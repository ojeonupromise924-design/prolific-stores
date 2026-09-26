import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly from =
    process.env.MAIL_FROM || 'Prolific Store <onboarding@resend.dev>';

  async send(params: { to: string; subject: string; html: string }) {
    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      if (result.error) {
        this.logger.error(`Email failed to send: ${result.error.message}`);
        return;
      }

      this.logger.log(`Email sent to ${params.to}: ${params.subject}`);
    } catch (error) {
      // Email failures should never break the request that triggered them
      // (e.g. a payment confirmation) — log and move on.
      this.logger.error(
        'Email send failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
