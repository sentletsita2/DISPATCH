/**
 * Mailer stub — no real SMTP needed for this project.
 * OTPs are returned directly in the API response for demo/dev use.
 * In production, swap these stubs for real nodemailer calls.
 */

export async function sendOtpEmail(to: string, otp: string, name: string): Promise<void> {
  console.log(`[MAIL STUB] OTP for ${name} <${to}>: ${otp}`);
}

export async function sendWelcomeEmail(to: string, name: string, userId: string): Promise<void> {
  console.log(`[MAIL STUB] Welcome ${name} <${to}> — userId: ${userId}`);
}
