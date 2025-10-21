import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport(
  process.env.SMTP_URL || {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }
);

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  SMTP not configured or connection failed:', error.message);
  } else {
    console.log('✅ SMTP ready');
  }
});

export default transporter;
