import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Credenciais padrão fixas
      const defaultCredentials = {
        username: 'admin',
        password: 'admin123'
      }

      // Verificar credenciais
      if (credentials.username === defaultCredentials.username && 
          credentials.password === defaultCredentials.password) {

        // Criar dados da sessão
        const sessionData = {
          name: 'Administrador',
          username: 'admin',
          email: 'admin@sitedotrabalhador.com.br',
          role: 'super_admin',
          loginTime: new Date().toISOString(),
          authenticated: true
        }

        // Salvar no localStorage
        localStorage.setItem('admin_token', 'admin_authenticated')
        localStorage.setItem('admin_user', JSON.stringify(sessionData))

        console.log('Login realizado com sucesso!')

        // Pequeno delay para garantir que o localStorage foi salvo
        setTimeout(() => {
          router.push('/admin')
        }, 100)

      } else {
        setError('Credenciais inválidas. Use: admin / admin123')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro interno. Tente novamente.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-govgray-50">
      <Head>
        <title>Login Admin - Site do Trabalhador</title>
      </Head>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-govblue-700">Login Administrativo</h1>
        <div className="mb-4">
          <label className="block text-govgray-700 mb-2">Usuário</label>
          <input
            type="text"
            className="w-full border border-govgray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-govblue-500"
            value={credentials.username}
            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-govgray-700 mb-2">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full border border-govgray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-govblue-500"
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-govgray-400 hover:text-govblue-600"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <button
          type="submit"
          className="w-full bg-govblue-600 text-white py-2 rounded-lg font-semibold hover:bg-govblue-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
