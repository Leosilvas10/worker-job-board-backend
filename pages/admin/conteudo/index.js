import { useState, useEffect } from 'react'
import AdminLayout from '../../../src/components/Admin/AdminLayout'
import { useSiteContext } from '../../../src/contexts/SiteContext'

const ConteudoAdmin = () => {
  const { siteConfig, updateSiteConfig, uploadLogo } = useSiteContext()
  
  const [conteudo, setConteudo] = useState({
    heroTitulo: 'Encontre sua próxima oportunidade',
    heroSubtitulo: 'Conectamos trabalhadores a empresas em todo o Brasil',
    sobreTitulo: 'Sobre o Site do Trabalhador',
    sobreTexto: 'Plataforma dedicada a conectar trabalhadores e empresas.',
    contatoEmail: 'contato@sitedotrabalhador.com.br',
    contatoTelefone: '(11) 99999-9999',
    logoUrl: '/lodo.png' // Nova logo sem fundo
  })

  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Sincronizar com o contexto
  useEffect(() => {
    if (siteConfig) {
      setConteudo(prev => ({ ...prev, ...siteConfig }))
    }
  }, [siteConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload da nova logo se selecionada
      if (logoFile) {
        console.log('Fazendo upload da logo:', logoFile.name)
        const logoUrl = await uploadLogo(logoFile)
        console.log('Logo uploaded com sucesso:', logoUrl)
      }
      
      // Atualizar outras configurações
      updateSiteConfig(conteudo)
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Conteúdo atualizado com sucesso!')
      setTimeout(() => setMessage(''), 3000)
      
      // Limpar preview
      setLogoFile(null)
      setLogoPreview(null)
      const fileInput = document.getElementById('logo-upload')
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error)
      setMessage('Erro ao atualizar conteúdo')
    }
    setLoading(false)
  }

  return (
    <AdminLayout>
      {/* ...restante do componente de conteúdo... */}
    </AdminLayout>
  )
}

export default ConteudoAdmin
