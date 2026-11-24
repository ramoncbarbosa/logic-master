try {
  var p = JSON.parse(localStorage.getItem('lm-prefs-v2') || '{}')
  var r = document.documentElement
  if (p.dark || p.highContrast) r.classList.add('dark')
  if (p.highContrast) r.classList.add('high-contrast')
  if (p.fontScale) r.style.setProperty('--base-font-size', 16 * p.fontScale + 'px')
} catch (e) { }

