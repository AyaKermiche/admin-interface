export interface Admin {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
}
