import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { mensagem, historico } = await req.json()

  // Buscar contexto real do usuário
  const { data: empresas } = await supabase
    .from('empresas_mei')
    .select('*')
    .eq('ativa', true)
    .limit(1)

  const empresa = empresas?.[0] ?? null

  const { data: resumo } = empresa ? await supabase
    .from('resumo_financeiro')
    .select('*')
    .eq('empresa_id', empresa.id)
    .single() : { data: null }

  const { data: lancamentosRecentes } = empresa ? await supabase
    .from('lancamentos')
    .select('*')
    .eq('empresa_id', empresa.id)
    .order('data', { ascending: false })
    .limit(10) : { data: [] }

  const contexto = empresa ? `
Você é um assistente especialista em MEI (Microempreendedor Individual) brasileiro.
Responda sempre em português, de forma clara, direta e amigável.
Use no máximo 3 parágrafos curtos. Seja objetivo.

DADOS REAIS DA EMPRESA DO USUÁRIO:
- Empresa: ${empresa.razao_social}
- CNPJ: ${empresa.cnpj}
- Atividade: ${empresa.atividade}
- Limite anual: R$ ${empresa.limite_anual.toLocaleString('pt-BR')}
- Receita acumulada: R$ ${resumo?.receita_acumulada?.toLocaleString('pt-BR') ?? '0'}
- Percentual do limite: ${resumo?.percentual_limite ?? 0}%
- Saldo disponível: R$ ${resumo?.saldo_disponivel?.toLocaleString('pt-BR') ?? empresa.limite_anual}
- Total despesas: R$ ${resumo?.total_despesas?.toLocaleString('pt-BR') ?? '0'}
- DAS pendentes: ${resumo?.das_pendentes ?? 0}

ÚLTIMOS LANÇAMENTOS:
${lancamentosRecentes?.map(l => `- ${l.data}: ${l.tipo} de R$ ${l.valor} — ${l.descricao}`).join('\n') ?? 'Nenhum lançamento'}

${resumo?.percentual_limite > 80 ? '⚠️ ATENÇÃO: O usuário está acima de 80% do limite anual MEI. Alerte sobre isso!' : ''}
${resumo?.das_pendentes > 0 ? '⚠️ ATENÇÃO: Há DAS pendentes. Lembre de regularizar!' : ''}
` : `
Você é um assistente especialista em MEI (Microempreendedor Individual) brasileiro.
Responda sempre em português, de forma clara, direta e amigável.
Use no máximo 3 parágrafos curtos. Seja objetivo.
O usuário ainda não cadastrou uma empresa.
`

  const messages = [
    ...(historico ?? []),
    { role: 'user' as const, content: mensagem }
  ]

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: contexto },
      ...messages
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  const resposta = completion.choices[0]?.message?.content ?? 'Não consegui processar sua pergunta.'

  return NextResponse.json({ resposta })
}
