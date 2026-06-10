package freelance.twin.sport.server.config;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.header.writers.DelegatingRequestMatcherHeaderWriter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.stereotype.Component;

import static org.springframework.security.config.Customizer.withDefaults;

@Component
public class SecurityHeaderConfig {

    private final OrRequestMatcher staticAssets = new OrRequestMatcher(
            PathPatternRequestMatcher.withDefaults().matcher("/img/**"),
            PathPatternRequestMatcher.withDefaults().matcher("/static/**"),
            PathPatternRequestMatcher.withDefaults().matcher("/assets/**"),
            PathPatternRequestMatcher.withDefaults().matcher("/**/*.js"),
            PathPatternRequestMatcher.withDefaults().matcher("/**/*.css"),
            PathPatternRequestMatcher.withDefaults().matcher("/**/*.woff2"),
            PathPatternRequestMatcher.withDefaults().matcher("/**/*.woff"),
            PathPatternRequestMatcher.withDefaults().matcher("/**/*.ttf")
    );

    public void configure(HttpSecurity http) throws Exception {
        http.headers(headers -> headers

                // ── Security headers ─────────────────────────────────────
                .xssProtection(xss -> xss
                        .headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK)
                )
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                .contentTypeOptions(withDefaults())
                .referrerPolicy(referrer -> referrer
                        .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000)
                )

                // ── Cache: no-store for API / dynamic responses ───────────
                .addHeaderWriter(new DelegatingRequestMatcherHeaderWriter(
                        new NegatedRequestMatcher(staticAssets),
                        new StaticHeadersWriter("Cache-Control", "no-store, no-cache, must-revalidate")
                ))
                .addHeaderWriter(new DelegatingRequestMatcherHeaderWriter(
                        new NegatedRequestMatcher(staticAssets),
                        new StaticHeadersWriter("Pragma", "no-cache")
                ))

                // ── Cache: immutable for static assets ────────────────────
                .addHeaderWriter(new DelegatingRequestMatcherHeaderWriter(
                        staticAssets,
                        new StaticHeadersWriter("Cache-Control", "public, max-age=31536000, immutable")
                ))
        );
    }
}
