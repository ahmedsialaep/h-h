package freelance.twin.sport.server.utils;

import freelance.twin.sport.server.user.entity.User;
import io.jsonwebtoken.Claims;
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

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractDeviceType(String token) {
        return extractClaim(token, claims -> claims.get("deviceType", String.class));
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        Object value = claims.get("role");
        if (value == null) return null;
        return value.toString();
    }
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
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

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    public UUID extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Object value = claims.get("userId");

        if (value == null) return null;

        try {
            return UUID.fromString(value.toString());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    public Boolean extractVerified2FA(String token) {
        Claims claims = extractAllClaims(token);
        Object value = claims.get("verified2Fa");
        if (value instanceof Boolean b) return b;
        if (value instanceof String s) return Boolean.parseBoolean(s);
        return false;
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

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    public String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) return cookie.getValue();
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
                .secure(false)
                .path("/")
                .maxAge(expiration)
                .sameSite("Lax");


        ResponseCookie cookie = builder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    public void buildClearCookie(HttpServletResponse response, String name) {

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(name, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax");



        ResponseCookie cookie = builder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    public void buildClearCookieHttpOnly(HttpServletResponse response, String name, boolean httpOnly) {
        ResponseCookie cookie = ResponseCookie
                .from(name, "")
                .httpOnly(httpOnly)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
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

}
