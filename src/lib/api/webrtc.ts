import axios, { AxiosRequestConfig } from "axios";
import { getAuthToken } from "@/actions/auth";
import { ApiConfig } from "@/types/api";
import { postDataToAPI, postWebRtcDataToAPI } from "./client";

interface EndSessionResponse {
  status: string;
}
// WebRTC API Base URL
const WEBRTC_API_BASE = 'http://192.168.1.39:8000';

// Create WebRTC axios instance
export const webrtcApiClient = axios.create({
  baseURL: WEBRTC_API_BASE,
  timeout: 30000,
  // Add CORS headers to help with preflight requests
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
});

// Add request interceptor for debugging
webrtcApiClient.interceptors.request.use(
  (config) => {
    console.log('📤 WebRTC API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: typeof config.data === 'string' ? `${config.data.substring(0, 100)}...` : config.data
    });
    return config;
  },
  (error) => {
    console.error('📤 WebRTC API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
webrtcApiClient.interceptors.response.use(
  (response) => {
    console.log('📥 WebRTC API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: typeof response.data === 'string' ? `${response.data.substring(0, 100)}...` : response.data
    });
    return response;
  },
  (error) => {
    console.error('📥 WebRTC API Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

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
    console.log("WebRTC Authorization header set");
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
  conversation_id: string = 'gpt-4o-mini-realtime-preview-2024-12-17'
): Promise<string> {
  console.log('🔄 Starting SDP exchange...');
  console.log('📤 SDP Offer length:', sdpOffer.length);
  // console.log('🎯 Target model:', model);
  console.log('🌐 WebRTC API Base:', WEBRTC_API_BASE);
  
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true, mediaType: "sdp" });
    console.log('🔑 Request config prepared:', {
      headers: requestConfig.headers,
      baseURL: webrtcApiClient.defaults.baseURL
    });

    const url = `/api/v1/realtime2/sdp?conversation_id=${conversation_id}`;
    console.log('📍 Full request URL:', `${WEBRTC_API_BASE}${url}`);
    
    const response = await webrtcApiClient.post(
      url,
      sdpOffer,
      {
        ...requestConfig,
        responseType: 'text'
      }
    );
    
    console.log('✅ SDP exchange successful!');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data length:', response.data.length);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ SDP exchange failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Response data:', error.response?.data);
    throw error;
  }
}

// Fallback SDP exchange using fetch with no-cors (for debugging)
export async function exchangeSdpFallback(
  sdpOffer: string,
  conversation_id: string = 'gpt-4o-mini-realtime-preview-2024-12-17'
): Promise<string> {
  console.log('🔄 Fallback SDP exchange (using fetch)...');
  
  try {
    const token = await getAuthToken();
    const url = `${WEBRTC_API_BASE}/api/v1/realtime2/sdp?conversation_id=${conversation_id}`;

    console.log('📍 Fallback URL:', url);
    console.log('🔑 Using token:', token ? 'Token present' : 'No token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/sdp',
      },
      body: sdpOffer,
      mode: 'cors', // Try CORS first
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.text();
    console.log('✅ Fallback SDP exchange successful!');
    return result;
    
  } catch (error: any) {
    console.error('❌ Fallback SDP exchange also failed:', error);
    throw error;
  }
}

// WebRTC Bind Context
export async function bindWebRtcContext(data: { title: string; information: string }): Promise<any> {
  console.log('🔗 Binding WebRTC context...');
  console.log('📤 Context data:', data);
  
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    console.log('🔑 Bind context request config:', requestConfig.headers);
    
    const response = await webrtcApiClient.post('/api/v1/realtime2/bind-context', data, requestConfig);
    
    console.log('✅ Context bind successful!');
    console.log('📥 Response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Context bind failed:');
    console.error('Error:', error.message);
    console.error('Response:', error.response?.data);
    throw error;
  }
}

// Debug function to test the exact same request as your working cURL
export async function testEndSessionWithFetch(conversation_id: string): Promise<any> {
  console.log('🧪 Testing end session with fetch (like cURL)...');
  
  const token = await getAuthToken();
  const url = `${WEBRTC_API_BASE}/api/v1/realtime2/end`;
  const data = {
    "conversation_id": conversation_id,
    "reason": "ended_by_client"
  };
  
  console.log('📤 Fetch request details:');
  console.log('URL:', url);
  console.log('Headers:', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
  console.log('Body:', JSON.stringify(data));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
      mode: 'cors'
    });
    
    console.log('📥 Fetch response status:', response.status);
    console.log('📥 Fetch response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Fetch response body:', responseText);
    
    return {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    };
  } catch (error: any) {
    console.error('❌ Fetch request failed:', error);
    throw error;
  }
}

// WebRTC Health Check (for debugging connectivity)
export async function testWebRtcConnection(): Promise<any> {
  console.log('🩺 Testing WebRTC server connectivity...');
  console.log('🌐 Target server:', WEBRTC_API_BASE);
  
  try {
    // Try a simple GET request first (if your server has a health endpoint)
    const response = await fetch(`${WEBRTC_API_BASE}/health`, {
      method: 'GET',
      mode: 'cors'
    });
    
    console.log('✅ Health check response:', response.status, response.statusText);
    return { status: 'ok', message: 'Server is reachable' };
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    
    // Try a basic connection to the base URL
    try {
      const baseResponse = await fetch(WEBRTC_API_BASE, {
        method: 'GET',
        mode: 'no-cors' // This will tell us if the server is at least responding
      });
      console.log('📡 Base URL response:', baseResponse.type);
      return { status: 'partial', message: 'Server responds but may have CORS issues' };
    } catch (baseError: any) {
      console.error('❌ Base URL also failed:', baseError);
      return { status: 'error', message: 'Server unreachable' };
    }
  }
}

// WebRTC End Session
export async function endWebRtcSession({conversation_id}: {conversation_id: string}): Promise<any> {
  console.log('🛑 Ending WebRTC session...');
  console.log('🔑 Conversation ID:', conversation_id);
  console.log('🌐 Target URL:', `${WEBRTC_API_BASE}/api/v1/realtime2/end`);
  
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    const requestData = {
      "conversation_id": `${conversation_id}`,
      "reason": "ended_by_client"
    };
    
    console.log('📤 Request data:', requestData);
    console.log('📤 Request config:', requestConfig);
    console.log('📤 Full axios config:', {
      method: 'POST',
      url: '/api/v1/realtime2/end',
      baseURL: WEBRTC_API_BASE,
      headers: requestConfig.headers,
      data: requestData
    });
    
    const response = await webrtcApiClient.post('/api/v1/realtime2/end', requestData, requestConfig);

    console.log('✅ Session ended successfully!', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to end session:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error config:', error.config);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Response headers:', error.response?.headers);
    
    // Log network-specific errors
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused - server may be down or unreachable');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🚫 Host not found - check the server IP/URL');
    } else if (error.code === 'ECONNRESET') {
      console.error('🚫 Connection reset - network issue or server dropped connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('🚫 Request timeout - server taking too long to respond');
    }
    
    throw error;
  }
}

// WebRTC Get Latest Image
export async function getLatestImage(): Promise<any> {
  console.log('🖼️ Getting latest image...');
  
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    const response = await webrtcApiClient.get('/api/v1/realtime2/latest-image', requestConfig);
    
    console.log('✅ Latest image retrieved!');
    console.log('📥 Image data:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get latest image:');
    console.error('Error:', error.message);
    throw error;
  }
}
