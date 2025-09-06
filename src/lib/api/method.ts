import { ApiConfig, ApiResponse, ApiError } from "@/types/api";
import { configureRequest, apiClient } from "./client";
import axios, { AxiosRequestConfig } from "axios";

export async function fetchFromAPI<T>(
  url: string,
  config: ApiConfig = { requiresAuth: false }
): Promise<ApiResponse<T>> {
  try {
    const requestConfig = await configureRequest(config);
    const response = await apiClient.get<ApiResponse<T>>(url, requestConfig);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function postDataToAPI<T, D = unknown>(
  url: string,
  data: D,
  config: ApiConfig = { requiresAuth: false }
): Promise<ApiResponse<T>> {
  try {
    const requestConfig = await configureRequest(config);
    const response = await apiClient.post<ApiResponse<T>>(
      url,
      data,
      requestConfig
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function axiosRequest<T>(
  url: string,
  reqParams: AxiosRequestConfig,
  config: ApiConfig
): Promise<ApiResponse<T>> {
  try {
    const requestConfig = await configureRequest(config, reqParams);
    const response = await apiClient.request<ApiResponse<T>>({
      url,
      ...requestConfig,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Error handling utility
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const apiError: ApiError = {
      message: error.response?.data?.message,
      status: error.response?.status || 500,
      code: error.code,
    };
    throw apiError;
  }
  throw error;
}