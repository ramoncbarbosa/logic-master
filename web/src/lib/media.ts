export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string) {
  if (!speechSupported) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'pt-BR'
  u.rate = 0.95
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('pt'))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel()
}

let ctx: AudioContext | null = null
export function playFeedback(correct: boolean) {
  try {
    ctx ??= new AudioContext()
    const notes = correct ? [523.25, 659.25, 783.99] : [311.13, 233.08]
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = correct ? 'triangle' : 'sawtooth'
      osc.frequency.value = freq
      const t = ctx!.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
      osc.connect(gain).connect(ctx!.destination)
      osc.start(t)
      osc.stop(t + 0.2)
    })
  } catch {
  }
}

export function toEmbedUrl(url: string | null) {
  if (!url) return null
  try {
    const u = new URL(url)
    const yt = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v')
    if (u.hostname.includes('youtu') && yt) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}`
    const vimeo = u.hostname.includes('vimeo.com') && u.pathname.split('/').filter(Boolean).pop()
    if (vimeo && /^\d+$/.test(vimeo)) return `https://player.vimeo.com/video/${vimeo}`
  } catch {
  }
  return null
}
