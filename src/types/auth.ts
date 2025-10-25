export type User = {
  id: string | number;
  username?: string;
  email: string;
  name?: string | null;
  role?: string; 
  permissionKeys?: string[];
};

export type AuthResponse = {
  token: string;
  user: User;
  message?: string;
};
