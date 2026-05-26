// api/_lib/supabase.js — shared Supabase client + helpers for all serverless functions
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://poaorgynzqylsxeiotob.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_2XCJ7usbF29k6RA6FobkUQ_OX7f_tsy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const GENRES = [
  { id:'action',     name:'Action',     icon:'⚔️',  gradient:'linear-gradient(135deg,#e53935,#b71c1c)',  desc:'Fast-paced combat and explosions.' },
  { id:'rpg',        name:'RPG',        icon:'🧙',  gradient:'linear-gradient(135deg,#7b1fa2,#4a148c)',  desc:'Deep stories, character progression.' },
  { id:'fps',        name:'FPS',        icon:'🔫',  gradient:'linear-gradient(135deg,#2e7d32,#1b5e20)',  desc:'First-person shooting action.' },
  { id:'strategy',   name:'Strategy',   icon:'♟️',  gradient:'linear-gradient(135deg,#0288d1,#01579b)',  desc:'Build, plan, and conquer.' },
  { id:'horror',     name:'Horror',     icon:'💀',  gradient:'linear-gradient(135deg,#8B0000,#1a0000)',  desc:'Survive the darkness and fear.' },
  { id:'sports',     name:'Sports',     icon:'⚽',  gradient:'linear-gradient(135deg,#00897b,#004d40)',  desc:'Compete in your favorite sport.' },
  { id:'simulation', name:'Simulation', icon:'🏙️', gradient:'linear-gradient(135deg,#558b2f,#33691e)', desc:'Build, manage, and simulate.' },
  { id:'adventure',  name:'Adventure',  icon:'🗺️', gradient:'linear-gradient(135deg,#ef6c00,#bf360c)', desc:'Explore vast worlds and stories.' },
  { id:'puzzle',     name:'Puzzle',     icon:'🧩',  gradient:'linear-gradient(135deg,#0097a7,#006064)',  desc:'Challenge your mind and logic.' },
  { id:'racing',     name:'Racing',     icon:'🏎️', gradient:'linear-gradient(135deg,#f57c00,#e65100)', desc:'High-speed racing and stunts.' },
  { id:'fighting',   name:'Fighting',   icon:'🥊',  gradient:'linear-gradient(135deg,#c62828,#6d1010)',  desc:'One-on-one combat showdowns.' },
  { id:'sandbox',    name:'Sandbox',    icon:'🌍',  gradient:'linear-gradient(135deg,#f9a825,#e65100)', desc:'Build anything in open worlds.' },
];

export function normalizeRow(row) {
  return {
    id:          row.id,
    steamAppId:  row.steam_app_id,
    title:       row.title,
    genre:       row.genre,
    genres:      row.genres || [row.genre].filter(Boolean),
    year:        row.year,
    developer:   row.developer,
    publisher:   row.publisher,
    rating:      row.rating != null ? parseFloat(row.rating) : 0,
    price:       row.price,
    priceType:   row.price_type,
    tags:        row.tags || [],
    icon:        row.icon || '🎮',
    headerImage: row.header_image,
    description: row.description,
    steam:       row.steam,
    gradient:    GENRES.find(g => g.id === (row.genre || '').toLowerCase())?.gradient
                 || 'linear-gradient(135deg,#1a1a2e,#16213e)',
  };
}

export async function getSteamId(hubId) {
  const { data } = await supabase
    .from('games')
    .select('steam_app_id')
    .eq('id', hubId)
    .single();
  return data?.steam_app_id || null;
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
