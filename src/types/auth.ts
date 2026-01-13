export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
}

export interface Session {
  user: User;
  expiresAt: Date;
}

export interface AuthError {
  message: string;
  code?: string;
}
