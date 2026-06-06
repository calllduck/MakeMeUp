import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { messageAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ConversationPage() {
  const { muaProfileId } = useParams()
  const [searchParams] = useSearchParams()
  const otherUserId = searchParams.get('otherUserId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const res = await messageAPI.getConversation(muaProfileId, otherUserId)
      setMessages(res.data.data)
    } catch {
      // gagal load
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    // Auto-refresh setiap 5 detik
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [muaProfileId, otherUserId])

  // Scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      await messageAPI.sendMessage({
        receiverId: otherUserId,
        muaProfileId: parseInt(muaProfileId),
        content
      })
      setContent('')
      await fetchMessages()
    } catch {
      // gagal kirim
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat...</div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2 flex items-center gap-3">
        <button onClick={() => navigate('/inbox')} className="text-pink-500 text-sm">← Inbox</button>
        <p className="font-semibold text-gray-800">Percakapan</p>
      </div>

      {/* Daftar pesan */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">Belum ada pesan. Mulai percakapan!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id
          console.log('msg.senderId:', msg.senderId, '| user.userId:', user.userId, '| isMe:', isMe)
          console.log('senderId:', msg.senderId, typeof msg.senderId)
          console.log('userId:', user.userId, typeof user.userId)
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                isMe
                  ? 'bg-pink-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input pesan */}
      <form onSubmit={handleSend} className="bg-white border-t px-4 py-3 flex gap-3 sticky bottom-0">
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  )
}