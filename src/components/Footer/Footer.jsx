import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const Footer = () => {
  const router = useRouter()

  const scrollToSection = (sectionId) => {
    if (router.pathname === '/') {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(`/#${sectionId}`)
    }
  }

  const scrollToTop = () => {
    if (router.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push('/')
    }
  }

  return (
    <footer className="header-blue border-t-4 border-govyellow-400">
      <div className="container mx-auto px-4 py-8">
        {/* Links principais - Melhor responsividade */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8 mb-8">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 lg:gap-8">
            <button 
              onClick={scrollToTop}
              className="text-white hover:text-govyellow-400 transition-colors duration-200 font-medium text-lg hover:scale-105 transform transition-transform"
            >
              🏠 Início
            </button>
            <Link href="/vagas">
              <button className="text-white hover:text-govyellow-400 transition-colors duration-200 font-medium text-lg hover:scale-105 transform transition-transform">
                💼 Vagas
              </button>
            </Link>
            <Link href="/calculadora">
              <button className="text-white hover:text-govyellow-400 transition-colors duration-200 font-medium text-lg hover:scale-105 transform transition-transform">
                🧮 Calculadora
              </button>
            </Link>
            <Link href="/contato">
              <button className="text-white hover:text-govyellow-400 transition-colors duration-200 font-medium text-lg hover:scale-105 transform transition-transform">
                📞 Contato
              </button>
            </Link>
            <Link href="/empresas">
              <button className="text-white hover:text-govgreen-400 transition-colors duration-200 font-medium text-lg hover:scale-105 transform transition-transform border-l border-white/30 pl-4 lg:pl-8">
                🏢 Para Empresas
              </button>
            </Link>
          </div>
        </div>
        
        {/* Divisor visual */}
        <div className="border-t border-white/20 mb-6"></div>
        
        {/* Links de Políticas - Melhor organização mobile */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8 text-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link href="/politica-privacidade">
              <button className="text-blue-200 hover:text-white transition-colors duration-200 hover:underline">
                🔒 Política de Privacidade
              </button>
            </Link>
            <Link href="/termos-uso">
              <button className="text-blue-200 hover:text-white transition-colors duration-200 hover:underline">
                📋 Termos de Uso
              </button>
            </Link>
            <Link href="/lgpd">
              <button className="text-blue-200 hover:text-white transition-colors duration-200 hover:underline">
                🛡️ LGPD
              </button>
            </Link>
          </div>
        </div>
        
        {/* Informações de contato rápido */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6">
          <a 
            href="https://wa.me/5511999999999?text=Olá! Vim do Site do Trabalhador e gostaria de falar sobre direitos trabalhistas."
            target="_blank"
            rel="noopener noreferrer"
            className="text-govgreen-400 hover:text-govgreen-300 transition-colors duration-200 font-medium flex items-center gap-2"
          >
            <span>💬</span>
            <span className="hidden sm:inline">WhatsApp:</span>
            <span>(11) 99999-9999</span>
          </a>
          <a 
            href="mailto:contato@sitedotrabalhador.com.br"
            className="text-govyellow-400 hover:text-govyellow-300 transition-colors duration-200 font-medium flex items-center gap-2"
          >
            <span>📧</span>
            <span className="hidden sm:inline">E-mail:</span>
            <span>contato@sitedotrabalhador.com.br</span>
          </a>
        </div>
        
        {/* Copyright - Aprimorado */}
        <div className="text-center border-t border-white/20 pt-6">
          <p className="text-white font-medium mb-3 text-lg">
            © {new Date().getFullYear()} Site do Trabalhador
          </p>
          <p className="text-blue-200 text-sm leading-relaxed mb-2">
            Conectando trabalhadores a oportunidades e direitos em todo o Brasil
          </p>
          <p className="text-blue-300 text-xs opacity-80">
            Todos os direitos reservados. Desenvolvido com ❤️ para o trabalhador brasileiro.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
