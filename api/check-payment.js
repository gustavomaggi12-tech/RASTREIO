// api/check-payment.js — Verifica se Pix foi pago
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { correlationID } = req.query;
  if (!correlationID) return res.status(400).json({ error: 'correlationID obrigatório' });

  const OPENPIX_APP_ID = process.env.OPENPIX_APP_ID;

  try {
    const response = await fetch(
      `https://api.openpix.com.br/api/v1/charge/${correlationID}`,
      { headers: { 'Authorization': OPENPIX_APP_ID } }
    );
    const data = await response.json();
    return res.status(200).json({
      paid:   data.charge?.status === 'COMPLETED',
      status: data.charge?.status,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
}
