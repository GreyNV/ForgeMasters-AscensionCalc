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
      <span className="text-sm font-medium text-violet-50">{label}</span>
      <select
        className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,11,20,0.96),rgba(10,8,14,0.92))] px-4 py-3 text-base text-white outline-none transition focus:border-violet-400/60 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(181,70,255,0.16)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-stone-950 text-white">
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-violet-100/55">{hint}</span> : null}
    </label>
  )
}
