#!/bin/bash

# Email Configuration Helper Script
# This script helps you configure Gmail SMTP for sending OTP emails

echo ""
echo "=========================================="
echo "📧 Gmail Email Configuration Setup"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "To send OTP emails to Gmail inbox, you need:"
echo "1. Gmail account with 2-Step Verification enabled"
echo "2. App Password (16-digit code from Google)"
echo ""
echo "📝 Steps to get App Password:"
echo "   1. Go to: https://myaccount.google.com/apppasswords"
echo "   2. Select 'Mail' app and 'Other' device"
echo "   3. Name it 'Matrimony App' and click Generate"
echo "   4. Copy the 16-digit password (remove spaces)"
echo ""

read -p "Enter your Gmail address (e.g., sajeeb2186@gmail.com): " email
read -sp "Enter your 16-digit App Password (no spaces): " password
echo ""

# Update .env file
if [ ! -z "$email" ] && [ ! -z "$password" ]; then
    # Backup current .env
    cp .env .env.backup
    
    # Update email settings
    sed -i "s/EMAIL_USER=.*/EMAIL_USER=$email/" .env
    sed -i "s/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=$password/" .env
    
    echo ""
    echo "✅ Email configuration updated successfully!"
    echo "📝 Backup saved to .env.backup"
    echo ""
    echo "Current configuration:"
    echo "  EMAIL_USER=$email"
    echo "  EMAIL_PASSWORD=****************"
    echo ""
    echo "⚠️  Next steps:"
    echo "  1. Restart the backend server (Ctrl+C then npm start)"
    echo "  2. Test by registering a new account"
    echo "  3. Check your email inbox for OTP"
    echo ""
else
    echo "❌ Error: Email or password cannot be empty"
    exit 1
fi
