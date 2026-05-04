package freelance.twin.sport.server.utils;

import freelance.twin.sport.server.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtils {

    private final SecretKey secretKey;
    private final SecretKey secretUtilsKey;
    private final long computerExpiration;
    private final long mobileExpiration;
    private final long reservationExpiration;
    @Value("${app.security.verification2FaDuration}")
    private long verification2FaDuration;
    @Value("${app.security.cookieName}")
    public String COOKIE_NAME;
    @Value("${app.security.cookieDomain}")
    private String cookieDomain;

    @Value("${app.security.cookieSecure}")
    private boolean cookieSecure;

    @Value("${app.security.cookiePath}")
    private String cookiePath;

    @Value("${app.security.cookieSite}")
    private String cookieSite;

    public JwtUtils(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.secret.utils}") String UtilsSecret,
            @Value("${jwt.expiration.computer}") long computerExpiration,
            @Value("${jwt.expiration.mobile}") long mobileExpiration,
            @Value("${jwt.expiration.reservation}") long reservationExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.secretUtilsKey = Keys.hmacShaKeyFor(UtilsSecret.getBytes());
        this.computerExpiration = computerExpiration;
        this.mobileExpiration = mobileExpiration;
        this.reservationExpiration = reservationExpiration;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    public String extractUsername(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        if (token == null) return null;
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        if (token == null) return null;
        Claims claims = extractAllClaims(token);
        Object value = claims.get("role");
        if (value == null) return null;
        return value.toString();
    }

    public String extractDeviceType(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        if (token == null) return null;
        return extractClaim(token, claims -> claims.get("deviceType", String.class));
    }

    public Date extractExpiration(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        if (token == null) return null;
        return extractClaim(token, Claims::getExpiration);
    }

    public Boolean extractVerified2FA(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        if (token == null) return false;
        return extractClaim(token, claims -> claims.get("verified2Fa", Boolean.class));
    }

    public UUID extractUserId(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        if (token == null) return null;
        return extractUserId(request);
    }
    public String generateToken(UserDetails userDetails, String deviceType, User user) {
        long expiration = "mobile".equalsIgnoreCase(deviceType) ? mobileExpiration : computerExpiration;
        boolean verified2Fa = checkIs2FaVerified(user.getLast2FaVerification(),user.getCodeVerification2FA());
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("userId", user.getId())
                .claim("deviceType", deviceType)
                .claim("role", user.getRoleUser())
                .claim("verified2Fa", verified2Fa)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey)
                .compact();
    }

    public boolean validateToken(HttpServletRequest request) {
        String token = extractTokenFromCookies(request);
        if (token == null) return false;

        try {
            extractAllClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            throw ex;
        } catch (JwtException ex) {
            System.out.println("auth exception: "+ex.getMessage());
        }
        return false;
    }
    public String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    public void buildJwtCookie(String value, String deviceType, HttpServletResponse response) {
        int expiration = "mobile".equalsIgnoreCase(deviceType)
                ? (int) (mobileExpiration / 1000)
                : (int) (computerExpiration / 1000);

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .maxAge(expiration)
                .sameSite(cookieSite);

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }

        ResponseCookie cookie = builder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    public void buildClearCookie(HttpServletResponse response, String name) {

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .maxAge(0)
                .sameSite(cookieSite);

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }

        ResponseCookie cookie = builder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    public boolean checkIs2FaVerified(Instant last2FaVerification, String codeVerification2FA) {

        if (last2FaVerification == null) {
            return false;
        }

        if (codeVerification2FA != null) {
            return false;
        }

        Instant expiryTime = last2FaVerification.plusSeconds(verification2FaDuration * 3600);

        return Instant.now().isBefore(expiryTime);
    }
    public void validateTokenString(String token) {
        Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseSignedClaims(token);
    }
}
