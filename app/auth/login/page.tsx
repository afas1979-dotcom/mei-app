'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

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
    if (error) { setErro('E-mail ou senha inválidos.'); setCarregando(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
            <Image
              src="/AX.png"
              alt="Xpert AX Contabilidade"
              width={180}
              height={70}
              className="object-contain brightness-110"
              priority
            />
          </div>
        </div>
        <div className="bg-[#13131a] border border-white/5 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Entrar</h1>
          <p className="text-white/30 text-sm mb-6">Acesse sua conta para continuar</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com"
                className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20 transition-colors" />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="••••••••"
                className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20 transition-colors" />
            </div>
            {erro && <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"><p className="text-rose-400 text-sm">{erro}</p></div>}
            <button type="submit" disabled={carregando}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors mt-2">
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-white/30 text-sm mt-5 text-center">
            Não tem conta?{' '}
            <a href="/auth/cadastro" className="text-violet-400 hover:text-violet-300 transition-colors">Criar conta</a>
          </p>
        </div>
      </div>
    </div>
  )
}
