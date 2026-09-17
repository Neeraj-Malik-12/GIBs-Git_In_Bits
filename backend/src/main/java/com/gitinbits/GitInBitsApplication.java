package com.gitinbits;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Git in Bits — Proof of Concept Backend
 *
 * <p>Authenticates users via GitHub OAuth2 and exposes GitHub repository
 * metadata through clean REST APIs. This PoC validates whether GitHub's
 * public API exposes sufficient data for the future Git in Bits platform.
 *
 * <p>Architecture is intentionally modular to support future layers:
 * Normalization → Analysis → AI → Visualization.
 */
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class GitInBitsApplication {

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner resetStuckSyncs(com.gitinbits.persistence.repository.SyncMetadataRepository repo) {
        return args -> {
            java.util.List<com.gitinbits.persistence.document.SyncMetadataDoc> stuck = repo.findAll().stream()
                .filter(m -> "IN_PROGRESS".equals(m.status()))
                .toList();
            for (com.gitinbits.persistence.document.SyncMetadataDoc doc : stuck) {
                repo.save(new com.gitinbits.persistence.document.SyncMetadataDoc(
                    doc.repoFullName(), doc.owner(), doc.lastSyncTimestamp(),
                    doc.latestSynchronizedCommitSha(), "COMPLETED", doc.lastAnalyzedTimestamp()
                ));
            }
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(GitInBitsApplication.class, args);
    }
}
