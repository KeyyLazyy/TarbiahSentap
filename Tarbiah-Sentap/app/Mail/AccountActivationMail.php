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
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Account Activation | Tarbiah Sentap</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,500;0,600;1,500&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  @media only screen and (max-width: 600px) {
    .main-wrapper { padding: 12px !important; }
    .content-container { padding: 32px 20px !important; }
    .heading-lg { font-size: 28px !important; }
    .heading-md { font-size: 24px !important; }
    .text-base { font-size: 16px !important; line-height: 24px !important; }
    .btn { padding: 16px 24px !important; width: 100% !important; box-sizing: border-box !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Hanken Grotesk', Arial, sans-serif; color: #1a1c1c; -webkit-text-size-adjust: 100%;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9f9f9; width: 100%; min-height: 100vh;">
    <tr>
      <td align="center" class="main-wrapper" style="padding: 24px;">
        
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 50px -12px rgba(97, 0, 0, 0.08); border: 1px solid rgba(212, 175, 55, 0.15);">
          
          <!-- Decorative Top Border -->
          <tr>
            <td style="height: 6px; background-color: #8b0000; width: 100%; font-size: 6px; line-height: 6px;">&nbsp;</td>
          </tr>
          
          <tr>
            <td align="center" class="content-container" style="padding: 48px 32px;">
              
              <!-- Header: Brand Logo -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 48px;">
                <tr>
                  <td align="center">
                    <h1 class="heading-lg" style="font-family: 'EB Garamond', Georgia, serif; font-size: 32px; font-weight: 500; color: #610000; margin: 0; font-style: italic; letter-spacing: -0.02em;">
                      Tarbiah Sentap
                    </h1>
                    <div style="margin-top: 8px; text-align: center;">
                      <span style="display: inline-block; width: 32px; height: 1px; background-color: rgba(227, 190, 184, 0.3); vertical-align: middle;"></span>
                      <span style="display: inline-block; color: #735c00; font-size: 14px; margin: 0 8px; vertical-align: middle;">&#10003;</span>
                      <span style="display: inline-block; width: 32px; height: 1px; background-color: rgba(227, 190, 184, 0.3); vertical-align: middle;"></span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Subject & Salutation -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="text-align: left;">
                <tr>
                  <td>
                    <h2 class="heading-md" style="font-family: 'EB Garamond', Georgia, serif; font-size: 24px; font-weight: 600; color: #1a1c1c; margin: 0 0 32px 0; border-bottom: 1px solid #8b0000; display: inline-block; padding-bottom: 4px;">
                      Tarbiah Sentap Security
                    </h2>
                    <p class="heading-md" style="font-family: 'EB Garamond', Georgia, serif; font-size: 24px; font-weight: 500; color: #1a1c1c; margin: 0 0 24px 0; font-style: italic;">
                      Dear {$this->userName},
                    </p>
                    <p class="text-base" style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; line-height: 28px; font-weight: 400; color: #5a403c; margin: 0 0 24px 0;">
                      Thank you for registering on our secure e-commerce platform. Our systems are dedicated to the preservation of intellectual and spiritual growth through literary excellence.
                    </p>
                    <p class="text-base" style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; line-height: 28px; font-weight: 400; color: #5a403c; margin: 0;">
                      To complete your registration and activate your account within our digital archive, please click the button below:
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 48px 0;">
                <tr>
                  <td align="center">
                    <a href="{$this->activationUrl}" class="btn" style="background-color: #8b0000; color: #ffffff; padding: 20px 40px; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; display: inline-block; border-radius: 4px; box-shadow: 0 4px 14px 0 rgba(139, 0, 0, 0.3);">
                      Activate Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid rgba(227, 190, 184, 0.2); padding-top: 40px;">
                <tr>
                  <td style="width: 24px; vertical-align: top; padding-top: 2px;">
                    <span style="color: #735c00; font-size: 20px;">&#128274;</span>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 16px; line-height: 24px; color: #5a403c; font-style: italic; margin: 0;">
                      Security Note: This activation link is digitally signed and will expire shortly for your protection. If you did not sign up for this account, please disregard this correspondence. No further action is required.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          
          <!-- Institutional Footer -->
          <tr>
            <td align="center" style="background-color: #f3f3f4; padding: 32px; border-top: 1px solid rgba(227, 190, 184, 0.1);">
              <p style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em; color: rgba(90, 64, 60, 0.7); margin: 0;">
                Secure-by-Design Integrated System Framework &copy; 2026
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
HTML;

        return new Content(
            htmlString: $html,
        );
    }
}
