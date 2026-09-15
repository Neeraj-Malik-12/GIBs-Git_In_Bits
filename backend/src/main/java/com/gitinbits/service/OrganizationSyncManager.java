package com.gitinbits.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrganizationSyncManager {
    
    private final ConcurrentHashMap<String, Boolean> activeOrgSyncs = new ConcurrentHashMap<>();

    public boolean startSyncIfNotRunning(String owner) {
        return activeOrgSyncs.putIfAbsent(owner, true) == null;
    }

    public void markSyncFinished(String owner) {
        activeOrgSyncs.remove(owner);
    }

    public boolean isSyncing(String owner) {
        return activeOrgSyncs.getOrDefault(owner, false);
    }
}
