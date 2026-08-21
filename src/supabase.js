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

  const memoryDb = {};

  const getStorageItem = (key, defaultValue) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
    return key in memoryDb ? memoryDb[key] : defaultValue;
  };

  const setStorageItem = (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return;
      }
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
    memoryDb[key] = value;
  };

  const getInitialProducts = () => {
    const allProducts = [...(mockData.products || []), ...(mockData.newArrivals || [])];
    const uniqueProducts = [];
    const seenIds = new Set();
    for (const p of allProducts) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        const normalized = {
          secondary_image: p.secondaryImage || p.secondary_image,
          ...p
        };
        uniqueProducts.push(normalized);
      }
    }
    return uniqueProducts;
  };

  const initDb = () => {
    if (!getStorageItem('uc_mock_initialized', false)) {
      setStorageItem('uc_mock_products', getInitialProducts());
      setStorageItem('uc_mock_categories', mockData.categories || []);
      setStorageItem('uc_mock_reviews', [
        { id: 1, author: "Alexander M.", rating: 5, comment: "The fabric texture is outstanding. It feels extremely premium and holds its shape perfectly throughout the day.", product: "The Oxford Textured Shirt", created_at: new Date().toISOString() },
        { id: 2, author: "Liam K.", rating: 5, comment: "Exceptional tailoring. Finding pants that drape this nicely is rare.", product: "The Corduroy Utility Pants", created_at: new Date().toISOString() },
        { id: 3, author: "Julian R.", rating: 5, comment: "Heavyweight cotton done right. The mock collar stays tight, and the puff print detail is immaculate.", product: "The Vanguard Graphic Tee", created_at: new Date().toISOString() }
      ]);
      setStorageItem('uc_mock_site_settings', [{
        id: 1,
        hero_title: 'SARTORIAL REFINEMENT',
        hero_subtitle: 'MINIMALIST LUXURY TAILORED FOR THE MODERN MAN',
        contact_email: 'urbanclothingconnect@gmail.com',
        contact_phone: '+1 (555) 019-2834',
        address: '148 Vanguard Ave, Suite 300, New York, NY'
      }]);
      setStorageItem('uc_mock_orders', []);
      setStorageItem('uc_mock_order_items', []);
      setStorageItem('uc_mock_profiles', []);
      setStorageItem('uc_mock_addresses', []);
      setStorageItem('uc_mock_wishlist', []);
      setStorageItem('uc_mock_users', []);
      setStorageItem('uc_mock_initialized', true);
    }
  };

  // Initialize DB immediately if window/document is present
  if (typeof window !== 'undefined') {
    initDb();
  }

  const createMockBuilder = (table) => {
    let filters = [];
    let sortField = null;
    let sortAscending = true;
    let limitCount = null;
    let operation = 'select';
    let operationData = null;
    let isSingle = false;

    const getTableData = () => {
      initDb();
      return getStorageItem(`uc_mock_${table}`, []);
    };

    const saveTableData = (data) => {
      setStorageItem(`uc_mock_${table}`, data);
    };

    const execute = () => {
      let data = getTableData();

      // Apply mutations (insert / update / upsert / delete)
      if (operation === 'insert') {
        const rows = Array.isArray(operationData) ? operationData : [operationData];
        const newRows = rows.map(row => {
          const newRow = { ...row };
          if (newRow.id === undefined) {
            newRow.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.floor(Math.random() * 1000000000).toString();
          }
          if (newRow.created_at === undefined) {
            newRow.created_at = new Date().toISOString();
          }
          return newRow;
        });
        data = [...data, ...newRows];
        saveTableData(data);
        const resolvedVal = Array.isArray(operationData) ? newRows : newRows[0];
        return { data: isSingle ? resolvedVal : newRows, error: null };
      }

      if (operation === 'update') {
        let updatedCount = 0;
        const updatedData = data.map(row => {
          const matches = filters.every(f => f(row));
          if (matches) {
            updatedCount++;
            return { ...row, ...operationData };
          }
          return row;
        });
        if (updatedCount > 0) {
          saveTableData(updatedData);
        }
        return { data: operationData, error: null };
      }

      if (operation === 'upsert') {
        const rows = Array.isArray(operationData) ? operationData : [operationData];
        const updatedData = [...data];
        rows.forEach(row => {
          const index = updatedData.findIndex(item => item.id === row.id || (row.key && item.key === row.key));
          if (index > -1) {
            updatedData[index] = { ...updatedData[index], ...row };
          } else {
            updatedData.push({
              id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.floor(Math.random() * 1000000000).toString(),
              created_at: new Date().toISOString(),
              ...row
            });
          }
        });
        saveTableData(updatedData);
        return { data: operationData, error: null };
      }

      if (operation === 'delete') {
        const filteredData = data.filter(row => !filters.every(f => f(row)));
        saveTableData(filteredData);
        return { data: null, error: null };
      }

      // Default: select / query
      let result = [...data];

      // Apply filters
      filters.forEach(f => {
        result = result.filter(f);
      });

      // Apply sorting
      if (sortField) {
        result.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          if (typeof valA === 'string') {
            return sortAscending ? valA.localeCompare(valB || '') : (valB || '').localeCompare(valA);
          }
          return sortAscending ? (valA - valB) : (valB - valA);
        });
      }

      // Apply limit
      if (limitCount !== null) {
        result = result.slice(0, limitCount);
      }

      if (isSingle) {
        return { data: result[0] || null, error: null };
      }

      return { data: result, error: null };
    };

    const builder = {
      select: (columns) => {
        operation = 'select';
        return builder;
      },
      eq: (field, value) => {
        filters.push(row => row[field] == value);
        return builder;
      },
      neq: (field, value) => {
        filters.push(row => row[field] != value);
        return builder;
      },
      ilike: (field, value) => {
        const pattern = (value || '').replace(/%/g, '').toLowerCase();
        filters.push(row => {
          const val = row[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(pattern);
        });
        return builder;
      },
      order: (field, { ascending = true } = {}) => {
        sortField = field;
        sortAscending = ascending;
        return builder;
      },
      limit: (count) => {
        limitCount = count;
        return builder;
      },
      single: () => {
        isSingle = true;
        return builder;
      },
      maybeSingle: () => {
        isSingle = true;
        return builder;
      },
      insert: (data) => {
        operation = 'insert';
        operationData = data;
        return builder;
      },
      update: (data) => {
        operation = 'update';
        operationData = data;
        return builder;
      },
      upsert: (data) => {
        operation = 'upsert';
        operationData = data;
        return builder;
      },
      delete: () => {
        operation = 'delete';
        return builder;
      },
      then: (resolve, reject) => {
        try {
          const res = execute();
          resolve(res);
        } catch (e) {
          if (reject) reject(e);
          else resolve({ data: null, error: e });
        }
      }
    };

    return builder;
  };

  const authListeners = [];

  client = {
    from: createMockBuilder,
    auth: {
      getSession: async () => {
        const session = getStorageItem('uc_mock_session', null);
        return { data: { session }, error: null };
      },
      onAuthStateChange: (callback) => {
        authListeners.push(callback);
        const session = getStorageItem('uc_mock_session', null);
        callback('INITIAL_SESSION', session);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = authListeners.indexOf(callback);
                if (idx > -1) authListeners.splice(idx, 1);
              }
            }
          }
        };
      },
      signInWithPassword: async ({ email, password }) => {
        const users = getStorageItem('uc_mock_users', []);
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          return { data: { session: null }, error: { message: 'Invalid email or password' } };
        }
        const session = {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { full_name: user.full_name, phone: user.phone }
          }
        };
        setStorageItem('uc_mock_session', session);
        authListeners.forEach(l => l('SIGNED_IN', session));
        return { data: session, error: null };
      },
      signUp: async ({ email, password, options }) => {
        const users = getStorageItem('uc_mock_users', []);
        if (users.some(u => u.email === email)) {
          return { data: null, error: { message: 'Email already exists' } };
        }
        const fullName = options?.data?.full_name || email.split('@')[0];
        const phone = options?.data?.phone || '';
        const newUser = {
          id: `mock-user-${Math.floor(Math.random() * 1000000000)}`,
          email,
          password,
          full_name: fullName,
          phone
        };
        users.push(newUser);
        setStorageItem('uc_mock_users', users);

        // Also add profile to profiles
        const profiles = getStorageItem('uc_mock_profiles', []);
        profiles.push({
          id: newUser.id,
          user_id: newUser.id,
          full_name: fullName,
          phone,
          created_at: new Date().toISOString()
        });
        setStorageItem('uc_mock_profiles', profiles);

        const session = {
          user: {
            id: newUser.id,
            email: newUser.email,
            user_metadata: { full_name: fullName, phone }
          }
        };
        setStorageItem('uc_mock_session', session);
        authListeners.forEach(l => l('SIGNED_IN', session));
        return { data: session, error: null };
      },
      signInWithOAuth: async ({ provider }) => {
        const mockUser = {
          id: 'mock-google-user-id',
          email: 'google-user@example.com',
          user_metadata: {
            full_name: 'Google User',
            phone: '+1 (555) 019-2834'
          }
        };
        const session = { user: mockUser };
        setStorageItem('uc_mock_session', session);

        // Ensure profile exists
        const profiles = getStorageItem('uc_mock_profiles', []);
        if (!profiles.some(p => p.id === mockUser.id)) {
          profiles.push({
            id: mockUser.id,
            user_id: mockUser.id,
            full_name: 'Google User',
            phone: '+1 (555) 019-2834',
            created_at: new Date().toISOString()
          });
          setStorageItem('uc_mock_profiles', profiles);
        }

        authListeners.forEach(l => l('SIGNED_IN', session));
        return { data: session, error: null };
      },
      signOut: async () => {
        setStorageItem('uc_mock_session', null);
        authListeners.forEach(l => l('SIGNED_OUT', null));
        return { error: null };
      },
      updateUser: async ({ password, data }) => {
        const session = getStorageItem('uc_mock_session', null);
        if (!session || !session.user) {
          return { data: null, error: { message: 'Not authenticated' } };
        }

        // Update user in users list
        const users = getStorageItem('uc_mock_users', []);
        const idx = users.findIndex(u => u.id === session.user.id);
        if (idx > -1) {
          if (password) users[idx].password = password;
          if (data?.full_name) users[idx].full_name = data.full_name;
          if (data?.phone) users[idx].phone = data.phone;
          setStorageItem('uc_mock_users', users);
        }

        // Update profile in profiles list
        const profiles = getStorageItem('uc_mock_profiles', []);
        const pIdx = profiles.findIndex(p => p.id === session.user.id);
        if (pIdx > -1) {
          if (data?.full_name) profiles[pIdx].full_name = data.full_name;
          if (data?.phone) profiles[pIdx].phone = data.phone;
          setStorageItem('uc_mock_profiles', profiles);
        }

        // Update active session metadata
        if (data?.full_name) session.user.user_metadata.full_name = data.full_name;
        if (data?.phone) session.user.user_metadata.phone = data.phone;
        setStorageItem('uc_mock_session', session);
        authListeners.forEach(l => l('USER_UPDATED', session));

        return { data: { user: session.user }, error: null };
      },
      resetPasswordForEmail: async (email) => {
        return { data: {}, error: null };
      }
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
