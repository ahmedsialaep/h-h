package freelance.twin.sport.server.config;

import freelance.twin.sport.server.filters.CsrfCookieFilter;
import freelance.twin.sport.server.filters.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.upload.image-dir}")
    private String imageUploadDir;

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Autowired
    private CsrfTokenRepository csrfTokenRepository;
    @Autowired
    private  CsrfTokenRequestAttributeHandler csrfTokenRequestAttributeHandler;
    @Autowired
    private  CsrfCookieFilter csrfCookieFilter;
    @Autowired
    private  CsrfConfig csrfConfig;

    @Autowired
    private SecurityHeaderConfig securityHeadersConfigurer;



    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        securityHeadersConfigurer.configure(http);
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(csrfTokenRequestAttributeHandler)
                        .ignoringRequestMatchers("/auth/login", "/auth/register", "/auth/csrf", "/auth/logout",
                                "/auth/2fa/send", "/auth/2fa/verify")
                )
                .cors(c -> c.configurationSource(request -> {
                    var config = new org.springframework.web.cors.CorsConfiguration();
                    config.setAllowedOriginPatterns(allowedOrigins);
                    config.setAllowedMethods(Arrays.asList(
                            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
                    ));
                    config.setAllowedHeaders(Arrays.asList(
                            "Authorization",
                            "Content-Type",
                            csrfConfig.getCsrfHeaderName(),
                            "Accept",
                            "Origin",
                            "X-Requested-With",
                            "Access-Control-Request-Method",
                            "Access-Control-Request-Headers",
                            "Cache-Control",
                            "Pragma"
                    ));
                    config.setExposedHeaders(Arrays.asList(
                            "Authorization",
                            "Content-Disposition",
                            "X-Total-Count",
                            "Set-Cookie"
                    ));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/auth/logout").authenticated()
                        .requestMatchers(HttpMethod.GET, "/magasin", "/product-vars", "/product-vars/**", "/commande/{ref}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/commande/checkout").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/products", "/products/**",
                                "/brand", "/brand/**",
                                "/product-type", "/product-type/**"
                        ).permitAll()
                        .requestMatchers("/admin/**").hasAuthority("ADMIN_TWIN")
                        .requestMatchers("/commande/**", "/payment/**", "/profile/**").hasAnyAuthority("STANDARD", "ADMIN_TWIN")
                        .requestMatchers("/auth/**", "/img/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .addFilterAfter(
                        csrfCookieFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                );

        return http.build();
    }


    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/img/**")
                        .addResourceLocations("file:" + imageUploadDir);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}