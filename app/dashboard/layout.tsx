import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return (
    <div className="flex min-h-screen bg-[#0f0f13]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  )
}
