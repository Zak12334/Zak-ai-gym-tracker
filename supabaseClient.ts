
import { createClient } from '@supabase/supabase-js'

/**
 * Searches for an environment variable across multiple possible injection points.
 * Supports process.env (Node/Sandboxes), import.meta.env (Vite/ESM), and global scope.
 */
const getEnv = (key: string): string => {
  // Priority 1: process.env (Standard for most cloud/sandbox environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {}

  // Priority 2: import.meta.env (Standard for Vite-based builds)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch {}

  // Priority 3: globalThis (Fallback for certain browser injection methods)
  try {
    if ((globalThis as any)[key]) {
      return (globalThis as any)[key];
    }
  } catch {}

  return '';
};

/**
 * Attempt to find the Supabase configuration variables.
 * We check for both 'VITE_' prefixed and plain versions to ensure compatibility
 * across different deployment and build environments.
 */
const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// Log a warning if the configuration is missing, rather than crashing immediately.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'IronMind Persistence Warning: Supabase configuration (URL or Anon Key) is missing. ' +
    'The app will continue to run, but database features will remain disabled until ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided in your environment variables.'
  );
}

/**
 * Initialize the Supabase client.
 * We provide a fallback URL to prevent the 'supabaseUrl is required' error 
 * during the constructor call. This allows the application to boot normally.
 * If these are placeholders, database requests will fail gracefully with a connection error
 * which is caught and handled in the App components.
 */
const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
);

export default supabase;
