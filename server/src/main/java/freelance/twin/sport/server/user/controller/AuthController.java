package freelance.twin.sport.server.user.controller;

import freelance.twin.sport.server.user.dto.Verify2FaRequest;
import freelance.twin.sport.server.user.entity.User;
import freelance.twin.sport.server.user.service.TokenStoreService;
import freelance.twin.sport.server.user.service.UserService;
import freelance.twin.sport.server.utils.JwtUtils;
import io.jsonwebtoken.ExpiredJwtException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = Logger.getLogger(AuthController.class.getName());

    private final UserService userService;


    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        if (userService.findUserByUsername(user.getUsername()).isPresent()) {
            response.put("error", "Username déja utilisé");
            return ResponseEntity.badRequest().body(response);
        }
        userService.saveUser(user);
        response.put("message", "Création avec succès");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user,
                                       @RequestParam(defaultValue = "false") boolean force,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {

        try {
            return ResponseEntity.ok(userService.login(user, force, request, response));

        } catch (RuntimeException e) {

            if (e.getMessage().startsWith("ACTIVE_SESSION")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "You already have an active session",
                        "existingSession", true
                ));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Invalid Username or password"
            ));
        }
    }

    @GetMapping("/csrf")
    public ResponseEntity<?> csrf() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate-session")
    public ResponseEntity<?> validateSession(HttpServletRequest request,HttpServletResponse response) {
        try {
            return ResponseEntity.ok(userService.validateSession(request,response));

        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Session expired"));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        userService.logout(response);

        return ResponseEntity.ok(Map.of(
                "message", "Déconnexion réussie",
                "status", HttpStatus.OK.value(),
                "timestamp", System.currentTimeMillis()
        ));
    }
    @PostMapping("/2fa/send")
    public ResponseEntity<Boolean> send2faVerificationCode() {
        boolean sent = userService.send2FaVerificationCode();
        return ResponseEntity.ok(sent);
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<Map<String, Object>> verify2Fa(@RequestBody Verify2FaRequest request,
                                                         HttpServletRequest httpRequest,
                                                         HttpServletResponse httpResponse) {

        User user = userService.verify2Fa(request, httpRequest, httpResponse);

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "role", user.getRoleUser().name(),
                "verified2FA", true,
                "message", "2FA verification successful"
        ));
    }

    public boolean isMobileDevice(String userAgent) {
        if (userAgent == null) return false;
        userAgent = userAgent.toLowerCase();
        return userAgent.contains("mobile") || userAgent.contains("android") ||
                userAgent.contains("iphone") || userAgent.contains("ipad") ||
                userAgent.contains("ipod") || userAgent.contains("cfnetwork") ||
                userAgent.contains("darwin") || userAgent.contains("expo") ||
                userAgent.contains("okhttp");
    }
}