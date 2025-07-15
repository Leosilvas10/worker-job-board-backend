import React from 'react'

const CrudTable = ({ 
  data = [], 
  columns = [], 
  onEdit, 
  onDelete, 
  onView,
  actions = ['view', 'edit', 'delete'],
  loading = false,
  emptyMessage = "Nenhum registro encontrado"
}) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Carregando dados...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum registro encontrado</h3>
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-700/50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-4">
                    {column.render ? (
                      column.render(item[column.key], item, index)
                    ) : (
                      <span className="text-white text-sm">
                        {item[column.key] || '-'}
                      </span>
                    )}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="p-4 space-x-2">
                    {actions.includes('view') && (
                      <button onClick={() => onView && onView(item)} className="text-blue-400 hover:underline">Ver</button>
                    )}
                    {actions.includes('edit') && (
                      <button onClick={() => onEdit && onEdit(item)} className="text-yellow-400 hover:underline">Editar</button>
                    )}
                    {actions.includes('delete') && (
                      <button onClick={() => onDelete && onDelete(item)} className="text-red-400 hover:underline">Excluir</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CrudTable
