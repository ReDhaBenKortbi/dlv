import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail =
      this.config.get<string>('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY not set — skipping password reset email to ${to}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: `Digital Learning Vault <${this.fromEmail}>`,
      to,
      subject: 'Reset your password',
      html: `
        <p>We received a request to reset your Digital Learning Vault password.</p>
        <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}: ${error.message}`,
      );
    }
  }
}
