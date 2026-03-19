import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/** Shape expected by {@link NotificationsService.sendBookingConfirmation}. */
interface BookingConfirmationDetails {
  clientName: string;
  businessName: string;
  serviceName: string;
  dateTime: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@agendoo.com');

    const html = `
      <h2>Verify your email address</h2>
      <p>Thank you for signing up for Agendoo. Click the link below to verify your account:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #6366f1;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
      ">Verify email</a>
      <p>Or copy this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an Agendoo account, you can safely ignore this email.</p>
    `;

    await this.send({ from, to: email, subject: 'Verify your email - Agendoo', html });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@agendoo.com');

    const html = `
      <h2>Reset your password</h2>
      <p>We received a request to reset the password for your account.</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #6366f1;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
      ">Reset password</a>
      <p>Or copy this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this change, you can safely ignore this email.</p>
    `;

    await this.send({ from, to: email, subject: 'Reset your password - Agendoo', html });
  }

  async sendBookingConfirmation(email: string, details: BookingConfirmationDetails): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@agendoo.com');

    const html = `
      <h2>Booking confirmed</h2>
      <p>Hi ${details.clientName},</p>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li><strong>Business:</strong> ${details.businessName}</li>
        <li><strong>Service:</strong> ${details.serviceName}</li>
        <li><strong>Date &amp; time:</strong> ${details.dateTime}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `;

    await this.send({ from, to: email, subject: `Booking confirmed - ${details.businessName}`, html });
  }

  private async send(options: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail(options);
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    }
  }
}
