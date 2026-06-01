<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewDeviceVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $verificationCode;
    public string $ipAddress;
    public string $userAgent;

    /**
     * Create a new message instance.
     */
    public function __construct(string $userName, string $verificationCode, string $ipAddress, string $userAgent)
    {
        $this->userName = $userName;
        $this->verificationCode = $verificationCode;
        $this->ipAddress = $ipAddress;
        $this->userAgent = $userAgent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Device Sign-in Request Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $html = "
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e8e8e8; border-radius: 8px; background-color: #0c0d0e; color: #ffffff;\">
            <h2 style=\"color: #D4AF37; text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;\">Tarbiah Sentap Security Alert</h2>
            <p>Dear {$this->userName},</p>
            <p>We detected a sign-in attempt to your account from a new, unrecognized device or browser.</p>
            
            <div style=\"background-color: #1a1c1e; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; line-height: 1.6;\">
                <strong>Sign-in Details:</strong><br>
                • <strong>IP Address:</strong> {$this->ipAddress}<br>
                • <strong>Browser / Device:</strong> {$this->userAgent}
            </div>

            <p>To verify this is you, please enter the following 6-digit device verification code on the login screen:</p>
            
            <div style=\"text-align: center; margin: 30px 0;\">
                <span style=\"background-color: #1a1c1e; border: 2px dashed #D4AF37; color: #D4AF37; padding: 15px 40px; border-radius: 12px; font-weight: 900; font-size: 32px; letter-spacing: 6px; display: inline-block;\">{$this->verificationCode}</span>
            </div>
            
            <p style=\"font-size: 12px; color: #a0a0a0;\">This code is valid for 10 minutes. If you did not attempt to sign in, please change your password immediately to protect your account.</p>
            <hr style=\"border-color: #222222; margin-top: 30px;\">
            <p style=\"font-size: 10px; color: #666666; text-align: center;\">Secure-by-Design Integrated System Framework &copy; 2026</p>
        </div>
        ";

        return new Content(
            htmlString: $html,
        );
    }
}
