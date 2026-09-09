// server/types/auth.d.ts
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

declare module "#auth-utils" {
  interface User extends AuthUser {}
}