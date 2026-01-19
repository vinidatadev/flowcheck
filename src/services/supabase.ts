import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kztzrejrhpsefvpugynq.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dHpyZWpyaHBzZWZ2cHVneW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NDM2NDAsImV4cCI6MjA2MjExOTY0MH0.DuVCHKKAH7H_pFWbMAoXVzP8YlZoucl1mVDc2m-EjNE'

export const supabase = createClient(supabaseUrl, supabaseKey)