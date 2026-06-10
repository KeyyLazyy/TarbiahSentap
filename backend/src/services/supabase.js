const { createClient } = require('@supabase/supabase-js');

let isSupabaseEnabled = false;
let supabase = null;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  isSupabaseEnabled = true;
  console.log('🔥 Supabase initialized successfully');
} else {
  console.warn('⚠️ Supabase configuration variables missing (SUPABASE_URL, SUPABASE_KEY).');
  console.warn('⚠️ Server will run in MOCK Authentication mode.');
}

/**
 * Signs in a user using email and password via Supabase.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} Supabase sign-in response
 */
async function signInWithEmailAndPassword(email, password) {
  if (!isSupabaseEnabled) {
    throw new Error('Supabase authentication is not enabled.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    idToken: data.session.access_token,
    uid: data.user.id,
    email: data.user.email,
  };
}

/**
 * Gets a user's details and custom claims.
 * @param {string} uid 
 * @returns {Promise<object>}
 */
async function getUserRecord(uid) {
  if (!isSupabaseEnabled) {
    throw new Error('Supabase SDK is not enabled.');
  }
  
  // Note: Without a service_role key, we cannot easily fetch another user's details via admin API.
  // We'll mock returning user metadata for now, but ideally this uses supabase.auth.admin.getUserById(uid)
  
  // If we have admin methods (using service_role key)
  if (supabase.auth.admin) {
      const { data, error } = await supabase.auth.admin.getUserById(uid);
      if (error) throw new Error(error.message);
      
      return {
          uid: data.user.id,
          email: data.user.email,
          emailVerified: data.user.email_confirmed_at != null,
          customClaims: data.user.app_metadata,
      };
  }

  // Fallback if no admin access:
  return {
    uid,
    customClaims: {}
  };
}

/**
 * Sets custom claims on a user (such as role and TOTP secret).
 * @param {string} uid 
 * @param {object} claims 
 */
async function setCustomUserClaims(uid, claims) {
  if (!isSupabaseEnabled) {
    throw new Error('Supabase SDK is not enabled.');
  }
  
  if (supabase.auth.admin) {
    const { data: user } = await supabase.auth.admin.getUserById(uid);
    const existingClaims = user.user?.app_metadata || {};
    
    await supabase.auth.admin.updateUserById(uid, {
      app_metadata: { ...existingClaims, ...claims }
    });
  } else {
      console.warn('⚠️ Service role key required to set custom claims in Supabase.');
  }
}

/**
 * Seeds default admin and customer credentials if they do not exist.
 */
async function seedUsers() {
  if (!isSupabaseEnabled || !supabase.auth.admin) {
      if(isSupabaseEnabled) console.warn('⚠️ Skipping Supabase seeding: Service Role Key is required to create admin users directly.');
      return;
  }

  console.log('🌱 Checking and seeding default users in Supabase Auth...');
  
  const defaultUsers = [
    {
      email: 'admin@tarbiahsentap.com',
      password: 'password123',
      displayName: 'System Admin',
      claims: {
        role: 'admin',
        totpSecret: 'MFRGGZDFMZTWQ2LK',
      },
    },
    {
      email: 'customer@example.com',
      password: 'password123',
      displayName: 'Mock Customer',
      claims: {
        role: 'customer',
      },
    }
  ];

  for (const defaultUser of defaultUsers) {
    try {
      let { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      
      let userRecord = users.find(u => u.email === defaultUser.email);
      
      if (userRecord) {
        console.log(`✅ User ${defaultUser.email} already exists in Supabase Auth`);
      } else {
        const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
          email: defaultUser.email,
          password: defaultUser.password,
          email_confirm: true,
          user_metadata: { name: defaultUser.displayName }
        });
        
        if (createError) throw createError;
        userRecord = newUserData.user;
        console.log(`✨ Created default user ${defaultUser.email} in Supabase Auth`);
      }

      const currentClaims = userRecord.app_metadata || {};
      const needsClaimsUpdate = Object.keys(defaultUser.claims).some(
        key => currentClaims[key] !== defaultUser.claims[key]
      );

      if (needsClaimsUpdate) {
        await supabase.auth.admin.updateUserById(userRecord.id, {
          app_metadata: {
            ...currentClaims,
            ...defaultUser.claims,
          }
        });
        console.log(`🔑 Applied custom claims for ${defaultUser.email}`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed user ${defaultUser.email}:`, error.message);
    }
  }
}

module.exports = {
  isSupabaseEnabled,
  supabase,
  signInWithEmailAndPassword,
  getUserRecord,
  setCustomUserClaims,
  seedUsers,
};
