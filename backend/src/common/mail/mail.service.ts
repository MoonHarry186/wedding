import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor(private config: ConfigService) {
    const apiKey = config.get<string>('SENDGRID_API_KEY') ?? '';
    sgMail.setApiKey(apiKey);
    this.from = config.get<string>('SENDGRID_FROM') ?? 'noreply@zenlove.vn';
  }

  async sendResetPassword(email: string, token: string) {
    const domain = this.config.get<string>('APP_DOMAIN') ?? 'localhost:3001';
    const resetUrl = `https://${domain}/reset-password?token=${token}`;

    await sgMail.send({
      to: email,
      from: this.from,
      subject: 'Đặt lại mật khẩu Cinlove',
      html: `
        <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
        <p>Nhấn vào link bên dưới để tiếp tục (có hiệu lực trong 1 giờ):</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      `,
    });

    this.logger.log(`Reset password email sent to ${email}`);
  }
}
