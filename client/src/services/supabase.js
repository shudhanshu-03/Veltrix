import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poaorgynzqylsxeiotob.supabase.co';
const supabaseKey = 'sb_publishable_2XCJ7usbF29k6RA6FobkUQ_OX7f_tsy';

export const supabase = createClient(supabaseUrl, supabaseKey);
