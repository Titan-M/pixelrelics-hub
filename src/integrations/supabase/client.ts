
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables for Supabase connection
const SUPABASE_URL = "https://xzrplktgloumrqygnhze.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6cnBsa3RnbG91bXJxeWduaHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjA5MjMsImV4cCI6MjA1NjIzNjkyM30.nIkZPhjHnav3sa68kQynEZFsfwQpaOX-qsf7ttClhrU";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Create a storage bucket for profile photos if it doesn't exist
const createStorageBucket = async () => {
  try {
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const profileBucketExists = existingBuckets?.some(bucket => bucket.name === 'profile-photos');
    
    if (!profileBucketExists) {
      const { data, error } = await supabase.storage.createBucket('profile-photos', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
      });
      
      if (error) {
        console.error('Error creating profile-photos bucket:', error);
      } else {
        console.log('Created profile-photos bucket:', data);
      }
    }
  } catch (error) {
    console.error('Error checking/creating storage bucket:', error);
  }
};

// Initialize storage bucket when the client is imported
createStorageBucket();

// Helper function to upload profile photos
export const uploadProfilePhoto = async (file: File, userId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};
