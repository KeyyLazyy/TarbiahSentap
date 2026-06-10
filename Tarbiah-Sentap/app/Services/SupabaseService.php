<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseService
{
    private static function getSupabaseConfig(): array
    {
        return [
            'url' => env('SUPABASE_URL'),
            'key' => env('SUPABASE_KEY'), // The Secret/Service Role Key
        ];
    }

    public static function isSupabaseEnabled(): bool
    {
        $config = self::getSupabaseConfig();
        return !empty($config['url']) && !empty($config['key']);
    }

    public static function signIn(string $email, string $password): array
    {
        if (!self::isSupabaseEnabled()) {
            throw new \Exception('Supabase is not enabled.');
        }

        $config = self::getSupabaseConfig();
        $url = rtrim($config['url'], '/') . '/auth/v1/token?grant_type=password';

        $response = Http::withHeaders([
            'apikey' => $config['key'],
        ])->post($url, [
            'email' => $email,
            'password' => $password,
        ]);

        if (!$response->successful()) {
            $error = $response->json('error_description') ?? 'AUTHENTICATION_FAILED';
            throw new \Exception($error);
        }

        return [
            'uid' => $response->json('user.id'),
            'email' => $response->json('user.email'),
            'idToken' => $response->json('access_token'),
        ];
    }

    public static function signUp(string $email, string $password): array
    {
        if (!self::isSupabaseEnabled()) {
            throw new \Exception('Supabase is not enabled.');
        }

        $config = self::getSupabaseConfig();
        $url = rtrim($config['url'], '/') . '/auth/v1/admin/users';

        $response = Http::withHeaders([
            'apikey' => $config['key'],
            'Authorization' => 'Bearer ' . $config['key'],
        ])->post($url, [
            'email' => $email,
            'password' => $password,
            'email_confirm' => true,
        ]);

        if (!$response->successful()) {
            $error = $response->json('message') ?? 'REGISTRATION_FAILED';
            throw new \Exception($error);
        }

        return [
            'uid' => $response->json('id'),
            'email' => $response->json('email'),
        ];
    }

    public static function setUserClaims(string $uid, array $claims): bool
    {
        if (!self::isSupabaseEnabled()) return false;

        try {
            $config = self::getSupabaseConfig();
            $url = rtrim($config['url'], '/') . '/auth/v1/admin/users/' . $uid;

            $response = Http::withHeaders([
                'apikey' => $config['key'],
                'Authorization' => 'Bearer ' . $config['key'],
            ])->put($url, [
                'app_metadata' => $claims,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('🔥 Supabase setUserClaims failed: ' . $e->getMessage());
            return false;
        }
    }

    public static function getUserClaims(string $uid): array
    {
        if (!self::isSupabaseEnabled()) return [];

        try {
            $config = self::getSupabaseConfig();
            $url = rtrim($config['url'], '/') . '/auth/v1/admin/users/' . $uid;

            $response = Http::withHeaders([
                'apikey' => $config['key'],
                'Authorization' => 'Bearer ' . $config['key'],
            ])->get($url);

            if ($response->successful()) {
                return $response->json('app_metadata') ?? [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('🔥 Supabase getUserClaims failed: ' . $e->getMessage());
            return [];
        }
    }

    public static function getUserByEmail(string $email): ?array
    {
        if (!self::isSupabaseEnabled()) return null;

        try {
            $config = self::getSupabaseConfig();
            // In Supabase, you can list users and filter, but admin API doesn't have a direct /userByEmail endpoint in standard REST.
            // We use the admin users list with pagination/search.
            $url = rtrim($config['url'], '/') . '/auth/v1/admin/users';

            $response = Http::withHeaders([
                'apikey' => $config['key'],
                'Authorization' => 'Bearer ' . $config['key'],
            ])->get($url);

            if ($response->successful()) {
                $users = $response->json('users') ?? [];
                foreach ($users as $user) {
                    if ($user['email'] === $email) {
                        return [
                            'localId' => $user['id'],
                            'email' => $user['email'],
                        ];
                    }
                }
            }
            return null;
        } catch (\Exception $e) {
            Log::error('🔥 Supabase getUserByEmail failed: ' . $e->getMessage());
            return null;
        }
    }

    public static function verifyUserEmail(string $uid): bool
    {
        if (!self::isSupabaseEnabled()) return false;

        try {
            $config = self::getSupabaseConfig();
            $url = rtrim($config['url'], '/') . '/auth/v1/admin/users/' . $uid;

            $response = Http::withHeaders([
                'apikey' => $config['key'],
                'Authorization' => 'Bearer ' . $config['key'],
            ])->put($url, [
                'email_confirm' => true,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('🔥 Supabase verifyUserEmail failed: ' . $e->getMessage());
            return false;
        }
    }
}
