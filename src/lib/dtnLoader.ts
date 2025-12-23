import { DtlnModule } from "@/types/audio";

export async function loadDtlnModule(): Promise<DtlnModule> {
  if (typeof window === 'undefined') {
    throw new Error('DTLN module can only be loaded in browser environment');
  }

  // If already loading, return the existing promise
  if (window.dtlnModulePromise) {
    return window.dtlnModulePromise;
  }

  // If already loaded and has the functions we need, return it
  if (window.dtlnModule && 
      typeof window.dtlnModule.dtln_create === 'function' && 
      typeof window.dtlnModule.dtln_denoise === 'function') {
    return window.dtlnModule;
  }
  
  window.dtlnModulePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('DTLN module load timeout'));
    }, 30000);

    const existingScript = document.querySelector('script[src="/worklets/dtln.js"]');
    
    const setupModule = () => {
      clearTimeout(timeout);
      
      let retryCount = 0;
      const maxRetries = 50;
      
      const checkModule = () => {
        let dtlnModule: DtlnModule | null = null;
        
        // ✅ Look for the _wasm suffix functions you identified
        if (window.Module && typeof window.Module._dtln_create_wasm === 'function') {
          const wasmModule = window.Module;
          
          // ✅ Check if TensorFlow delegate is ready (this might be the missing piece)
          const tfReady = typeof wasmModule._dtln_get_audio_buffer === 'function' || 
                          (wasmModule.HEAPF32 && wasmModule._malloc && wasmModule._free);
          
          if (!tfReady) {
            retryCount++;
            if (retryCount < maxRetries) {
              setTimeout(checkModule, 100);
            } else {
              reject(new Error('TensorFlow functions not available after timeout'));
            }
            return;
          }
          
          // ✅ Create wrapper functions with proper memory management
          dtlnModule = {
            dtln_create: () => {
              try {
                if (!wasmModule._dtln_create_wasm) {
                  throw new Error('_dtln_create_wasm function not available');
                }
                
                const handle = wasmModule._dtln_create_wasm();
                
                // ✅ In WASM, 0 typically means null/failure, any positive number is a valid handle
                if (!handle || handle === 0) {
                  throw new Error('DTLN handle creation failed - returned null/zero');
                }
                return handle;
              } catch (error) {
                console.error('[DTLN] Error in dtln_create:', error);
                throw error;
              }
            },
            
            dtln_denoise: (handle: unknown, input: Float32Array, output: Float32Array) => {
              try {
                // ✅ Validate handle first
                if (!handle || handle === 0) {
                  throw new Error('Invalid DTLN handle');
                }
                
                // ✅ Validate input/output arrays
                if (!input || !output || input.length === 0 || output.length === 0) {
                  throw new Error('Invalid input/output arrays');
                }
                
                // Check if we should use the audio buffer approach
                if (typeof wasmModule._dtln_get_audio_buffer === 'function') {
                  // Method 1: Use pre-allocated buffer (more efficient)
                  const bufferPtr = wasmModule._dtln_get_audio_buffer();
                  
                  if (bufferPtr && wasmModule.HEAPF32 && wasmModule._dtln_denoise_wasm) {
                    // Copy input to WASM memory
                    wasmModule.HEAPF32.set(input, bufferPtr / 4);
                    
                    // Process
                    const result = wasmModule._dtln_denoise_wasm(handle, bufferPtr, bufferPtr);
                    
                    // ✅ Check if processing was successful
                    if (result !== undefined && result !== 0) {
                      // Silent processing warning
                    }
                    
                    // Copy output back
                    const processedData = wasmModule.HEAPF32.subarray(
                      bufferPtr / 4,
                      bufferPtr / 4 + output.length
                    );
                    output.set(processedData);
                  } else {
                    throw new Error('Could not get audio buffer or missing WASM functions');
                  }
                } else {
                  // Method 2: Manual memory allocation
                  if (!wasmModule._malloc || !wasmModule._free || !wasmModule.HEAPF32 || !wasmModule._dtln_denoise_wasm) {
                    throw new Error('Required WASM functions not available');
                  }
                  
                  const inputPtr = wasmModule._malloc(input.length * 4);
                  const outputPtr = wasmModule._malloc(output.length * 4);
                  
                  if (!inputPtr || !outputPtr) {
                    if (inputPtr) wasmModule._free(inputPtr);
                    if (outputPtr) wasmModule._free(outputPtr);
                    throw new Error('Memory allocation failed');
                  }
                  
                  try {
                    // Copy input to WASM memory
                    wasmModule.HEAPF32.set(input, inputPtr / 4);
                    
                    // Process
                    const result = wasmModule._dtln_denoise_wasm(handle, inputPtr, outputPtr);
                    
                    // ✅ Check if processing was successful
                    if (result !== undefined && result !== 0) {
                      // Silent processing warning
                    }
                    
                    // Copy output back
                    const processedData = wasmModule.HEAPF32.subarray(
                      outputPtr / 4,
                      outputPtr / 4 + output.length
                    );
                    output.set(processedData);
                  } finally {
                    // Free memory
                    wasmModule._free(inputPtr);
                    wasmModule._free(outputPtr);
                  }
                }
              } catch (error) {
                // On error, copy input to output (passthrough)
                output.set(input);
              }
            },
            
            dtln_destroy: (handle: unknown) => {
              try {
                // ✅ Validate handle before destroying
                if (!handle || handle === 0) {
                  return;
                }
                
                if (wasmModule._dtln_destroy_wasm) {
                  wasmModule._dtln_destroy_wasm(handle);
                }
              } catch (error) {
                // Silent error handling
              }
            }
          };
        }
        
        // ✅ Validate and resolve
        if (dtlnModule && dtlnModule.dtln_create && dtlnModule.dtln_denoise) {
          window.dtlnModule = dtlnModule;
          dtlnModule._initialized = true;
          resolve(dtlnModule);
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            setTimeout(checkModule, 100);
          } else {
            
            // Debug info
            if (window.Module) {
              const allKeys = Object.keys(window.Module);
              const dtlnKeys = allKeys.filter(k => k.toLowerCase().includes('dtln'));
            }
            
            reject(new Error('DTLN functions not available after timeout'));
          }
        }
      };
      
      checkModule();
    };

    if (!existingScript) {
      window.Module = {
        noInitialRun: false,
        onRuntimeInitialized() {
          setTimeout(setupModule, 100);
        },
        postRun: [() => {
          setTimeout(setupModule, 50);
        }]
      };
      
      const script = document.createElement('script');
      script.src = '/worklets/dtln.js';
      script.onload = () => {
        setTimeout(setupModule, 2000);
      };
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Failed to load DTLN script"));
      };
      document.head.appendChild(script);
    } else {
      setTimeout(setupModule, 500);
    }
  });

  try {
    const result = await window.dtlnModulePromise;
    window.dtlnModulePromise = undefined;
    return result;
  } catch (error) {
    window.dtlnModulePromise = undefined;
    throw error;
  }
}