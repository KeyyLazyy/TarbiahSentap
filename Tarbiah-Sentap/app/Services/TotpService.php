<?php

namespace App\Services;

class TotpService
{
    /**
     * Generate a new TOTP secret
     */
    public static function generateSecret(): string
    {
        // Generate a 32-character random secret
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        for ($i = 0; $i < 32; $i++) {
            $secret .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $secret;
    }

    /**
     * Verify a TOTP code
     */
    public static function verify(string $secret, string $code, int $windowSize = 1): bool
    {
        $code = trim($code);
        
        // Remove spaces from code
        $code = str_replace(' ', '', $code);
        
        // Code must be 6 digits
        if (!preg_match('/^\d{6}$/', $code)) {
            return false;
        }

        $time = floor(time() / 30);

        // Check current time and adjacent windows
        for ($i = -$windowSize; $i <= $windowSize; $i++) {
            $timeCounter = $time + $i;
            $hash = hash_hmac('sha1', pack('N*', 0) . pack('N*', $timeCounter), self::base32Decode($secret), true);
            $offset = ord($hash[19]) & 0xf;
            $fourBytes = unpack('N', substr($hash, $offset, 4))[1];
            $totp = ($fourBytes & 0x7fffffff) % 1000000;
            $totpStr = str_pad($totp, 6, '0', STR_PAD_LEFT);

            if (hash_equals($totpStr, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate QR code URL for authenticator apps
     */
    public static function getQrCodeUrl(string $secret, string $email, string $issuer = 'TarbiahSentap'): string
    {
        $label = rawurlencode("{$issuer}:{$email}");
        $secret = rawurlencode($secret);
        $issuer = rawurlencode($issuer);

        return "otpauth://totp/{$label}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";
    }

    /**
     * Generate QR code image URL using Google Charts API
     */
    public static function getQrCodeImageUrl(string $secret, string $email, string $issuer = 'TarbiahSentap'): string
    {
        $url = self::getQrCodeUrl($secret, $email, $issuer);
        return 'https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=' . urlencode($url);
    }

    /**
     * Decode base32 string
     */
    private static function base32Decode(string $encoded): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $encoded = strtoupper($encoded);
        $decoded = '';

        for ($i = 0; $i < strlen($encoded); $i += 8) {
            $chunk = substr($encoded, $i, 8);
            $output = 0;

            for ($j = 0; $j < strlen($chunk); $j++) {
                $output = ($output << 5) | strpos($chars, $chunk[$j]);
            }

            $bytes = ceil(strlen($chunk) * 5 / 8);
            $binary = pack('N', $output);
            $decoded .= substr($binary, 4 - $bytes);
        }

        return $decoded;
    }
}
