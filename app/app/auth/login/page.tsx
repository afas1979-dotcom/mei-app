// app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha inválidos.')
      setCarregando(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Entrar</h1>
        <p className="text-sm text-gray-500 mb-6">MEI App — Gestão Financeira</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Não tem conta?{' '}
          <a href="/auth/cadastro" className="text-blue-600 hover:underline">
            Criar conta
          </a>
        </p>
      </div>
    </div>
  )
}
