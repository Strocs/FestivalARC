import type { Activity } from '@cTypes/types'
import { ARTWORK, CATEGORIES, PLACES } from './CONSTANTS'

export const EXPO = (title: string): Activity => {
  return {
    title: title || '',
    subTitle: '10 Artistas Regionales',
    description:
      'Exposición de artes visuales que contará con la participación de diez artistas regionales, tales como: Ulises López, Sandy Baptista, María Piedad Aguirre, Luis Cáceres, Fernando Pizarro, Felipe de Ferrari, Claudia Suárez Jansson, Claudia Campos, Carolina Muñoz y Andre Álvarez, la muestra estará abierta a la comunidad del 28 de junio al 27 de julio en la Sala de Exposiciones de la Universidad de La Serena, ubicada a un costado del Aula Magna.',
    category: CATEGORIES.visuales,
    location: PLACES.salaExposiciones,
    time: ['10:00', '18:00'],
    gallery: [
      {
        name: 'Ulises López',
        imgName: 'ulises-lópez-1.jpg'
      },
      {
        name: 'Sandy Baptista',
        imgName: 'sandy-baptista-7.jpg'
      },
      {
        name: 'María Piedad Aguirre',
        imgName: 'maría-piedad-aguirre-2.jpeg'
      },
      {
        name: 'Luis Cáceres',
        imgName: 'luis-cáceres-6.jpg'
      },
      {
        name: 'Fernando Pizarro',
        imgName: 'fernando-pizarro-3.jpg'
      },
      {
        name: 'Felipe de Ferrari',
        imgName: 'felipe-de-ferrari-4.jpg'
      },
      {
        name: 'Claudia Suárez Jansson',
        imgName: 'claudia-suárez-jansson-7.jpg'
      },
      {
        name: 'Claudia Campos',
        imgName: 'claudia-campos-1.jpg'
      },
      {
        name: 'Carolina Muñoz',
        imgName: 'carolina-muñoz-6.jpg'
      },
      {
        name: 'Andre Álvarez',
        imgName: 'andre-álvarez-5.jpg'
      }
    ],
    exhibitors: [
      {
        name: 'Ulises López',
        artwork: {
          type: ARTWORK.obra,
          name: 'Paisaje semiárido'
        },
        social_media: {
          ig: 'https://www.instagram.com/taller.elqui/',
          fb: 'https://www.facebook.com/ulises.lopezgalleguillos'
        }
      },
      {
        name: 'Sandy Baptista',
        artwork: {
          type: ARTWORK.obra,
          name: 'Despojo de un flujo húmedo ahora inexistente'
        },
        social_media: {
          ig: 'https://www.instagram.com/sandybaptistaartistavisual/',
          fb: 'https://www.facebook.com/profile.php?id=100064670983294'
        }
      },
      {
        name: 'María Piedad Aguirre',
        artwork: {
          type: ARTWORK.obra,
          name: 'Ornamento y Delirio B'
        },
        social_media: {
          tumblr: 'https://8piedad8.tumblr.com/'
        }
      },
      {
        name: 'Luis Cáceres',
        artwork: {
          type: ARTWORK.obra,
          name: 'San Pedro de Quiles + Vicuñas en Primavera'
        },
        social_media: {
          ig: 'https://www.instagram.com/adolfo.pintor/?hl=es'
        }
      },
      {
        name: 'Fernando Pizarro',
        artwork: {
          type: ARTWORK.obra,
          name: 'Que no se vaya la vida'
        },
        social_media: {}
      },
      {
        name: 'Felipe de Ferrari',
        artwork: {
          type: ARTWORK.perf,
          name: 'PT Dream'
        },
        social_media: {
          ig: 'https://www.instagram.com/felipedeferari/?hl=es',
          fb: 'https://www.facebook.com/p/Artes-Visuales-Felipe-De-Ferari-wwwdeferaricl-100063552967998/?_rdr'
        }
      },
      {
        name: 'Claudia Suárez',
        artwork: {
          type: ARTWORK.obra,
          name: 'El agua es un derecho humano y Eryngium Anomalum'
        },
        social_media: {
          fb: 'https://www.facebook.com/claudiasuarezartistavisual/?locale=es_LA',
          ig: 'https://www.instagram.com/claudiasuarezartistavisual/'
        }
      },
      {
        name: 'Claudia Campos',
        artwork: {
          type: ARTWORK.obra,
          name: 'Naturaleza Neodiaguita'
        },
        social_media: {
          ig: 'https://www.instagram.com/artistaclaudiacampos/?hl=es',
          fb: 'https://www.facebook.com/p/Artista-Claudia-Campos-100070728224331/?locale=hi_IN&_rdr'
        }
      },
      {
        name: 'Carolina Muñoz',
        artwork: {
          type: ARTWORK.obra,
          name: 'Nado en el humedal + Alzar el vuelo'
        },
        social_media: {
          ig: 'https://www.instagram.com/lagranca/'
        }
      },
      {
        name: 'Andre Álvarez ',
        artwork: {
          type: ARTWORK.obra,
          name: 'Somos Tierra'
        },
        social_media: {
          ig: 'https://www.instagram.com/lazurcida/?hl=es',
          fb: 'https://www.facebook.com/AndreAlvaoli'
        }
      }
    ]
  }
}
