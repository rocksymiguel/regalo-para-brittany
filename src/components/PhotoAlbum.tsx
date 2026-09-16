import { useEffect, useMemo, useState } from 'react'
import collageBase from '../assets/collage_book_base.png'
import { shuffledAlbumPhotos } from '../data/albumPhotos'

interface Props {
  entering?: boolean
  onFinish: () => void
}

const slots = [
  { name: 'left', left: '23.2%', top: '6.1%', width: '29.6%', height: '78.2%' },
  { name: 'top-right', left: '56.5%', top: '5.7%', width: '18.0%', height: '37.4%' },
  { name: 'bottom-right', left: '56.5%', top: '46.8%', width: '18.0%', height: '38.0%' },
] as const

export function PhotoAlbum({ entering = false, onFinish }: Props) {
  const photos = useMemo(shuffledAlbumPhotos, [])
  const pages = useMemo(() => Array.from({ length: Math.ceil(photos.length / 3) }, (_, index) => photos.slice(index * 3, index * 3 + 3)), [photos])
  const [page, setPage] = useState(0)
  const [changing, setChanging] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const pagePhotos = pages[page] ?? []
  const isLastPage = page === pages.length - 1

  const goToPage = (nextPage: number) => {
    if (changing || nextPage < 0 || nextPage >= pages.length) return
    setChanging(true)
    window.setTimeout(() => {
      setPage(nextPage)
      setChanging(false)
    }, 180)
  }

  const finishAlbum = () => {
    if (finishing) return
    setFinishing(true)
    window.setTimeout(onFinish, 320)
  }

  const moveRight = () => isLastPage ? finishAlbum() : goToPage(page + 1)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPage(page - 1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveRight()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [page, isLastPage, changing, finishing, pages.length])

  return <main className={`album-scene ${entering ? 'album-entering' : ''} ${changing ? 'album-changing' : ''} ${finishing ? 'album-finishing' : ''}`}>
    <div className="album-book" aria-label="Álbum de fotos">
      <img className="album-base" src={collageBase} alt="" />
      {isLastPage
        ? <><div className="album-final-slot-matte" aria-hidden="true" /><div className="album-final-photo"><img src={pagePhotos[0]} alt="" /></div></>
        : pagePhotos.map((photo, index) => <div key={photo} className={`album-photo album-photo-${slots[index].name}`} style={slots[index]}>
          <img src={photo} alt="" />
        </div>)}
      <p className="album-page-counter" aria-live="polite">{String(page + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</p>
    </div>
    <button className="album-arrow album-arrow-left" type="button" onClick={() => goToPage(page - 1)} disabled={page === 0 || changing || finishing} aria-label="Página anterior">←</button>
    <button className="album-arrow album-arrow-right" type="button" onClick={moveRight} disabled={changing || finishing} aria-label={isLastPage ? 'Finalizar álbum' : 'Página siguiente'}>{isLastPage ? '→' : '→'}</button>
    {entering && <div className="album-fade-overlay" aria-hidden="true" />}
  </main>
}
