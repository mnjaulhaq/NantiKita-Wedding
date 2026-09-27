import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, otpCode: string) {
  // Kalau SMTP belum dikonfigurasi (mis. saat development), cukup log ke console
  // supaya alur register tetap bisa dites tanpa server email asli.
  if (!process.env.SMTP_HOST) {
    console.log(`[DEV] Kirim OTP ${otpCode} ke ${to}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "NantiKita <no-reply@nantikita.test>",
    to,
    subject: "Kode Verifikasi OTP - NantiKita",
    html: `<p>Kode verifikasi kamu adalah:</p><h2>${otpCode}</h2><p>Berlaku 5 menit.</p>`,
  });
}
