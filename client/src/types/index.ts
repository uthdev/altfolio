// User Types
export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

// Investment Types
export type AssetType = 'Startup' | 'Crypto Fund' | 'Farmland' | 'Collectible' | 'Other';

export interface Investment extends Record<string, unknown> {
  _id: string;
  assetName: string;
  assetType: AssetType;
  investedAmount: number;
  investmentDate: string;
  currentValue: number;
  owners: User[];
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentsResponse {
  investments: Investment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}