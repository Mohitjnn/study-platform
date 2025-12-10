export interface DtlnHandle {
  handle: unknown;
}

export interface AudioProcessorResult {
  success: boolean;
  processedBuffer?: Float32Array;
  error?: string;
}

export interface AudioCleaningConfig {
  enabled: boolean;
  sampleRate: number;
  frameSize: number;
}

export interface DtlnModuleInterface {
  dtln_create?: () => unknown;
  dtln_denoise?: (handle: unknown, input: Float32Array, output: Float32Array) => void;
  dtln_destroy?: (handle: unknown) => void;
  _initialized?: boolean;
}

// Type definition for the DTLN module
export interface DtlnModule {
  noInitialRun?: boolean;
  onRuntimeInitialized?: () => void;
  postRun?: (() => void) | Array<() => void>;
  _initialized?: boolean;

  // dtln-rs specific API:
  dtln_create?: () => unknown;
  dtln_denoise?: (handle: unknown, input: Float32Array, output: Float32Array) => void;
  dtln_destroy?: (handle: unknown) => void;
}

// Extended WASM module interface with DTLN functions
export interface DtlnWasmModule extends DtlnModule {
  _dtln_create_wasm?: () => unknown;
  _dtln_denoise_wasm?: (handle: unknown, inputPtr: number, outputPtr: number) => void;
  _dtln_destroy_wasm?: (handle: unknown) => void;
  _dtln_get_audio_buffer?: () => number;
  _malloc?: (size: number) => number;
  _free?: (ptr: number) => void;
  HEAPF32?: Float32Array;
}

declare global {
  interface Window {
    Module?: DtlnWasmModule;
    dtlnModule?: DtlnModule;
    dtlnModulePromise?: Promise<DtlnModule>;
  }
  
  const Module: DtlnWasmModule | undefined;
}
