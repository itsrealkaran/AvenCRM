import { Team } from './company';
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
  team?: Team;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  phone?: string;
  companyName?: string;
}
