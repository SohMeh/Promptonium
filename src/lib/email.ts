import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const fromAddress = process.env.EMAIL_FROM || "Promptonium <onboarding@resend.dev>";
  const { error } = await getResend().emails.send({
    from: fromAddress,
    to: email,
    subject: "Reset your Promptonium password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c3aed;">Promptonium</h2>
        <p>You requested a password reset. Click the link below to choose a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="color: #888; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  const fromAddress = process.env.EMAIL_FROM || "Promptonium <onboarding@resend.dev>";
  const { error } = await getResend().emails.send({
    from: fromAddress,
    to: email,
    subject: "Your Promptonium verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c3aed;">Promptonium</h2>
        <p>Your email verification code is:</p>
        <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c3aed; text-align: center; padding: 16px 0;">${code}</p>
        <p style="color: #888; font-size: 14px;">This code expires in 15 minutes. If you didn't create a Promptonium account, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
