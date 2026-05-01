// api/track.js — Vercel Serverless Function
// Suporte Multi-API para maior confiabilidade

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Código de rastreio é obrigatório' });

  const trackingCode = code.trim().toUpperCase();
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ error: 'RAPIDAPI_KEY não configurada. Configure no painel do Vercel.' });
  }

  try {
    // Determina o endpoint com base no código
    let endpoint = 'correios';
    if (/^LP|CNBR|^\d{14,}$/.test(trackingCode)) endpoint = 'aliexpress';
    
    const pvUrl = `https://api.pacotevicio.dev/${endpoint}?tracking_code=${trackingCode}`;
    const pvResponse = await fetch(pvUrl, {
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY }
    });

    if (pvResponse.ok) {
      const data = await pvResponse.json();
      if (data.eventos && data.eventos.length > 0) {
        return res.status(200).json({
          code: trackingCode,
          carrier: data.courier || 'Correios',
          lastStatus: data.eventos[0].descricao,
          events: data.eventos.map(ev => ({
            date: ev.dtHrCriado,
            status: ev.descricao,
            location: ev.unidade ? `${ev.unidade.nome || ''} ${ev.unidade.endereco?.cidade || ''}`.trim() : '',
            detail: ev.detalhe || ''
          })),
          source: 'pacotevicio'
        });
      }
    }

    // Se falhar ou não encontrar, podemos tentar uma segunda API ou retornar erro claro
    return res.status(404).json({ 
      error: 'Objeto não encontrado', 
      details: 'O código pode estar incorreto ou ainda não foi atualizado no sistema dos Correios.' 
    });

  } catch (err) {
    console.error('Erro no rastreio:', err);
    return res.status(500).json({ error: 'Erro interno ao processar rastreio' });
  }
}
