
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xzrplktgloumrqygnhze.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6cnBsa3RnbG91bXJxeWduaHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjA5MjMsImV4cCI6MjA1NjIzNjkyM30.nIkZPhjHnav3sa68kQynEZFsfwQpaOX-qsf7ttClhrU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
