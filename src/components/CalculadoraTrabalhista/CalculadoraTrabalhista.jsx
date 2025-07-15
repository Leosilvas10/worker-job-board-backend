import { useState, useEffect } from 'react'

const CalculadoraTrabalhista = ({ selectedCalculator, onCalculate }) => {
  const [activeCalc, setActiveCalc] = useState(selectedCalculator || 'rescisao')
  const [results, setResults] = useState({})

  const calculadoras = [
    { 
      id: 'rescisao', 
      icon: '💰', 
      name: 'Rescisão de Contrato', 
      desc: 'Calcule verbas rescisórias' 
    },
    { 
      id: 'ferias', 
      icon: '🏖️', 
      name: 'Férias', 
      desc: 'Valor de férias e terço constitucional' 
    },
    { 
      id: 'horasextras', 
      icon: '⏰', 
      name: 'Horas Extras', 
      desc: 'Cálculo de horas extras' 
    },
    { 
      id: 'adicionalnoturno', 
      icon: '🌙', 
      name: 'Adicional Noturno', 
      desc: 'Valor do trabalho noturno' 
    },
    { 
      id: 'salarioliquido', 
      icon: '📊', 
      name: 'Salário Líquido', 
      desc: 'Descontos e valor líquido' 
    }
  ]

  const calcularRescisao = (dados) => {
    const salario = parseFloat(dados.salario) || 0
    const meses = parseInt(dados.meses) || 0
    const tipo = dados.tipo

    let resultado = {
      saldoSalario: salario,
      aviso13: salario,
      fgts: salario * meses * 0.08,
      multaFgts: 0,
      ferias: salario * (meses / 12),
      tercoFerias: (salario * (meses / 12)) / 3,
      total: 0
    }

    if (tipo === 'demissao-sem-justa-causa') {
      resultado.multaFgts = resultado.fgts * 0.4
    }

    resultado.total = Object.values(resultado).reduce((sum, val) => sum + val, 0) - resultado.total

    return resultado
  }

  const calcularFerias = (dados) => {
    const salario = parseFloat(dados.salario) || 0
    const dias = parseInt(dados.diasTrabalhados) || 0

    const feriasProporcionais = (salario / 12) * (dias / 30)
    const tercoConstitucional = feriasProporcionais / 3

    return {
      feriasProporcionais,
      tercoConstitucional,
      total: feriasProporcionais + tercoConstitucional
    }
  }

  const calcularHorasExtras = (dados) => {
    const salarioHora = parseFloat(dados.salarioHora) || 0
    const horasExtras = parseInt(dados.horasExtras) || 0
    const percentual = parseFloat(dados.percentual) || 50

    const valorHoraExtra = salarioHora * (1 + percentual / 100)
    const total = valorHoraExtra * horasExtras

    return {
      valorHoraExtra,
      total
    }
  }

  const calcularAdicionalNoturno = (dados) => {
    const salarioHora = parseFloat(dados.salarioHora) || 0
    const horasNoturnas = parseInt(dados.horasNoturnas) || 0

    const adicional = salarioHora * 0.2 // 20% de adicional noturno
    const total = adicional * horasNoturnas

    return {
      adicionalPorHora: adicional,
      total
    }
  }

  const calcularSalarioLiquido = (dados) => {
    const salarioBruto = parseFloat(dados.salarioBruto) || 0
    const dependentes = parseInt(dados.dependentes) || 0

    // Cálculos simplificados
    const inss = Math.min(salarioBruto * 0.14, 908.85) // Teto INSS 2024
    const irrf = salarioBruto > 2259.20 ? (salarioBruto - 2259.20) * 0.075 : 0
    const valeTransporte = dados.valeTransporte ? salarioBruto * 0.06 : 0

    const salarioLiquido = salarioBruto - inss - irrf - valeTransporte

    return {
      salarioBruto,
      inss,
      irrf,
      valeTransporte,
      salarioLiquido
    }
  }

  // Atualizar calculadora ativa quando selectedCalculator mudar
  useEffect(() => {
    if (selectedCalculator) {
      setActiveCalc(selectedCalculator)
    }
  }, [selectedCalculator])

  // Função para processar formulário
  const processFormCalculate = (calcType, e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    
    let result
    switch (calcType) {
      case 'rescisao':
        result = calcularRescisao(data)
        break
      case 'ferias':
        result = calcularFerias(data)
        break
      case 'horasextras':
        result = calcularHorasExtras(data)
        break
      case 'adicionalnoturno':
        result = calcularAdicionalNoturno(data)
        break
      case 'salarioliquido':
        result = calcularSalarioLiquido(data)
        break
      default:
        return
    }
    
    handleCalculate(calcType, result)
  }

  const handleCalculate = (calcType, result) => {
    setResults(prev => ({
      ...prev,
      [calcType]: result
    }))
    
    // Chamar callback da página pai se fornecido
    if (onCalculate) {
      onCalculate(result)
    }
  }

  const renderForm = () => {
    switch (activeCalc) {
      case 'rescisao':
        return (
          <form onSubmit={(e) => processFormCalculate('rescisao', e)} className="space-y-4">
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Salário Bruto (R$)</label>
              <input 
                type="number" 
                name="salario"
                step="0.01"
                className="form-input w-full" 
                placeholder="3.000,00" 
                required 
              />
            </div>
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Tempo de Trabalho (meses)</label>
              <input 
                type="number" 
                name="meses"
                className="form-input w-full" 
                placeholder="24" 
                required 
              />
            </div>
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Tipo de Rescisão</label>
              <select name="tipo" className="form-input w-full" required>
                <option value="demissao-sem-justa-causa">Demissão sem justa causa</option>
                <option value="pedido-demissao">Pedido de demissão</option>
                <option value="demissao-justa-causa">Demissão por justa causa</option>
                <option value="termino-contrato">Término de contrato</option>
              </select>
            </div>
            <div className="text-sm text-govblue-700 bg-govblue-50 p-3 rounded border border-govblue-200">
              💡 Inclui aviso prévio, férias proporcionais, 13º proporcional e FGTS
            </div>
            <button type="submit" className="w-full bg-govblue-600 hover:bg-govblue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md">
              🧮 Calcular Rescisão
            </button>
          </form>
        )

      case 'ferias':
        return (
          <form onSubmit={(e) => processFormCalculate('ferias', e)} className="space-y-4">
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Salário Mensal (R$)</label>
              <input 
                type="number" 
                name="salario"
                step="0.01"
                className="form-input w-full" 
                placeholder="3.000,00" 
                required 
              />
            </div>
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Dias Trabalhados no Período</label>
              <input 
                type="number" 
                name="diasTrabalhados"
                className="form-input w-full" 
                placeholder="365" 
                required 
              />
            </div>
            <div className="text-sm text-govblue-700 bg-govblue-50 p-3 rounded border border-govblue-200">
              💡 Férias = Salário + 1/3 constitucional proporcional aos dias trabalhados
            </div>
            <button type="submit" className="w-full bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md">
              🏖️ Calcular Férias
            </button>
          </form>
        )

      case 'horasextras':
        return (
          <form onSubmit={(e) => processFormCalculate('horasextras', e)} className="space-y-4">
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Valor Hora Normal (R$)</label>
              <input 
                type="number" 
                name="salarioHora"
                step="0.01"
                className="form-input w-full" 
                placeholder="15,00" 
                required 
              />
            </div>
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Quantidade de Horas Extras</label>
              <input 
                type="number" 
                name="horasExtras"
                className="form-input w-full" 
                placeholder="20" 
                required 
              />
            </div>
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Percentual de Adicional (%)</label>
              <select name="percentual" className="form-input w-full" required>
                <option value="50">50% (dias úteis)</option>
                <option value="100">100% (domingos e feriados)</option>
              </select>
            </div>
            <div className="text-sm text-govblue-700 bg-govblue-50 p-3 rounded border border-govblue-200">
              💡 Horas extras devem ser pagas com adicional mínimo de 50% sobre a hora normal
            </div>
            <button type="submit" className="w-full bg-govyellow-500 hover:bg-govyellow-600 text-govblue-800 font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md">
              ⏰ Calcular Horas Extras
            </button>
          </form>
        )

      case 'adicionalnoturno':
        return (
          <form onSubmit={(e) => processFormCalculate('adicionalnoturno', e)} className="space-y-4">
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Valor Hora Normal (R$)</label>
              <input 
                type="number" 
                name="salarioHora"
                step="0.01"
                className="form-input w-full" 
                placeholder="15,00" 
                required 
              />
            </div>
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Horas Noturnas Trabalhadas</label>
              <input 
                type="number" 
                name="horasNoturnas"
                className="form-input w-full" 
                placeholder="40" 
                required 
              />
            </div>
            <div className="text-sm text-govblue-700 bg-govblue-50 p-3 rounded border border-govblue-200">
              💡 Adicional noturno: 20% sobre o valor da hora normal (22h às 5h)
            </div>
            <button type="submit" className="w-full bg-govpurple-600 hover:bg-govpurple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md">
              🌙 Calcular Adicional Noturno
            </button>
          </form>
        )

      case 'salarioliquido':
        return (
          <form onSubmit={(e) => processFormCalculate('salarioliquido', e)} className="space-y-4">
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Salário Bruto (R$)</label>
              <input 
                type="number" 
                name="salarioBruto"
                step="0.01"
                className="form-input w-full" 
                placeholder="3.000,00" 
                required 
              />
            </div>
            <div>
              <label className="block text-govblue-800 mb-2 font-medium">Número de Dependentes</label>
              <input 
                type="number" 
                name="dependentes"
                className="form-input w-full" 
                placeholder="0" 
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                name="valeTransporte"
                id="valeTransporte"
                className="form-checkbox text-govblue-600 focus:ring-govblue-500"
              />
              <label htmlFor="valeTransporte" className="text-govblue-800 font-medium">Desconta Vale Transporte (6%)</label>
            </div>
            <div className="text-sm text-govblue-700 bg-govblue-50 p-3 rounded border border-govblue-200">
              💡 Cálculo baseado nas alíquotas de INSS e IRRF vigentes em 2025
            </div>
            <button type="submit" className="w-full bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md">
              📊 Calcular Salário Líquido
            </button>
          </form>
        )

      default:
        return null
    }
  }

  const renderResults = () => {
    const result = results[activeCalc]
    if (!result) return null

    return (
      <div className="mt-6 p-4 bg-govgreen-50 border-2 border-govgreen-600 rounded-lg">
        <h4 className="text-govgreen-700 font-bold mb-3">✅ Resultado do Cálculo</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-govblue-700 capitalize font-medium">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
              </span>
              <span className="text-govblue-800 font-bold">
                R$ {typeof value === 'number' ? value.toFixed(2) : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Formulário da Calculadora Ativa */}
      <div>
        {renderForm()}
        {renderResults()}
      </div>
    </div>
  )
}

export default CalculadoraTrabalhista
