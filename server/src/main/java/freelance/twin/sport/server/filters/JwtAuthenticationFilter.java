package freelance.twin.sport.server.filters;

import freelance.twin.sport.server.user.exception.ActiveSessionException;
import freelance.twin.sport.server.user.exception.InvalidSession;
import freelance.twin.sport.server.user.exception.SessionExpiredException;
import freelance.twin.sport.server.user.service.CustomUserDetailsService;
import freelance.twin.sport.server.user.service.TokenStoreService;
import freelance.twin.sport.server.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtils jwtUtils;
    private final TokenStoreService tokenStoreService;
    private final HandlerExceptionResolver resolver;

    @Value("${app.security.xsrfCookieName}")
    private String xsrfCookieName;

    @Value("${app.security.sessionCookieName}")
    private String sessionCookieName;

    public JwtAuthenticationFilter(
            CustomUserDetailsService customUserDetailsService,
            JwtUtils jwtUtils,
            TokenStoreService tokenStoreService,
            @Lazy @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtils = jwtUtils;
        this.tokenStoreService = tokenStoreService;
        this.resolver = resolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String username = "";

        try {
            if (jwtUtils.validateToken(request)) {

                Claims claims = jwtUtils.extractAllClaims(jwtUtils.extractTokenFromCookies(request));
                username = claims.getSubject();
                String role = claims.get("role", String.class);
                String deviceType = claims.get("deviceType", String.class);

                if ("ADMIN_TWIN".equalsIgnoreCase(role)) {
                    boolean isLatest = tokenStoreService.isLatestToken(username,
                            jwtUtils.extractTokenFromCookies(request), deviceType);

                    if (!isLatest) {
                        boolean hasAnySession = tokenStoreService.hasActiveSession(username, deviceType);

                        if (hasAnySession) {

                            clearAuth(response);
                            resolver.resolveException(request, response, null,
                                    new ActiveSessionException("Active Session exists"));
                            return;
                        } else {
                            tokenStoreService.invalidateToken(username, deviceType);
                            tokenStoreService.storeToken(username,
                                    jwtUtils.extractTokenFromCookies(request), deviceType);
                        }
                    }
                }

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (ExpiredJwtException ex) {
            clearAuth(response);
            resolver.resolveException(request, response, null,
                    new InvalidSession("Session Expired"));
            return;
        } catch (Exception ex) {
            log.error("JWT authentication failed for user [{}]: {}", username, ex.getMessage());
            clearAuth(response);
            resolver.resolveException(request, response, null, new SessionExpiredException("Session expiré"));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void clearAuth(HttpServletResponse response) {
        jwtUtils.buildClearCookie(response, jwtUtils.COOKIE_NAME);
        jwtUtils.buildClearCookie(response, sessionCookieName);
        jwtUtils.buildClearCookie(response, xsrfCookieName);
        SecurityContextHolder.clearContext();
    }
}