const User = require('../models/User');
const Profile = require('../models/Profile');
const Chat = require('../models/Chat');

// @desc    Create admin account
// @route   POST /api/dev/create-admin
// @access  Public (development only)
exports.createAdmin = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, phone, and password'
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already exists',
        data: { email: existingAdmin.email }
      });
    }

    // Create admin user
    const admin = await User.create({
      email,
      phone,
      password,
      role: 'admin',
      isVerified: true,
      emailVerified: true,
      phoneVerified: true
    });

    console.log('\n' + '='.repeat(50));
    console.log('👑 ADMIN ACCOUNT CREATED');
    console.log('='.repeat(50));
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`Role: admin`);
    console.log('='.repeat(50) + '\n');

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        userId: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

// Simple seed for development only
exports.seed = async (req, res) => {
  try {
    const now = new Date();

    const sample = [
      {
        email: 'demo1@example.com',
        phone: '+919876543210',
        password: 'Password123!',
        personalInfo: {
          firstName: 'Asha',
          lastName: 'Kumar',
          dateOfBirth: new Date('1994-05-12'),
          gender: 'female',
          maritalStatus: 'never_married',
          height: 160
        },
        professionalInfo: {
          education: 'B.Tech',
          occupation: 'Software Engineer'
        },
        location: { country: 'India', state: 'Karnataka', city: 'Bengaluru' },
        religiousInfo: { religion: 'Hindu' }
      },
      {
        email: 'demo2@example.com',
        phone: '+919876543211',
        password: 'Password123!',
        personalInfo: {
          firstName: 'Rohit',
          lastName: 'Sharma',
          dateOfBirth: new Date('1992-08-22'),
          gender: 'male',
          maritalStatus: 'never_married',
          height: 175
        },
        professionalInfo: {
          education: 'MBA',
          occupation: 'Product Manager'
        },
        location: { country: 'India', state: 'Maharashtra', city: 'Mumbai' },
        religiousInfo: { religion: 'Hindu' }
      },
      {
        email: 'demo3@example.com',
        phone: '+919876543212',
        password: 'Password123!',
        personalInfo: {
          firstName: 'Maya',
          lastName: 'Patel',
          dateOfBirth: new Date('1996-11-02'),
          gender: 'female',
          maritalStatus: 'never_married',
          height: 158
        },
        professionalInfo: {
          education: 'M.Sc',
          occupation: 'Data Analyst'
        },
        location: { country: 'India', state: 'Gujarat', city: 'Ahmedabad' },
        religiousInfo: { religion: 'Hindu' }
      }
    ];

    const created = [];

    for (const s of sample) {
      // If user already exists, skip
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create({
          email: s.email,
          phone: s.phone,
          password: s.password,
          isVerified: true
        });
      }

      let profile = await Profile.findOne({ userId: user._id });
      if (!profile) {
        profile = await Profile.create({
          userId: user._id,
          personalInfo: s.personalInfo,
          professionalInfo: s.professionalInfo,
          location: s.location,
          religiousInfo: s.religiousInfo,
          photos: [
            { url: '/default-avatar.png', isProfile: true, isVerified: true }
          ],
          privacy: { profileVisibility: 'public' },
          profileCompleted: true,
          isActive: true
        });
      }

      created.push({ user, profile });
    }

    // Create a chat between first two users with some messages
    if (created.length >= 2) {
      const u1 = created[0].user;
      const u2 = created[1].user;

      let chat = await Chat.findOne({ participants: { $all: [u1._id, u2._id] } });
      if (!chat) {
        chat = await Chat.create({
          participants: [u1._id, u2._id],
          messages: [
            { senderId: u1._id, receiverId: u2._id, message: 'Hi there! 👋', messageType: 'text', sentAt: now },
            { senderId: u2._id, receiverId: u1._id, message: 'Hello! Nice to meet you.', messageType: 'text', sentAt: now }
          ],
          lastMessage: { text: 'Hello! Nice to meet you.', sentAt: now, senderId: u2._id }
        });
      }
    }

    res.status(201).json({ success: true, message: 'Seed completed', data: created.map(c => ({ email: c.user.email, profileId: c.profile.profileId })) });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: 'Seed failed', error: error.message });
  }
};

exports.getPublicProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({ 'privacy.profileVisibility': 'public', isActive: true })
      .limit(50)
      .select('userId profileId personalInfo professionalInfo location photos verification isPremium')
      .lean();

    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error('Get public profiles error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
