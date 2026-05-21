package freelance.twin.sport.server.filters;

import freelance.twin.sport.server.user.service.CustomUserDetailsService;
import freelance.twin.sport.server.user.service.TokenStoreService;
import freelance.twin.sport.server.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private TokenStoreService tokenStoreService;


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
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Admin session invalidated. Please log in again.\"}");

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
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Session expired.\"}");
            return;
        } catch (Exception ex) {

        }

        filterChain.doFilter(request, response);
    }

    private void clearAuth(HttpServletResponse response) {
        jwtUtils.buildClearCookie(response, jwtUtils.COOKIE_NAME);

        jwtUtils.buildClearCookie(response, "XSRF-TOKEN");
        jwtUtils.buildClearCookie(response, "JSESSIONID");

        SecurityContextHolder.clearContext();
    }
}