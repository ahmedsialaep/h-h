package freelance.twin.sport.server.filters;

import freelance.twin.sport.server.user.service.CustomUserDetailsService;
import freelance.twin.sport.server.user.service.TokenStoreService;
import freelance.twin.sport.server.user.service.UserService;
import freelance.twin.sport.server.utils.JwtUtils;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtils jwtUtils;
    private final TokenStoreService tokenStoreService;



    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String jwt = jwtUtils.extractTokenFromCookies(request);
        String uri = request.getRequestURI();

        if (uri.contains("/auth/login") || uri.contains("/auth/register") ||
                uri.contains("/auth/logout") || uri.contains("/auth/csrf") ||
                uri.contains("/auth/validate-session")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (jwt == null || jwt.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = null;

        try {
            username = jwtUtils.extractUsername(jwt);
            String role = jwtUtils.extractRole(jwt);
            String deviceType = jwtUtils.extractDeviceType(jwt);

            if ("ADMIN_TWIN".equalsIgnoreCase(role)) {
                boolean isLatest = tokenStoreService.isLatestToken(username, jwt, deviceType);

                if (!isLatest) {

                    boolean hasAnySession = tokenStoreService.hasActiveSession(username, deviceType);

                    if (hasAnySession) {

                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                                "Admin session invalidated. Please log in again.");
                        return;
                    } else {

                        tokenStoreService.storeToken(username, jwt, deviceType);
                    }
                }
            }

        } catch (ExpiredJwtException ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired.");
            return;
        } catch (Exception ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token.");
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                boolean valid = jwtUtils.validateToken(jwt, userDetails);

                if (valid) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ex) {
                System.out.println(">>> USER LOAD ERROR: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}