package ctimsviewer;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.PropertySource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;


@Configuration
//@CrossOrigin(origins = "http://localhost:3000")
public class WebConfig implements WebMvcConfigurer {


    @Value("${origins.allowed}")
    private String allowedOrigin;

    @Autowired
    public Environment env;

   private String getAuthenticationRequirement() {
    
        if ("disable".equals(allowedOrigin)) {
            System.out.printf("Entered disable condition %s%n", allowedOrigin);
            return "permitAll";
        } else {
            System.out.printf("Entered Enable condition %s%n", allowedOrigin);
            return "authenticated";
        }
    }
     private String authReq = getAuthenticationRequirement();

/*

    @PropertySource("classpath:application.properties")
    private String allowedOrigin = env.getProperty(origins.allowed);
*/
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        System.out.printf("Inside Enable condition %s%n", allowedOrigin);
        String url ="http://localhost:3000";
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
   
}


