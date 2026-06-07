'use client'
import { useState, useRef, useEffect } from 'react'

interface Mensagem {
  role: 'user' | 'assistant'
  content: string
}

const SUGESTOES = [
  'Qual meu limite de faturamento?',
  'Tenho DAS pendentes?',
  'Como emitir nota fiscal?',
  'Quando devo pagar o DAS?',
  'Posso ter funcionário como MEI?',
  'Como faço a declaração anual?',
]

export default function AssistentePage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { role: 'assistant', content: 'Olá! Sou seu assistente MEI. Posso te ajudar com dúvidas sobre sua empresa, limite de faturamento, DAS, notas fiscais e muito mais. Como posso ajudar?' }
  ])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function enviar(texto?: string) {
    const msg = texto ?? input.trim()
    if (!msg || carregando) return

    const novaMensagem: Mensagem = { role: 'user', content: msg }
    const novaLista = [...mensagens, novaMensagem]
    setMensagens(novaLista)
    setInput('')
    setCarregando(true)

    try {
      const historico = mensagens.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: msg, historico })
      })

      const data = await res.json()
      setMensagens([...novaLista, { role: 'assistant', content: data.resposta }])
    } catch {
      setMensagens([...novaLista, { role: 'assistant', content: 'Erro ao conectar com o assistente. Tente novamente.' }])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f13]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg">
            ✦
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Assistente MEI</h1>
            <p className="text-white/30 text-xs">Powered by Llama 3.3 · Groq</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-emerald-400 text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {mensagens.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs mr-3 flex-shrink-0 mt-1">✦</div>
            )}
            <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-sm'
                : 'bg-[#13131a] border border-white/5 text-white/80 rounded-tl-sm'
            }`}>
              {m.content.split('\n').map((linha, j) => (
                <p key={j} className={j > 0 ? 'mt-2' : ''}>{linha}</p>
              ))}
            </div>
          </div>
        ))}

        {carregando && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs mr-3 flex-shrink-0 mt-1">✦</div>
            <div className="bg-[#13131a] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      {mensagens.length === 1 && (
        <div className="px-8 pb-4 flex-shrink-0">
          <p className="text-white/20 text-xs mb-3 uppercase tracking-wider">Sugestões</p>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="bg-[#13131a] border border-white/10 text-white/50 hover:text-white/80 hover:border-violet-500/30 text-xs px-3 py-2 rounded-xl transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-8 py-5 border-t border-white/5 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-colors">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
              placeholder="Pergunte sobre MEI, DAS, limite anual..."
              rows={1}
              className="w-full bg-transparent text-white/80 text-sm outline-none resize-none placeholder:text-white/20"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => enviar()}
            disabled={!input.trim() || carregando}
            className="w-10 h-10 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <span className="text-white text-sm">↑</span>
          </button>
        </div>
        <p className="text-white/15 text-xs mt-2 text-center">Enter para enviar · Shift+Enter para nova linha</p>
      </div>
    </div>
  )
}
