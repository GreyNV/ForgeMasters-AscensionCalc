import type { ReactNode } from 'react'

type NumberFieldProps = {
  label: string
  labelContent?: ReactNode
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  hint?: string
}

export function NumberField({
  label,
  labelContent,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  hint,
}: NumberFieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="min-w-0 text-sm font-medium text-violet-50">{labelContent ?? label}</span>
      <input
        type="number"
        className="block min-w-0 w-full max-w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,11,20,0.96),rgba(10,8,14,0.92))] px-4 py-3 text-base text-white outline-none transition placeholder:text-violet-100/30 focus:border-violet-400/60 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(181,70,255,0.16)]"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint ? <span className="text-xs text-violet-100/55">{hint}</span> : null}
    </label>
  )
}
