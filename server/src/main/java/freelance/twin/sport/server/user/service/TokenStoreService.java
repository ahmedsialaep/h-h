package freelance.twin.sport.server.user.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenStoreService {

    private final ConcurrentHashMap<String, Map<String, String>> userDeviceTokens = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> invalidatedTokens = new ConcurrentHashMap<>();

    public void storeToken(String username, String token, String deviceType) {
        userDeviceTokens.computeIfAbsent(username, k -> new ConcurrentHashMap<>())
                .put(deviceType, token);

        Set<String> invalidated = invalidatedTokens.get(username);
        if (invalidated != null) invalidated.remove(token);
    }

    public boolean isLatestToken(String username, String token, String deviceType) {
        String stored = getToken(username, deviceType);

        Set<String> invalidated = invalidatedTokens.get(username);
        if (invalidated != null && invalidated.contains(token)) return false;

        if (stored == null) return false;

        return stored.equals(token);
    }

    public boolean hasActiveSession(String username, String deviceType) {
        return userDeviceTokens.containsKey(username) &&
                userDeviceTokens.get(username).containsKey(deviceType);
    }

    public String getToken(String username, String deviceType) {
        return userDeviceTokens.getOrDefault(username, Map.of()).get(deviceType);
    }

    public void invalidateToken(String username, String deviceType) {
        Map<String, String> deviceMap = userDeviceTokens.get(username);
        if (deviceMap != null) {
            String token = deviceMap.remove(deviceType);
            if (token != null) {
                invalidatedTokens.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet())
                        .add(token);
            }
            if (deviceMap.isEmpty()) {
                userDeviceTokens.remove(username);
            }
        }
    }

    public void invalidateAllSessions(String username) {
        Map<String, String> deviceMap = userDeviceTokens.get(username);
        if (deviceMap != null) {
            invalidatedTokens.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet())
                    .addAll(deviceMap.values());
        }
        userDeviceTokens.remove(username);
    }

    public boolean hasAnyActiveSession(String username) {
        return userDeviceTokens.containsKey(username) &&
                !userDeviceTokens.get(username).isEmpty();
    }
}