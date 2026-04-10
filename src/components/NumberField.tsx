type NumberFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  hint?: string
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  hint,
}: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-stone-200">{label}</span>
      <input
        type="number"
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-amber-400/60 focus:bg-black/30"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint ? <span className="text-xs text-stone-400">{hint}</span> : null}
    </label>
  )
}

