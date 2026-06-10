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
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tarbiah Sentap Security Alert</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  @media only screen and (max-width: 600px) {
    .main-wrapper { padding: 12px !important; }
    .content-container { padding: 32px 20px !important; }
    .heading-lg { font-size: 36px !important; line-height: 42px !important; }
    .text-base { font-size: 16px !important; line-height: 24px !important; }
    .stack-col { display: block !important; width: 100% !important; }
    .meta-label { padding-bottom: 4px !important; }
    .meta-value { padding-bottom: 20px !important; word-break: break-all !important; }
    .otp-wrapper { padding: 16px 20px !important; }
    .otp-code { font-size: 48px !important; letter-spacing: 0.15em !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: 'Hanken Grotesk', Arial, sans-serif; color: #1a1c1c; -webkit-text-size-adjust: 100%;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9f9f9; min-height: 100vh;">
    <tr>
      <td align="center" class="main-wrapper" style="padding: 24px;">
        
        <!-- Main Archival Document Shell -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 672px; width: 100%; background-color: #f9f9f9; border: 1px solid rgba(227, 190, 184, 0.3); position: relative; overflow: hidden; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
          
          <!-- Decorative Top Border -->
          <tr>
            <td style="height: 4px; background-color: #8b0000; width: 100%; font-size: 4px; line-height: 4px;">&nbsp;</td>
          </tr>
          
          <tr>
            <td align="left" class="content-container" style="padding: 48px 32px; position: relative;">

              <!-- Decorative Watermark Icon (Email safe fallback) -->
              <span style="position: absolute; top: 16px; right: 16px; color: rgba(227, 190, 184, 0.2); font-size: 80px; font-family: sans-serif;">&#10003;</span>
              
              <!-- Content Header -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 48px; border-bottom: 1px solid rgba(227, 190, 184, 0.2); padding-bottom: 32px;">
                <tr>
                  <td align="left">
                    <div style="color: #8b0000; margin-bottom: 16px;">
                      <span style="font-size: 24px; vertical-align: middle; margin-right: 8px;">&#128272;</span>
                      <span style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: middle;">Official Correspondence</span>
                    </div>
                    <h2 class="heading-lg" style="font-family: 'EB Garamond', Georgia, serif; font-size: 48px; line-height: 56px; font-weight: 500; color: #1a1c1c; margin: 0;">Tarbiah Sentap Security Alert</h2>
                  </td>
                </tr>
              </table>

              <!-- Salutation & Body -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px;">
                <tr>
                  <td>
                    <p style="font-family: 'EB Garamond', Georgia, serif; font-size: 24px; line-height: 32px; font-weight: 600; font-style: italic; color: #5a403c; margin: 0 0 24px 0;">Dear {$this->userName},</p>
                    <p class="text-base" style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; line-height: 28px; color: #1a1c1c; margin: 0;">
                        We detected a sign-in attempt to your account from a new, unrecognized device or browser. To safeguard the integrity of your editorial collection and personal data, we require immediate verification.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Details Section - High Contrast / Editorial Split -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f3f4; border-left: 4px solid #8b0000; margin-bottom: 48px;">
                <tr>
                  <td class="content-container" style="padding: 24px;">
                    <h3 style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #8b0000; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: -0.01em;">Event Metadata</h3>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td class="stack-col meta-label" width="30%" valign="top" style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 500; color: #5a403c; text-transform: uppercase; padding-bottom: 12px;">IP ADDRESS</td>
                        <td class="stack-col meta-value" width="70%" valign="top" style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 16px; color: #1a1c1c; padding-bottom: 12px;">{$this->ipAddress}</td>
                      </tr>
                      <tr>
                        <td class="stack-col meta-label" width="30%" valign="top" style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 500; color: #5a403c; text-transform: uppercase;">DEVICE / BROWSER</td>
                        <td class="stack-col meta-value" width="70%" valign="top" style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 16px; color: #1a1c1c; word-break: break-all;">{$this->userAgent}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- OTP Section - Archival Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 2px solid rgba(227, 190, 184, 0.4); background-color: #ffffff; text-align: center; margin-bottom: 48px;">
                <tr>
                  <td class="content-container" align="center" style="padding: 40px 24px;">
                    <p style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 16px; color: #1a1c1c; margin: 0 0 24px 0;">To verify this is you, please enter the following 6-digit device verification code on the login screen:</p>
                    
                    <div class="otp-wrapper" style="display: inline-block; padding: 24px 48px; border: 2px solid rgba(139, 0, 0, 0.3); background-color: #ffffff;">
                      <span class="otp-code" style="font-family: 'EB Garamond', Georgia, serif; font-size: 64px; line-height: 1.1; font-weight: 700; letter-spacing: 0.2em; color: #8b0000; margin-right: -0.2em;">{$this->verificationCode}</span>
                    </div>
                    
                    <p style="margin: 32px 0 0 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 500; color: #5a403c;">
                      <span style="font-size: 16px; vertical-align: middle; margin-right: 8px;">&#9202;</span><span style="vertical-align: middle;">This code is valid for 10 minutes.</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid rgba(227, 190, 184, 0.2); padding-top: 32px;">
                <tr>
                  <td width="30" valign="top">
                    <span style="color: #ba1a1a; font-size: 24px;">&#9888;</span>
                  </td>
                  <td valign="top">
                    <p style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #1a1c1c; text-transform: uppercase; letter-spacing: -0.01em; margin: 0 0 8px 0;">Security Advisory</p>
                    <p style="font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 16px; line-height: 24px; color: #5a403c; margin: 0;">
                        If you did not attempt to sign in, please <a href="#" style="color: #8b0000; text-decoration: underline; font-weight: 600;">change your password immediately</a> to protect your account. Your security is our highest editorial priority.
                    </p>
                  </td>
                </tr>
              </table>

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
