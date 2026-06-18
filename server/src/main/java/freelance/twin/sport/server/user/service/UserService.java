package freelance.twin.sport.server.user.service;

import freelance.twin.sport.server.user.dto.Verify2FaRequest;
import freelance.twin.sport.server.user.entity.Role;
import freelance.twin.sport.server.user.entity.TwofaMethod;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.exception.*;
import freelance.twin.sport.server.user.repository.UserRepository;
import freelance.twin.sport.server.config.mail.twofa.ITowFaMessageService;
import freelance.twin.sport.server.config.mail.twofa.TowFaMessageFactory;
import freelance.twin.sport.server.utils.JwtUtils;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final TokenStoreService tokenStoreService;
    private final AuthenticationManager authenticationManager;
    private final TowFaMessageFactory towFaMessageFactory;
    private final CustomUserDetailsService customUserDetailsService;


    public void removeUser(Long idUser) {
        userRepository.delete(userRepository.findById(idUser).get());
    }

    public User addOrUpdateUser(User user) {
        try {
            User existingUser = userRepository.findUserById(user.getId());
            if (existingUser == null) {
                throw new UserNotFoundException("User not found");
            }

            String submittedPwd = user.getPwd();
            String existingEncodedPwd = existingUser.getPwd();

            if (submittedPwd != null && !submittedPwd.isEmpty()) {

                if (submittedPwd.startsWith("$2a$") || submittedPwd.startsWith("$2b$") || submittedPwd.startsWith("$2y$")) {
                    user.setPwd(existingEncodedPwd);
                } else {
                    user.setPwd(passwordEncoder.encode(submittedPwd));
                }
            } else {

                user.setPwd(existingEncodedPwd);
            }

            return userRepository.save(user);

        } catch (Exception e) {

            throw new RuntimeException("Failed to add or update user", e);
        }
    }


    public User getUserById(UUID idUser) {
        return userRepository.findUserById(idUser);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void registerUser(User user) {

        user.setPwd(passwordEncoder.encode(user.getPwd()));
        user.setTwoFaMethod(TwofaMethod.EMAIL);
        user.setRoleUser(Role.STANDARD);
        userRepository.save(user);
    }

    public Optional<User> findUserByUsername(String email) {
        return Optional.ofNullable(userRepository.findUserByUsername(email));
    }


    public void logout(HttpServletRequest request, HttpServletResponse response) {

        String username = getCurrentUser().getUsername();
        SecurityContextHolder.clearContext();

        String userAgent = request.getHeader("User-Agent"); // ← was response, must be request
        boolean isComputer = userAgent != null && !userAgent.toLowerCase().contains("mobile");
        String deviceType = isComputer ? "computer" : "mobile";

        jwtUtils.buildClearCookie(response, jwtUtils.COOKIE_NAME);
        jwtUtils.buildClearCookie(response, "XSRF-TOKEN");
        jwtUtils.buildClearCookie(response, "JSESSIONID");
        tokenStoreService.invalidateToken(username, deviceType);
    }

    public String generate2FaString(int length) {
        String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom RANDOM = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = RANDOM.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(randomIndex));
        }
        return sb.toString();
    }

    @Transactional
    public boolean send2FaVerificationCode() {

        User user = getCurrentUser();
        String verificationCode = generate2FaString(6);

        try {
            ITowFaMessageService notificationService =
                    towFaMessageFactory.getNotificationService(user.getTwoFaMethod());

            if (notificationService.send2faVerificationCode(user, verificationCode)) {
                user.setCodeVerification2FA(verificationCode);
                user.setTwoFaCodeExpiry(Instant.now().plusSeconds(600));
                userRepository.save(user);
                return true;
            }

        } catch (IllegalArgumentException e) {
            throw new TwoFaRequired("invalid 2FA verification method !");
        }

        return false;
    }

    @Transactional
    public User verify2Fa(Verify2FaRequest request,
                          HttpServletRequest httpRequest,
                          HttpServletResponse httpResponse) {

        User user = getCurrentUser();

        String userAgent = httpRequest.getHeader("User-Agent");
        boolean isComputer = userAgent != null && !userAgent.toLowerCase().contains("mobile");
        String deviceType = isComputer ? "computer" : "mobile";

        if (user == null) {
            throw new AuthenticationException("No authenticated user found.");
        }
        if (user.getCodeVerification2FA() == null) {
            throw new TwoFaCodeNotFoundException("No 2FA code found. Please request a new one.");
        }
        if (!user.getCodeVerification2FA().equalsIgnoreCase(request.getVerificationCode())) {
            throw new Invalid2FaException("Invalid 2FA code.");
        }
        if (user.getTwoFaCodeExpiry().isBefore(Instant.now())) {
            throw new Invalid2FaException("2FA code expired.");
        }

        user.setCodeVerification2FA(null);
        user.setTwoFaCodeExpiry(null);
        user.setLast2FaVerification(Instant.now());

        User savedUser = userRepository.save(user);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getUsername());
        String newJwt = jwtUtils.generateToken(userDetails, deviceType, savedUser);


        if ("ADMIN_TWIN".equalsIgnoreCase(savedUser.getRoleUser().name())) {
            tokenStoreService.storeToken(savedUser.getUsername(), newJwt, deviceType);
        }

        jwtUtils.buildJwtCookie(newJwt, deviceType, httpResponse);

        return savedUser;
    }

    public Map<String, Object> login(User user,
                                     boolean force,
                                     HttpServletRequest request,
                                     HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPwd()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            String userAgent = request.getHeader("User-Agent");
            boolean isComputer = userAgent != null && !userAgent.toLowerCase().contains("mobile");
            String deviceType = isComputer ? "computer" : "mobile";
            String username = user.getUsername();

            User authenticatedUser = findUserByUsername(username)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            String role = authenticatedUser.getRoleUser().name();
            boolean isAdmin = "ADMIN_TWIN".equalsIgnoreCase(role);

            // ─── Active Session Check ─────────────────────────────────────────────────
            if ((isAdmin) && !force && tokenStoreService.hasActiveSession(username, deviceType)) {
                try {
                    boolean isValid = jwtUtils.validateToken(request);

                    if (isValid) {
                        throw new ActiveSessionException("Another session is active on: " + deviceType);
                    }

                    String storedToken = tokenStoreService.getToken(username, deviceType);
                    if (storedToken != null) {
                        try {
                            jwtUtils.validateTokenString(storedToken);
                            throw new ActiveSessionException("Another session is active on: " + deviceType);
                        } catch (ExpiredJwtException e) {
                            tokenStoreService.invalidateToken(username, deviceType);
                        }
                    } else {
                        tokenStoreService.invalidateToken(username, deviceType);
                    }

                } catch (ActiveSessionException e) {
                    throw e;
                } catch (ExpiredJwtException e) {
                    tokenStoreService.invalidateToken(username, deviceType);
                }
            }
            // ─────────────────────────────────────────────────────────────────────────

            boolean verified2FA = jwtUtils.checkIs2FaVerified(
                    authenticatedUser.getLast2FaVerification(),
                    authenticatedUser.getCodeVerification2FA()
            );

            String jwt = jwtUtils.generateToken(userDetails, deviceType, authenticatedUser);

            if (isAdmin) {
                tokenStoreService.storeToken(username, jwt, deviceType);
            }

            jwtUtils.buildJwtCookie(jwt, deviceType, response);

            return Map.of(
                    "userId", authenticatedUser.getId(),
                    "username", authenticatedUser.getUsername(),
                    "isAdmin", isAdmin,
                    "deviceType", deviceType,
                    "verified2FA", verified2FA,
                    "message", verified2FA ? "Login successful" : "2FA requis"
            );
        }catch (BadCredentialsException e){
            throw new FailedCredentialsException("Invalid email or password");
        }catch (org.springframework.security.core.AuthenticationException ex) {
            throw new AuthenticationException("Authentication failed");
        }
    }

    public Map<String, Object> validateSession(HttpServletRequest request, HttpServletResponse response) {
        String token = jwtUtils.extractTokenFromCookies(request);

        if (token == null) {
            throw new RuntimeException("NO_SESSION");
        }
        User user = getCurrentUser();
        String username = jwtUtils.extractUsername(request);
        String role = user.getRoleUser().toString();

        UUID userId = user.getId();
        Boolean verified2FA = jwtUtils.extractVerified2FA(request);
        String deviceType = jwtUtils.extractDeviceType(request);

        boolean isAdmin = "ADMIN_TWIN".equalsIgnoreCase(role);
        if (isAdmin) {
            String userAgent = request.getHeader("User-Agent");
            String dt = userAgent != null && userAgent.toLowerCase().contains("mobile")
                    ? "mobile"
                    : "computer";

            if (!tokenStoreService.isLatestToken(username, token, dt)) {
                logout(request,response);
                throw new InvalidSession("SESSION_INVALIDATED");
            }
        }

        return Map.of(
                "valid", true,
                "user", Map.of(
                        "userId", userId,
                        "username", username,
                        "deviceType", deviceType,
                        "nom", user.getNom() != null ? user.getNom() : "",
                        "isAdmin", isAdmin,
                        "prenom", user.getPrenom() != null ? user.getPrenom() : "",
                        "verified2FA", verified2FA
                )
        );
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new InvalidSession("Session expiré");
        }
        String username = authentication.getName();
        User user = userRepository.findUserByUsername(username);
        if (user == null) {
            throw new SessionExpiredException("Session expiré");
        }
        return user;
    }

}
