import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSiteContext } from '../../contexts/SiteContext'
import UnifiedLogo from '../Logo/UnifiedLogo'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const { siteConfig } = useSiteContext()
  const router = useRouter()

  // Verificar se está na página inicial
  const isHomePage = router.pathname === '/'

  // Debug: Log das configurações do site
  useEffect(() => {
    console.log('Header - siteConfig atual:', siteConfig)
    console.log('Header - logoUrl:', siteConfig.logoUrl)
    console.log('Header - isHomePage:', isHomePage)
  }, [siteConfig, isHomePage])

  useEffect(() => {
    // Verificar se há usuário logado
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setIsMobileMenuOpen(false)
  }

  const scrollToSection = (sectionId) => {
    if (isHomePage) {
      // Se está na página inicial, faz scroll suave
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Se está em outra página, redireciona para home com âncora
      router.push(`/#${sectionId}`)
    }
    setIsMobileMenuOpen(false)
  }

  const scrollToTop = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push('/')
    }
    setIsMobileMenuOpen(false)
  }

  const goToHome = () => {
    router.push('/')
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.8)); }
        }

        .logo-container {
          animation: floating 3s ease-in-out infinite;
        }

        .logo-container:hover {
          animation: floating 1s ease-in-out infinite, glow 2s ease-in-out infinite;
        }

        .shimmer-effect {
          animation: shimmer 3s infinite;
        }
      `}</style>
      <header className="header-blue shadow-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Logo Unificada - Estilo Gov.br simples e destacada */}
            <UnifiedLogo 
              onClick={scrollToTop}
              className="transform hover:scale-105 transition-all duration-300"
            />

            {/* Desktop Navigation - Estilo Gov.br - SEMPRE VISÍVEL */}
            <nav className="hidden md:flex space-x-6">
              <button onClick={() => router.push('/')} className="text-white hover:text-govyellow-400 font-medium transition-colors duration-200 px-3 py-2 border-b-2 border-transparent hover:border-govyellow-400">
                Início
              </button>
              <button onClick={() => router.push('/vagas')} className="text-white hover:text-govyellow-400 font-medium transition-colors duration-200 px-3 py-2 border-b-2 border-transparent hover:border-govyellow-400">
                Vagas
              </button>
              <button onClick={() => router.push('/calculadora')} className="text-white hover:text-govyellow-400 font-medium transition-colors duration-200 px-3 py-2 border-b-2 border-transparent hover:border-govyellow-400">
                Calculadora Trabalhista
              </button>
              <button onClick={() => router.push('/contato')} className="text-white hover:text-govyellow-400 font-medium transition-colors duration-200 px-3 py-2 border-b-2 border-transparent hover:border-govyellow-400">
                Contato
              </button>
            </nav>

            {/* Desktop Auth Buttons - SEMPRE VISÍVEL */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => router.push('/empresas')}
                className="px-6 py-2 bg-govgreen-600 text-white rounded font-medium transition-all duration-200 hover:bg-govgreen-700 shadow-md"
              >
                Para Empresas
              </button>
            </div>

            {/* Mobile menu button - Estilo Gov.br */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded text-white hover:text-govyellow-400 hover:bg-govblue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-govyellow-400"
              >
                <span className="sr-only">Abrir menu principal</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Estilo Gov.br - SEMPRE VISÍVEL */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="header-blue-mobile px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => router.push('/')} className="block w-full text-left px-3 py-2 text-white hover:text-govyellow-400 font-medium hover:bg-govblue-800 rounded">
                Início
              </button>
              <button onClick={() => router.push('/vagas')} className="block w-full text-left px-3 py-2 text-white hover:text-govyellow-400 font-medium hover:bg-govblue-800 rounded">
                Vagas
              </button>
              <button onClick={() => router.push('/calculadora')} className="block w-full text-left px-3 py-2 text-white hover:text-govyellow-400 font-medium hover:bg-govblue-800 rounded">
                Calculadora Trabalhista
              </button>
              <button onClick={() => router.push('/contato')} className="block w-full text-left px-3 py-2 text-white hover:text-govyellow-400 font-medium hover:bg-govblue-800 rounded">
                Contato
              </button>
              <button onClick={() => router.push('/empresas')} className="block w-full text-left px-3 py-2 text-govgreen-400 hover:text-govgreen-300 font-medium hover:bg-govblue-800 rounded">
                Para Empresas
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header