export interface SignUpResponse {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  error?: string;
  success?: boolean;
}
