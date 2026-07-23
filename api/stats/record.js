// ============================================================
// SSE 穿搭顾问 · 数据统计记录 API
// 环境变量：由 Vercel Postgres 自动注入 (POSTGRES_URL 等)
// ============================================================
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // ─── CORS ───
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const {
      gender, height, weight, shoulder, waist, hip, leg,
      skintone, scenario, hatRequest, customerRequest,
    } = req.body;

    await sql`
      INSERT INTO consultations (
        gender, height, weight, shoulder, waist, hip, leg,
        skintone, scenario, hat_request, customer_request
      ) VALUES (
        ${gender}, ${height}, ${weight}, ${shoulder}, ${waist}, ${hip}, ${leg},
        ${skintone}, ${scenario}, ${hatRequest}, ${customerRequest}
      )
    `;

    return res.status(200).json({ ok: true });
  } catch (err) {
    // 静默失败，不影响用户使用
    console.error('❌ stats record error:', err.message);
    return res.status(200).json({ ok: false });
  }
}
