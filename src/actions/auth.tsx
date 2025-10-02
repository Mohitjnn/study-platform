"use server"
import { cookies } from "next/headers";
import { loginSchema } from "@/schema/loginSchema";
import { SignUpResponse } from "@/types/auth";
import { jwtDecode } from "jwt-decode";
import { fetchFromAPI, postDataToAPI } from "@/lib/api/client";

interface SignupData {
full_name: string;
email:string;
password: string;
}

// Type for JWT token payload
interface TokenPayload {
  id: number;
  role: string;
  name: string;
  email: string;
  phone_number?: string;
  user_type?: string;
}

// Type for API error responses
interface APIError {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
  };
  status?: number;
  message?: string;
}

// Type for login API response
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Type for forgot password API response
interface ForgotPasswordResponse {
  status: string;
  message: string;
}

// Type for verify reset token API response
interface VerifyResetTokenResponse {
  status: string;
  message: string;
  user_email: string;
}

// Type for reset password API response
interface ResetPasswordResponse {
  status: string;
  message: string;
}

interface SendOTPResponse {
  message: string;
  expires_in_minutes: number;
}

// Type for OTP verify API response
interface VerifyOTPResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}


export async function signup(data: SignupData): Promise<SignUpResponse> {
  try {
    const result = await postDataToAPI<SignUpResponse>(
      "/auth/register",
      data,
      { requiresAuth: false }
    );
    if (!result.id) {
        throw new Error("Invalid response from server");
    }
    return {
      id: result.id,
      full_name: result.full_name,
      email: result.email,
      is_active: result.is_active
    };

  } catch (error: unknown) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : (error as APIError)?.response?.data?.detail || `Something went wrong: ${error}`;
    return {
      id: "",
      full_name: "",
      email: "",
      is_active: false,
      success: false,
      error: errorMessage
    };
  }
}

export async function login(formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid Form Data"
    }
  }

  try {
    const data = await postDataToAPI<LoginResponse>(
      "/auth/login",
      validatedFields.data,
      { requiresAuth: false }
    );

    const cookie = await cookies();
    
    // Set both access and refresh tokens
    cookie.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    cookie.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };

  } catch (error: unknown) {
    let errorMessage = `Authentication failed: ${error}`;
    if (error && typeof error === 'object' && 'response' in error) {
      const responseError = error as APIError;
      if (responseError?.response?.data?.detail) {
        errorMessage = responseError.response.data.detail;
      }
    }
    return {
      success: false,
      error: errorMessage
    }
  }
}

export async function logout() {
  const cookie = await cookies()
  try {
    cookie.delete("access_token")
    cookie.delete("refresh_token")
  } catch {
    console.error("error occured in deleting cookies")
  }
}

export async function clearAuthTokens() {
  const cookie = await cookies()
  try {
    cookie.delete("access_token")
    cookie.delete("refresh_token")
    return { success: true }
  } catch (error) {
    console.error("Error occurred in clearing auth tokens:", error)
    return { success: false }
  }
}

export async function validation() {
  const cookie = await cookies()
  const token = cookie.get("access_token");


  if (token) {
    return {
      success: true,
      message: "Token is valid.",
    };
  } else {
    return {
      success: false,
      message: "Token is missing or invalid."
    };
  }
}

// Helper to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  const cookie = (await cookies()).get("access_token");
  return cookie?.value || null;
};

export async function getUserData() {
  const cookie = await cookies();
  const token = cookie.get("access_token");

  if (!token) {
    return {
      success: false,
      message: "Token not found in cookies.",
    };
  }

  try {
    // Decode the token
    const decoded = jwtDecode<TokenPayload>(`${token?.value}`);
    return {
      success: true,
      message: "User data retrieved successfully.",
      data: {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
        phone_number: decoded.phone_number,
        user_type: decoded.user_type,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to decode token: ${error}`,
    };
  }
}

// Get user data from backend /me endpoint
export async function getUserDataFromAPI() {
  const cookie = await cookies();
  const token = cookie.get("access_token");
  if (!token) {
    return {
      success: false,
      message: "Token not found in cookies.",
      data: null,
      shouldRedirect: true
    };
  }
  
  try {
    const result = await fetchFromAPI<Record<string, unknown>>(
      "/me",
      { requiresAuth: true }
    );
    return {
      success: true,
      message: "User data retrieved successfully from API.",
      data: result,
      shouldRedirect: false
    };
  } catch (error: unknown) {
    console.error("Get user data error:", error);
    const errorObj = error as APIError;
    
    // If it's a 401 error, clear the invalid tokens and indicate redirect
    if (errorObj.status === 401 || errorObj.response?.status === 401) {
      try {
        const cookieStore = await cookies();
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
      } catch (cookieError) {
        console.error("Error clearing cookies:", cookieError);
      }
      
      return {
        success: false,
        message: "Authentication expired",
        data: null,
        shouldRedirect: true
      };
    }
    
    return {
      success: false,
      message: errorObj.response?.data?.detail || "Failed to get user data",
      data: null,
      shouldRedirect: true
    };
  }
}

// Forgot Password Action
export async function forgotPassword(email: string) {
  try {
    const result = await postDataToAPI<ForgotPasswordResponse>(
      "/auth/forgot-password",
      { email },
      { requiresAuth: false }
    );

    return {
      success: true,
      message: result.message
    };
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    const errorObj = error as APIError;
    return {
      success: false,
      error: errorObj.response?.data?.detail || "Failed to send reset email. Please try again."
    };
  }
}

// Verify Reset Token Action
export async function verifyResetToken(token: string) {
  try {
    const result = await postDataToAPI<VerifyResetTokenResponse>(
      "/auth/verify-reset-token",
      { token },
      { requiresAuth: false }
    );

    return {
      success: true,
      userEmail: result.user_email,
      message: result.message
    };
  } catch (error: unknown) {
    console.error("Token verification error:", error);
    const errorObj = error as APIError;
    return {
      success: false,
      error: errorObj.response?.data?.detail || "Invalid or expired reset token."
    };
  }
}

// Reset Password Action
export async function resetPassword(token: string, newPassword: string) {
  try {
    const result = await postDataToAPI<ResetPasswordResponse>(
      "/auth/reset-password",
      { token, new_password: newPassword },
      { requiresAuth: false }
    );

    return {
      success: true,
      message: result.message
    };
  } catch (error: unknown) {
    console.error("Password reset error:", error);
    const errorObj = error as APIError;
    return {
      success: false,
      error: errorObj.response?.data?.detail || "Failed to reset password. Please try again."
    };
  }
}

export async function decodeToken() {
  const cookie = await cookies();
  const token = cookie.get("access_token");

  if (!token) {
    return {
      success: false,
      message: "Token not found in cookies.",
      data: null
    };
  }

  try {
    // Decode the token
    const decoded = jwtDecode<TokenPayload>(`${token?.value}`);
    return {
      success: true,
      message: "Token decoded successfully.",
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to decode token: ${error}`,
      data: null
    };
  }
}

export async function sendOTP(email: string) {
  try {
    const result = await postDataToAPI<SendOTPResponse>(
      "/otp/send",
      { email },
      { requiresAuth: false }
    );

    return {
      success: true,
      message: result.message,
      expiresInMinutes: result.expires_in_minutes
    };
  } catch (error: unknown) {
    console.error("Send OTP error:", error);
    const errorObj = error as APIError;
    return {
      success: false,
      error: errorObj.response?.data?.detail || "Failed to send OTP. Please try again."
    };
  }
}

// Verify OTP Action
export async function verifyOTP(email: string, code: string) {
  try {
    const result = await postDataToAPI<VerifyOTPResponse>(
      "/otp/verify",
      { email, code },
      { requiresAuth: false }
    );

    const cookie = await cookies();
    
    // Set both access and refresh tokens
    cookie.set("access_token", result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    cookie.set("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { 
      success: true,
      message: "Login successful"
    };

  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    const errorObj = error as APIError;
    return {
      success: false,
      error: errorObj.response?.data?.detail || "Invalid OTP. Please try again."
    };
  }
}