<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountActivationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $activationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(string $userName, string $activationUrl)
    {
        $this->userName = $userName;
        $this->activationUrl = $activationUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Activate Your Tarbiah Sentap Account',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $html = "
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e8e8e8; border-radius: 8px; background-color: #0c0d0e; color: #ffffff;\">
            <h2 style=\"color: #D4AF37; text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;\">Tarbiah Sentap Security</h2>
            <p>Dear {$this->userName},</p>
            <p>Thank you for registering on our secure e-commerce platform. To complete your registration and activate your account, please click the button below:</p>
            <div style=\"text-align: center; margin: 30px 0;\">
                <a href=\"{$this->activationUrl}\" style=\"background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%); color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;\">Activate Account</a>
            </div>
            <p style=\"font-size: 12px; color: #a0a0a0;\">This activation link is signed and will expire shortly. If you did not sign up for this account, please ignore this email.</p>
            <hr style=\"border-color: #222222; margin-top: 30px;\">
            <p style=\"font-size: 10px; color: #666666; text-align: center;\">Secure-by-Design Integrated System Framework &copy; 2026</p>
        </div>
        ";

        return new Content(
            htmlString: $html,
        );
    }
}
