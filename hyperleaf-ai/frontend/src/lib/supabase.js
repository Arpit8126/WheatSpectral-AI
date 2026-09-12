import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rrrbmuqhjvkkkxuhrogk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycmJtdXFoanZra2t4dWhyb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDY3NTgsImV4cCI6MjEwMzkyMjc1OH0.CtGB7UcOyO-DIGDGJihLOMS_0JoFRT1krTkmuY1uY-E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
