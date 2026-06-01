<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserDevice;
use App\Services\TotpService;
use App\Services\FirebaseService;
use App\Mail\AccountActivationMail;
use App\Mail\NewDeviceVerificationMail;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user (customer or admin)
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)->mixedCase()->numbers()->symbols()],
            'phone' => 'required|string|min:10|max:15',
            'role' => 'in:customer,admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $firebaseUid = null;
            if (FirebaseService::isFirebaseEnabled()) {
                // Register in Firebase Auth
                $fbUser = FirebaseService::signUp($request->email, $request->password);
                $firebaseUid = $fbUser['uid'];
                
                // Assign role in Firebase custom claims
                FirebaseService::setUserClaims($firebaseUid, [
                    'role' => $request->role ?? 'customer'
                ]);
            }

            // Sync/create in local SQLite DB
            // We set email_verified_at = null initially for activation check
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'phone' => $request->phone,
                'role' => $request->role ?? 'customer',
            ]);

            // Generate signed activation URL
            $activationUrl = URL::temporarySignedRoute(
                'activate',
                now()->addMinutes(60),
                ['id' => $user->id, 'hash' => sha1($user->email)]
            );

            // Send activation email
            Mail::to($user->email)->send(new AccountActivationMail($user->name, $activationUrl));

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully. Please check your email to activate your account.',
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user with email and password
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (FirebaseService::isFirebaseEnabled()) {
                // Verify credentials via Firebase Auth REST API
                try {
                    $fbUser = FirebaseService::signIn($request->email, $request->password);
                    $uid = $fbUser['uid'];
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid email or password.'
                    ], 401);
                }

                // Retrieve custom claims and user info from Firebase Auth
                $claims = FirebaseService::getUserClaims($uid);
                $fbUserDetail = FirebaseService::getUserByEmail($request->email);
                $isEmailVerified = $fbUserDetail && !empty($fbUserDetail['emailVerified']);

                // Get or create mirror local SQLite user
                $user = User::where('email', $request->email)->first();
                if (!$user) {
                    $user = new User([
                        'name' => explode('@', $request->email)[0],
                        'email' => $request->email,
                        'password' => Hash::make(Str::random(16)),
                        'phone' => $claims['phone'] ?? '',
                        'role' => $claims['role'] ?? 'customer',
                        'totp_secret' => $claims['totpSecret'] ?? null,
                        'totp_enabled' => !empty($claims['totpSecret']),
                    ]);
                    if ($isEmailVerified) {
                        $user->email_verified_at = now();
                    }
                    $user->save();
                } else {
                    // Update user fields from Firebase custom claims
                    $user->fill([
                        'role' => $claims['role'] ?? $user->role,
                        'totp_secret' => $claims['totpSecret'] ?? $user->totp_secret,
                        'totp_enabled' => isset($claims['totpSecret']) ? true : $user->totp_enabled,
                    ]);

                    if (!$user->email_verified_at && $isEmailVerified) {
                        $user->email_verified_at = now();
                    }

                    $user->save();
                }
            } else {
                // Standard SQLite/Mock check
                $user = User::where('email', $request->email)->first();

                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid email or password.'
                    ], 401);
                }

                // Check password
                if (!Hash::check($request->password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid email or password.'
                    ], 401);
                }
            }

            // Check if email is verified/activated
            if (!$user->email_verified_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please activate your account before logging in.'
                ], 403);
            }

            // Device Verification Challenge
            $verifiedDevice = UserDevice::where('user_id', $user->id)
                ->where('ip_address', $request->ip())
                ->where('user_agent', $request->userAgent())
                ->whereNotNull('verified_at')
                ->first();

            if (!$verifiedDevice) {
                // Generate a random 6-digit verification code
                $code = sprintf("%06d", random_int(0, 999999));

                $device = UserDevice::where('user_id', $user->id)
                    ->where('ip_address', $request->ip())
                    ->where('user_agent', $request->userAgent())
                    ->first();

                if (!$device) {
                    UserDevice::create([
                        'user_id' => $user->id,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'verification_code' => $code,
                        'code_expires_at' => now()->addMinutes(10),
                        'verified_at' => null,
                    ]);
                } else {
                    $device->update([
                        'verification_code' => $code,
                        'code_expires_at' => now()->addMinutes(10),
                        'verified_at' => null,
                    ]);
                }

                // Send the verification email
                Mail::to($user->email)->send(new NewDeviceVerificationMail(
                    $user->name,
                    $code,
                    $request->ip(),
                    $request->userAgent()
                ));

                return response()->json([
                    'success' => true,
                    'requires_device_verification' => true,
                    'message' => 'New device detected. Please verify your identity using the code sent to your email.',
                    'user_id' => $user->id,
                    'email' => $user->email,
                ], 202);
            }

            // If admin and TOTP is enabled, require TOTP verification
            if ($user->isAdmin() && $user->totp_enabled) {
                return response()->json([
                    'success' => true,
                    'message' => 'TOTP verification required',
                    'requires_totp' => true,
                    'temp_token' => $user->createToken('temp-' . time())->plainTextToken,
                    'user_id' => $user->id,
                ], 200);
            }

            // Generate API token
            $token = $user->createToken('api-token-' . time())->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify TOTP code for admin users
     */
    public function verifyTotp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'totp_code' => 'required|string',
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($request->user_id);

            // Verify TOTP is enabled and user is admin
            if (!$user->isAdmin() || !$user->totp_enabled) {
                return response()->json([
                    'success' => false,
                    'message' => 'TOTP is not enabled for this account.'
                ], 403);
            }

            // Verify TOTP code
            if (!TotpService::verify($user->totp_secret, $request->totp_code)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid TOTP code.'
                ], 401);
            }

            // Revoke temp token and create new token
            $user->tokens()->delete();
            $token = $user->createToken('api-token-' . time())->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'TOTP verification successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'TOTP verification failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Setup TOTP for admin users
     */
    public function setupTotp(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only admins can setup TOTP
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admin users can setup TOTP.'
            ], 403);
        }

        try {
            $secret = TotpService::generateSecret();
            $qrCodeUrl = TotpService::getQrCodeImageUrl($secret, $user->email, 'TarbiahSentap');

            return response()->json([
                'success' => true,
                'message' => 'TOTP setup started. Scan the QR code with your authenticator app.',
                'secret' => $secret,
                'qr_code_url' => $qrCodeUrl,
                'manual_entry_key' => $secret,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'TOTP setup failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm TOTP setup with verification code
     */
    public function confirmTotp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'totp_secret' => 'required|string',
            'totp_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Only admins can setup TOTP
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admin users can setup TOTP.'
            ], 403);
        }

        try {
            // Verify TOTP code
            if (!TotpService::verify($request->totp_secret, $request->totp_code)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid TOTP code. Please try again.'
                ], 401);
            }

            // Save TOTP secret and enable it
            $user->update([
                'totp_secret' => $request->totp_secret,
                'totp_enabled' => true,
            ]);

            // Sync to Firebase claims if active
            if (FirebaseService::isFirebaseEnabled()) {
                $fbUser = FirebaseService::getUserByEmail($user->email);
                if ($fbUser) {
                    $claims = json_decode($fbUser['customAttributes'] ?? '{}', true) ?? [];
                    $claims['role'] = $user->role;
                    $claims['totpSecret'] = $request->totp_secret;
                    FirebaseService::setUserClaims($fbUser['localId'], $claims);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'TOTP has been successfully enabled for your account.',
                'totp_enabled' => true,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'TOTP confirmation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disable TOTP for admin users
     */
    public function disableTotp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password.'
            ], 401);
        }

        try {
            $user->update([
                'totp_secret' => null,
                'totp_enabled' => false,
            ]);

            // Sync to Firebase claims if active
            if (FirebaseService::isFirebaseEnabled()) {
                $fbUser = FirebaseService::getUserByEmail($user->email);
                if ($fbUser) {
                    $claims = json_decode($fbUser['customAttributes'] ?? '{}', true) ?? [];
                    unset($claims['totpSecret']);
                    FirebaseService::setUserClaims($fbUser['localId'], $claims);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'TOTP has been disabled for your account.',
                'totp_enabled' => false,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to disable TOTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Revoke all tokens
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user
     */
    public function getCurrentUser(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'totp_enabled' => $user->totp_enabled,
            ]
        ], 200);
    }

    /**
     * Activate the user account using the signed URL
     */
    public function activate(Request $request, $id, $hash)
    {
        if (! $request->hasValidSignature()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired activation link.'
                ], 403);
            }
            abort(403, 'Invalid or expired activation link.');
        }

        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->email))) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid activation signature.'
                ], 403);
            }
            abort(403, 'Invalid activation signature.');
        }

        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
            $user->save();

            // Sync with Firebase if active
            if (FirebaseService::isFirebaseEnabled()) {
                $fbUser = FirebaseService::getUserByEmail($user->email);
                if ($fbUser && isset($fbUser['localId'])) {
                    FirebaseService::verifyUserEmailInFirebase($fbUser['localId']);
                }
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Account activated successfully.'
            ], 200);
        }

        // Redirect to React frontend login page with activation success indicator
        return redirect()->away('http://localhost:5173/login?activated=true');
    }

    /**
     * Verify the 6-digit code for a new device login
     */
    public function verifyDevice(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'verification_code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        $device = UserDevice::where('user_id', $user->id)
            ->where('ip_address', $request->ip())
            ->where('user_agent', $request->userAgent())
            ->where('verification_code', $request->verification_code)
            ->first();

        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code.'
            ], 401);
        }

        if ($device->code_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired.'
            ], 401);
        }

        // Mark the device as verified
        $device->update([
            'verified_at' => now(),
            'verification_code' => null,
            'code_expires_at' => null,
        ]);

        // Proceed to complete login (checking TOTP if applicable)
        if ($user->isAdmin() && $user->totp_enabled) {
            return response()->json([
                'success' => true,
                'message' => 'TOTP verification required',
                'requires_totp' => true,
                'temp_token' => $user->createToken('temp-' . time())->plainTextToken,
                'user_id' => $user->id,
            ], 200);
        }

        // Issue final token
        $token = $user->createToken('api-token-' . time())->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Device verified and login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 200);
    }
}
