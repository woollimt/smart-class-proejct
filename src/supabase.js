import { createClient } from '@supabase/supabase-js';

// Vite 환경 변수에서 키를 가져옵니다.
const supabaseUrl = 'https://sjjjjxphikyemhawqoer.supabase.co'
const supabaseKey = 'sb_publishable_2AKgiV_Pw0mxx5zqqSj--w_db6hJJUv'

export const supabase = createClient(supabaseUrl, supabaseKey);