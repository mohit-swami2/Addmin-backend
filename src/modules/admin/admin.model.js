import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, AUTH_PROVIDERS } from '../../shared/utils/constants.js';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: USER_ROLES, default: 'Admin' },
    avatar: { type: String, default: null },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    website: { type: String, default: '' },
    provider: { type: String, enum: AUTH_PROVIDERS, default: 'local' },
    providerId: { type: String, default: null },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.toAuthJSON = function toAuthJSON(req) {
  const base = process.env.OAUTH_CALLBACK_BASE_URL || '';
  const avatar = this.avatar
    ? this.avatar.startsWith('http')
      ? this.avatar
      : `${base}/uploads/${this.avatar.replace(/^\//, '')}`
    : null;

  return {
    id: this._id.toString(),
    name: this.name,
    firstName: this.firstName || this.name,
    lastName: this.lastName || '',
    email: this.email,
    role: this.role,
    avatar,
    phone: this.phone,
    location: this.location,
    bio: this.bio,
    website: this.website,
    createdAt: this.createdAt,
  };
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
