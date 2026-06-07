'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  if (loading) return null

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 16px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>Messages</h1>
        <p style={{ fontSize: '16px', color: '#888888', marginBottom: '48px' }}>Vos conversations avec les créateurs et organisateurs</p>

        <div style={{ textAlign: 'center', padding: '80px 24px', borderRadius: '16px', border: '1px dashed #E5E7EB', backgroundColor: '#FAFAFA' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#F0F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <MessageCircle size={32} color="#6366F1" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>Aucun message pour l'instant</h3>
          <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.6', maxWidth: '340px', margin: '0 auto 24px' }}>
            Vos échanges avec les créateurs et organisateurs apparaîtront ici.
          </p>
          <button
            onClick={() => router.push('/events')}
            style={{ padding: '12px 28px', borderRadius: '8px', backgroundColor: '#6366F1', color: '#FFFFFF', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Explorer les événements
          </button>
        </div>
      </motion.div>
    </div>
  )
}
