import { createClient } from '@supabase/supabase-js';
import * as mockData from './data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let client;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing! The website is falling back to a local mock client. ' +
    'To connect to your live database, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );

  const createMockBuilder = (table) => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      neq: () => builder,
      order: () => builder,
      limit: () => builder,
      single: async () => {
        const { data } = await builder;
        return { data: Array.isArray(data) ? data[0] : data, error: null };
      },
      insert: async (inputData) => {
        return { data: inputData, error: null };
      },
      update: async (inputData) => {
        return { data: inputData, error: null };
      },
      upsert: async (inputData) => {
        return { data: inputData, error: null };
      },
      delete: async () => {
        return { data: null, error: null };
      },
      then: (resolve) => {
        let result = [];
        if (table === 'products') {
          const allProducts = [...(mockData.products || []), ...(mockData.newArrivals || [])];
          const uniqueProducts = [];
          const seenIds = new Set();
          for (const p of allProducts) {
            if (!seenIds.has(p.id)) {
              seenIds.add(p.id);
              uniqueProducts.push(p);
            }
          }
          result = uniqueProducts;
        } else if (table === 'categories') {
          result = mockData.categories || [];
        } else if (table === 'reviews') {
          result = [
            { id: 1, author: "Alexander M.", rating: 5, comment: "The fabric texture is outstanding. It feels extremely premium and holds its shape perfectly throughout the day.", product: "The Oxford Textured Shirt", created_at: new Date().toISOString() },
            { id: 2, author: "Liam K.", rating: 5, comment: "Exceptional tailoring. Finding pants that drape this nicely is rare.", product: "The Corduroy Utility Pants", created_at: new Date().toISOString() },
            { id: 3, author: "Julian R.", rating: 5, comment: "Heavyweight cotton done right. The mock collar stays tight, and the puff print detail is immaculate.", product: "The Vanguard Graphic Tee", created_at: new Date().toISOString() }
          ];
        } else if (table === 'site_settings') {
          result = [{
            id: 1,
            hero_title: 'SARTORIAL REFINEMENT',
            hero_subtitle: 'MINIMALIST LUXURY TAILORED FOR THE MODERN MAN',
            contact_email: 'support@urbangents.com',
            contact_phone: '+1 (555) 019-2834',
            address: '148 Vanguard Ave, Suite 300, New York, NY'
          }];
        }
        resolve({ data: result, error: null });
      }
    };
    return builder;
  };

  client = {
    from: createMockBuilder,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async (credentials) => {
        return { data: { user: { email: credentials.email, id: 'mock-user-id' } }, error: null };
      },
      signUp: async (credentials) => {
        return { data: { user: { email: credentials.email, id: 'mock-user-id' } }, error: null };
      },
      signOut: async () => ({ error: null })
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-image.png' }, error: null }),
        getPublicUrl: (filePath) => ({ data: { publicUrl: `https://via.placeholder.com/600?text=${filePath}` } })
      })
    }
  };
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
