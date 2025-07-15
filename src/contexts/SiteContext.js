import React, { createContext, useContext, useState, useEffect } from 'react'

const SiteContext = createContext()

export const useSiteContext = () => {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSiteContext deve ser usado dentro de um SiteProvider')
  }
  return context
}

export const SiteProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState({
    logoUrl: `/site do trabalhador.png?v=${Date.now() + Math.random()}`,
    heroTitulo: 'Encontre sua próxima oportunidade',
    heroSubtitulo: 'Conectamos trabalhadores a empresas em todo o Brasil',
    sobreTitulo: 'Sobre o Site do Trabalhador',
    sobreTexto: 'Plataforma dedicada a conectar trabalhadores e empresas.',
    contatoEmail: 'contato@sitedotrabalhador.com.br',
    contatoTelefone: '(11) 99999-9999'
  })

  useEffect(() => {
    const currentTime = Date.now()
    const lastLogoUpdate = localStorage.getItem('logo_update_time')
    if (!lastLogoUpdate || (currentTime - parseInt(lastLogoUpdate)) > 10000) {
      console.log('🔄 Limpando cache do logo e carregando nova imagem...')
      localStorage.removeItem('site_config')
      localStorage.setItem('logo_update_time', currentTime.toString())
    }
    const savedConfig = localStorage.getItem('site_config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setSiteConfig(prev => ({ ...prev, ...config }))
      } catch (error) {
        console.error('Erro ao carregar configurações do site:', error)
        localStorage.removeItem('site_config')
      }
    }
  }, [])

  // Carregar configurações ao iniciar - uma única vez
  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const timestamp = Date.now() + Math.random()

        const configs = {
          logoUrl: `/site do trabalhador.png?v=${timestamp}`,
          heroTitulo: 'Encontre sua próxima oportunidade',
          heroSubtitulo: 'Conectamos trabalhadores a empresas em todo o Brasil',
          sobreTitulo: 'Sobre o Site do Trabalhador',
          sobreTexto: 'Plataforma dedicada a conectar trabalhadores e empresas.',
          contatoEmail: 'contato@sitedotrabalhador.com.br',
          contatoTelefone: '(11) 99999-9999'
        }

        setSiteConfig(configs)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }

    // Carregar apenas uma vez
    if (!siteConfig.logoUrl) {
      loadSiteConfig()
    }
  }, [siteConfig.logoUrl])

  const updateSiteConfig = (newConfig) => {
    const updatedConfig = { ...siteConfig, ...newConfig }
    setSiteConfig(updatedConfig)
    localStorage.setItem('site_config', JSON.stringify(updatedConfig))
  }

  const uploadLogo = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Simular upload e atualizar logoUrl
        const url = e.target.result
        updateSiteConfig({ logoUrl: url })
        resolve(url)
      }
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  }

  return (
    <SiteContext.Provider value={{ siteConfig, updateSiteConfig, uploadLogo }}>
      {children}
    </SiteContext.Provider>
  )
}