const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'd4bdb6f073abf6',
    pass: '0c211de82fbf37'
  }
});

const sendVerificationEmail = async (to, link) => {
  try {
    const info = await transporter.sendMail({
      from: '"Tarbiah Sentap" <noreply@tarbiahsentap.com>',
      to: to,
      subject: 'Verify your Tarbiah Sentap Account',
      text: `Hello!\n\nPlease click the following link to verify your account:\n${link}\n\nThank you!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
          <h2 style="color: #8b0000;">Welcome to Tarbiah Sentap!</h2>
          <p>Please click the button below to verify your account.</p>
          <a href="${link}" style="display: inline-block; background-color: #8b0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px;">Verify Account</a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">Or copy and paste this link into your browser:<br/>${link}</p>
        </div>
      `
    });
    console.log('✉️ Mailtrap Verification Email Sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('🔥 Error sending email via Mailtrap:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail
};
