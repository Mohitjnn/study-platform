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
const WEBRTC_API_BASE = 'https://burgerkingswaadkapatakha.com';

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
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true, mediaType: "sdp" });

    const url = `/api/v1/realtime2/sdp?conversation_id=${conversation_id}`;
    
    const response = await webrtcApiClient.post(
      url,
      sdpOffer,
      {
        ...requestConfig,
        responseType: 'text'
      }
    );
    
    return response.data;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// Fallback SDP exchange using fetch with no-cors (for debugging)
export async function exchangeSdpFallback(
  sdpOffer: string,
  conversation_id: string = 'gpt-4o-mini-realtime-preview-2024-12-17'
): Promise<string> {
  try {
    const token = await getAuthToken();
    const url = `${WEBRTC_API_BASE}/api/v1/realtime2/sdp?conversation_id=${conversation_id}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/sdp',
      },
      body: sdpOffer,
      mode: 'cors',
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
export async function bindWebRtcContext(data: { title: string; information: string }): Promise<BindContextResponse> {
  console.log('🔗 Binding WebRTC context...');
  console.log('📤 Context data:', data);
  
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    console.log('🔑 Bind context request config:', requestConfig.headers);
    
    const response = await webrtcApiClient.post('/api/v1/realtime2/bind-context', data, requestConfig);
    
    console.log('✅ Context bind successful!');
    console.log('📥 Response:', response.data);
    
    return response.data as BindContextResponse;
  } catch (error) {
    const err = error as WebRtcError;
    console.error('❌ Context bind failed:');
    console.error('Error:', err.message);
    console.error('Response:', err.response?.data);
    throw err;
  }
}

// // Debug function to test the exact same request as your working cURL
// export async function testEndSessionWithFetch(conversation_id: string): Promise<any> {
//   console.log('🧪 Testing end session with fetch (like cURL)...');
  
//   const token = await getAuthToken();
//   const url = `${WEBRTC_API_BASE}/api/v1/realtime2/end`;
//   const data = {
//     "conversation_id": conversation_id,
//     "reason": "ended_by_client"
//   };
  
//   console.log('📤 Fetch request details:');
//   console.log('URL:', url);
//   console.log('Headers:', {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`
//   });
//   console.log('Body:', JSON.stringify(data));
  
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(data),
//       mode: 'cors'
//     });
    
//     console.log('📥 Fetch response status:', response.status);
//     console.log('📥 Fetch response headers:', Object.fromEntries(response.headers.entries()));
    
//     const responseText = await response.text();
//     console.log('📥 Fetch response body:', responseText);
    
//     return {
//       status: response.status,
//       statusText: response.statusText,
//       body: responseText
//     };
//   } catch (error: any) {
//     console.error('❌ Fetch request failed:', error);
//     throw error;
//   }
// }

// // WebRTC Health Check (for debugging connectivity)
// export async function testWebRtcConnection(): Promise<any> {
//   console.log('🩺 Testing WebRTC server connectivity...');
//   console.log('🌐 Target server:', WEBRTC_API_BASE);
  
//   try {
//     // Try a simple GET request first (if your server has a health endpoint)
//     const response = await fetch(`${WEBRTC_API_BASE}/health`, {
//       method: 'GET',
//       mode: 'cors'
//     });
    
//     console.log('✅ Health check response:', response.status, response.statusText);
//     return { status: 'ok', message: 'Server is reachable' };
//   } catch (error: any) {
//     console.error('❌ Health check failed:', error);
    
//     // Try a basic connection to the base URL
//     try {
//       const baseResponse = await fetch(WEBRTC_API_BASE, {
//         method: 'GET',
//         mode: 'no-cors' // This will tell us if the server is at least responding
//       });
//       console.log('📡 Base URL response:', baseResponse.type);
//       return { status: 'partial', message: 'Server responds but may have CORS issues' };
//     } catch (baseError: any) {
//       console.error('❌ Base URL also failed:', baseError);
//       return { status: 'error', message: 'Server unreachable' };
//     }
//   }
// }

// WebRTC End Session
export async function endWebRtcSession({conversation_id}: {conversation_id: string}): Promise<EndSessionResponse> {
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    const requestData = {
      "conversation_id": `${conversation_id}`,
      "reason": "ended_by_client"
    };
    
    const response = await webrtcApiClient.post('/api/v1/realtime2/end', requestData, requestConfig);

    return response.data as EndSessionResponse;
  } catch (error) {
    const err = error as WebRtcError;
    throw err;
  }
}

// WebRTC Get Latest Image
export async function getLatestImage(): Promise<LatestImageResponse> {
  console.log('🖼️ Getting latest image...');
  
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });
    const response = await webrtcApiClient.get('/api/v1/realtime2/latest-image', requestConfig);
    
    console.log('✅ Latest image retrieved!');
    console.log('📥 Image data:', response.data);
    
    return response.data as LatestImageResponse;
  } catch (error) {
    const err = error as WebRtcError;
    console.error('❌ Failed to get latest image:');
    console.error('Error:', err.message);
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
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true, mediaType: "sdp" });

    // Build query parameters
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
    
    console.log('🔄 Sandbox SDP Exchange URL:', `${WEBRTC_API_BASE}${url}`);
    
    const response = await webrtcApiClient.post(
      url,
      sdpOffer,
      {
        ...requestConfig,
        responseType: 'text'
      }
    );
    
    console.log('✅ Sandbox SDP Answer received');
    return response.data;
  } catch (error) {
    const err = error as WebRtcError;
    console.error('❌ Sandbox SDP Exchange failed:', err);
    throw err;
  }
}

// Sandbox End Session
export async function endSandboxSession(session_id: string, fast: boolean = true): Promise<{ status: string; message?: string }> {
  try {
    const requestConfig = await configureWebRtcRequest({ requiresAuth: true });

    const url = '/api/v1/realtime2/sandbox/end';
    const data = {
      session_id,
      fast
    };

    console.log('🛑 Ending sandbox session:', session_id);

    const response = await webrtcApiClient.post(url, data, requestConfig);
    
    console.log('✅ Sandbox session ended successfully');
    return response.data;
  } catch (error) {
    const err = error as WebRtcError;
    console.error('❌ Failed to end sandbox session:', err);
    throw err;
  }
}

// // Add these functions to your webrtc.ts file for backend testing

// // Test if backend server is reachable
// export async function testBackendConnectivity(): Promise<{
//   status: 'ok' | 'partial' | 'error';
//   message: string;
//   details?: any;
// }> {
//   console.log('🩺 Testing backend connectivity...');
//   console.log('🌐 Target server:', WEBRTC_API_BASE);
  
//   const tests = [];
  
//   // Test 1: Basic server reachability
//   try {
//     const response = await fetch(`${WEBRTC_API_BASE}/health`, {
//       method: 'GET',
//       mode: 'cors',
//       signal: AbortSignal.timeout(10000) // 10 second timeout
//     });
//     tests.push({
//       name: 'Health Check',
//       status: response.ok ? 'PASS' : 'FAIL',
//       details: `${response.status} ${response.statusText}`
//     });
//   } catch (error: any) {
//     tests.push({
//       name: 'Health Check',
//       status: 'FAIL',
//       details: error.message
//     });
    
//     // If health check fails, try base URL
//     try {
//       const baseResponse = await fetch(WEBRTC_API_BASE, {
//         method: 'GET',
//         mode: 'no-cors',
//         signal: AbortSignal.timeout(10000)
//       });
//       tests.push({
//         name: 'Base URL (no-cors)',
//         status: 'PARTIAL',
//         details: 'Server responds but CORS may be blocking'
//       });
//     } catch (baseError: any) {
//       tests.push({
//         name: 'Base URL',
//         status: 'FAIL',
//         details: 'Server completely unreachable'
//       });
//     }
//   }
  
//   // Test 2: WebRTC endpoint specifically
//   try {
//     const token = await getAuthToken();
//     const testResponse = await fetch(`${WEBRTC_API_BASE}/api/v1/realtime2/sdp?conversation_id=test`, {
//       method: 'OPTIONS', // Preflight request
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/sdp',
//       },
//       mode: 'cors',
//       signal: AbortSignal.timeout(10000)
//     });
    
//     tests.push({
//       name: 'WebRTC Endpoint OPTIONS',
//       status: testResponse.ok ? 'PASS' : 'FAIL',
//       details: `${testResponse.status} ${testResponse.statusText}`
//     });
//   } catch (error: any) {
//     tests.push({
//       name: 'WebRTC Endpoint',
//       status: 'FAIL',
//       details: error.message
//     });
//   }
  
//   console.log('🩺 Backend connectivity test results:', tests);
  
//   const failedTests = tests.filter(t => t.status === 'FAIL');
//   const passedTests = tests.filter(t => t.status === 'PASS');
  
//   if (passedTests.length === tests.length) {
//     return { status: 'ok', message: 'Backend server is fully accessible', details: tests };
//   } else if (failedTests.length === tests.length) {
//     return { status: 'error', message: 'Backend server is unreachable', details: tests };
//   } else {
//     return { status: 'partial', message: 'Backend has connectivity issues', details: tests };
//   }
// }

// // Test WebRTC capabilities
// export async function testWebRTCCapabilities(): Promise<{
//   supported: boolean;
//   issues: string[];
//   details: any;
// }> {
//   console.log('🔍 Testing WebRTC capabilities...');
  
//   const issues: string[] = [];
//   const details: any = {};
  
//   // Check RTCPeerConnection support
//   if (typeof RTCPeerConnection === 'undefined') {
//     issues.push('RTCPeerConnection not supported');
//   } else {
//     details.rtcPeerConnection = 'supported';
//   }
  
//   // Check getUserMedia support
//   if (!navigator.mediaDevices?.getUserMedia) {
//     issues.push('getUserMedia not supported');
//   } else {
//     details.getUserMedia = 'supported';
//   }
  
//   // Check secure context
//   if (!window.isSecureContext) {
//     issues.push('Not in secure context (HTTPS required for WebRTC)');
//     details.secureContext = false;
//   } else {
//     details.secureContext = true;
//   }
  
//   // Test creating a peer connection
//   try {
//     const testPC = new RTCPeerConnection({
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//     });
//     testPC.close();
//     details.peerConnectionCreation = 'success';
//   } catch (error: any) {
//     issues.push(`Cannot create RTCPeerConnection: ${error.message}`);
//     details.peerConnectionCreation = 'failed';
//   }
  
//   console.log('🔍 WebRTC capabilities test:', { issues, details });
  
//   return {
//     supported: issues.length === 0,
//     issues,
//     details
//   };
// }

// // Combined diagnostic function
// export async function runFullDiagnostics(): Promise<void> {
//   console.log('🚀 Running full WebRTC diagnostics...');
//   console.log('=' .repeat(50));
  
//   // Test 1: WebRTC Capabilities
//   console.log('📋 Test 1: WebRTC Browser Capabilities');
//   const webrtcTest = await testWebRTCCapabilities();
//   if (!webrtcTest.supported) {
//     console.error('❌ FRONTEND ISSUE: WebRTC not supported:', webrtcTest.issues);
//     return;
//   } else {
//     console.log('✅ WebRTC is supported in this browser');
//   }
  
//   // Test 2: Backend Connectivity
//   console.log('📋 Test 2: Backend Server Connectivity');
//   const backendTest = await testBackendConnectivity();
//   if (backendTest.status === 'error') {
//     console.error('❌ BACKEND ISSUE: Server unreachable');
//     console.error('💡 SOLUTION: Use local backend or fix server deployment');
//   } else if (backendTest.status === 'partial') {
//     console.warn('⚠️ BACKEND ISSUE: Connectivity problems');
//     console.warn('💡 May work but with limitations');
//   } else {
//     console.log('✅ Backend server is accessible');
//   }
  
//   console.log('=' .repeat(50));
//   console.log('🎯 DIAGNOSTIC SUMMARY:');
//   console.log(`Frontend WebRTC: ${webrtcTest.supported ? '✅' : '❌'}`);
//   console.log(`Backend Server: ${backendTest.status === 'ok' ? '✅' : backendTest.status === 'partial' ? '⚠️' : '❌'}`);
  
//   if (webrtcTest.supported && backendTest.status !== 'error') {
//     console.log('💡 System should work - if audio fails, it\'s likely a backend configuration issue');
//   } else {
//     console.log('💡 System has fundamental issues that need to be resolved first');
//   }
// }
