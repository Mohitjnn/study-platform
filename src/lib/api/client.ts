import axios, { AxiosRequestConfig } from "axios";
import { getAuthToken } from "@/actions/auth";
import { ApiConfig } from "@/types/api";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Configure request based on auth requirements
export const configureRequest = async (
  config: ApiConfig,
  customConfig?: AxiosRequestConfig
): Promise<AxiosRequestConfig> => {
  const headers: Record<string, string> = {
    "Content-Type":
      config.mediaType === "multipart"
        ? "multipart/form-data"
        : config.mediaType === "sdp"
        ? "application/sdp"
        : "application/json",
  };

  if (config.requiresAuth) {
    const token = await getAuthToken();
    headers["Authorization"] = `Bearer ${token}`;
    console.log("Authorization header set");
  }

  return {
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig?.headers,
    },
  };
};

// Update the API methods to handle the async configureRequest
export async function fetchFromAPI<T>(
  url: string,
  config: ApiConfig = { requiresAuth: false }
): Promise<T> {
  const requestConfig = await configureRequest(config);

  // Parse URL and extract query parameters
  const [baseUrl, queryString] = url.split("?");
  if (queryString) {
    requestConfig.params = Object.fromEntries(new URLSearchParams(queryString));
  }


  const response = await apiClient.get<T>(baseUrl, requestConfig);

  return response.data;
}

export async function postDataToAPI<T, D = unknown>(
  url: string,
  data: D,
  config: ApiConfig = { requiresAuth: false }
): Promise<T> {
  const requestConfig = await configureRequest(config);
  const response = await apiClient.post<T>(url, data, requestConfig);
  return response.data;
}

export async function axiosRequest<T>(
  url: string,
  reqParams: AxiosRequestConfig,
  config: ApiConfig = { requiresAuth: false }
): Promise<T> {
  const requestConfig = await configureRequest(config, reqParams);
  const response = await apiClient.request<T>({
    url,
    ...requestConfig,
  });
  return response.data;
}

// Utility function for SDP requests (WebRTC)
export async function postSdpToAPI(
  url: string,
  sdpData: string,
  config: ApiConfig = { requiresAuth: true, mediaType: "sdp" }
): Promise<string> {
  const requestConfig = await configureRequest(config);
  const response = await apiClient.post(url, sdpData, {
    ...requestConfig,
    responseType: 'text' // SDP responses are text
  });
  return response.data;
}

// Utility function for WebRTC JSON requests
export async function postWebRtcDataToAPI<T, D = unknown>(
  url: string,
  data: D,
  config: ApiConfig = { requiresAuth: true }
): Promise<T> {
  const requestConfig = await configureRequest(config);
  const response = await apiClient.post<T>(url, data, requestConfig);
  return response.data;
}

// Utility function for WebRTC GET requests
export async function fetchWebRtcFromAPI<T>(
  url: string,
  config: ApiConfig = { requiresAuth: true }
): Promise<T> {
  const requestConfig = await configureRequest(config);
  const response = await apiClient.get<T>(url, requestConfig);
  return response.data;
}