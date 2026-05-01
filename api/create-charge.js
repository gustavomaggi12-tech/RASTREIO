// api/create-charge.js — Cria cobrança Pix via OpenPix
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const OPENPIX_APP_ID = process.env.OPENPIX_APP_ID;
  if (!OPENPIX_APP_ID) {
    return res.status(500).json({ 
      error: 'OPENPIX_APP_ID não configurada',
      help: 'Configure a variável de ambiente OPENPIX_APP_ID no seu projeto Vercel.'
    });
  }

  const correlationID = `rastreio-${Date.now()}`;

  try {
    const response = await fetch('https://api.openpix.com.br/api/v1/charge', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': OPENPIX_APP_ID 
      },
      body: JSON.stringify({
        value: 5000, // R$ 50,00
        comment: 'Rastreio.com Premium',
        correlationID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenPix Error:', data);
      return res.status(response.status).json({ 
        error: 'Erro na API do OpenPix', 
        details: data.errors?.[0]?.message || 'Falha ao gerar cobrança' 
      });
    }

    return res.status(200).json({
      correlationID,
      qrCodeImage: data.charge.qrCodeImage,
      brCode: data.charge.brCode,
    });
  } catch (err) {
    console.error('Catch Error:', err);
    return res.status(500).json({ error: 'Erro interno ao conectar com OpenPix' });
  }
}
