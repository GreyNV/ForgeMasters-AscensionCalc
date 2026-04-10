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
      <span className="text-sm font-medium text-violet-50">{label}</span>
      <input
        type="number"
        className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,11,20,0.96),rgba(10,8,14,0.92))] px-4 py-3 text-base text-white outline-none transition placeholder:text-violet-100/30 focus:border-violet-400/60 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(181,70,255,0.16)]"
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
