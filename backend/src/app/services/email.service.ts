import nodemailer from "nodemailer";
import { env } from "../../config";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  static async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: env.smtp.from,
        to,
        subject,
        html,
      });

      console.log(`[EMAIL-SERVICE] Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error("[EMAIL-SERVICE] Error sending email:", error);
    }
  }

  static async sendPasswordResetEmail(to: string, resetLink: string) {
    const subject = "Password Reset Request";
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your Auction System account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email. The link will expire in 30 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">Auction System &bull; High-Stakes Bidding Platform</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}
