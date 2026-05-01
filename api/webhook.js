// api/webhook.js — Recebe confirmação automática do OpenPix
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { event, charge } = req.body || {};

  if (event === 'OPENPIX:CHARGE_COMPLETED' && charge?.status === 'COMPLETED') {
    console.log(`✅ Pix confirmado: ${charge.correlationID} — R$${charge.value / 100}`);
    // Em produção: salve no banco (Vercel KV, Supabase, etc.)
    // await kv.set(`premium:${charge.correlationID}`, true);
  }

  return res.status(200).json({ received: true });
}
