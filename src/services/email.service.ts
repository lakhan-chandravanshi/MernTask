import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD
  }
});

export async function sendWelcomeEmail(
  email: string,
  name: string
) {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    console.log(
      `Email skipped. SMTP not configured for ${email}`
    );

    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Welcome to our application",
    html: `
      <h2>Welcome ${name}</h2>
      <p>Your account has been successfully created.</p>
    `
  });
}