import { createClient } from '@supabase/supabase-js'

// Ideally keep these in environment variables (Vite: import.meta.env)
// Using provided credentials per request
const SUPABASE_URL = 'https://royjfhweioengfgcnuml.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveWpmaHdlaW9lbmdmZ2NudW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTIyODQsImV4cCI6MjA3NDI4ODI4NH0.1M_ekm4lHoPn8_lMVLYlBvJr3n-tPI6u8G2BNMYRtIg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
