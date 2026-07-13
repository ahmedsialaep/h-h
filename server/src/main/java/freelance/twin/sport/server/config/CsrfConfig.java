package freelance.twin.sport.server.config;

import freelance.twin.sport.server.filters.CsrfCookieFilter;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class CsrfConfig {

    @Value("${app.security.xsrfCookieName}")
    private String xsrfCookieName;


    @Value("${app.security.cookiePath}")
    private String cookiePath;

    @Getter
    @Value("${app.security.xsrfHearderName}")
    private String csrfHeaderName;

    @Bean
    public CsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieName(xsrfCookieName);
        repository.setCookiePath(cookiePath);
        repository.setHeaderName(csrfHeaderName);
        return repository;
    }

    @Bean
    public CsrfTokenRequestAttributeHandler csrfTokenRequestAttributeHandler() {
        return new CsrfTokenRequestAttributeHandler();
    }

    @Bean
    public CsrfCookieFilter csrfCookieFilter(CsrfTokenRepository csrfTokenRepository) {
        return new CsrfCookieFilter(csrfTokenRepository);
    }
}
