type PhotoModules = Record<string, string>

const modules = import.meta.glob('../assets/photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
}) as PhotoModules

export const albumPhotos = Object.entries(modules)
  .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
  .map(([, source]) => source)

if (import.meta.env.DEV && albumPhotos.length !== 22) {
  console.warn(`[Regalo para Brittany] Se esperaban 22 fotos para el álbum; se encontraron ${albumPhotos.length}.`)
}

export function shuffledAlbumPhotos() {
  const shuffled = [...albumPhotos]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}
