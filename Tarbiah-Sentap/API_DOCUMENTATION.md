# Authentication API Documentation

## Base URL
```
http://localhost/api
```

## Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`

**Description:** Register a new customer or admin user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!@#",
  "phone": "+60123456789",
  "role": "customer"  // or "admin" (default: customer)
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one symbol (!@#$%^&*)

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "user_id": 1,
  "email": "john@example.com",
  "role": "customer"
}
```

**Error Response (422):**
```json
{
  "success": false,
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`

**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!@#"
}
```

**Response (200 - Customer):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+60123456789",
    "role": "customer"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 - Admin with TOTP enabled):**
```json
{
  "success": true,
  "message": "TOTP verification required",
  "requires_totp": true,
  "temp_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_id": 2
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Please verify your email before logging in."
}
```

---

### 3. Verify TOTP Code
**Endpoint:** `POST /auth/verify-totp`

**Description:** Verify TOTP code for admin users during login

**Request Body:**
```json
{
  "user_id": 2,
  "totp_code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "TOTP verification successful",
  "user": {
    "id": 2,
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "+60123456789",
    "role": "admin"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid TOTP code."
}
```

---

### 4. Setup TOTP (Admin Only)
**Endpoint:** `POST /auth/totp/setup`

**Headers:**
```
Authorization: Bearer {token}
```

**Description:** Generate TOTP secret and QR code for admin

**Response (200):**
```json
{
  "success": true,
  "message": "TOTP setup started. Scan the QR code with your authenticator app.",
  "secret": "JBSWY3DPEBLW64TMMQ5AV3VXKQ",
  "qr_code_url": "https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=...",
  "manual_entry_key": "JBSWY3DPEBLW64TMMQ5AV3VXKQ"
}
```

---

### 5. Confirm TOTP Setup (Admin Only)
**Endpoint:** `POST /auth/totp/confirm`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "totp_secret": "JBSWY3DPEBLW64TMMQ5AV3VXKQ",
  "totp_code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "TOTP has been successfully enabled for your account.",
  "totp_enabled": true
}
```

---

### 6. Disable TOTP (Admin Only)
**Endpoint:** `POST /auth/totp/disable`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "password": "SecurePass123!@#"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "TOTP has been disabled for your account.",
  "totp_enabled": false
}
```

---

### 7. Logout
**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### 8. Get Current User
**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+60123456789",
    "role": "customer",
    "email_verified_at": "2026-05-25T10:30:00.000000Z",
    "totp_enabled": false
  }
}
```

---

## Authentication

All protected endpoints require the `Authorization` header with a Bearer token:

```
Authorization: Bearer {token}
```

The token is returned after successful login or TOTP verification.

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Setup Instructions

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. For Authenticator Apps (Admin TOTP)
- Use Google Authenticator, Microsoft Authenticator, or Authy
- Scan the QR code provided in the setup response
- Or manually enter the secret key

### 3. Testing with cURL

**Register:**
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!@#",
    "phone": "+60123456789",
    "role": "customer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!@#"
  }'
```

**Setup TOTP (Admin):**
```bash
curl -X POST http://localhost/api/auth/totp/setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}"
```

---

## Notes

- Email verification is required before login
- TOTP is optional but recommended for admin accounts
- Tokens are generated using Laravel Sanctum
- All timestamps are in UTC
- Phone format: International format with country code
