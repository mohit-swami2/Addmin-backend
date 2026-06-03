import mongoose from 'mongoose';
import { USER_ROLES, USER_STATUSES } from '../../shared/utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: USER_ROLES, default: 'User' },
    status: { type: String, enum: USER_STATUSES, default: 'Active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.toListJSON = function toListJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
