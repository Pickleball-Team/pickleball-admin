export interface User {
  id: number;
  firstName: string;
  lastName: string;
  secondName?: string;
  email: string;
  passwordHash: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
  gender?: string;
  status: boolean;
  roleId: number;
  refreshToken: string;
  createAt?: Date;
  refreshTokenExpiryTime: Date;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  secondName?: string;
  email: string;
  password: string;
  dateOfBirth?: Date;
  gender?: string;
  roleId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}
