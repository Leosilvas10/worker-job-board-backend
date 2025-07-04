import React from 'react'

const CrudForm = ({ 
  fields = [], 
  data = {}, 
  onChange, 
  errors = {},
  disabled = false 
}) => {
  const handleChange = (fieldName, value) => {
    if (onChange) {
      onChange(fieldName, value)
    }
  }

  const renderField = (field) => {
    const { name, label, type, required, options, placeholder, rows } = field
    const value = data[name] || ''
    const error = errors[name]

    const commonProps = {
      id: name,
      name: name,
      value: value,
      onChange: (e) => handleChange(name, e.target.value),
      disabled: disabled,
      className: `w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors ${
        error ? 'border-red-500' : ''
      }`
    }

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'password':
        return (
          <input
            type={type}
            placeholder={placeholder}
            {...commonProps}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            placeholder={placeholder}
            {...commonProps}
            onChange={(e) => handleChange(name, parseFloat(e.target.value) || 0)}
          />
        )

      case 'textarea':
        return (
          <textarea
            rows={rows || 4}
            placeholder={placeholder}
            {...commonProps}
          />
        )

      case 'select':
        return (
          <select
            {...commonProps}
          >
            <option value="">Selecione</option>
            {options && options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )

      default:
        return null
    }
  }

  return (
    <form className="space-y-4">
      {fields.map(field => (
        <div key={field.name} className="mb-2">
          <label htmlFor={field.name} className="block text-slate-300 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <div className="text-red-500 text-xs mt-1">{errors[field.name]}</div>
          )}
        </div>
      ))}
    </form>
  )
}

export default CrudForm
