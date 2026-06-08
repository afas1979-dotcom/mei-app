'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface EmpresaSimples {
  id: string
  razao_social: string
  cnpj: string
}

export function useEmpresa() {
  const [empresas, setEmpresas] = useState<EmpresaSimples[]>([])
  const [empresaAtual, setEmpresaAtual] = useState<EmpresaSimples | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const supabase = createClient()
    const { data } = await supabase
      .from('empresas_mei')
      .select('id, razao_social, cnpj')
      .eq('ativa', true)
      .order('razao_social')

    const lista = data ?? []
    setEmpresas(lista)

    // Recuperar empresa salva no localStorage
    const salva = localStorage.getItem('empresa_id')
    const encontrada = lista.find(e => e.id === salva)
    setEmpresaAtual(encontrada ?? lista[0] ?? null)
    setCarregando(false)
  }

  function trocarEmpresa(empresa: EmpresaSimples) {
    setEmpresaAtual(empresa)
    localStorage.setItem('empresa_id', empresa.id)
    window.location.reload()
  }

  return { empresas, empresaAtual, carregando, trocarEmpresa }
}
