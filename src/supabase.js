import { createClient } from '@supabase/supabase-js';

// Publishable keys are designed for browser apps. Security is enforced by Supabase Auth and RLS.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://wttwtzqtflmbncxnngcu.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_MT81mks5Llv3VK-PTlu_5g_u0xxTbdy'
);
