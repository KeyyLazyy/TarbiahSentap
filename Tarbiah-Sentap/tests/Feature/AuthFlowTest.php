<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserDevice;
use App\Mail\AccountActivationMail;
use App\Mail\NewDeviceVerificationMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup env variables for test
        config(['services.firebase.api_key' => 'test-api-key']);
        // Fake Google OAuth2 token exchange
        Http::preventStrayRequests();
    }

    public function test_user_registration_sends_activation_email()
    {
        Mail::fake();
        Http::fake([
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=*' => Http::response([
                'localId' => 'fb-test-uid-123',
                'email' => 'test@example.com',
            ], 200),
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-access-token',
            ], 200),
            'https://identitytoolkit.googleapis.com/v1/projects/*/accounts:setCustomAttributes' => Http::response([
                'localId' => 'fb-test-uid-123',
            ], 200),
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'phone' => '0123456789',
            'role' => 'customer',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'User registered successfully. Please check your email to activate your account.',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);

        Mail::assertSent(AccountActivationMail::class, function ($mail) use ($user) {
            return $mail->hasTo('test@example.com') && 
                   str_contains($mail->activationUrl, "/api/auth/activate/{$user->id}/");
        });
    }

    public function test_login_blocked_if_unactivated()
    {
        Http::fake([
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=*' => Http::response([
                'localId' => 'fb-test-uid-123',
                'email' => 'test@example.com',
                'idToken' => 'mock-id-token',
            ], 200),
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-access-token',
            ], 200),
            'https://identitytoolkit.googleapis.com/v1/projects/*/accounts:lookup' => Http::response([
                'users' => [
                    [
                        'localId' => 'fb-test-uid-123',
                        'email' => 'test@example.com',
                        'emailVerified' => false,
                        'customAttributes' => json_encode(['role' => 'customer']),
                    ]
                ]
            ], 200),
        ]);

        $user = new User([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'phone' => '0123456789',
            'role' => 'customer',
        ]);
        $user->email_verified_at = null;
        $user->save();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Please activate your account before logging in.',
        ]);
    }

    public function test_account_activation_flow()
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-access-token',
            ], 200),
            'https://identitytoolkit.googleapis.com/v1/projects/*/accounts:lookup' => Http::response([
                'users' => [
                    [
                        'localId' => 'fb-test-uid-123',
                        'email' => 'test@example.com',
                        'emailVerified' => false,
                    ]
                ]
            ], 200),
            'https://identitytoolkit.googleapis.com/v1/projects/*/accounts:update' => Http::response([
                'localId' => 'fb-test-uid-123',
                'emailVerified' => true,
            ], 200),
        ]);

        $user = new User([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'phone' => '0123456789',
            'role' => 'customer',
        ]);
        $user->email_verified_at = null;
        $user->save();

        $activationUrl = URL::temporarySignedRoute(
            'activate',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        // Call the activation endpoint
        $response = $this->getJson($activationUrl);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Account activated successfully.',
        ]);

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_login_from_new_device_triggers_challenge()
    {
        Mail::fake();
        Http::fake([
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=*' => Http::response([
                'localId' => 'fb-test-uid-123',
                'email' => 'test@example.com',
                'idToken' => 'mock-id-token',
            ], 200),
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-access-token',
            ], 200),
            'https://identitytoolkit.googleapis.com/v1/projects/*/accounts:lookup' => Http::response([
                'users' => [
                    [
                        'localId' => 'fb-test-uid-123',
                        'email' => 'test@example.com',
                        'emailVerified' => true,
                        'customAttributes' => json_encode(['role' => 'customer']),
                    ]
                ]
            ], 200),
        ]);

        $user = new User([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'phone' => '0123456789',
            'role' => 'customer',
        ]);
        $user->email_verified_at = now();
        $user->save();

        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ])->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(202);
        $response->assertJson([
            'success' => true,
            'requires_device_verification' => true,
        ]);

        $device = UserDevice::where('user_id', $user->id)->first();
        $this->assertNotNull($device);
        $this->assertNull($device->verified_at);
        $this->assertNotNull($device->verification_code);

        Mail::assertSent(NewDeviceVerificationMail::class, function ($mail) use ($user, $device) {
            return $mail->hasTo('test@example.com') && 
                   $mail->verificationCode === $device->verification_code;
        });
    }

    public function test_verify_device_completes_login()
    {
        $user = new User([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'phone' => '0123456789',
            'role' => 'customer',
        ]);
        $user->email_verified_at = now();
        $user->save();

        $device = UserDevice::create([
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'verification_code' => '654321',
            'code_expires_at' => now()->addMinutes(10),
            'verified_at' => null,
        ]);

        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ])->postJson('/api/auth/verify-device', [
            'email' => 'test@example.com',
            'verification_code' => '654321',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Device verified and login successful',
        ]);
        $response->assertJsonStructure(['token', 'user']);

        $device->refresh();
        $this->assertNotNull($device->verified_at);
    }
}
