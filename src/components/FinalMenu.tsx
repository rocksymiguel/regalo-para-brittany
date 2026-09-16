interface Props {
  onQuestionnaire: () => void
  onAlbum: () => void
  onLetter: () => void
}

export function FinalMenu({ onQuestionnaire, onAlbum, onLetter }: Props) {
  return <main className="final-menu-scene">
    <div className="final-menu-wash" aria-hidden="true" />
    <section className="final-menu-card" aria-label="Menú final">
      <p>¿Qué quieres volver a ver?</p>
      <button className="final-menu-primary" type="button" onClick={onQuestionnaire}>CUESTIONARIO</button>
      <div className="final-menu-secondary-actions">
        <button className="final-menu-secondary" type="button" onClick={onAlbum}>COLLAGE</button>
        <button className="final-menu-secondary" type="button" onClick={onLetter}>CARTA</button>
      </div>
    </section>
  </main>
}
