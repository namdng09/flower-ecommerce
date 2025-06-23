import nodemailer, { SendMailOptions, SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // smtp.gmail.com
  port: Number(process.env.MAIL_PORT), // 587
  secure: false, // STARTTLS
  auth: {
    user: process.env.MAIL_ADDRESS, // imssystemvn@gmail.com
    pass: process.env.MAIL_PASSWORD // “fvsd qrwc …”
  }
});

/**
 * options: { to, subject, html, text }
 */
export function sendMail(options: SendMailOptions): Promise<SentMessageInfo> {
  return transporter.sendMail({
    from: `"IMS System" <${process.env.MAIL_ADDRESS}>`,
    ...options
  });
}
