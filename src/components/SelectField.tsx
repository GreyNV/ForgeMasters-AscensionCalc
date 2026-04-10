import type { ReactNode } from 'react'

type Option = {
  label: string
  value: string
}

type SelectFieldProps = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  hint?: ReactNode
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
}: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-stone-200">{label}</span>
      <select
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-amber-400/60 focus:bg-black/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-stone-950 text-white">
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-stone-400">{hint}</span> : null}
    </label>
  )
}

