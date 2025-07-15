import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../../src/components/Admin/AdminLayout'

export default function NovaVaga() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    category: 'Technology',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    applicationUrl: '',
    email: '',
    featured: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simular salvamento
    setTimeout(() => {
      alert('Vaga criada com sucesso!')
      router.push('/admin/vagas')
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <>
      <Head>
        <title>Nova Vaga - Admin</title>
      </Head>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white mr-4"
            >
              ← Voltar
            </button>
            <h1 className="text-3xl font-bold text-white">Nova Vaga</h1>
          </div>
          {/* ...restante do formulário de nova vaga... */}
        </div>
      </AdminLayout>
    </>
  )
}
