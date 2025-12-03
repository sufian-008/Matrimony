import nodemailer from 'nodemailer';

// Create reusable email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

// Generic Email Sender
export const sendEmail = async ({ email, subject, message }) => {
  const mailOptions = {
    from: `Matrimony App <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

// Send OTP Email
export const sendOTPEmail = async (email, otp) => {
  const message = `
    <h2 style="color:#e91e63;">Matrimony App - Email Verification</h2>
    <p>Your OTP for email verification is:</p>
    <h1 style="color:#e91e63; font-size:32px; letter-spacing:5px;">
      ${otp}
    </h1>
    <p>This OTP will expire in 
      <strong>${process.env.OTP_EXPIRE_MINUTES || 10} minutes</strong>.
    </p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail({
    email,
    subject: "Email Verification OTP",
    message,
  });
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
    <h2 style="color:#e91e63;">Matrimony App - Password Reset</h2>
    <p>You requested a password reset. Click below:</p>
    <a href="${resetUrl}"
       style="background:#e91e63; color:white; padding:10px 20px; 
              text-decoration:none; border-radius:5px;">
      Reset Password
    </a>
    <p>This link will expire in <strong>1 hour</strong>.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail({
    email,
    subject: "Password Reset Request",
    message,
  });
};

// Send Interest Notification
export const sendInterestNotification = async (email, fromUserName) => {
  const message = `
    <h2 style="color:#e91e63;">New Interest Received!</h2>
    <p><strong>${fromUserName}</strong> has shown interest in your profile.</p>
    <p>Login to view their profile:</p>
    <a href="${process.env.FRONTEND_URL}/dashboard"
       style="background:#e91e63; color:white; padding:10px 20px; 
              text-decoration:none; border-radius:5px;">
      View Profile
    </a>
  `;

  return sendEmail({
    email,
    subject: "New Interest Received!",
    message,
  });
};
