import axios, { AxiosRequestConfig } from "axios";
import { getAuthToken } from "@/actions/auth";
import { ApiConfig } from "@/types/api";
import { postDataToAPI, postWebRtcDataToAPI } from "./client";

// --- Types for WebRTC API responses and errors ---
export interface WebRtcError {
  name?: string;
  message?: string;
  code?: string;
  config?: unknown;
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
    headers?: unknown;
  };
}

export interface SdpExchangeResponse {
  sdp: string;
}

export interface EndSessionResponse {
  status: string;
  message?: string;
}

export interface BindContextResponse {
  status: string;
  message?: string;
  data?: unknown;
}

export interface LatestImageResponse {
  status: string;
  image_url: string;
  explanation?: string;
}

// WebRTC API Base URL
const WEBRTC_API_BASE = "https://studymate.realtimeconvo.com";

// Create WebRTC axios instance
export const webrtcApiClient = axios.create({
  baseURL: WEBRTC_API_BASE,
  timeout: 30000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
});

// Configure request for WebRTC API
export const configureWebRtcRequest = async (
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
  }

  return {
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig?.headers,
    },
  };
};

// WebRTC SDP Exchange
export async function exchangeSdp(
  sdpOffer: string,
  conversation_id: string = "gpt-4o-mini-realtime-preview-2024-12-17"
): Promise<string> {
  try {
    const requestConfig = await configureWebRtcRequest({
      requiresAuth: true,
      mediaType: "sdp",
    });

    const url = `/api/v1/realtime2/sdp?conversation_id=${conversation_id}`;

    const response = await webrtcApiClient.post(url, sdpOffer, {
      ...requestConfig,
      responseType: "text",
    });

    return response.data;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// Fallback SDP exchange using fetch with no-cors (for debugging)
export async function exchangeSdpFallback(
  sdpOffer: string,
  conversation_id: string = "gpt-4o-mini-realtime-preview-2024-12-17"
): Promise<string> {
  try {
    const token = await getAuthToken();
    const url = `${WEBRTC_API_BASE}/api/v1/realtime2/sdp?conversation_id=${conversation_id}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/sdp",
      },
      body: sdpOffer,
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.text();
    return result;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// WebRTC Bind Context
export async function bindWebRtcContext(data: {
  title: string;
  information: string;
}): Promise<BindContextResponse> {
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });

    const response = await webrtcApiClient.post(
      "/api/v1/realtime2/bind-context",
      data,
      requestConfig
    );

    return response.data as BindContextResponse;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// WebRTC End Session
export async function endWebRtcSession({
  conversation_id,
}: {
  conversation_id: string;
}): Promise<EndSessionResponse> {
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    const requestData = {
      conversation_id: `${conversation_id}`,
      reason: "ended_by_client",
    };

    const response = await webrtcApiClient.post(
      "/api/v1/realtime2/end",
      requestData,
      requestConfig
    );

    return response.data as EndSessionResponse;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// WebRTC Get Latest Image
export async function getLatestImage(): Promise<LatestImageResponse> {
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    const response = await webrtcApiClient.get(
      "/api/v1/realtime2/latest-image",
      requestConfig
    );

    return response.data as LatestImageResponse;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// Sandbox SDP Exchange with query parameters
export async function exchangeSandboxSdp(
  sdpOffer: string,
  config: {
    model: string;
    prompt: string;
    temperature: number;
    max_output_tokens: number;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
    create_response: boolean;
    interrupt_response: boolean;
    auto_start: boolean;
  }
): Promise<string> {
  try {
    const requestConfig = await configureWebRtcRequest({
      requiresAuth: true,
      mediaType: "sdp",
    });

    const params = new URLSearchParams({
      model: config.model,
      prompt: config.prompt,
      temperature: config.temperature.toString(),
      max_output_tokens: config.max_output_tokens.toString(),
      threshold: config.threshold.toString(),
      prefix_padding_ms: config.prefix_padding_ms.toString(),
      silence_duration_ms: config.silence_duration_ms.toString(),
      create_response: config.create_response.toString(),
      interrupt_response: config.interrupt_response.toString(),
      auto_start: config.auto_start.toString(),
    });

    const url = `/api/v1/realtime2/sandbox/sdp?${params.toString()}`;

    const response = await webrtcApiClient.post(url, sdpOffer, {
      ...requestConfig,
      responseType: "text",
    });

    return response.data;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// Sandbox End Session
export async function endSandboxSession(
  session_id: string,
  fast: boolean = true
): Promise<{ status: string; message?: string }> {
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });

    const url = "/api/v1/realtime2/sandbox/end";
    const data = {
      session_id,
      fast,
    };

    const response = await webrtcApiClient.post(url, data, requestConfig);

    return response.data;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// Free Explore SDP Exchange - Open ended conversation
export async function exchangeFreeExploreSdp(
  sdpOffer: string
): Promise<{ sdp: string; sessionId: string }> {
  try {
    const token = await getAuthToken();
    const url = `${WEBRTC_API_BASE}/api/v1/realtime2/open/sdp`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': `Bearer ${token}`
      },
      body: sdpOffer,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const sdpAnswer = await response.text();

    const sessionId = response.headers.get('x-session-id');
    
    if (!sessionId) {
      throw new Error('No session ID received from backend - backend may need to set Access-Control-Expose-Headers: X-Session-Id');
    }

    return {
      sdp: sdpAnswer,
      sessionId: sessionId
    };
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

export async function endFreeExploreSession(
  sessionId: string
): Promise<{ status: string; message?: string }> {
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });

    const url = "/api/v1/realtime2/sandbox/end";
    const data = {
      session_id: sessionId,
      fast: false
    };

    const response = await webrtcApiClient.post(url, data, requestConfig);

    return response.data;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}