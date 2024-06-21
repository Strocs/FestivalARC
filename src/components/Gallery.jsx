import { SwiperSlide, Swiper } from 'swiper/react'
import 'swiper/css'
import useImage from 'src/hooks/useImage'

export const Gallery = ({ gallery, category }) => {
  if (!gallery) return <></>

  return (
    <section className=''>
      <h3 className='text-2xl font-medium'>Galería</h3>
      <Swiper slidesPerView={'auto'} spaceBetween={10} className=''>
        {gallery.map(img => {
          const categoryFolder = category.toLowerCase().replaceAll(' ', '-')
          const artistFolder = img.name.toLowerCase().replaceAll(' ', '-')
          const imagePath = `public/images/gallery/${categoryFolder}/${artistFolder}/${img.imgName}`

          const { image, error, loading } = useImage(imagePath)

          if (error) return <p>Error al cargar la galería {':('}</p>

          return (
            <>
              {loading ? (
                <div className='w-4/5 max-h-52 aspect-auto bg-black/20'></div>
              ) : (
                <SwiperSlide key={img.imgName} className='!w-fit h-52'>
                  <img
                    height={image.height}
                    width={image.width}
                    className='w-fit h-full max-h-52 aspect-auto'
                    src={image.src}
                    alt={`Imagen de ${img.name}`}
                  />
                </SwiperSlide>
              )}
            </>
          )
        })}
      </Swiper>
    </section>
  )
}
