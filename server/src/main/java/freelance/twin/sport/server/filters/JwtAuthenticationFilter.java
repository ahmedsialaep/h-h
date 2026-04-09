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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtils jwtUtils;
    private final TokenStoreService tokenStoreService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String username = "";

        try {
            // validateToken returns false if no cookie or invalid — no exception thrown
            if (jwtUtils.validateToken(request)) {

                username = jwtUtils.extractUsername(request);
                String role = jwtUtils.extractRole(request);
                String deviceType = jwtUtils.extractDeviceType(request);

                if ("ADMIN_TWIN".equalsIgnoreCase(role)) {
                    boolean isLatest = tokenStoreService.isLatestToken(username,
                            jwtUtils.extractTokenFromCookies(request), deviceType);

                    if (!isLatest) {
                        boolean hasAnySession = tokenStoreService.hasActiveSession(username, deviceType);
                        if (hasAnySession) {
                            jwtUtils.buildClearCookie(response, jwtUtils.COOKIE_NAME);
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                                    "Admin session invalidated. Please log in again.");
                            return;
                        } else {

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
            jwtUtils.buildClearCookie(response, jwtUtils.COOKIE_NAME);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired.");
            return;
        } catch (Exception ex) {

        }

        filterChain.doFilter(request, response);
    }
}