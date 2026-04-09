package freelance.twin.sport.server.config;

import jakarta.servlet.SessionCookieConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.server.servlet.ConfigurableServletWebServerFactory;
import org.springframework.boot.web.server.servlet.Session;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SessionConfig {

    @Value("${app.security.cookiePath}")
    private String cookiePath;

    @Bean
    public ServletContextInitializer sessionCookieCustomizer() {
        return servletContext -> {
            SessionCookieConfig sessionCookieConfig = servletContext.getSessionCookieConfig();
            sessionCookieConfig.setPath(cookiePath);
        };
    }
}
