import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ispsmqludalykdgyykft.supabase.co'
const supabaseKey = 'sb_publishable_t6DGe9QTtEb2Rbwmvd0Jhg_ONSE5T0R'

export const supabase = createClient(supabaseUrl, supabaseKey)