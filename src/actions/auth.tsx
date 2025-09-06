"use server"
import { cookies } from "next/headers";
import { loginSchema } from "@/schema/loginSchema";
import { signupSchema } from "@/schema/signupSchema";
import { SignUpResponse } from "@/types/auth";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { fetchFromAPI, postDataToAPI } from "@/lib/api/client";

interface SignupData {
full_name: string;
email:string;
password: string;
}

export async function signup(data: SignupData): Promise<SignUpResponse> {
    console.log("Signup data received:", data);
  try {
    const result = await postDataToAPI<SignUpResponse>(
      "/auth/register",
      data,
      { requiresAuth: false }
    );
    if (!result.id) {
        throw new Error("Invalid response from server");
    }
    console.log("Signup successful:", result);
    return {
      id: result.id,
      full_name: result.full_name,
      email: result.email,
      is_active: result.is_active
    };

  } catch (error: any) {
    console.error("Signup error:", error);
    return {
      id: "",
      full_name: "",
      email: "",
      is_active: false,
      success: false,
      error: error.response?.data?.detail || `Something went wrong: ${error}`
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
    const data = await postDataToAPI<{ 
      access_token: string; 
      refresh_token: string; 
      token_type: string; 
    }>(
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

  } catch (error: any) {
    let errorMessage = `Authentication failed: ${error}`;
    if (error?.response?.data?.detail) {
      errorMessage = error.response.data.detail;
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
  } catch (error) {
    console.error("error occured in deleting cookies")
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
    const decoded = jwtDecode<{ id: number, role: string, name: string; email: string; phone_number?: string | "", user_type?: string }>(`${token?.value}`);
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
    console.log("No access token found in cookies");
    return {
      success: false,
      message: "Token not found in cookies.",
      data: null,
      shouldRedirect: true
    };
  }

  console.log("Access token found, making API request to /me");

  try {
    const result = await fetchFromAPI<any>(
      "/me",
      { requiresAuth: true }
    );

    console.log("API response successful:", result);
    return {
      success: true,
      message: "User data retrieved successfully from API.",
      data: result,
      shouldRedirect: false
    };
  } catch (error: any) {
    console.error("Get user data error:", error);
    console.log("Error status:", error.status || error.response?.status);
    
    // If it's a 401 error, clear the invalid tokens
    if (error.status === 401 || error.response?.status === 401) {
      console.log("401 error - clearing tokens");
      const cookieStore = await cookies();
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      
      return {
        success: false,
        message: "Authentication expired",
        data: null,
        shouldRedirect: true
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to get user data",
      data: null,
      shouldRedirect: true
    };
  }
}

// Forgot Password Action
export async function forgotPassword(email: string) {
  try {
    const result = await postDataToAPI<{status: string, message: string}>(
      "/auth/forgot-password",
      { email },
      { requiresAuth: false }
    );

    return {
      success: true,
      message: result.message
    };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to send reset email. Please try again."
    };
  }
}

// Verify Reset Token Action
export async function verifyResetToken(token: string) {
  try {
    const result = await postDataToAPI<{status: string, message: string, user_email: string}>(
      "/auth/verify-reset-token",
      { token },
      { requiresAuth: false }
    );

    return {
      success: true,
      userEmail: result.user_email,
      message: result.message
    };
  } catch (error: any) {
    console.error("Token verification error:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Invalid or expired reset token."
    };
  }
}

// Reset Password Action
export async function resetPassword(token: string, newPassword: string) {
  try {
    const result = await postDataToAPI<{status: string, message: string}>(
      "/auth/reset-password",
      { token, new_password: newPassword },
      { requiresAuth: false }
    );

    return {
      success: true,
      message: result.message
    };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to reset password. Please try again."
    };
  }
}