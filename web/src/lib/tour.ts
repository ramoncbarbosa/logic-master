import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import i18n from '@/i18n'

const KEYS = { intro: 'lm-tour-intro-v1', question: 'lm-tour-question-v1' } as const
type TourName = keyof typeof KEYS

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const steps = (name: TourName): DriveStep[] => {
  const t = i18n.t.bind(i18n)
  if (name === 'intro')
    return [
      { popover: { title: t('tour.welcomeTitle'), description: t('tour.welcomeText') } },
      { element: '#tour-summary', popover: { title: t('tour.summaryTitle'), description: t('tour.summaryText'), side: 'bottom' } },
      { element: '#tour-name', popover: { title: t('tour.nameTitle'), description: t('tour.nameText'), side: 'top' } },
      { element: '#tour-email', popover: { title: t('tour.emailTitle'), description: t('tour.emailText'), side: 'top' } },
      { element: '#tour-consent', popover: { title: t('tour.consentTitle'), description: t('tour.consentText'), side: 'top' } },
      { element: '#tour-start', popover: { title: t('tour.startTitle'), description: t('tour.startText'), side: 'top' } },
    ]
  return [
    { element: '#tour-progress', popover: { title: t('tour.progressTitle'), description: t('tour.progressText'), side: 'bottom' } },
    { element: '#tour-listen', popover: { title: t('tour.listenTitle'), description: t('tour.listenText'), side: 'bottom' } },
    { element: '#tour-options', popover: { title: t('tour.optionsTitle'), description: t('tour.optionsText'), side: 'top' } },
    { element: '#tour-confirm', popover: { title: t('tour.confirmTitle'), description: t('tour.confirmText'), side: 'top' } },
    { element: '#tour-help', popover: { title: t('tour.helpTitle'), description: t('tour.helpText'), side: 'left' } },
  ]
}

export function runTour(name: TourName) {
  const d = driver({
    steps: steps(name).filter((s) => !s.element || document.querySelector(s.element as string)),
    showProgress: true,
    progressText: i18n.t('tour.progress', { current: '{{current}}', total: '{{total}}' }),
    nextBtnText: i18n.t('tour.next'),
    prevBtnText: i18n.t('tour.prev'),
    doneBtnText: i18n.t('tour.done'),
    popoverClass: 'lm-tour',
    overlayOpacity: 0.55,
    stagePadding: 8,
    stageRadius: 12,
    smoothScroll: !reducedMotion(),
    animate: !reducedMotion(),
    onDestroyed: () => localStorage.setItem(KEYS[name], '1'),
  })
  d.drive()
  return d
}

export function runTourOnce(name: TourName, delayMs = 700) {
  if (localStorage.getItem(KEYS[name])) return () => {}
  const timer = window.setTimeout(() => runTour(name), delayMs)
  return () => window.clearTimeout(timer)
}
