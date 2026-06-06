import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { messageAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function InboxPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inbox, setInbox] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await messageAPI.getInbox()
        setInbox(res.data.data)
      } catch {
        // inbox kosong atau gagal
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat...</div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-gray-800">Pesan Masuk</h1>

        {inbox.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
            Belum ada percakapan.
          </div>
        ) : (
          inbox.map((msg) => {
            // Tentukan lawan bicara
            const other = msg.senderId === user.id ? msg.receiver : msg.sender
            const muaProfileId = msg.muaProfileId

            return (
              <button
                key={`${muaProfileId}-${other.id}`}
                onClick={() => navigate(`/messages/${muaProfileId}?otherUserId=${other.id}`)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-semibold flex-shrink-0">
                  {other.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{other.name}</p>
                  <p className="text-sm text-gray-400 truncate">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-300 flex-shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString('id-ID')}
                </p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}