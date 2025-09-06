export interface ApiConfig {
  requiresAuth: boolean;
  mediaType?: "json" | "multipart" | "sdp";
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}