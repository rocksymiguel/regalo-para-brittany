interface Props {
  questionNumber: number | null
  onContinue: () => void
  onStartOver: () => void
}

export function ResumeMenu({ questionNumber, onContinue, onStartOver }: Props) {
  const continueLabel = questionNumber ? `CONTINUAR — PREGUNTA ${questionNumber}` : 'CONTINUAR DONDE LO DEJASTE'
  return <main className="resume-scene">
    <div className="resume-wash" aria-hidden="true" />
    <section className="resume-card">
      <h1>Ya habías empezado.</h1>
      {questionNumber && <p>Continuar desde la pregunta {questionNumber}.</p>}
      <button className="primary-button" type="button" onClick={onContinue}>{continueLabel}</button>
      <button className="secondary-button" type="button" onClick={onStartOver}>EMPEZAR DESDE EL PRINCIPIO</button>
    </section>
  </main>
}
