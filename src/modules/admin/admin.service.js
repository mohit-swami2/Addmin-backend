import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Admin from './admin.model.js';
import { loadJwtKeys } from '../../shared/utils/keyManager.js';
import { sendMail, applyTemplate } from '../../shared/utils/mailer.js';
import { serializeAdminUser } from '../../shared/utils/fileUrl.js';

const signToken = (admin) => {
  const { privateKey } = loadJwtKeys();
  return jwt.sign(
    { adminId: admin._id.toString(), email: admin.email },
    privateKey,
    { algorithm: 'RS256', expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const formatAuthResponse = async (admin, req) => ({
  user: await serializeAdminUser(admin, req),
  token: signToken(admin),
});

export const registerAdmin = async (data) => {
  const exists = await Admin.findOne({ email: data.email.toLowerCase(), isDeleted: false });
  if (exists) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const admin = await Admin.create({
    name: data.name,
    firstName: data.name,
    email: data.email,
    password: data.password,
    role: 'Admin',
    provider: 'local',
  });
  return admin;
};

export const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  return admin;
};

export const findOrCreateOAuthAdmin = async ({ provider, providerId, email, name, avatar }) => {
  let admin = await Admin.findOne({
    $or: [{ provider, providerId }, { email: email.toLowerCase(), isDeleted: false }],
  }).select('+password');

  if (admin) {
    if (!admin.providerId) {
      admin.provider = provider;
      admin.providerId = providerId;
    }
    if (avatar && !admin.avatar) admin.avatar = avatar;
    if (name && admin.name === 'User') admin.name = name;
    await admin.save();
    return admin;
  }

  admin = await Admin.create({
    name: name || email.split('@')[0],
    firstName: name || email.split('@')[0],
    email: email.toLowerCase(),
    role: 'Admin',
    provider,
    providerId,
    avatar,
  });
  return admin;
};

export const requestPasswordReset = async (email) => {
  const admin = await Admin.findOne({ email: email.toLowerCase(), isDeleted: false }).select(
    '+resetToken +resetTokenExpiry +password'
  );
  if (!admin) return null;

  const token = crypto.randomBytes(32).toString('hex');
  admin.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  admin.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await admin.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = applyTemplate(
    `<p>Hello,</p><p>Reset your password: <a href="{{resetUrl}}">{{resetUrl}}</a></p><p>Link expires in 1 hour.</p>`,
    { resetUrl }
  );
  await sendMail({
    to: admin.email,
    subject: 'Password reset — AAdmin',
    html,
    text: `Reset your password: ${resetUrl}`,
  });
  return admin;
};

export const resetPassword = async ({ token, password }) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const admin = await Admin.findOne({
    resetToken: hashed,
    resetTokenExpiry: { $gt: new Date() },
    isDeleted: false,
  }).select('+password +resetToken +resetTokenExpiry');

  if (!admin) {
    const err = new Error('Invalid or expired reset token');
    err.status = 400;
    throw err;
  }
  admin.password = password;
  admin.resetToken = undefined;
  admin.resetTokenExpiry = undefined;
  await admin.save();
  return admin;
};

export const getProfile = async (adminId) => Admin.findOne({ _id: adminId, isDeleted: false });

export const updateProfile = async (adminId, data) => {
  const admin = await Admin.findOne({ _id: adminId, isDeleted: false });
  if (!admin) {
    const err = new Error('Admin not found');
    err.status = 404;
    throw err;
  }
  const emailTaken = await Admin.findOne({
    email: data.email.toLowerCase(),
    _id: { $ne: adminId },
    isDeleted: false,
  });
  if (emailTaken) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }
  Object.assign(admin, {
    firstName: data.firstName,
    lastName: data.lastName || '',
    email: data.email,
    phone: data.phone ?? admin.phone,
    bio: data.bio ?? admin.bio,
    website: data.website ?? admin.website,
    location: data.location ?? admin.location,
    name: `${data.firstName} ${data.lastName || ''}`.trim(),
  });
  await admin.save();
  return admin;
};

export const updateAvatar = async (adminId, relativePath) => {
  const admin = await Admin.findOneAndUpdate(
    { _id: adminId, isDeleted: false },
    { avatar: relativePath },
    { new: true }
  );
  if (!admin) {
    const err = new Error('Admin not found');
    err.status = 404;
    throw err;
  }
  return admin;
};

export const changePassword = async (adminId, { currentPassword, newPassword }) => {
  const admin = await Admin.findOne({ _id: adminId, isDeleted: false }).select('+password');
  if (!admin || !(await admin.comparePassword(currentPassword))) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }
  admin.password = newPassword;
  await admin.save();
  return admin;
};
