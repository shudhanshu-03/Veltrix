// api/genres.js — Vercel Serverless Function
import { GENRES, setCors } from './_lib/supabase.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({ success: true, data: GENRES });
}
