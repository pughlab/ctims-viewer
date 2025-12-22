package ctimsviewer;

import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.context.annotation.PropertySource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;





@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class KeycloakSecurityConfig extends KeycloakWebSecurityConfigurerAdapter {


    @Value("${keycloak.credentials.secret}")
    private String integrationStatus;

 


    private String getAuthenticationRequirement() {
    
        if ("disable".equals(integrationStatus)) {
            System.out.printf("Entered disable condition %s%n", integrationStatus);
            return "permitAll";
        } else {
            System.out.printf("Entered Enable condition %s%n", integrationStatus);
            return "authenticated";
        }
    }
    
private String authReq = getAuthenticationRequirement();


//authenticated
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //private String authReq;
        System.out.printf("Inside Enable condition integrationStatus %s%n", integrationStatus);
       // private String authReq = getAuthenticationRequirement(integrationStatus);
        super.configure(http);
        http
            .cors().and()
                .authorizeRequests()
                    .antMatchers(
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/webjars/**",
                        "/api/info"
                    ).permitAll()
                    .anyRequest().access(integrationStatus)
            .and()
            .csrf().disable()
            .sessionManagement()
                .sessionAuthenticationStrategy(sessionAuthenticationStrategy())
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false);
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) {
        KeycloakAuthenticationProvider keycloakAuthenticationProvider = keycloakAuthenticationProvider();
        keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(new SimpleAuthorityMapper());
        auth.authenticationProvider(keycloakAuthenticationProvider);
    }

    @Bean
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());
    }

    @Bean
    public KeycloakConfigResolver KeycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }


}
