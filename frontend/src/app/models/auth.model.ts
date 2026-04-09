export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  expiresIn?: number;
}

export interface User {
  userId: string;
  email: string;
  roles: string[];
}

export interface AuthLoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface AuthRegisterResponse {
  token: string;
}
