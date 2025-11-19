import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nuyitizwoylejffwubao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eWl0aXp3b3lsZWpmZnd1YmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTkwMjUsImV4cCI6MjA3OTA5NTAyNX0.FCVfQifNybnWp7PpcUG3E-36gGjlah9gH-vuefNLvjA';

export const supabase = createClient(supabaseUrl, supabaseKey);