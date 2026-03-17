import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    try {
      await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSubmitted(true)
    } catch (err) {
      alert('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="app">
      <div className="hero">
        <nav className="nav">
          <div className="logo">
            <span className="logo-icon">🦀</span>
            <span className="logo-text">IndyClaw</span>
          </div>
          <div className="nav-badge">Powered by OpenClaw + NVIDIA NemoClaw</div>
        </nav>

        <div className="hero-content">
          <div className="hero-tag">AI Agents for Indianapolis Businesses</div>
          <h1>
            Your business deserves an AI that <span className="highlight">actually works</span> for you.
          </h1>
          <p className="hero-sub">
            We build, deploy, and manage autonomous AI agents — and we're positioning 
            to be early partners in NVIDIA's NemoClaw ecosystem. Local expertise. 
            Enterprise-grade AI. Indianapolis roots.
          </p>

          <div className="cta-section">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="email-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Get Early Access'}
                </button>
              </form>
            ) : (
              <div className="success-msg">
                ✅ Thank you! Check your inbox — we've sent you a welcome email from info@indyclaw.com.
              </div>
            )}
            <p className="cta-note">Sign up now for a <span className="cta-highlight">free discovery call</span> with our team</p>
          </div>
        </div>

        <div className="grid-bg" />
      </div>

      <section className="what-section">
        <h2>What We Do</h2>
        <div className="cards">
          <div className="card">
            <div className="card-icon">🤖</div>
            <h3>Build Your Claw</h3>
            <p>Custom AI agents that handle real work — scheduling, research, customer support, data analysis, and more. Always on, always learning.</p>
          </div>
          <div className="card">
            <div className="card-icon">🔒</div>
            <h3>Privacy-First Options</h3>
            <p>Beta access for NVIDIA OpenShell with enterprise-grade privacy routing. Your data stays yours. Local inference when it matters, cloud power when you need it.</p>
          </div>
          <div className="card">
            <div className="card-icon">⚡</div>
            <h3>Always Running</h3>
            <p>Your agent doesn't clock out. It runs 24/7 on dedicated hardware, learning your business and getting smarter every day.</p>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="why-content">
          <h2>Why Indianapolis?</h2>
          <p>
            The world's biggest companies are racing to deploy AI agents. But most 
            businesses in Indianapolis don't have a Silicon Valley budget — or need one.
          </p>
          <p>
            We're local. We speak your language. We know that a dental office in Broad Ripple 
            has different needs than a tech startup in SF. And with NVIDIA's NemoClaw stack, 
            we can deliver enterprise-grade AI at a price that makes sense for real businesses.
          </p>
          <div className="quote">
            "Every single company in the world today has to have an OpenClaw strategy."
            <span className="quote-attr">— Jensen Huang, CEO of NVIDIA (March 16, 2026)</span>
          </div>
        </div>
      </section>

      <section className="tech-section">
        <h2>Built on the Best</h2>
        <div className="tech-logos">
          <div className="tech-item">
            <span className="tech-name">OpenClaw</span>
            <span className="tech-desc">The OS for personal AI</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">NVIDIA NemoClaw</span>
            <span className="tech-desc">Enterprise agent stack</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">OpenShell</span>
            <span className="tech-desc">Secure sandboxed runtime</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">Nemotron</span>
            <span className="tech-desc">Local AI inference</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🦀</span> IndyClaw
          </div>
          <p>AI agents for Indianapolis businesses.</p>
          <p className="footer-copy">© 2026 IndyClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
