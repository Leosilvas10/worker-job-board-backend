import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import AdminLayout from '../../../src/components/Admin/AdminLayout'

export default function AdminLandingPages() {
  const [landingPages, setLandingPages] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pagesRes, leadsRes] = await Promise.all([
        fetch('/api/landing-pages'),
        fetch('/api/landing-leads')
      ])
      
      const pagesData = await pagesRes.json()
      const leadsData = await leadsRes.json()
      
      if (pagesData.success) setLandingPages(pagesData.data)
      if (leadsData.success) setLeads(leadsData.data)
      
      // Calcular estatísticas
      const statsData = {}
      if (pagesData.success) {
        pagesData.data.forEach(page => {
          const pageLeads = leadsData.success ? leadsData.data.filter(lead => lead.landingSlug === page.slug) : []
          statsData[page.slug] = {
            totalLeads: pageLeads.length,
            leadsHoje: pageLeads.filter(lead => {
              const hoje = new Date().toDateString()
              const leadDate = new Date(lead.criadoEm).toDateString()
              return hoje === leadDate
            }).length,
            ultimoLead: pageLeads.length > 0 ? pageLeads[pageLeads.length - 1].criadoEm : null
          }
        })
      }
      setStats(statsData)
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePage = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta landing page?')) return
    
    try {
      const response = await fetch(`/api/landing-pages?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Landing Pages - Admin</title>
      </Head>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Landing Pages
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Gerencie suas landing pages e acompanhe os leads
                  </p>
                </div>
                <Link
                  href="/admin/landing-pages/nova"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nova Landing Page
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {landingPages.length}
              </div>
              <div className="text-sm text-gray-600">Landing Pages</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {leads.length}
              </div>
              <div className="text-sm text-gray-600">Total de Leads</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {leads.filter(lead => {
                  const hoje = new Date().toDateString()
                  const leadDate = new Date(lead.criadoEm).toDateString()
                  return hoje === leadDate
                }).length}
              </div>
              <div className="text-sm text-gray-600">Leads Hoje</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {leads.filter(lead => {
                  const semana = new Date()
                  semana.setDate(semana.getDate() - 7)
                  return new Date(lead.criadoEm) >= semana
                }).length}
              </div>
              <div className="text-sm text-gray-600">Leads 7 dias</div>
            </div>
          </div>

          {/* Lista de Landing Pages */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">
                Suas Landing Pages
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {landingPages.map((page) => (
                <div key={page.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {page.titulo}
                          </h3>
                          <p className="text-sm text-gray-500">
                            /{page.slug}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {page.subtitulo}
                          </p>
                        </div>
                        
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          page.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {page.ativo ? 'Ativa' : 'Inativa'}
                        </div>
                      </div>
                      
                      {/* Stats da página */}
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-blue-600">
                            {stats[page.slug]?.totalLeads || 0}
                          </div>
                          <div className="text-xs text-gray-600">Total Leads</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-green-600">
                            {stats[page.slug]?.leadsHoje || 0}
                          </div>
                          <div className="text-xs text-gray-600">Hoje</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600">Último Lead</div>
                          <div className="text-sm font-medium">
                            {stats[page.slug]?.ultimoLead
                              ? new Date(stats[page.slug].ultimoLead).toLocaleDateString()
                              : 'Nenhum'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-6">
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors text-center"
                      >
                        Ver Página
                      </a>
                      <Link
                        href={`/admin/landing-pages/editar/${page.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors text-center"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/admin/landing-pages/leads/${page.slug}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors text-center"
                      >
                        Ver Leads
                      </Link>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leads Recentes */}
          {leads.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">
                  Últimos Leads (10 mais recentes)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-mail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Landing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads
                      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
                      .slice(0, 10)
                      .map((lead) => (
                        <tr key={lead.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {lead.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.telefone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {lead.landingSlug}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
