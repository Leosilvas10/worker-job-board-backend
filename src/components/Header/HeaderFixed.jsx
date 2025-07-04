import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSiteContext } from '../../contexts/SiteContext'

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
  }

  // ...restante do componente HeaderFixed...

  return (
    <header>
      {/* Header visual e navegação fixa aqui */}
    </header>
  )
}

export default Header
