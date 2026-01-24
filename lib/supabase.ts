
import { createClient } from '@supabase/supabase-js';

// Substitua estas strings pelos valores que você pegou no painel do Supabase
// (Project Settings > API)
const supabaseUrl = 'https://aweipematwhmvnyksrpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZWlwZW1hdHdobXZueWtzcnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTkzOTEsImV4cCI6MjA4NDM5NTM5MX0.0vLWeMbUg_tJSSEO63-Mkr-1DQHCITMy8ldEkIYHwlQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
