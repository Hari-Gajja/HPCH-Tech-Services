import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { useAuth } from './auth/AuthContext'
import LoginModal from './auth/LoginModal'
import { trackPageView } from './auth/api'
import './App.css'

// Import images for production build
import logoImg from './assets/logo.png'
import member1Img from './assets/member-1.png'
import member2Img from './assets/member-2.png'
import member3Img from './assets/member-3.png'
import member4Img from './assets/member-4.png'

function App() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [backToTopVisible, setBackToTopVisible] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const cursorRef = useRef(null)
  const cursorFollowerRef = useRef(null)

  // Budget Calculator State
  const [budgetOptions, setBudgetOptions] = useState({
    websiteType: 'frontend', // 'frontend' or 'fullstack'
    customDomain: false,
    aiChat: false,
    seoOptimization: false,
    analyticsIntegration: false,
    paymentGateway: false,
    adminDashboard: false,
    extraPages: 0, // number of extra pages beyond 5
    maintenancePackage: 'basic' // 'basic', 'premium', 'enterprise'
  })

  // Calculate total budget
  const calculateBudget = () => {
    let total = 0
    
    // Base price based on website type
    if (budgetOptions.websiteType === 'frontend') {
      total += 3999
    } else {
      total += 7999
    }
    
    // Add-ons
    if (budgetOptions.customDomain) total += 1000
    if (budgetOptions.aiChat) total += 3000
    if (budgetOptions.seoOptimization) total += 1500
    if (budgetOptions.analyticsIntegration) total += 800
    if (budgetOptions.paymentGateway) total += 2000
    if (budgetOptions.adminDashboard) total += 2500
    
    // Extra pages (₹500 per page)
    total += budgetOptions.extraPages * 500
    
    // Maintenance package
    if (budgetOptions.maintenancePackage === 'basic') total += 999
    if (budgetOptions.maintenancePackage === 'premium') total += 1999
    if (budgetOptions.maintenancePackage === 'enterprise') total += 3999
    
    return total
  }

  const handleBudgetChange = (option, value) => {
    setBudgetOptions(prev => ({ ...prev, [option]: value }))
  }

  // Track page view on mount
  useEffect(() => { trackPageView() }, [])

  // Custom Cursor Effect
  useEffect(() => {
    const cursor = cursorRef.current
    const cursorFollower = cursorFollowerRef.current
    
    if (!cursor || !cursorFollower) return

    let mouseX = 0, mouseY = 0
    let cursorX = 0, cursorY = 0
    let followerX = 0, followerY = 0
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15
      followerX += (mouseX - followerX) * 0.08
      followerY += (mouseY - followerY) * 0.08
      
      cursor.style.left = cursorX + 'px'
      cursor.style.top = cursorY + 'px'
      cursorFollower.style.left = followerX + 'px'
      cursorFollower.style.top = followerY + 'px'
      
      requestAnimationFrame(animateCursor)
    }

    document.addEventListener('mousemove', handleMouseMove)
    animateCursor()

    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Scroll Effects
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 100)
      setBackToTopVisible(window.scrollY > 500)

      // Active section detection
      const sections = document.querySelectorAll('section[id]')
      const scrollY = window.scrollY + 150
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight
        const sectionId = section.getAttribute('id')
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          setActiveSection(sectionId)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll Reveal Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          
          // Animate skill bars
          if (entry.target.closest('.skill-category')) {
            entry.target.querySelectorAll('.skill-bar span').forEach(bar => {
              const width = bar.getAttribute('data-width')
              if (width) {
                bar.style.width = width + '%'
              }
            })
          }
        }
      })
    }, observerOptions)

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMobileMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formRef = useRef(null)
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: false, blocked: false, invalid: false })

  // Blocked emails and phone numbers
  const blockedEmails = [
    'harigajja121@gmail.com',
    'harigajja10@gmail.com',
    'harigajja010@gmail.com',
    'sanvichowdary10@gmail.com'
  ]
  const blockedPhones = ['7331105294', '9063135026']

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'mail.com', 'yandex.com', 'live.com', 'msn.com', 'rediffmail.com']
    if (!emailRegex.test(email)) return false
    const domain = email.split('@')[1]
    // Allow common domains or any valid-looking domain with at least 2 char TLD
    if (validDomains.includes(domain)) return true
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Require login before sending the form
    if (!user) {
      setShowLoginModal(true)
      return
    }
    
    const email = formRef.current.from_email.value.toLowerCase().trim()
    const phone = formRef.current.from_phone.value.replace(/[\s\-\+\(\)]/g, '').slice(-10)
    
    // Validate email format
    if (!isValidEmail(email)) {
      setFormStatus({ loading: false, success: false, error: false, blocked: false, invalid: true })
      setTimeout(() => setFormStatus({ loading: false, success: false, error: false, blocked: false, invalid: false }), 5000)
      return
    }
    
    // Check if email or phone is blocked
    if (blockedEmails.includes(email) || blockedPhones.includes(phone)) {
      setFormStatus({ loading: false, success: false, error: false, blocked: true, invalid: false })
      setTimeout(() => setFormStatus({ loading: false, success: false, error: false, blocked: false, invalid: false }), 5000)
      return
    }
    
    setFormStatus({ loading: true, success: false, error: false, blocked: false, invalid: false })
    
    emailjs.sendForm(
      'service_3zwkhxs',
      'template_z8lgy9n',
      formRef.current,
      'D-rf-UlU0D8SOLlir'
    )
    .then(() => {
      setFormStatus({ loading: false, success: true, error: false, blocked: false, invalid: false })
      formRef.current.reset()
      setTimeout(() => setFormStatus({ loading: false, success: false, error: false, blocked: false, invalid: false }), 5000)
    })
    .catch(() => {
      setFormStatus({ loading: false, success: false, error: true, blocked: false, invalid: false })
      setTimeout(() => setFormStatus({ loading: false, success: false, error: false, blocked: false, invalid: false }), 5000)
    })
  }

  return (
    <>
      {/* Custom Cursor */}
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-follower" ref={cursorFollowerRef}></div>

      {/* Grid background */}
      <div className="grid-lines" aria-hidden="true"></div>

      {/* Animated background particles */}
      <div className="bg-particles" aria-hidden="true">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Header */}
      <header className={`site-header ${headerScrolled ? 'scrolled' : ''}`}>
        <div className="brand">
          <span className="logo-circle">
            <span className="logo-letter">H</span>
          </span>
          <div className="brand-text">
            <h1>HPCH TECH</h1>
            <p>Freelance Solutions</p>
          </div>
        </div>

        <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><a href="#hero" className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`} onClick={(e) => scrollToSection(e, 'hero')}><span>Home</span></a></li>
            <li><a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={(e) => scrollToSection(e, 'about')}><span>About</span></a></li>
            <li><a href="#services" className={`nav-link ${activeSection === 'services' ? 'active' : ''}`} onClick={(e) => scrollToSection(e, 'services')}><span>Services</span></a></li>
            <li><a href="#team" className={`nav-link ${activeSection === 'team' ? 'active' : ''}`} onClick={(e) => scrollToSection(e, 'team')}><span>Team</span></a></li>
            <li><a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={(e) => scrollToSection(e, 'projects')}><span>Work</span></a></li>
            <li><a href="#budget-calculator" className={`nav-link ${activeSection === 'budget-calculator' ? 'active' : ''}`} onClick={(e) => scrollToSection(e, 'budget-calculator')}><span>Pricing</span></a></li>
            <li><a href="#contact" className="nav-link cta" onClick={(e) => scrollToSection(e, 'contact')}><span>Hire Us</span></a></li>
          </ul>
        </nav>

        {user ? (
          <div className="header-user">
            <img src={user.picture} alt={user.name} className="header-avatar" referrerPolicy="no-referrer" />
            <button className="logout-btn" onClick={logout} title="Sign out">Logout</button>
          </div>
        ) : (
          <button className="header-login-btn" onClick={() => setShowLoginModal(true)}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
        )}

        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} 
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="hero" className="section hero-section">
          <div className="content">
            <div className="hero-panel">
              <div className="hero-text">
                <div className="hero-badge reveal">
                  <span className="status-dot"></span>
                  Available for Projects
                </div>
                <h2 className="hero-title reveal delay-100">
                  <span className="line"><span className="text-gradient">WEB DEVELOPMENT</span></span>
                  <span className="line"><span>& AI SOLUTIONS</span></span>
                  <span className="line"><span className="text-outline">FOR YOUR BUSINESS</span></span>
                </h2>
                <p className="subtitle reveal delay-200">
                  We are HPCH Tech - a team of expert developers specializing in MERN stack applications, AI-powered tools, and modern web solutions that drive business growth.
                </p>
                <div className="hero-actions reveal delay-300">
                  <a href="#projects" className="btn primary btn-magnetic" onClick={(e) => scrollToSection(e, 'projects')}>
                    <i className="fas fa-eye"></i>
                    View Work
                  </a>
                  <a href="#contact" className="btn ghost btn-magnetic" onClick={(e) => scrollToSection(e, 'contact')}>
                    <i className="fas fa-paper-plane"></i>
                    Get Quote
                  </a>
                  <a href="https://github.com/Hari-Gajja" target="_blank" rel="noopener noreferrer" className="btn icon" aria-label="GitHub">
                    <i className="fab fa-github"></i>
                  </a>
                  <a href="https://www.linkedin.com/in/gajja-hari-64a83237b/" target="_blank" rel="noopener noreferrer" className="btn icon" aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
              <div className="hero-visual reveal-right delay-200">
                <div className="hero-logo">
                  <img src={logoImg} alt="HPCH Tech Logo" />
                </div>
              </div>
            </div>
            <a href="#about" className="scroll-indicator reveal delay-500" onClick={(e) => scrollToSection(e, 'about')}>
              <span>Scroll to Explore</span>
              <i className="fas fa-arrow-down"></i>
            </a>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee">
          <div className="marquee-content">
            <span>REACT</span>
            <span className="filled">NODE.JS</span>
            <span>MONGODB</span>
            <span className="filled">EXPRESS</span>
            <span>PYTHON</span>
            <span className="filled">AI/ML</span>
            <span>REACT</span>
            <span className="filled">NODE.JS</span>
            <span>MONGODB</span>
            <span className="filled">EXPRESS</span>
            <span>PYTHON</span>
            <span className="filled">AI/ML</span>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <section id="about" className="section">
          <div className="content">
            <div className="two-col">
              <div className="reveal-left">
                <p className="eyebrow"><i className="fas fa-sparkles"></i> About Us</p>
                <h2 className="display-md">Building the <span className="text-gradient">Future</span> with Code & AI</h2>
                <p>
                  HPCH Tech is a premier freelancing agency specializing in cutting-edge web development and AI solutions. We transform complex business challenges into elegant, functional digital products.
                </p>
                <p>
                  From stunning responsive websites to AI-powered applications, we deliver solutions that drive growth. Our expertise spans the full MERN stack, machine learning, and modern design principles.
                </p>
                <div className="about-cta">
                  <a href="#contact" className="btn primary btn-magnetic" onClick={(e) => scrollToSection(e, 'contact')}>
                    <i className="fas fa-arrow-right"></i>
                    Start a Project
                  </a>
                  <a href="#services" className="btn ghost btn-magnetic" onClick={(e) => scrollToSection(e, 'services')}>
                    <i className="fas fa-cog"></i>
                    Our Services
                  </a>
                </div>
              </div>
              <div className="reveal-right delay-200">
                <div className="about-cards">
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-globe"></i>
                    </div>
                    <div className="info-content">
                      <h4>Global Reach</h4>
                      <p>Remote services worldwide</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-code"></i>
                    </div>
                    <div className="info-content">
                      <h4>Tech Stack</h4>
                      <p>MERN, Python & AI/ML</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-rocket"></i>
                    </div>
                    <div className="info-content">
                      <h4>Fast Delivery</h4>
                      <p>On-time project delivery</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-headset"></i>
                    </div>
                    <div className="info-content">
                      <h4>24/7 Support</h4>
                      <p>Always here to help</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES/SKILLS SECTION */}
        <section id="services" className="section">
          <div className="content">
            <div className="section-header center">
              <p className="eyebrow reveal"><i className="fas fa-wand-magic-sparkles"></i> Our Services</p>
              <h2 className="display-md reveal delay-100">What We <span className="text-gradient">Offer</span></h2>
              <p className="section-desc reveal delay-200">Transform your business with AI-powered web solutions that drive results</p>
            </div>

            <div className="services-grid">
              <div className="service-card reveal delay-100">
                <div className="service-icon">
                  <i className="fas fa-code"></i>
                </div>
                <h3>Frontend Development</h3>
                <p>Beautiful, responsive frontend websites built with modern technologies. Clean code, fast performance, and stunning designs that bring your vision to life.</p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> React, Next.js, Vue.js</li>
                  <li><i className="fas fa-check"></i> Mobile-first responsive</li>
                  <li><i className="fas fa-check"></i> Modern UI/UX design</li>
                </ul>
                <div className="service-cta">
                  <span className="service-price">Starting at 3,999/-</span>
                </div>
              </div>

              <div className="service-card reveal delay-200">
                <div className="service-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h3>Frontend Development + Custom Domain</h3>
                <p>Get a complete frontend website with your own custom domain. We handle domain setup, DNS configuration, and SSL certificates for a professional online presence.</p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> Custom domain setup</li>
                  <li><i className="fas fa-check"></i> SSL certificate included</li>
                  <li><i className="fas fa-check"></i> Professional hosting</li>
                </ul>
                <div className="service-cta">
                  <span className="service-price">Starting at 4,999/-</span>
                </div>
              </div>

              <div className="service-card reveal delay-300">
                <div className="service-icon">
                  <i className="fas fa-laptop-code"></i>
                </div>
                <h3>Full Stack Web Development</h3>
                <p>Complete web applications with both frontend and backend. Databases, APIs, authentication, and everything you need for a fully functional web app.</p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> MERN / MEAN stack</li>
                  <li><i className="fas fa-check"></i> Database integration</li>
                  <li><i className="fas fa-check"></i> Secure authentication</li>
                </ul>
                <div className="service-cta">
                  <span className="service-price">Starting at 7,999/-</span>
                </div>
              </div>

              <div className="service-card featured reveal delay-100">
                <div className="featured-badge">Popular</div>
                <div className="service-icon">
                  <i className="fas fa-server"></i>
                </div>
                <h3>Full Stack Web Development + Custom Domain</h3>
                <p>A complete full stack solution with your own custom domain. Professional hosting, SSL security, and a fully functional web application ready to scale.</p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> Full stack application</li>
                  <li><i className="fas fa-check"></i> Custom domain & SSL</li>
                  <li><i className="fas fa-check"></i> Cloud hosting setup</li>
                </ul>
                <div className="service-cta">
                  <span className="service-price">Starting at 8,999/-</span>
                </div>
              </div>

              <div className="service-card reveal delay-200">
                <div className="service-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h3>Full Stack Web Development + AI Chat</h3>
                <p>Powerful full stack web app enhanced with AI chatbot integration. Smart conversational features that engage users and provide instant support.</p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> AI chatbot integration</li>
                  <li><i className="fas fa-check"></i> ChatGPT / Claude powered</li>
                  <li><i className="fas fa-check"></i> Smart automation</li>
                </ul>
                <div className="service-cta">
                  <span className="service-price">Starting at 10,999/-</span>
                </div>
              </div>

              <div className="service-card featured reveal delay-300">
                <div className="featured-badge">Best Value</div>
                <div className="service-icon">
                  <i className="fas fa-wand-magic-sparkles"></i>
                </div>
                <h3>Full Stack + AI Chat + Custom Domain</h3>
                <p>The ultimate package! Complete full stack web application with AI-powered chatbot and your own custom domain. Everything you need for a modern, intelligent web presence.</p>
                <ul className="service-features">
                  <li><i className="fas fa-check"></i> Complete full stack app</li>
                  <li><i className="fas fa-check"></i> AI chat integration</li>
                  <li><i className="fas fa-check"></i> Custom domain & hosting</li>
                </ul>
                <div className="service-cta">
                  <span className="service-price">Starting at 11,999/-</span>
                </div>
              </div>
            </div>

            <div className="services-footer reveal delay-400">
              <p className="guarantee"><i className="fas fa-shield-halved"></i> 100% Satisfaction Guarantee — We don't stop until you're thrilled with the results</p>
              <a href="#contact" className="btn primary btn-magnetic" onClick={(e) => scrollToSection(e, 'contact')}>
                <span>Get Free Consultation</span>
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section id="team" className="section">
          <div className="content">
            <div className="section-header center">
              <p className="eyebrow reveal"><i className="fas fa-users"></i> Our Team</p>
              <h2 className="display-md reveal delay-100">Meet the <span className="text-gradient">Experts</span></h2>
              <p className="section-desc reveal delay-200">Talented professionals dedicated to delivering excellence</p>
            </div>

            <div className="team-grid">
              <div className="team-card reveal delay-100">
                <div className="team-bg-text">
                  <span className="bg-text-main">FOUNDER</span>
                  <span className="bg-text-accent">dev</span>
                </div>
                <div className="team-image">
                  <img src={member1Img} alt="Hari - Founder" />
                </div>
                <div className="team-info">
                  <h3>Hari</h3>
                  <span className="team-role">Founder , Full Stack Developer & AIML Engineer</span>
                  <a href="#contact" className="team-discover">DISCOVER <i className="fas fa-arrow-right"></i></a>
                </div>
                <div className="team-social-vertical">
                  <a href="https://www.instagram.com/_hari_vision/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="https://www.linkedin.com/in/gajja-hari-64a83237b/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="https://github.com/Hari-Gajja" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fab fa-github"></i></a>
                </div>
              </div>

              <div className="team-card reveal delay-200">
                <div className="team-bg-text">
                  <span className="bg-text-main">BACKEND</span>
                  <span className="bg-text-accent">dev</span>
                </div>
                <div className="team-image">
                  <img src={member3Img} alt="Prasad - Backend Developer" />
                </div>
                <div className="team-info">
                  <h3>Prasad</h3>
                  <span className="team-role">Backend Developer</span>
                  <a href="#contact" className="team-discover">DISCOVER <i className="fas fa-arrow-right"></i></a>
                </div>
                <div className="team-social-vertical">
                  <a href="https://www.instagram.com/_p_r_a_s_a_d_27_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="https://www.linkedin.com/in/durga-prasad-bonu-200a0337b/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" aria-label="GitHub"><i className="fab fa-github"></i></a>
                </div>
              </div>

              <div className="team-card reveal delay-300">
                <div className="team-bg-text">
                  <span className="bg-text-main">FRONTEND</span>
                  <span className="bg-text-accent">dev</span>
                </div>
                <div className="team-image">
                  <img src={member2Img} alt="Chaitanya - Frontend Designer" />
                </div>
                <div className="team-info">
                  <h3>Chaitanya</h3>
                  <span className="team-role">Frontend Designer</span>
                  <a href="#contact" className="team-discover">DISCOVER <i className="fas fa-arrow-right"></i></a>
                </div>
                <div className="team-social-vertical">
                  <a href="https://www.instagram.com/_.mr._chaitu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="https://www.linkedin.com/in/ram-sai-chaitanya-parasa-048108385/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" aria-label="GitHub"><i className="fab fa-github"></i></a>
                </div>
              </div>

              <div className="team-card reveal delay-400">
                <div className="team-bg-text">
                  <span className="bg-text-main">FULL STACK</span>
                  <span className="bg-text-accent">dev</span>
                </div>
                <div className="team-image">
                  <img src={member4Img} alt="Harish - Full Stack Developer" />
                </div>
                <div className="team-info">
                  <h3>Harish</h3>
                  <span className="team-role">Full Stack Web Developer</span>
                  <a href="#contact" className="team-discover">DISCOVER <i className="fas fa-arrow-right"></i></a>
                </div>
                <div className="team-social-vertical">
                  <a href="https://www.instagram.com/harishrajavarapu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="https://www.linkedin.com/in/harish-rajavarapu/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                  <a href="https://github.com/HarishRajavarapu" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fab fa-github"></i></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="section">
          <div className="content">
            <div className="section-header center">
              <p className="eyebrow reveal"><i className="fas fa-folder-open"></i> Our Portfolio</p>
              <h2 className="display-md reveal delay-100">Featured <span className="text-gradient">Projects</span></h2>
              <p className="section-desc reveal delay-200">A showcase of our best work across various industries</p>
            </div>

            <div className="projects-grid">
              {/* Featured Project */}
              <article className="project-card featured reveal delay-100">
                <div className="project-image">
                  <div className="project-placeholder">
                    <i className="fas fa-atom"></i>
                  </div>
                  <div className="project-overlay">
                    <a href="https://github.com/Hari-Gajja/NovaMol" target="_blank" rel="noopener noreferrer" className="project-link" aria-label="View Code"><i className="fab fa-github"></i></a>
                  </div>
                </div>
                <div className="project-info">
                  <div className="project-header">
                    <span className="project-status">AI / Science</span>
                  </div>
                  <h3>NovaMol</h3>
                  <p>An AI-powered molecular analysis and visualization platform for scientific research, enabling researchers to explore and analyze molecular structures with advanced ML models.</p>
                  <ul className="project-features">
                    <li><i className="fas fa-check"></i> AI-powered molecular analysis</li>
                    <li><i className="fas fa-check"></i> Interactive 3D visualization</li>
                    <li><i className="fas fa-check"></i> Advanced ML model integration</li>
                  </ul>
                  <div className="project-tags">
                    <span className="chip">Python</span>
                    <span className="chip">React</span>
                    <span className="chip">TensorFlow</span>
                    <span className="chip">3D.js</span>
                  </div>
                </div>
              </article>

              {/* Project 2 */}
              <article className="project-card reveal delay-200">
                <div className="project-image">
                  <div className="project-placeholder">
                    <i className="fab fa-spotify"></i>
                  </div>
                  <div className="project-overlay">
                    <a href="https://github.com/Hari-Gajja/spotify-full-stack" target="_blank" rel="noopener noreferrer" className="project-link" aria-label="View Code"><i className="fab fa-github"></i></a>
                  </div>
                </div>
                <div className="project-info">
                  <div className="project-header">
                    <span className="project-status">Full Stack</span>
                  </div>
                  <h3>Spotify Clone</h3>
                  <p>A full-stack music streaming application with user authentication, playlist management, and audio playback.</p>
                  <div className="project-tags">
                    <span className="chip small">React</span>
                    <span className="chip small">Node.js</span>
                    <span className="chip small">MongoDB</span>
                  </div>
                </div>
              </article>

              {/* Project 3 */}
              <article className="project-card reveal delay-300">
                <div className="project-image">
                  <div className="project-placeholder">
                    <i className="fas fa-code"></i>
                  </div>
                  <div className="project-overlay">
                    <a href="https://github.com/Hari-Gajja/ProExplain" target="_blank" rel="noopener noreferrer" className="project-link" aria-label="View Code"><i className="fab fa-github"></i></a>
                  </div>
                </div>
                <div className="project-info">
                  <div className="project-header">
                    <span className="project-status">AI Tool</span>
                  </div>
                  <h3>ProExplain</h3>
                  <p>An AI-powered tool that explains program codes in simple terms, helping developers understand complex code snippets instantly.</p>
                  <div className="project-tags">
                    <span className="chip small">Python</span>
                    <span className="chip small">OpenAI</span>
                    <span className="chip small">React</span>
                  </div>
                </div>
              </article>
            </div>

            <div className="projects-cta reveal delay-500">
              <a href="#contact" className="btn ghost btn-magnetic" onClick={(e) => scrollToSection(e, 'contact')}>
                <i className="fas fa-paper-plane"></i>
                Discuss Your Project
              </a>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section id="process" className="section">
          <div className="content">
            <div className="section-header center">
              <p className="eyebrow reveal"><i className="fas fa-briefcase"></i> How We Work</p>
              <h2 className="display-md reveal delay-100">Our <span className="text-gradient">Process</span></h2>
              <p className="section-desc reveal delay-200">A streamlined approach to deliver exceptional results</p>
            </div>

            <div className="experience-grid">
              <div className="experience-column reveal delay-100">
                <div className="column-title">
                  <i className="fas fa-comments"></i>
                  <h3>Discovery & Planning</h3>
                </div>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-header">
                      <h4>Initial Consultation</h4>
                      <span className="timeline-date">Step 1</span>
                    </div>
                    <p className="timeline-company"><i className="fas fa-lightbulb"></i> Understanding Your Vision</p>
                    <ul className="timeline-list">
                      <li>Discuss project requirements and goals</li>
                      <li>Identify target audience and competitors</li>
                      <li>Define project scope and timeline</li>
                    </ul>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-header">
                      <h4>Strategy & Proposal</h4>
                      <span className="timeline-date">Step 2</span>
                    </div>
                    <p className="timeline-company"><i className="fas fa-file-alt"></i> Detailed Planning</p>
                    <ul className="timeline-list">
                      <li>Technical architecture design</li>
                      <li>Project timeline and milestones</li>
                      <li>Transparent pricing breakdown</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="experience-column reveal delay-200">
                <div className="column-title">
                  <i className="fas fa-code"></i>
                  <h3>Development & Delivery</h3>
                </div>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-header">
                      <h4>Design & Development</h4>
                      <span className="timeline-date">Step 3</span>
                    </div>
                    <p className="timeline-company"><i className="fas fa-cogs"></i> Building Your Solution</p>
                    <ul className="timeline-list">
                      <li>UI/UX design and prototyping</li>
                      <li>Agile development with regular updates</li>
                      <li>Continuous testing and quality assurance</li>
                    </ul>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-header">
                      <h4>Launch & Support</h4>
                      <span className="timeline-date">Step 4</span>
                    </div>
                    <p className="timeline-company"><i className="fas fa-rocket"></i> Going Live</p>
                    <ul className="timeline-list">
                      <li>Deployment and performance optimization</li>
                      <li>Training and documentation</li>
                      <li>Ongoing maintenance and support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUDGET CALCULATOR SECTION */}
        <section id="budget-calculator" className="section budget-section">
          <div className="content">
            <div className="section-header center">
              <p className="eyebrow reveal"><i className="fas fa-calculator"></i> Budget Calculator</p>
              <h2 className="display-md reveal delay-100">Estimate Your <span className="text-gradient">Project Cost</span></h2>
              <p className="section-desc reveal delay-200">Select the features you need and get an instant quote</p>
            </div>

            <div className="budget-calculator-container reveal delay-300">
              <div className="budget-options">
                {/* Website Type */}
                <div className="budget-group">
                  <h3><i className="fas fa-laptop-code"></i> Website Type</h3>
                  <div className="budget-radio-group">
                    <label className={`budget-radio ${budgetOptions.websiteType === 'frontend' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="websiteType"
                        checked={budgetOptions.websiteType === 'frontend'}
                        onChange={() => handleBudgetChange('websiteType', 'frontend')}
                      />
                      <span className="radio-content">
                        <span className="radio-title">Frontend Only</span>
                      </span>
                    </label>
                    <label className={`budget-radio ${budgetOptions.websiteType === 'fullstack' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="websiteType"
                        checked={budgetOptions.websiteType === 'fullstack'}
                        onChange={() => handleBudgetChange('websiteType', 'fullstack')}
                      />
                      <span className="radio-content">
                        <span className="radio-title">Full Stack</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Add-ons */}
                <div className="budget-group">
                  <h3><i className="fas fa-puzzle-piece"></i> Add-ons</h3>
                  <div className="budget-checkbox-group">
                    <label className={`budget-checkbox ${budgetOptions.customDomain ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={budgetOptions.customDomain}
                        onChange={(e) => handleBudgetChange('customDomain', e.target.checked)}
                      />
                      <span className="checkbox-content">
                        <i className="fas fa-globe"></i>
                        <span className="checkbox-title">Custom Domain</span>
                      </span>
                    </label>
                    <label className={`budget-checkbox ${budgetOptions.aiChat ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={budgetOptions.aiChat}
                        onChange={(e) => handleBudgetChange('aiChat', e.target.checked)}
                      />
                      <span className="checkbox-content">
                        <i className="fas fa-robot"></i>
                        <span className="checkbox-title">AI Chat Integration</span>
                      </span>
                    </label>
                    <label className={`budget-checkbox ${budgetOptions.seoOptimization ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={budgetOptions.seoOptimization}
                        onChange={(e) => handleBudgetChange('seoOptimization', e.target.checked)}
                      />
                      <span className="checkbox-content">
                        <i className="fas fa-search"></i>
                        <span className="checkbox-title">SEO Optimization</span>
                      </span>
                    </label>
                    <label className={`budget-checkbox ${budgetOptions.analyticsIntegration ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={budgetOptions.analyticsIntegration}
                        onChange={(e) => handleBudgetChange('analyticsIntegration', e.target.checked)}
                      />
                      <span className="checkbox-content">
                        <i className="fas fa-chart-line"></i>
                        <span className="checkbox-title">Analytics Integration</span>
                      </span>
                    </label>
                    <label className={`budget-checkbox ${budgetOptions.paymentGateway ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={budgetOptions.paymentGateway}
                        onChange={(e) => handleBudgetChange('paymentGateway', e.target.checked)}
                      />
                      <span className="checkbox-content">
                        <i className="fas fa-credit-card"></i>
                        <span className="checkbox-title">Payment Gateway</span>
                      </span>
                    </label>
                    <label className={`budget-checkbox ${budgetOptions.adminDashboard ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={budgetOptions.adminDashboard}
                        onChange={(e) => handleBudgetChange('adminDashboard', e.target.checked)}
                      />
                      <span className="checkbox-content">
                        <i className="fas fa-gauge-high"></i>
                        <span className="checkbox-title">Admin Dashboard</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Extra Pages */}
                <div className="budget-group">
                  <h3><i className="fas fa-file-alt"></i> Extra Pages</h3>
                  <p className="budget-note">4 pages included.</p>
                  <div className="budget-counter">
                    <button
                      className="counter-btn"
                      onClick={() => handleBudgetChange('extraPages', Math.max(0, budgetOptions.extraPages - 1))}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="counter-value">{budgetOptions.extraPages}</span>
                    <button
                      className="counter-btn"
                      onClick={() => handleBudgetChange('extraPages', budgetOptions.extraPages + 1)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                {/* Maintenance Package */}
                <div className="budget-group">
                  <h3><i className="fas fa-wrench"></i> Maintenance Package (Monthly)</h3>
                  <div className="budget-radio-group maintenance">
                    <label className={`budget-radio ${budgetOptions.maintenancePackage === 'basic' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="maintenance"
                        checked={budgetOptions.maintenancePackage === 'basic'}
                        onChange={() => handleBudgetChange('maintenancePackage', 'basic')}
                      />
                      <span className="radio-content">
                        <span className="radio-title">Basic</span>
                        <span className="radio-desc">Bug fixes & updates</span>
                        <span className="radio-price">₹999/mo</span>
                      </span>
                    </label>
                    <label className={`budget-radio ${budgetOptions.maintenancePackage === 'premium' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="maintenance"
                        checked={budgetOptions.maintenancePackage === 'premium'}
                        onChange={() => handleBudgetChange('maintenancePackage', 'premium')}
                      />
                      <span className="radio-content">
                        <span className="radio-title">Medium</span>
                        <span className="radio-desc">Priority support + features</span>
                        <span className="radio-price">₹1,999/mo</span>
                      </span>
                    </label>
                    <label className={`budget-radio ${budgetOptions.maintenancePackage === 'enterprise' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="maintenance"
                        checked={budgetOptions.maintenancePackage === 'enterprise'}
                        onChange={() => handleBudgetChange('maintenancePackage', 'enterprise')}
                      />
                      <span className="radio-content">
                        <span className="radio-title">Premium</span>
                        <span className="radio-desc">Bug fixes & updates + 24/7 support +Priority support + features+ content updates</span>
                        <span className="radio-price">₹3,999/mo</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Total Display */}
              <div className="budget-total">
                <div className="budget-summary">
                  <h3>Your Estimated Budget</h3>
                  <div className="total-amount">
                    <span className="currency">₹</span>
                    <span className="amount">{calculateBudget().toLocaleString('en-IN')}</span>
                    <span className="suffix">/-</span>
                  </div>
                  <p className="maintenance-note">
                    + ₹{budgetOptions.maintenancePackage === 'basic' ? '999' : budgetOptions.maintenancePackage === 'premium' ? '1,999' : '3,999'}/month maintenance
                  </p>
                  <div className="budget-includes">
                    <p><i className="fas fa-check"></i> Responsive Design</p>
                    <p><i className="fas fa-check"></i> Mobile Friendly</p>
                    <p><i className="fas fa-check"></i> 4 Pages Included</p>
                    <p><i className="fas fa-check"></i> Free Consultation</p>
                  </div>
                  <a href="#contact" className="btn primary btn-magnetic" onClick={(e) => scrollToSection(e, 'contact')}>
                    <span>Get Started</span>
                    <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="section">
          <div className="content">
            <div className="section-header center">
              <p className="eyebrow reveal"><i className="fas fa-envelope"></i> Get in Touch</p>
              <h2 className="display-md reveal delay-100">Let's Build <span className="text-gradient">Something Great</span></h2>
              <p className="section-desc reveal delay-200">Ready to transform your ideas into reality? Contact us today.</p>
            </div>

            <div className="commitment-section reveal delay-300">
              <h3 className="commitment-heading"><i className="fas fa-handshake"></i> Why Clients Trust Us</h3>
              <div className="commitment-cards">
                <div className="commitment-card">
                  <div className="commitment-icon"><i className="fas fa-heart"></i></div>
                  <p>Customer satisfaction is the cornerstone of everything we do — your success is our success.</p>
                </div>
                <div className="commitment-card">
                  <div className="commitment-icon"><i className="fas fa-comments"></i></div>
                  <p>We believe in transparent communication, keeping you informed and involved at every stage.</p>
                </div>
                <div className="commitment-card">
                  <div className="commitment-icon"><i className="fas fa-shield-alt"></i></div>
                  <p>Your vision deserves dedicated attention — we treat every project with care and precision.</p>
                </div>
                <div className="commitment-card">
                  <div className="commitment-icon"><i className="fas fa-rocket"></i></div>
                  <p>We go beyond delivery — offering long-term support to ensure your product thrives.</p>
                </div>
              </div>
            </div>

            <div className="contact-grid">
              <div className="contact-info reveal-left delay-100">
                <a href="mailto:harigajja10@gmail.com" className="contact-card">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-details">
                    <h4>Email</h4>
                    <p>harigajja10@gmail.com</p>
                  </div>
                </a>
                <a href="tel:+917331105294" className="contact-card">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="contact-details">
                    <h4>Phone</h4>
                    <p>+91 7331105294</p>
                  </div>
                </a>
                <a href="https://maps.google.com/?q=Vijayawada" target="_blank" rel="noopener noreferrer" className="contact-card">
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-details">
                    <h4>Location</h4>
                    <p>Vijayawada</p>
                  </div>
                </a>
                <a href="https://www.linkedin.com/in/gajja-hari-64a83237b/" target="_blank" rel="noopener noreferrer" className="contact-card">
                  <div className="contact-icon">
                    <i className="fab fa-linkedin-in"></i>
                  </div>
                  <div className="contact-details">
                    <h4>LinkedIn</h4>
                    <p>Hari-Gajja</p>
                  </div>
                </a>
                <a href="https://github.com/Hari-Gajja" target="_blank" rel="noopener noreferrer" className="contact-card">
                  <div className="contact-icon">
                    <i className="fab fa-github"></i>
                  </div>
                  <div className="contact-details">
                    <h4>GitHub</h4>
                    <p>Hari-Gajja</p>
                  </div>
                </a>
              </div>

              <form ref={formRef} className="contact-form reveal-right delay-200" onSubmit={handleSubmit}>
                <div className="form-header">
                  <h3>Request a Quote</h3>
                  <p>We'll get back to you within 24 hours</p>
                </div>
                {formStatus.success && (
                  <div className="form-message success">
                    <i className="fas fa-check-circle"></i> Message sent successfully! We'll get back to you soon.
                  </div>
                )}
                {formStatus.error && (
                  <div className="form-message error">
                    <i className="fas fa-exclamation-circle"></i> Failed to send. Please try again or email us directly.
                  </div>
                )}
                {formStatus.blocked && (
                  <div className="form-message error">
                    <i className="fas fa-ban"></i> This email or phone number is not allowed. Please use a different one.
                  </div>
                )}
                {formStatus.invalid && (
                  <div className="form-message error">
                    <i className="fas fa-exclamation-triangle"></i> Please enter a valid email address (e.g. name@example.com).
                  </div>
                )}
                <div className="field">
                  <label htmlFor="name"><i className="fas fa-user"></i> Your Name</label>
                  <input type="text" id="name" name="from_name" placeholder="Enter your name" required defaultValue={user?.name || ''} readOnly={!!user} className={user ? 'field-locked' : ''} />
                </div>
                <div className="field">
                  <label htmlFor="email"><i className="fas fa-at"></i> Your Email</label>
                  <input type="email" id="email" name="from_email" placeholder="Enter your email" required defaultValue={user?.email || ''} readOnly={!!user} className={user ? 'field-locked' : ''} />
                </div>
                <div className="field">
                  <label htmlFor="phone"><i className="fas fa-phone"></i> Phone Number</label>
                  <input type="tel" id="phone" name="from_phone" placeholder="Enter your phone number" required />
                </div>
                <div className="field">
                  <label htmlFor="message"><i className="fas fa-comment-dots"></i> Project Details</label>
                  <textarea id="message" name="message" placeholder="Tell us about your project..." required></textarea>
                </div>
                <button type="submit" className="btn primary full btn-magnetic" disabled={formStatus.loading}>
                  <i className={formStatus.loading ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"}></i>
                  {formStatus.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-circle small">
              <span className="logo-letter">H</span>
            </span>
            <span className="mono">HPCH TECH</span>
          </div>
          <p>Crafted with <i className="fas fa-heart"></i> in 2026</p>
          <div className="footer-links">
            <a href="https://github.com/Hari-Gajja" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fab fa-github"></i></a>
            <a href="https://www.linkedin.com/in/gajja-hari-64a83237b/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            <a href="mailto:harigajja10@gmail.com" aria-label="Email"><i className="fas fa-envelope"></i></a>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button 
        className={`back-to-top ${backToTopVisible ? 'visible' : ''}`} 
        aria-label="Back to top"
        onClick={scrollToTop}
      >
        <i className="fas fa-arrow-up"></i>
      </button>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
    </>
  )
}

export default App
