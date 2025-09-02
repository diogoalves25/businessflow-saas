const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
  console.error('You can find it in your Supabase project settings under API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoAccounts = [
  {
    email: 'demo@sparkleclean.com',
    password: 'demo123',
    user_metadata: {
      full_name: 'Sarah Johnson',
      organization_id: 'org_sparkle_clean_123'
    }
  },
  {
    email: 'demo@quickfixplumbing.com', 
    password: 'demo123',
    user_metadata: {
      full_name: 'Mike Thompson',
      organization_id: 'org_quickfix_plumbing_123'
    }
  },
  {
    email: 'demo@brightdental.com',
    password: 'demo123',
    user_metadata: {
      full_name: 'Dr. Emily Chen',
      organization_id: 'org_bright_dental_123'
    }
  }
];

async function setupDemoAuth() {
  console.log('Setting up demo authentication accounts...\n');

  for (const account of demoAccounts) {
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.some(u => u.email === account.email);

      if (userExists) {
        console.log(`✓ User ${account.email} already exists`);
        
        // Update the password to ensure it matches
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.users.find(u => u.email === account.email).id,
          { password: account.password }
        );
        
        if (updateError) {
          console.error(`  Error updating password: ${updateError.message}`);
        } else {
          console.log(`  Password updated to: ${account.password}`);
        }
      } else {
        // Create new user
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: account.user_metadata
        });

        if (error) {
          console.error(`✗ Error creating ${account.email}: ${error.message}`);
        } else {
          console.log(`✓ Created ${account.email} with password: ${account.password}`);
        }
      }
    } catch (error) {
      console.error(`✗ Error processing ${account.email}: ${error.message}`);
    }
  }

  console.log('\nDemo accounts setup complete!');
  console.log('\nYou can now login with:');
  demoAccounts.forEach(account => {
    console.log(`- Email: ${account.email}, Password: ${account.password}`);
  });
}

setupDemoAuth().catch(console.error);