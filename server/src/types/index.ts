import { z } from 'zod';
import { Types } from 'mongoose';

// User Types
export const UserRoleSchema = z.enum(['admin', 'viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// Investment Types
export const AssetTypeSchema = z.enum(['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other']);
export type AssetType = z.infer<typeof AssetTypeSchema>;

export interface IInvestment {
  _id: Types.ObjectId;
  assetName: string;
  assetType: AssetType;
  investedAmount: number;
  investmentDate: Date;
  currentValue: number;
  owners: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Zod Validation Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  name: z.string().min(1, 'Name is required').max(100),
  role: UserRoleSchema.optional().default('viewer'),
});

export const UpdateUserRoleSchema = z.object({
  role: UserRoleSchema,
});

export const CreateInvestmentSchema = z.object({
  assetName: z.string().min(1).max(100),
  assetType: AssetTypeSchema,
  investedAmount: z.number().positive(),
  investmentDate: z.string().datetime(),
  currentValue: z.number().positive(),
  owners: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)), // MongoDB ObjectId validation
});

export const UpdateInvestmentSchema = CreateInvestmentSchema.partial();

// API Response Types
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type UpdateUserRoleRequest = z.infer<typeof UpdateUserRoleSchema>;
export type CreateInvestmentRequest = z.infer<typeof CreateInvestmentSchema>;
export type UpdateInvestmentRequest = z.infer<typeof UpdateInvestmentSchema>;

// Service Layer Types
export type CreateInvestmentData = CreateInvestmentRequest;
export type UpdateInvestmentData = UpdateInvestmentRequest;