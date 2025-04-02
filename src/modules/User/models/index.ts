export interface RegisterUserRequest {
  FirstName: string;
  LastName: string;
  SecondName: string;
  Email: string;
  Password: string;
  DateOfBirth: string;
  Gender: string;
  PhoneNumber: string;
  refereeCode?: string;
  RoleId?: RoleFactory;
}

export enum RoleFactory {
  Player = 1,
  Admin = 2 ,
  Sponsor = 3,
  Refree = 4,
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenString: string;
  expiration: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  secondName?: string;
  email: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
  gender?: string;
  status: boolean;
  roleId: number;
  refreshToken: string;
  phoneNumber: string;
  createAt?: Date;
  refreshTokenExpiryTime: Date;
}


export interface UpdateUserRequest {
  userId: number;
  firstName: string;
  lastName: string;
  secondName: string;
  dateOfBirth: string;
  gender: string;
  avatarUrl: string;
  status: boolean;
}
