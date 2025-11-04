import { UserGender, UserStatus } from "./user";

export type User = {
  id: string | number;
  username?: string;
  email: string;
  name?: string | null;
  fullname?: string;
  phone?: string;
  avatar?: string | null;
  avatarPublicId?: string | null;
  gender?: UserGender;
  address?: string;
  dob?: string;
  status?: UserStatus;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  role?: string; 
  permissionKeys?: string[];
  creditRegistration?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
  message?: string;
};

export type RegisterResponse = {
  message: string;
  user: User;
};
