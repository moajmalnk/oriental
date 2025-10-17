/**
 * Type definitions for Oriental College Application
 */

export interface Admin {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  created_at: string;
}

export interface Student {
  RegiNo: string;
  Name: string;
  CertificateNo: string;
  Anatomy_CE: number | null;
  Anatomy_TE: number | null;
  Anatomy_Total: number | string;
  Acupuncture_CE: number | null;
  Acupuncture_TE: number | null;
  Acupuncture_Total: number | string;
  Practical_PR: number | null;
  Practical_Project: number | null;
  Practical_Viva: number | null;
  Practical_Total: number | string;
  Total: number;
  Result: string;
}

export interface DCPStudent {
  RegiNo: string;
  Name: string;
  CertificateNo: string;
  DCP001_CE: number | null;
  DCP001_TE: number | null;
  DCP001_Total: number | string;
  DCP002_CE: number | null;
  DCP002_TE: number | null;
  DCP002_Total: number | string;
  DCP003_CE: number | null;
  DCP003_TE: number | null;
  DCP003_Total: number | string;
  DCP004_PW: number | null;
  DCP004_PE: number | null;
  DCP004_Total: number | string;
  Total: number;
  Result: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Admin | null;
  isLoading: boolean;
  error: string | null;
}

// Legacy types for backward compatibility
export type { Student as LegacyStudent, DCPStudent as LegacyDCPStudent };
