const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: `Matrimony App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

exports.sendOTPEmail = async (email, otp) => {
  const message = `
    <h2>Matrimony App - Email Verification</h2>
    <p>Your OTP for email verification is:</p>
    <h1 style="color: #e91e63; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
    <p>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await exports.sendEmail({
    email,
    subject: 'Email Verification OTP',
    message
  });
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const message = `
    <h2>Matrimony App - Password Reset</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #e91e63; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await exports.sendEmail({
    email,
    subject: 'Password Reset Request',
    message
  });
};

exports.sendInterestNotification = async (email, fromUserName) => {
  const message = `
    <h2>New Interest Received!</h2>
    <p><strong>${fromUserName}</strong> has shown interest in your profile.</p>
    <p>Login to your account to view their profile and respond.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #e91e63; color: white; text-decoration: none; border-radius: 5px;">View Profile</a>
  `;

  return await exports.sendEmail({
    email,
    subject: 'New Interest Received!',
    message
  });
};
