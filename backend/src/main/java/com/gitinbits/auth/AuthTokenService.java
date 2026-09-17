package com.gitinbits.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to store and validate cross-domain bearer tokens.
 * This ensures full authentication compatibility across different domains
 * (e.g. Vercel frontend and Render backend) without relying on 3rd-party cookies
 * which are blocked by modern browsers like Brave, Safari, and Chrome Incognito.
 */
@Service
public class AuthTokenService {

    private static final Logger log = LoggerFactory.getLogger(AuthTokenService.class);

    public record TokenEntry(
            OAuth2AuthenticationToken authentication,
            OAuth2AuthorizedClient authorizedClient,
            Instant expiry
    ) {}

    private final Map<String, TokenEntry> tokenMap = new ConcurrentHashMap<>();
    private final OAuth2AuthorizedClientService authorizedClientService;

    public AuthTokenService(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    public String createToken(OAuth2AuthenticationToken authentication, OAuth2AuthorizedClient authorizedClient) {
        String token = UUID.randomUUID().toString();
        // Token valid for 7 days
        Instant expiry = Instant.now().plusSeconds(7 * 24 * 3600);
        tokenMap.put(token, new TokenEntry(authentication, authorizedClient, expiry));

        if (authorizedClient != null) {
            try {
                authorizedClientService.saveAuthorizedClient(authorizedClient, authentication);
            } catch (Exception e) {
                log.warn("Could not save authorized client in authorizedClientService: {}", e.getMessage());
            }
        }

        log.info("Created cross-domain auth token for user: {}", authentication.getName());
        return token;
    }

    public OAuth2AuthenticationToken getAuthentication(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        TokenEntry entry = tokenMap.get(token);
        if (entry == null) {
            return null;
        }
        if (Instant.now().isAfter(entry.expiry())) {
            tokenMap.remove(token);
            log.info("Expired app auth token removed");
            return null;
        }

        // Keep authorizedClientService populated for GitHubClient / GraphQL requests
        if (entry.authorizedClient() != null) {
            try {
                authorizedClientService.saveAuthorizedClient(entry.authorizedClient(), entry.authentication());
            } catch (Exception ignored) {}
        }

        return entry.authentication();
    }

    public void removeToken(String token) {
        if (token != null) {
            tokenMap.remove(token);
            log.info("Revoked app auth token");
        }
    }
}
