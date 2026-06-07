// types/database.ts
// Tipos gerados manualmente com base no schema do Supabase
// Futuramente: substitua por `npx supabase gen types typescript`

export type Plano = 'gratuito' | 'pro'
export type TipoLancamento = 'receita' | 'despesa' | 'das'

export interface Usuario {
  id: string
  nome: string
  email: string
  plano: Plano
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface EmpresaMei {
  id: string
  usuario_id: string
  cnpj: string
  razao_social: string
  nome_fantasia: string | null
  atividade: string
  cnaes: string[] | null
  limite_anual: number
  receita_acumulada: number
  data_abertura: string | null
  telefone: string | null
  email_empresa: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface Lancamento {
  id: string
  empresa_id: string
  tipo: TipoLancamento
  descricao: string
  valor: number
  data: string
  categoria: string | null
  cliente: string | null
  nota_fiscal: string | null
  das_competencia: string | null
  das_pago: boolean
  comprovante_url: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface ResumoFinanceiro {
  empresa_id: string
  usuario_id: string
  razao_social: string
  cnpj: string
  limite_anual: number
  receita_acumulada: number
  percentual_limite: number
  saldo_disponivel: number
  total_despesas: number
  total_das_pago: number
  das_pendentes: number
  ano_referencia: number
}

// Tipos para formulários (sem campos gerados automaticamente)
export type NovaEmpresaMei = Omit<
  EmpresaMei,
  'id' | 'usuario_id' | 'receita_acumulada' | 'created_at' | 'updated_at'
>

export type NovoLancamento = Omit<
  Lancamento,
  'id' | 'created_at' | 'updated_at'
>

export type AtualizarLancamento = Partial<NovoLancamento>
