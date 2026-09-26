export function resetPasswordTemplate(data: {
  firstName: string;
  resetUrl: string;
}): string {
  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #fbfbfa;">
    <div style="margin-bottom: 32px;">
      <span style="font-size: 20px; font-weight: 600; color: #1d1d1f;">Prolific</span><span style="font-size: 20px; font-weight: 300; color: #0f6a5b;">Store</span>
    </div>

    <h1 style="font-size: 22px; font-weight: 300; color: #1d1d1f; margin: 0 0 8px;">Reset your password</h1>
    <p style="font-size: 14px; color: #52525b; margin: 0 0 24px;">
      Hi ${data.firstName}, we received a request to reset your password. Click the button below to choose a new one.
    </p>

    <a href="${data.resetUrl}" style="display: inline-block; background-color: #0f6a5b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 500;">
      Reset Password
    </a>

    <p style="margin-top: 24px; font-size: 12px; color: #a1a1aa;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
  </div>`;
}
