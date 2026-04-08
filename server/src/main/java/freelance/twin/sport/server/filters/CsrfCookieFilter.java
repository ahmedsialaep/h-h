package freelance.twin.sport.server.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class CsrfCookieFilter extends OncePerRequestFilter {

    private final CsrfTokenRepository csrfTokenRepository;

    public CsrfCookieFilter(CsrfTokenRepository csrfTokenRepository) {
        this.csrfTokenRepository = csrfTokenRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {


        CsrfToken csrfToken = csrfTokenRepository.loadToken(request);


        if (csrfToken == null) {
            csrfToken = csrfTokenRepository.generateToken(request);
            csrfTokenRepository.saveToken(csrfToken, request, response);

        }

        request.setAttribute(CsrfToken.class.getName(), csrfToken);


        filterChain.doFilter(request, response);
    }
}