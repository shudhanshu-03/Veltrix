import { supabase } from './supabase';

export async function signUpWithEmail(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName }
    }
  });
  if (error) throw error;
  return data.user;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function getUserProfile(uid) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
  if (error) return null;
  return data;
}

export async function getFavorites() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return [];
  const { data, error } = await supabase.from('favorites').select('game_id').eq('user_id', sessionData.session.user.id);
  if (error || !data) return [];
  return data.map(f => f.game_id);
}

export async function toggleFavorite(gameId) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { success: false, requireLogin: true };
  
  const userId = sessionData.session.user.id;
  const favs = await getFavorites();
  const isFav = favs.includes(gameId);

  if (isFav) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('game_id', gameId);
  } else {
    await supabase.from('favorites').insert({ user_id: userId, game_id: gameId });
  }
  return { success: true, isFav: !isFav };
}
