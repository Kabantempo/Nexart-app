'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Grid2x2Plus, Menu, X, Search, MessageCircle, Heart, LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function NavbarFull() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadFirstName(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadFirstName(session.user)
      else setFirstName(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadFirstName = async (u: SupabaseUser) => {
    const name = u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'Moi'
    // Essaie d'abord le profil en base
    const { data } = await supabase.from('profiles').select('full_name').eq('id', u.id).single()
    const full = data?.full_name ?? name
    setFirstName(full.split(' ')[0])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setOpenDropdown(null)
    router.push('/')
  }

  const openSearch = () => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }
  const closeSearch = () => { setSearchOpen(false); setSearchValue('') }
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) { router.push(`/events?q=${encodeURIComponent(searchValue.trim())}`); closeSearch() }
  }
  const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name)

  return (
    <header style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#6366F1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
            <Grid2x2Plus size={24} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>Nexart</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: '8px', alignItems: 'center', flex: 1, marginLeft: '48px' }} className="desktop-nav">
          {/* Découvrir */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => toggleDropdown('discover')} onMouseEnter={() => setOpenDropdown('discover')} onMouseLeave={() => setOpenDropdown(null)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#1A1A1A', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Découvrir
              <ChevronDown size={18} style={{ transform: openDropdown === 'discover' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
            </button>
            <AnimatePresence>
              {openDropdown === 'discover' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  onMouseEnter={() => setOpenDropdown('discover')} onMouseLeave={() => setOpenDropdown(null)}
                  style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: '320px', zIndex: 100 }}>
                  {[{ title: 'Marchés & Événements', href: '/events', desc: 'Trouvez votre prochain marché' }, { title: 'Créateurs & Artisans', href: '/creators', desc: 'Découvrez les artisans' }].map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setOpenDropdown(null)}
                      style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', textDecoration: 'none', color: '#1A1A1A', borderRadius: '8px', margin: '0 8px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</span>
                      <span style={{ fontSize: '12px', color: '#888888' }}>{item.desc}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ressources */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => toggleDropdown('resources')} onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#1A1A1A', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Ressources
              <ChevronDown size={18} style={{ transform: openDropdown === 'resources' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
            </button>
            <AnimatePresence>
              {openDropdown === 'resources' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)}
                  style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: '280px', zIndex: 100 }}>
                  {[{ title: 'À propos', href: '/about' }, { title: "Centre d'aide", href: '#' }, { title: 'Confidentialité', href: '#' }, { title: 'Blog', href: '/blog' }, { title: 'Partenariats', href: '#' }, { title: 'Nous contacter', href: '#' }].map((item, idx) => (
                    <Link key={idx} href={item.href} onClick={() => setOpenDropdown(null)}
                      style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#1A1A1A', fontSize: '14px', borderRadius: '8px', margin: '0 8px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                      {item.title}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop CTA */}
        <div style={{ display: 'none', gap: '12px', alignItems: 'center' }} className="desktop-cta">

          {user ? (
            /* ── Connecté ── */
            <>
              {/* Messages */}
              <Link href="/messages" title="Messages"
                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none', transition: 'background-color 150ms ease', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF' }}>
                <MessageCircle size={18} color="#1A1A1A" />
              </Link>

              {/* Likes */}
              <Link href="/favorites" title="Favoris"
                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none', transition: 'background-color 150ms ease', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF' }}>
                <Heart size={18} color="#1A1A1A" />
              </Link>

              {/* Profil dropdown */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => toggleDropdown('profile')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '20px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer', transition: 'background-color 150ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{firstName?.[0]?.toUpperCase() ?? '?'}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{firstName ?? 'Moi'}</span>
                  <ChevronDown size={14} color="#888888" style={{ transform: openDropdown === 'profile' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', top: '110%', right: 0, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: '180px', zIndex: 100, overflow: 'hidden' }}>
                      <Link href="/profile" onClick={() => setOpenDropdown(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: '#1A1A1A', fontSize: '14px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                        <User size={15} color="#888888" /> Mon profil
                      </Link>
                      <Link href="/messages" onClick={() => setOpenDropdown(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: '#1A1A1A', fontSize: '14px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                        <MessageCircle size={15} color="#888888" /> Messages
                      </Link>
                      <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />
                      <button onClick={handleSignOut}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: 'none', backgroundColor: 'transparent', color: '#E05A5A', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                        <LogOut size={15} color="#E05A5A" /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* ── Non connecté ── */
            <>
              <Link href="/login"
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#6366F1', textDecoration: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 200ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F7' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                Se connecter
              </Link>
              <Link href="/register"
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#6366F1', color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 200ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4F46E5' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6366F1' }}>
                S'inscrire
              </Link>
            </>
          )}

          {/* Search */}
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.form key="search-open" initial={{ width: 36, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 36, opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={submitSearch}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F5F5F7', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '0 10px', overflow: 'hidden', height: '36px' }}>
                <Search size={15} color="#888888" style={{ flexShrink: 0 }} />
                <input ref={searchRef} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Ville, marché…"
                  style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none', minWidth: 0 }} />
                <button type="button" onClick={closeSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                  <X size={14} color="#888888" />
                </button>
              </motion.form>
            ) : (
              <motion.button key="search-closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={openSearch}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F5F5F7' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}>
                <Search size={16} color="#1A1A1A" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMobileOpen(!isMobileOpen)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', border: 'none', backgroundColor: '#F5F5F7', color: '#1A1A1A', cursor: 'pointer' }}
          className="mobile-menu-btn">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }} className="mobile-menu">
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {/* Discover */}
              <div>
                <button onClick={() => toggleDropdown('discover')}
                  style={{ width: '100%', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', backgroundColor: 'transparent', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Découvrir
                  <ChevronDown size={18} style={{ transform: openDropdown === 'discover' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'discover' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                      {[{ title: 'Marchés & Événements', href: '/events', desc: '100+ événements' }, { title: 'Créateurs & Artisans', href: '/creators', desc: '500+ talents' }].map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => { setIsMobileOpen(false); setOpenDropdown(null) }}
                          style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', textDecoration: 'none', color: '#1A1A1A', borderRadius: '8px', backgroundColor: '#F5F5F7', marginTop: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: '#888888' }}>{item.desc}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ressources */}
              <div>
                <button onClick={() => toggleDropdown('resources')}
                  style={{ width: '100%', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', backgroundColor: 'transparent', color: '#1A1A1A', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Ressources
                  <ChevronDown size={18} style={{ transform: openDropdown === 'resources' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'resources' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                      {[{ title: 'À propos', href: '/about' }, { title: "Centre d'aide", href: '#' }, { title: 'Confidentialité', href: '#' }, { title: 'Blog', href: '/blog' }, { title: 'Partenariats', href: '#' }, { title: 'Nous contacter', href: '#' }].map((item, idx) => (
                        <Link key={idx} href={item.href} onClick={() => { setIsMobileOpen(false); setOpenDropdown(null) }}
                          style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#1A1A1A', fontSize: '13px', borderRadius: '8px', backgroundColor: '#F5F5F7', marginTop: '8px' }}>
                          {item.title}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Search */}
              <form onSubmit={(e) => { e.preventDefault(); const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim(); if (input) { router.push(`/events?q=${encodeURIComponent(input)}`); setIsMobileOpen(false) } }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F5F5F7', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '0 12px', height: '44px', marginTop: '4px' }}>
                <Search size={16} color="#888888" />
                <input name="q" placeholder="Rechercher un marché…" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} />
              </form>

              {/* Mobile CTA */}
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#F5F5F7', borderRadius: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>{firstName?.[0]?.toUpperCase() ?? '?'}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{firstName ?? 'Mon compte'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href="/messages" onClick={() => setIsMobileOpen(false)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', color: '#1A1A1A', fontSize: '13px', fontWeight: '600' }}>
                      <MessageCircle size={16} /> Messages
                    </Link>
                    <Link href="/favorites" onClick={() => setIsMobileOpen(false)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', color: '#1A1A1A', fontSize: '13px', fontWeight: '600' }}>
                      <Heart size={16} /> Favoris
                    </Link>
                  </div>
                  <button onClick={handleSignOut}
                    style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FEF2F2', color: '#E05A5A', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <Link href="/login" onClick={() => setIsMobileOpen(false)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #6366F1', backgroundColor: 'transparent', color: '#6366F1', textDecoration: 'none', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                    Se connecter
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileOpen(false)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#6366F1', color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .desktop-cta { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
        }
      `}</style>
    </header>
  )
}
