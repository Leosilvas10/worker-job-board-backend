import React from 'react'
import { useRouter } from 'next/router'

const AdminHeader = ({ title }) => {
  const router = useRouter()

  const navigateToHome = () => {
    router.push('/')
  }

  return (
    <header className="bg-slate-800 shadow-sm border-b border-slate-700">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-slate-400 text-sm mt-1">
                Painel Administrativo - Site do Trabalhador
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={navigateToHome}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">🏠</span>
              Ver Site
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
