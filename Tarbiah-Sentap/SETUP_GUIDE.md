# Setup Guide - Authentication System

## Prerequisites
- Laravel 11+
- PHP 8.1+
- SQLite or MySQL database
- Composer

## Installation Steps

### 1. Install Required Packages

First, ensure Laravel Sanctum is installed for API token authentication:

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 2. Configure Email (Important for Email Verification)

Update your `.env` file:

```env
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com  # or your email service
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Tarbiah Sentap"
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate an "App Password" (not your Gmail password)
3. Use the App Password in `MAIL_PASSWORD`

**Alternative (Development):**
```env
MAIL_DRIVER=log  # Emails will be logged to storage/logs/laravel.log
```

### 3. Run Migrations

```bash
php artisan migrate
```

This will:
- Create the users table with new fields (role, totp_secret, totp_enabled, phone)
- Create password_reset_tokens table
- Create sessions table

### 4. Create Test Users (Optional)

Create a Tinker session:

```bash
php artisan tinker
```

Then run:

```php
// Create a customer user
User::create([
    'name' => 'John Customer',
    'email' => 'customer@example.com',
    'password' => bcrypt('SecurePass123!@#'),
    'phone' => '+60123456789',
    'role' => 'customer',
    'email_verified_at' => now(),  // Pre-verify for testing
]);

// Create an admin user
User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('SecurePass123!@#'),
    'phone' => '+60123456789',
    'role' => 'admin',
    'email_verified_at' => now(),  // Pre-verify for testing
]);

exit
```

### 5. Start the Development Server

```bash
php artisan serve
```

The API will be available at: `http://localhost:8000/api`

## Testing the API

### Using Postman or Thunder Client:

#### 1. Register a New User
- **Method:** POST
- **URL:** `http://localhost:8000/api/auth/register`
- **Body (JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPass123!@#",
  "phone": "+60123456789",
  "role": "customer"
}
```

#### 2. Check Email Verification
For development, verify the email in the database or through the email log:

```bash
php artisan tinker
User::where('email', 'test@example.com')->update(['email_verified_at' => now()])
exit
```

#### 3. Login
- **Method:** POST
- **URL:** `http://localhost:8000/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "TestPass123!@#"
}
```

#### 4. Get Current User (Protected)
- **Method:** GET
- **URL:** `http://localhost:8000/api/auth/me`
- **Headers:**
```
Authorization: Bearer {token_from_login}
```

#### 5. Setup TOTP for Admin
- **Method:** POST
- **URL:** `http://localhost:8000/api/auth/totp/setup`
- **Headers:**
```
Authorization: Bearer {admin_token}
```
- Save the `secret` and scan `qr_code_url` with Google Authenticator

#### 6. Confirm TOTP
- **Method:** POST
- **URL:** `http://localhost:8000/api/auth/totp/confirm`
- **Headers:**
```
Authorization: Bearer {admin_token}
```
- **Body (JSON):**
```json
{
  "totp_secret": "{secret_from_setup}",
  "totp_code": "{6_digit_code_from_authenticator}"
}
```

## File Structure

Created/Modified files:
```
Tarbiah-Sentap/
├── database/migrations/
│   └── 2026_05_25_000003_add_role_and_totp_to_users_table.php
├── app/
│   ├── Models/
│   │   └── User.php (updated)
│   ├── Services/
│   │   └── TotpService.php (new)
│   └── Http/Controllers/
│       └── AuthController.php (new)
├── routes/
│   └── api.php (new)
└── API_DOCUMENTATION.md (new)
```

## Common Issues & Solutions

### Issue: Emails not sending
**Solution:** Check `.env` mail configuration. Use `MAIL_DRIVER=log` for development.

### Issue: TOTP code not working
**Solution:** 
- Ensure server time is synchronized with NTP
- TOTP codes expire every 30 seconds
- Use codes within ±30 second window

### Issue: Token errors
**Solution:** 
- Ensure Laravel Sanctum is installed
- Run: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`

### Issue: CORS errors (when using from frontend)
**Solution:** Install and configure CORS:
```bash
composer require fruitcake/laravel-cors
```

Then update `config/cors.php` to allow your frontend domain.

## Next Steps

1. **Frontend Integration:** Build React/Vue components for login/register forms
2. **Email Verification:** Implement email verification link UI
3. **TOTP UI:** Create admin TOTP setup interface
4. **Password Reset:** Implement forgot password functionality
5. **Rate Limiting:** Add API rate limiting to prevent brute force attacks

## Security Recommendations

1. ✅ Passwords are hashed using bcrypt
2. ✅ TOTP uses SHA1-HMAC (industry standard)
3. ✅ API tokens use Laravel Sanctum
4. ⏳ Add rate limiting for login attempts
5. ⏳ Implement CORS properly for frontend
6. ⏳ Use HTTPS in production
7. ⏳ Implement logout on all devices
8. ⏳ Add password change functionality

## Support

For issues or questions about:
- **Laravel:** https://laravel.com/docs
- **Sanctum:** https://laravel.com/docs/sanctum
- **TOTP:** https://en.wikipedia.org/wiki/Time-based_one-time_password
