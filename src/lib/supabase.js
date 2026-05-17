import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://shpdvmokvxtmfzduysrk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocGR2bW9rdnh0bWZ6ZHV5c3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjczNjksImV4cCI6MjA5NDYwMzM2OX0.7yaZcHe9wcpAKkcyuhGSzW-vB9f8PnLZc2ogtc7sa3A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
