import React from 'react';

const JobCard = ({ job, onApplyClick }) => {
  // Verificações de segurança
  const title = job?.title || 'Título não informado';
  const company = job?.company || {};
  const companyName = company.name || 'Empresa não informada';
  const location = job?.location || 'Local não informado';
  const salary = job?.salary || 'Salário a combinar';
  const type = job?.type || 'Tipo não informado';
  const description = job?.description || 'Descrição não disponível';
  const tags = job?.tags || '';
  const source = job?.source || 'Fonte não informada';
  const timeAgo = job?.timeAgo || 'Recente';

  // Função para ocultar cidade específica e mostrar apenas região/estado
  const getHiddenLocation = (fullLocation) => {
    if (!fullLocation || fullLocation === 'Local não informado') {
      return 'Brasil';
    }
    
    // Extrair apenas o estado (parte depois da vírgula)
    const parts = fullLocation.split(',');
    if (parts.length > 1) {
      const state = parts[parts.length - 1].trim();
      return `${state} - Brasil`;
    }
    
    return 'Brasil';
  };

  const hiddenLocation = getHiddenLocation(location);

  return (
    <div className="job-card bg-white border border-govgray-200 rounded-lg p-6 hover:bg-govgray-50 transition-all duration-200 hover:border-govblue-600 hover:shadow-lg">
      {/* Cabeçalho com logo e informações da empresa - Estilo Gov.br */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-govblue-600 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">
            {companyName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-govblue-800 mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-govgray-600 text-sm mb-1 font-medium">{companyName}</p>
          <div className="flex items-center gap-3 text-xs text-govgray-500 font-medium">
            <span>⏰ {timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Informações de salário e tipo - Estilo Gov.br */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-govgreen-100 text-govgreen-700 text-sm rounded border border-govgreen-300 font-medium">
          💰 {salary}
        </span>
        <span className="px-3 py-1 bg-govblue-100 text-govblue-700 text-sm rounded border border-govblue-300 font-medium">
          ⏰ {type}
        </span>
      </div>

      {/* Descrição */}
      <div className="mb-4">
        <p className="text-govgray-700 text-sm line-clamp-3">
          {description}
        </p>
      </div>

      {/* Tags - Estilo Gov.br */}
      {tags && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(tags) ? tags : tags.split(',')).slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-govgray-100 text-govgray-600 text-xs rounded border border-govgray-300"
              >
                {typeof tag === 'string' ? tag.trim() : tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé com botão - Estilo Gov.br */}
      <div className="border-t border-govgray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
            📅 Recente
          </span>
          <span className="text-xs text-govgreen-600 font-bold">
            ✅ Verificada
          </span>
        </div>

        {/* Botão de candidatura - Estilo Gov.br */}
        <button
          onClick={onApplyClick}
          className="w-full bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold py-3 px-4 rounded transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          <span>Quero me candidatar</span>
          <span>🔗</span>
        </button>
      </div>
    </div>
  );
};

export default JobCard;
