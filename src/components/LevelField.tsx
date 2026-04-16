import { useEffect, useState } from 'react'

type LevelFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  hint?: string
}

function normalizeLevel(value: string, min: number, max: number): number {
  const digitsOnly = value.replace(/[^\d]/g, '')
  const parsed = Number.parseInt(digitsOnly, 10)

  if (!Number.isFinite(parsed)) {
    return min
  }

  return Math.min(max, Math.max(min, parsed))
}

export function LevelField({
  label,
  value,
  onChange,
  min = 1,
  max = 100,
  hint,
}: LevelFieldProps) {
  const [draft, setDraft] = useState(String(value))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setDraft(String(value))
    }
  }, [isFocused, value])

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="min-w-0 text-sm font-medium text-violet-50">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        className="block min-w-0 w-full max-w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,11,20,0.96),rgba(10,8,14,0.92))] px-4 py-3 text-base text-white outline-none transition placeholder:text-violet-100/30 focus:border-violet-400/60 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(181,70,255,0.16)]"
        value={draft}
        placeholder={String(min)}
        onFocus={() => setIsFocused(true)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          setIsFocused(false)
          const normalized = normalizeLevel(draft, min, max)
          setDraft(String(normalized))
          onChange(normalized)
        }}
      />
      {hint ? <span className="text-xs text-violet-100/55">{hint}</span> : null}
    </label>
  )
}
