import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Prefs = {
  fontScale: number
  highContrast: boolean
  dark: boolean
  sound: boolean
}

type PrefsCtx = Prefs & { update: (p: Partial<Prefs>) => void }

const KEY = 'lm-prefs-v2'
const defaults: Prefs = {
  fontScale: 1,
  highContrast: false,
  dark: false,
  sound: true,
}

const Ctx = createContext<PrefsCtx | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    } catch {
      return defaults
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(prefs))
    const root = document.documentElement
    root.classList.add('theme-switching')
    root.classList.toggle('dark', prefs.dark || prefs.highContrast)
    root.classList.toggle('high-contrast', prefs.highContrast)
    root.style.setProperty('--base-font-size', `${16 * prefs.fontScale}px`)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
    return () => cancelAnimationFrame(id)
  }, [prefs])

  return <Ctx.Provider value={{ ...prefs, update: (p) => setPrefs((s) => ({ ...s, ...p })) }}>{children}</Ctx.Provider>
}

export function usePreferences() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePreferences fora do PreferencesProvider')
  return ctx
}
