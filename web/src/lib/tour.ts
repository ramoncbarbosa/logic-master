import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

const KEYS = { intro: 'lm-tour-intro-v1', question: 'lm-tour-question-v1' } as const
type TourName = keyof typeof KEYS

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const STEPS: Record<TourName, DriveStep[]> = {
  intro: [
    {
      popover: {
        title: 'Bem-vindo ao Logic Master! 👋',
        description: 'Em poucos passos você vai entender como funciona o quiz. Use as setas do teclado ou os botões abaixo.',
      },
    },
    { element: '#tour-summary', popover: { title: 'Sobre o quiz', description: 'Aqui você vê quantas questões são, o tempo estimado e os conceitos avaliados.', side: 'bottom' } },
    { element: '#tour-name', popover: { title: 'Seu nome', description: 'Informe seu nome completo para o professor identificar sua participação.', side: 'top' } },
    { element: '#tour-email', popover: { title: 'E-mail institucional', description: 'Use obrigatoriamente o seu e-mail @icen.ufpa.br. Outros domínios não são aceitos.', side: 'top' } },
    { element: '#tour-consent', popover: { title: 'Termo de consentimento', description: 'Leia quais dados são coletados (incluindo IP e localização aproximada) e marque a caixa para concordar.', side: 'top' } },
    { element: '#tour-start', popover: { title: 'Tudo pronto!', description: 'Clique para começar. Você responde uma questão por vez e recebe a explicação logo em seguida.', side: 'top' } },
  ],
  question: [
    { element: '#tour-progress', popover: { title: 'Seu progresso', description: 'Mostra em qual questão você está e quantas faltam.', side: 'bottom' } },
    { element: '#tour-listen', popover: { title: 'Ouvir a questão', description: 'Prefere ouvir? Este botão lê o enunciado e as alternativas em voz alta.', side: 'bottom' } },
    { element: '#tour-options', popover: { title: 'Escolha uma alternativa', description: 'Clique em uma opção ou use as teclas A, B, C e D. Você pode trocar antes de confirmar.', side: 'top' } },
    { element: '#tour-confirm', popover: { title: 'Confirme a resposta', description: 'Depois de confirmar, não é possível mudar. Você verá se acertou e a explicação do raciocínio.', side: 'top' } },
    { element: '#tour-help', popover: { title: 'Precisa rever?', description: 'Clique aqui a qualquer momento para ver este tutorial novamente. Bom quiz!', side: 'left' } },
  ],
}

export function runTour(name: TourName) {
  const steps = STEPS[name].filter((s) => !s.element || document.querySelector(s.element as string))
  const d = driver({
    steps,
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo',
    prevBtnText: 'Voltar',
    doneBtnText: 'Entendi',
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
  const t = window.setTimeout(() => runTour(name), delayMs)
  return () => window.clearTimeout(t)
}
