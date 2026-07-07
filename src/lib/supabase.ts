import { createClient } from '@supabase/supabase-js';

// Fallback de strings vazias para evitar que o Next.js quebre durante a compilação (prerendering)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtebzvfqpccmicjqgfhw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r3RKhL-Oaqr5osqyn-LgtQ_VBVJJZox';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Aviso: As variáveis de ambiente do Supabase não estão definidas. ' +
    'O cliente foi inicializado com placeholders para a compilação estática.'
  );
}

if (typeof window !== 'undefined') {
  console.log('DEBUG - Supabase URL em uso:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
