import { Gender, UserRole } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: Gender;
  dob?: Date;
  role: UserRole;
  designation?: string;
  lastLogin?: Date;
  isActive: boolean;
  companyId?: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  phone?: string;
  companyName?: string;
}
