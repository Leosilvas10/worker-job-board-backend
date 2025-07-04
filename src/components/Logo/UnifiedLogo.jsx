import React from 'react'

const UnifiedLogo = ({ className = "", onClick, ...props }) => {
  return (
    <div 
      className={`flex items-center cursor-pointer ${className}`} 
      onClick={onClick}
      {...props}
    >
      <img 
        src="/logo.png" 
        alt="Site do Trabalhador" 
        className="h-24 md:h-32 w-auto max-w-[420px] md:max-w-[520px] object-contain transition-all duration-200 hover:scale-105"
        style={{maxHeight:'120px',height:'100%',objectFit:'contain'}}
        onError={(e) => {
          // Fallback para texto se a imagem não carregar
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'block'
        }}
      />
      <h1 
        className="text-2xl font-bold text-white hidden"
        style={{ display: 'none' }}
      >
        Site do Trabalhador
      </h1>
    </div>
  )
}

export default UnifiedLogo
