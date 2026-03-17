import type { SupabaseClient, User } from '@supabase/supabase-js';

type GymContext = {
  user: User;
  gymId: string;
};

export async function getGymContext(supabase: SupabaseClient): Promise<GymContext> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Please sign in again.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('gym_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.gym_id) {
    throw new Error('No gym is linked to your account yet.');
  }

  return { user, gymId: profile.gym_id as string };
}
