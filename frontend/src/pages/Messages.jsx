import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { messageAPI, searchAPI } from '../services/api'

const Messages = () => {
  const { muaProfileId }    = useParams()
  const navigate            = useNavigate()
  const { user }            = useAuth()

  const [inbox, setInbox]               = useState([])
  const [inboxLoading, setInboxLoading] = useState(true)

  const [activeConvo, setActiveConvo]   = useState(null)
  const [messages, setMessages]         = useState([])
  const [msgLoading, setMsgLoading]     = useState(false)
  const [newMsg, setNewMsg]             = useState('')
  const [sending, setSending]           = useState(false)

  const bottomRef = useRef(null)

  // Fetch inbox saat pertama buka
  useEffect(() => {
    fetchInbox()
  }, [])

  // Kalau ada muaProfileId di URL, buka conversation itu
  // Kalau belum ada di inbox, buat conversation baru
  useEffect(() => {
    if (!muaProfileId) return
    if (inboxLoading) return

    const convo = inbox.find(c => String(c.muaProfileId) === String(muaProfileId))
    if (convo) {
      openConversation(convo)
    } else {
      // Belum pernah chat — buat conversation baru, fetch info MUA dulu
      const initNewConvo = async () => {
        try {
          const res = await searchAPI.getMuaDetail(muaProfileId)
          const mua = res.data.data
          console.log('MUA data:', mua)
          setActiveConvo({
            muaProfileId: parseInt(muaProfileId),
            otherUserId: mua?.userId || mua?.user?.id || null,
            otherName:    mua?.brandName || 'MUA',
            lastMessage:  '',
          })
          setMessages([])
        } catch (err) {
          console.error('initNewConvo error:', err)
          setActiveConvo({
            muaProfileId: parseInt(muaProfileId),
            otherUserId:  null,
            otherName:    'MUA',
            lastMessage:  '',
          })
          setMessages([])
        }
      }
      initNewConvo()
    }
  }, [muaProfileId, inbox, inboxLoading])

  // Auto scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchInbox = async () => {
    setInboxLoading(true)
    try {
      const res = await messageAPI.getInbox()
      // Transform data inbox ke format conversation
      const transformed = res.data.data.map(msg => ({
        muaProfileId: msg.muaProfileId,
        muaBrandName: msg.muaProfile?.brandName || 'MUA',
        otherUserId: msg.senderId === user.id ? msg.receiverId : msg.senderId,
        otherName: msg.senderId === user.id ? msg.receiver?.name : msg.sender?.name,
        lastMessage: msg.content,
      }))
      setInbox(transformed)
    } catch { } finally {
      setInboxLoading(false)
    }
  }

  const openConversation = async (convo) => {
    setActiveConvo(convo)
    setMsgLoading(true)
    try {
      const res = await messageAPI.getConversation(
        convo.muaProfileId,
        convo.otherUserId
      )
      setMessages(res.data.data)
    } catch { } finally {
      setMsgLoading(false)
    }
  }

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConvo) return
    if (!activeConvo.otherUserId) return
    setSending(true)
    try {
      await messageAPI.sendMessage({
        receiverId: activeConvo.otherUserId,
        muaProfileId: activeConvo.muaProfileId,
        content:      newMsg.trim(),
      })
      setNewMsg('')
      // Refresh conversation
      openConversation(activeConvo)
      // Refresh inbox juga supaya percakapan baru muncul di sidebar
      fetchInbox()
    } catch { } finally {
      setSending(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Pesan 💬</h1>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ height: '70vh' }}>
          <div className="flex h-full">

            {/* ── Sidebar inbox ── */}
            <div className="w-full sm:w-72 border-r border-gray-100 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-sm">Percakapan</h2>
              </div>

              {inboxLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  Memuat...
                </div>
              ) : inbox.length === 0 && !muaProfileId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-4 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm font-semibold">Belum ada percakapan</p>
                  {user?.role === 'client' && (
                    <button
                      onClick={() => navigate('/search')}
                      className="mt-3 text-xs text-[#f6339a] font-semibold hover:underline"
                    >
                      Cari MUA →
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {inbox.map(convo => (
                    <button
                      key={`${convo.muaProfileId}-${convo.otherUserId || convo.clientId}`}
                      onClick={() => openConversation(convo)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        activeConvo?.muaProfileId === convo.muaProfileId ? 'bg-pink-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-[#f6339a] font-black text-sm shrink-0">
                          {(convo.otherName || convo.muaBrandName || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {convo.otherName || convo.muaBrandName || 'Pengguna'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{convo.lastMessage || '...'}</p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Tampilkan conversation baru yang belum ada di inbox */}
                  {muaProfileId && activeConvo && !inbox.find(c => String(c.muaProfileId) === String(muaProfileId)) && (
                    <div className="w-full text-left px-4 py-3 border-b border-gray-50 bg-pink-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-[#f6339a] font-black text-sm shrink-0">
                          {activeConvo.otherName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {activeConvo.otherName || 'MUA'}
                          </p>
                          <p className="text-xs text-gray-400">Percakapan baru</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Area chat ── */}
            <div className="flex-1 flex flex-col min-w-0">
              {!activeConvo ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-sm">Pilih percakapan</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header chat */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-[#f6339a] font-black text-sm">
                      {(activeConvo.otherName || activeConvo.muaBrandName || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {activeConvo.otherName || activeConvo.muaBrandName || 'Pengguna'}
                      </p>
                      {!activeConvo.otherUserId && (
                        <p className="text-xs text-amber-500">Memuat info MUA...</p>
                      )}
                    </div>
                  </div>

                  {/* Pesan */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {msgLoading ? (
                      <div className="text-center text-gray-400 text-sm py-8">Memuat pesan...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-8">
                        Belum ada pesan. Mulai percakapan!
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMine = msg.senderId === user.id
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                              isMine
                                ? 'bg-[#f6339a] text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}>
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMine ? 'text-pink-200' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input pesan */}
                  <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder={activeConvo.otherUserId ? 'Tulis pesan...' : 'Memuat...'}
                      disabled={!activeConvo.otherUserId}
                      className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMsg.trim() || !activeConvo.otherUserId}
                      className="bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
                    >
                      {sending ? '...' : '→'}
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages