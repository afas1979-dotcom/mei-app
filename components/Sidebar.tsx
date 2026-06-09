'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SeletorEmpresa from './SeletorEmpresa'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/dashboard/lancamentos', label: 'Lançamentos', icon: '⇄' },
  { href: '/dashboard/lancamentos/novo', label: 'Novo lançamento', icon: '+' },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: '◈' },
  { href: '/dashboard/assistente', label: 'Assistente IA', icon: '✦' },
  { href: '/dashboard/empresa', label: 'Empresa', icon: '◎' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#13131a] border-r border-white/5 flex flex-col z-40">
      <div className="px-6 py-5 border-b border-white/5">
        <Image src="/AX.png" alt="Xpert AX Contabilidade" width={160} height={60} className="object-contain brightness-110" priority />
      </div>
      <div className="py-3 border-b border-white/5">
        <SeletorEmpresa />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-violet-500/15 text-violet-300 font-medium' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-5 border-t border-white/5">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <span className="text-base w-5 text-center">→</span>
          Sair
        </button>
      </div>
    </aside>
  )
}
