import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://efhgyispuwxcplvzipcy.supabase.co'
const supabaseKey = 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'

export const supabase = createClient(supabaseUrl, supabaseKey)
