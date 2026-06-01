<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    /**
     * Get the Firebase configuration dynamically (supporting environment variables
     * and direct service account JSON file path).
     */
    private static function getFirebaseConfig(): array
    {
        $projectId = env('FIREBASE_PROJECT_ID');
        $clientEmail = env('FIREBASE_CLIENT_EMAIL');
        $privateKey = env('FIREBASE_PRIVATE_KEY');

        // Check if path to JSON file is defined
        $jsonPath = env('GOOGLE_APPLICATION_CREDENTIALS') ?: env('FIREBASE_SERVICE_ACCOUNT_KEY');
        if ($jsonPath && file_exists($jsonPath)) {
            $serviceAccount = json_decode(file_get_contents($jsonPath), true);
            if ($serviceAccount) {
                $projectId = $serviceAccount['project_id'] ?? $projectId;
                $clientEmail = $serviceAccount['client_email'] ?? $clientEmail;
                $privateKey = $serviceAccount['private_key'] ?? $privateKey;
            }
        }

        return [
            'project_id' => $projectId,
            'client_email' => $clientEmail,
            'private_key' => $privateKey,
        ];
    }

    /**
     * Check if Firebase credentials are fully configured.
     */
    public static function isFirebaseEnabled(): bool
    {
        $config = self::getFirebaseConfig();
        return !empty($config['project_id']) &&
               !empty($config['client_email']) &&
               !empty($config['private_key']) &&
               !empty(env('FIREBASE_API_KEY'));
    }

    /**
     * Authenticate a user with email and password via Firebase Auth REST API.
     * 
     * @return array Contains uid, email, and idToken
     * @throws \Exception
     */
    public static function signIn(string $email, string $password): array
    {
        if (!self::isFirebaseEnabled()) {
            throw new \Exception('Firebase authentication is not enabled.');
        }

        $apiKey = env('FIREBASE_API_KEY');
        $url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={$apiKey}";

        $response = Http::post($url, [
            'email' => $email,
            'password' => $password,
            'returnSecureToken' => true,
        ]);

        if (!$response->successful()) {
            $error = $response->json('error.message', 'AUTHENTICATION_FAILED');
            throw new \Exception($error);
        }

        return [
            'uid' => $response->json('localId'),
            'email' => $response->json('email'),
            'idToken' => $response->json('idToken'),
        ];
    }

    /**
     * Create a user in Firebase Auth.
     * 
     * @return array Contains uid and email
     * @throws \Exception
     */
    public static function signUp(string $email, string $password): array
    {
        if (!self::isFirebaseEnabled()) {
            throw new \Exception('Firebase authentication is not enabled.');
        }

        $apiKey = env('FIREBASE_API_KEY');
        $url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={$apiKey}";

        $response = Http::post($url, [
            'email' => $email,
            'password' => $password,
            'returnSecureToken' => true,
        ]);

        if (!$response->successful()) {
            $error = $response->json('error.message', 'REGISTRATION_FAILED');
            throw new \Exception($error);
        }

        return [
            'uid' => $response->json('localId'),
            'email' => $response->json('email'),
        ];
    }

    /**
     * Set custom user claims (role, totpSecret, etc.) using Identity Toolkit API.
     */
    public static function setUserClaims(string $uid, array $claims): bool
    {
        try {
            $token = self::getAccessToken();
            if (!$token) {
                return false;
            }

            $config = self::getFirebaseConfig();
            $projectId = $config['project_id'];
            $url = "https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts:setCustomAttributes";

            // Custom attributes must be sent as a serialized JSON string
            $response = Http::withToken($token)->post($url, [
                'localId' => $uid,
                'customAttributes' => json_encode($claims),
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('🔥 Firebase setUserClaims failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Mark a user's email as verified in Firebase.
     */
    public static function verifyUserEmailInFirebase(string $uid): bool
    {
        try {
            $token = self::getAccessToken();
            if (!$token) {
                return false;
            }

            $config = self::getFirebaseConfig();
            $projectId = $config['project_id'];
            $url = "https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts:update";

            $response = Http::withToken($token)->post($url, [
                'localId' => $uid,
                'emailVerified' => true,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('🔥 Firebase verifyUserEmailInFirebase failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Retrieve custom claims for a Firebase user.
     */
    public static function getUserClaims(string $uid): array
    {
        try {
            $token = self::getAccessToken();
            if (!$token) {
                return [];
            }

            $config = self::getFirebaseConfig();
            $projectId = $config['project_id'];
            $url = "https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts:lookup";

            $response = Http::withToken($token)->post($url, [
                'localId' => [$uid],
            ]);

            if ($response->successful()) {
                $users = $response->json('users', []);
                if (!empty($users)) {
                    $customAttributesJson = $users[0]['customAttributes'] ?? '{}';
                    return json_decode($customAttributesJson, true) ?? [];
                }
            }

            return [];
        } catch (\Exception $e) {
            Log::error('🔥 Firebase getUserClaims failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Retrieve Firebase User details by email.
     */
    public static function getUserByEmail(string $email): ?array
    {
        try {
            $token = self::getAccessToken();
            if (!$token) {
                return null;
            }

            $config = self::getFirebaseConfig();
            $projectId = $config['project_id'];
            $url = "https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts:lookup";

            $response = Http::withToken($token)->post($url, [
                'email' => [$email],
            ]);

            if ($response->successful()) {
                $users = $response->json('users', []);
                if (!empty($users)) {
                    return $users[0];
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('🔥 Firebase getUserByEmail failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate Google OAuth2 access token using RS256 Service Account JWT assertion.
     */
    private static function getAccessToken(): ?string
    {
        $config = self::getFirebaseConfig();
        $projectId = $config['project_id'];
        $clientEmail = $config['client_email'];
        $privateKey = $config['private_key'];

        if (!$projectId || !$clientEmail || !$privateKey) {
            return null;
        }

        // Handle both raw newlines and escaped "\n" in key config
        $privateKey = str_replace('\n', "\n", $privateKey);

        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $now = time();
        $claimSet = json_encode([
            'iss' => $clientEmail,
            'sub' => $clientEmail,
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
            'scope' => 'https://www.googleapis.com/auth/identitytoolkit',
        ]);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlClaimSet = self::base64UrlEncode($claimSet);

        $signatureInput = $base64UrlHeader . '.' . $base64UrlClaimSet;
        $signature = '';

        if (!openssl_sign($signatureInput, $signature, $privateKey, 'SHA256')) {
            throw new \Exception('Failed to sign JWT with Firebase Private Key.');
        }

        $base64UrlSignature = self::base64UrlEncode($signature);
        $jwt = $signatureInput . '.' . $base64UrlSignature;

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to exchange service account JWT for access token: ' . $response->body());
        }

        return $response->json('access_token');
    }

    /**
     * Base64 URL Helper.
     */
    private static function base64UrlEncode(string $data): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
}
