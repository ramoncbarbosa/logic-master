export default function ConsentText({ domains }: { domains: string[] }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      <p>
        Ao participar deste quiz você concorda que os seguintes dados sejam coletados e armazenados para fins{' '}
        <strong>exclusivamente pedagógicos</strong> (acompanhamento da turma pelo professor responsável e estatísticas de
        aprendizagem):
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>nome e e-mail institucional ({domains.map((d) => `@${d}`).join(', ')});</li>
        <li>endereço IP e localização aproximada derivada dele (país, estado e cidade);</li>
        <li>navegador/dispositivo utilizado;</li>
        <li>respostas escolhidas, acertos, data/hora e tempo gasto em cada questão.</li>
      </ul>
      <p>
        Os dados são acessíveis apenas ao professor autenticado, não são vendidos nem compartilhados com terceiros e são
        anonimizados automaticamente após 180 dias. Você pode solicitar a exclusão dos seus dados ao professor a qualquer
        momento (Lei nº 13.709/2018 — LGPD).
      </p>
    </div>
  )
}
