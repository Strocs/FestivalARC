import { useEffect, useState } from 'react'
import 'swiper/css'

const getImagesAttributes = src => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve({ src, width: img.width, height: img.height })
    img.onerror = reject
  })
}

export const ActivityGallery = ({ gallery, category }) => {
  const [images, setImages] = useState({})
  const [loadingImg, setLoadingImg] = useState(false)
  useEffect(() => {
    const loadImages = async () => {
      const images = {}
      setLoadingImg(true)
      if (!gallery) return

      for (let img of gallery) {
        const categoryPath = category.replaceAll(' ', '-').toLowerCase()
        const folderPath = img.name.replaceAll(' ', '-').toLowerCase()
        const imgPath = img.imgName.replaceAll(' ', '-').toLowerCase()
        const imgSrc = `gallery/${categoryPath}/${folderPath}/${imgPath}`

        try {
          const imageAttr = await getImagesAttributes(imgSrc)
          images[img.imgName] = imageAttr
        } catch (error) {
          console.error(`Error loading image ${imgSrc}`, error)
        }
      }
      setImages(images)
      setLoadingImg(false)
    }
    loadImages()
  }, [gallery, category])

  if (!gallery) return <></>

  return (
    <section className='pt-10'>
      <h3 className='text-2xl font-medium'>Galería</h3>
      <ul className='columns-1 gap-x-2 my-2'>
        {gallery.map(img => {
          const dimension = images[img.imgName] || {}
          const { width, height, src } = dimension

          const withSpan =
            category === 'Música' || category === 'Artes Visuales'

          return loadingImg ? (
            <p key={img.imgName}>Cargado...</p>
          ) : (
            <li
              key={img.imgName}
              className='w-full h-fit relative mb-2'
              id='image_container'
            >
              {withSpan && (
                <span className='absolute bottom-1 left-0 right-0 w-fit bg-secondary/80 px-4 leading-4 text-sm py-1 mx-auto text-center'>
                  {img.name}
                </span>
              )}
              <img
                loading='lazy'
                width={width}
                height={height}
                className='w-full h-full'
                src={src}
                alt={`Imagen de ${img.name}`}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
