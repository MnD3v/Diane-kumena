import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const realisations = [
  { file: "1.jpeg", desc: "Affiche institutionnelle de vœux pour la fête de Tabaski, chaleureuse et communautaire." },
  { file: "2.jpg",  desc: "Visuel motivationnel de début de semaine, moderne et positif, orienté éducation." },
  { file: "3.jpg",  desc: "Affiche dynamique de week-end, jeune, détendue et engageante." },
  { file: "4.jpg",  desc: "Annonce de services universitaires en ligne, claire, informative et orientée inscription." },
  { file: "5.jpg",  desc: "Affiche immobilière directe pour la recherche de chambre, simple et persuasive." },
  { file: "6.jpg",  desc: "Présentation complète d'une agence immobilière, professionnelle et rassurante." },
  { file: "7.jpg",  desc: "Affiche de services auto, pressing et livraison, pratique et orientée rapidité." },
  { file: "8.jpg",  desc: "Promotion textile traditionnelle, élégante et valorisant l'identité culturelle." },
  { file: "9.jpg",  desc: "Affiche professionnelle de topographie, technique, crédible et orientée expertise." },
]

const skills = [
  'Community Management',
  'Social Media',
  'Stratégie Digitale',
]

// ── Curseur personnalisé ─────────────────────────────────────────
function Cursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = -200, my = -200, rx = -200, ry = -200, raf

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      dot.style.left = mx + 'px'
      dot.style.top  = my + 'px'
    }
    const tick = () => {
      rx += (mx - rx) * 0.1
      ry += (my - ry) * 0.1
      ring.style.left = rx + 'px'
      ring.style.top  = ry + 'px'
      raf = requestAnimationFrame(tick)
    }
    const onOver = (e) => {
      const hov = !!e.target.closest('a,button,[role="button"],.realisation-card')
      dot.classList.toggle('cursor--hover', hov)
      ring.classList.toggle('cursor--hover', hov)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <span ref={dotRef}  className="cursor-dot"  />
      <span ref={ringRef} className="cursor-ring" />
    </>
  )
}

// ── Loader ───────────────────────────────────────────────────────
function Loader({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const fillRef = useRef(null)

  useEffect(() => {
    const complete = () => {
      if (fillRef.current) {
        fillRef.current.style.transition = 'width 0.35s ease'
        fillRef.current.style.width = '100%'
      }
      setTimeout(() => {
        setLeaving(true)
        setTimeout(onDone, 850)
      }, 450)
    }

    if (document.readyState === 'complete') {
      setTimeout(complete, 400)
    } else {
      window.addEventListener('load', complete, { once: true })
    }
  }, [onDone])

  return (
    <div className={`loader${leaving ? ' loader--out' : ''}`}>
      <div className="loader-inner">
        <p className="loader-name">Diane K</p>
        <p className="loader-sub">Designer <em>&</em> Community Manager</p>
      </div>
      <div className="loader-track">
        <div ref={fillRef} className="loader-fill" />
      </div>
    </div>
  )
}

// ── Barre de progression ─────────────────────────────────────────
function ScrollProgress() {
  const barRef = useRef(null)
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div ref={barRef} className="scroll-progress" />
}

// ── Compteur animé ───────────────────────────────────────────────
function CountUp({ to, suffix = '+' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const duration = 1400
      const start = performance.now()
      const step = (now) => {
        const p    = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(ease * to))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [to])

  return <span ref={ref}>{val}{suffix}</span>
}

// ── Lightbox ─────────────────────────────────────────────────────
function Lightbox({ index, onClose, onPrev, onNext }) {
  const item = realisations[index]
  return (
    <div className="lb-backdrop" onClick={onClose}>
      <button className="lb-close" onClick={onClose} aria-label="Fermer">✕</button>
      <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); onPrev() }} aria-label="Précédent">‹</button>
      <div className="lb-content" onClick={(e) => e.stopPropagation()}>
        <img src={`/images/realisations/${item.file}`} alt={item.desc} className="lb-img" />
        <div className="lb-footer">
          <span className="lb-counter">{index + 1} / {realisations.length}</span>
          <p className="lb-desc">{item.desc}</p>
        </div>
      </div>
      <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); onNext() }} aria-label="Suivant">›</button>
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────
function App() {
  const [ready, setReady] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    document.body.style.overflow = (menuOpen || lightboxIndex !== null) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, lightboxIndex])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const goPrev = useCallback(() => setLightboxIndex(i => (i - 1 + realisations.length) % realisations.length), [])
  const goNext = useCallback(() => setLightboxIndex(i => (i + 1) % realisations.length), [])

  // Révélation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible') }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Clavier lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e) => {
      if (e.key === 'Escape')     closeLightbox()
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey) }
  }, [lightboxIndex, closeLightbox, goPrev, goNext])

  return (
    <div>
      {!ready && <Loader onDone={() => setReady(true)} />}
      <Cursor />
      <ScrollProgress />

      {/* ── Navigation ── */}
      <nav className="nav">
        <a href="#" className="nav-logo">Diane K</a>
        <ul className="nav-links">
          <li><a href="#home">Accueil</a></li>
          <li><a href="#projects">Projets</a></li>
          <li><a href="#about">À propos</a></li>
          <li><a href="#contact" className="nav-cta">Contact</a></li>
        </ul>
        <button
          className={`nav-burger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── Menu mobile ── */}
      {menuOpen && (
        <div className="mobile-menu" onClick={closeMenu}>
          <nav onClick={e => e.stopPropagation()}>
            <a href="#home"     onClick={closeMenu}>Accueil</a>
            <a href="#about"    onClick={closeMenu}>À propos</a>
            <a href="#projects" onClick={closeMenu}>Réalisations</a>
            <a href="#contact"  onClick={closeMenu}>Contact</a>
          </nav>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hero" id="home">
        <div className="hero-glow-top" />
        <div className="hero-glow-bottom" />

        <div className="hero-content">
          <div className="hero-text">
            {/* Nom lettre par lettre */}
            <p className="hero-name" aria-label="Diane KUMENA">
              {[["D","i","a","n","e"], ["K","U","M","E","N","A"]].map((word, wi) => (
                <span key={wi} className="name-word">
                  {word.map((char, ci) => (
                    <span key={ci} className="name-char" style={{ '--i': wi === 0 ? ci : 6 + ci }}>
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </p>

            <h1 className="hero-title" data-reveal>
              Je crée des expériences<br />
              <strong className="hero-title-strong">mémorables.</strong>
            </h1>

            <p className="hero-desc" data-reveal>
              Passionnée par le design visuel et la création de communautés
              engagées — je transforme vos idées en identités visuelles
              percutantes qui <em className="text-em">marquent les esprits.</em>
            </p>

            <div className="hero-actions" data-reveal>
              <a href="#projects" className="btn-primary">Voir mes projets</a>
              <a href="#contact"  className="btn-secondary">Me contacter</a>
            </div>

            <div className="hero-socials" data-reveal>
              <span className="social-label">Retrouvez-moi</span>
              <a href="https://www.linkedin.com/in/diane-kumena-aaaa70342/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://web.facebook.com/profile.php?id=100085180773334" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="hero-visual" data-reveal>
            <div className="hero-image-wrapper">
              <img src="/images/Diane Kumena.png" alt="Diane KUMENA" className="hero-img" />
              <div className="hero-stat-card">
                <span className="stat-number">50+</span>
                <span className="stat-label">Projets réalisés</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── À Propos ── */}
      <section className="about" id="about">
        <div className="about-inner">
          <div className="section-label" data-reveal>
            <span className="section-label-line" />
            <span className="section-label-text">À propos</span>
          </div>
          <h2 className="about-statement" data-reveal>
            Une créative <em>passionnée,</em><br />
            une stratège <em>engagée.</em>
          </h2>
          <div className="about-grid">
            <div className="about-left" data-reveal>
              <div className="about-img-wrapper">
                <img src="/images/Diane Kumena-About.png" alt="Diane KUMENA" className="about-img" />
              </div>
            </div>
            <div className="about-right">
              <div className="about-bio" data-reveal>
                <p>
                  Je suis Diane KUMENA, Designer et Community Manager avec une
                  vision claire&nbsp;: créer des expériences visuelles qui parlent,
                  qui touchent, et qui <em className="text-em">restent.</em>
                </p>
                <p>
                  Mon approche mêle <em className="text-em">esthétique exigeante</em> et
                  stratégie digitale pour donner vie à des marques qui ont
                  du caractère et de la cohérence.
                </p>
              </div>

              <div className="about-stats" data-reveal>
                <div className="about-stat">
                  <span className="about-stat-num"><CountUp to={3} /></span>
                  <span className="about-stat-desc">Années<br />d'expérience</span>
                </div>
                <div className="about-stat-sep" />
                <div className="about-stat">
                  <span className="about-stat-num"><CountUp to={50} /></span>
                  <span className="about-stat-desc">Projets<br />réalisés</span>
                </div>
                <div className="about-stat-sep" />
                <div className="about-stat">
                  <span className="about-stat-num"><CountUp to={20} /></span>
                  <span className="about-stat-desc">Clients<br />satisfaits</span>
                </div>
              </div>

              <div className="about-skills" data-reveal>
                {skills.map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Réalisations ── */}
      <section className="realisations" id="projects">
        <div className="realisations-inner">
          <div className="section-label" data-reveal>
            <span className="section-label-line" />
            <span className="section-label-text">Réalisations</span>
          </div>
          <div className="realisations-header" data-reveal>
            <h2 className="realisations-title">Mes <em>créations.</em></h2>
            <p className="realisations-sub">Design graphique · Identité visuelle · Community</p>
          </div>
          <div className="realisations-grid">
            {realisations.map((item, i) => (
              <div
                key={item.file}
                className="realisation-card"
                data-reveal
                style={{ '--card-i': i }}
                onClick={() => setLightboxIndex(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(i)}
              >
                <img src={`/images/realisations/${item.file}`} alt={item.desc} className="card-img" />
                <div className="card-overlay">
                  <span className="card-num">0{i + 1}</span>
                  <p className="card-desc">{item.desc}</p>
                  <span className="card-arrow">↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Entreprises ── */}
      <section className="entreprises">
        <div className="entreprises-inner">
          <p className="entreprises-label" data-reveal>Ils m'ont fait confiance</p>
          <div className="entreprises-logos" data-reveal>
            <div className="entreprise-item">
              <img src="/images/entreprises/isla.png"      alt="ISLA"              className="entreprise-logo" />
            </div>
            <div className="entreprise-sep" />
            <div className="entreprise-item">
              <img src="/images/entreprises/lafiatech.png" alt="LAFIATECH"         className="entreprise-logo" />
            </div>
            <div className="entreprise-sep" />
            <div className="entreprise-item">
              <img src="/images/entreprises/panpas.jpg"    alt="PANPAS Immobilier" className="entreprise-logo" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta" id="contact">
        <div className="cta-inner">
          <span className="cta-eyebrow" data-reveal>Travaillons ensemble</span>
          <h2 className="cta-title" data-reveal>
            Un projet en tête&nbsp;?<br />
            <em>Parlons-en.</em>
          </h2>
          <p className="cta-desc" data-reveal>
            Que ce soit pour une identité visuelle, une campagne social media
            ou un projet créatif — je suis disponible pour en discuter.
          </p>
          <a href="https://wa.me/91217118" target="_blank" rel="noopener noreferrer" className="cta-btn" data-reveal>
            <span className="cta-btn-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.522 5.843L.057 23.882l6.21-1.628A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.003-1.369l-.358-.214-3.718.975.993-3.63-.233-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
            </span>
            Écrire sur WhatsApp
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <p className="footer-name">Diane KUMENA</p>
              <p className="footer-role">Designer <em>&</em> Community Manager</p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <p className="footer-col-title">Navigation</p>
                <ul>
                  <li><a href="#home">Accueil</a></li>
                  <li><a href="#about">À propos</a></li>
                  <li><a href="#projects">Réalisations</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <p className="footer-col-title">Contact</p>
                <ul>
                  <li><a href="https://wa.me/91217118" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <p className="footer-col-title">Réseaux</p>
                <ul>
                  <li><a href="https://www.linkedin.com/in/diane-kumena-aaaa70342/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                  <li><a href="https://web.facebook.com/profile.php?id=100085180773334" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2025 Diane KUMENA — Tous droits réservés</p>
            <p className="footer-made">Conçu avec passion</p>
          </div>
        </div>
      </footer>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <Lightbox index={lightboxIndex} onClose={closeLightbox} onPrev={goPrev} onNext={goNext} />
      )}
    </div>
  )
}

export default App
