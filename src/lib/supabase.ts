import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

// ==========================================
// Reusable Typed Client
// ==========================================
/**
 * Creates a reusable Supabase client configured for Next.js Client Components.
 * Automatically injects environment variables:
 * NEXT_PUBLIC_SUPABASE_URL
 * NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export const createSupabaseClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
};

export const supabase = createSupabaseClient();

// ==========================================
// Standardized Error Handling
// ==========================================
export class DatabaseError extends Error {
  public code: string;
  public details: string;

  constructor(message: string, code: string = 'UNKNOWN_DB_ERROR', details: string = '') {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Standardized error handler to wrap Supabase calls.
 * Normalizes Supabase errors into a standard DatabaseError class.
 */
export const handleSupabaseError = (error: any, context?: string) => {
  console.error(`[Supabase Error] ${context ? `(${context})` : ''}:`, error);
  
  const errorMessage = error?.message || 'An unexpected database error occurred.';
  const errorCode = error?.code || 'UNKNOWN';
  const errorDetails = error?.details || '';

  throw new DatabaseError(errorMessage, errorCode, errorDetails);
};