import mongoose, { Schema } from 'mongoose';
import { IUser, UserRole } from '../types';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'viewer'],
    required: true,
    default: 'viewer',
  },
  passwordHash: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', userSchema);