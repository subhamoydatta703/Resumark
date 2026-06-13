export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  resumeId?: string;
  fileData?: {
    resume?: {
      id: string;
      fileName: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadState {
  status: UploadStatus;
  progress: number;
  resumeId: string | null;
  error: string | null;
  fileName: string | null;
  fileSize: number | null;
}
