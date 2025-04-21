export interface URL {
  id: number;
  original_url: string;
  short_code: string;
  created_at: string;
  clicks: number;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  username: string;
  created_at: string;
  urls: URL[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
