'use client'
import { useState } from 'react'
import { useEmpresa } from '@/hooks/useEmpresa'
import Link from 'next/link'

export default function SeletorEmpresa() {
  const { empresas, empresaAtual, carregando, trocarEmpresa } = useEmpresa()
  const [aberto, setAberto] = useState(false)

  if (carregando) return (
    <div className="px-3 mb-2">
      <div className="bg-white/5 rounded-xl p-3 animate-pulse h-14" />
    </div>
  )

  if (!empresaAtual) return (
    <div className="px-3 mb-2">
      <Link href="/dashboard/empresa/nova"
        className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-violet-400 text-xs hover:bg-violet-500/20 transition-all">
        <span>+</span> Cadastrar empresa
      </Link>
    </div>
  )

  return (
    <div className="px-3 mb-2 relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl p-3 text-left transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-white/80 text-xs font-medium truncate">{empresaAtual.razao_social}</p>
            <p className="text-white/30 text-xs mt-0.5">{empresaAtual.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</p>
          </div>
          {empresas.length > 1 && (
            <span className="text-white/30 text-xs ml-2 flex-shrink-0">{aberto ? '▲' : '▼'}</span>
          )}
        </div>
      </button>

      {aberto && empresas.length > 1 && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
          {empresas.map(e => (
            <button
              key={e.id}
              onClick={() => { trocarEmpresa(e); setAberto(false) }}
              className={`w-full text-left px-4 py-3 text-xs transition-all border-b border-white/5 last:border-0 ${
                e.id === empresaAtual.id
                  ? 'bg-violet-500/15 text-violet-300'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <p className="font-medium truncate">{e.razao_social}</p>
              <p className="text-white/30 mt-0.5">{e.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</p>
            </button>
          ))}
          <Link
            href="/dashboard/empresa/nova"
            onClick={() => setAberto(false)}
            className="flex items-center gap-2 px-4 py-3 text-xs text-violet-400 hover:bg-violet-500/10 transition-all"
          >
            <span>+</span> Adicionar empresa
          </Link>
        </div>
      )}
    </div>
  )
}
