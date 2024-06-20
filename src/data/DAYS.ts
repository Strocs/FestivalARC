import type { Day } from '@cTypes/types'
import { CATEGORIES, CITIES, PLACES } from './CONSTANTS'
import { EXPO } from './ACTIVITIES'

export const DAYS: Day[] = [
  {
    day: 'Jueves 27',
    color: {
      border: 'border-day-1',
      background: 'bg-day-1',
      text: 'text-day-1',
      textHover: 'hover:text-day-1',
      borderHover: 'hover:border-day-1',
      backgroundHover: 'hover:bg-day-1',
      afterBackground: 'after:bg-day-1'
    },
    schedule: {
      '20:00': [
        {
          title: 'Inauguración Festival ARC 2024',
          subTitle: 'José Luis Urquieta, Lican Antay y Congreso',
          description: 'El Festival ARC 2024 se inicia con un evento inaugural que se desarrollará en el Auditorio Consistorial de la Municipalidad de Coquimbo, a las 20:00 hrs., y que contará con la participación del oboísta serenense, José Luis Urquieta, la agrupación de música andina, Lican Antay y la legendaria banda nacional, Congreso, entre autoridades y público general que se convocará ese día.',
          category: CATEGORIES.musica,
          location: PLACES.consistorial,
          city: CITIES.cq,
          time: '20:00',
          exhibitors: [
            {
              name: 'José Luis Urquieta',
              description: 'Reconocido como un importante y activo artista latinoamericano. Sus propuestas lo han llevado a realizar conciertos por más de treinta países, en diversos continentes. Nace en La Serena, donde comienza sus estudios en la cátedra de Oboe de su padre José Urquieta Varela en la Escuela Experimental de Música “Jorge Peña Hen”. Luego estudia en la Pontificia Universidad Católica de Chile y más tarde se radica en Europa.',
              artwork: {
                type: 'Nombre del concierto:',
                name: 'Nuevos Aires Chilenos para Oboe'
              },
              social_media: {
                x: 'https://x.com/oboejl82',
                fb: 'https://www.facebook.com/jose.l.urquieta',
                yt: 'https://www.youtube.com/channel/UC0QSl0J8ZILkp63uxvvtuRQ',
                ig: 'https://www.instagram.com/jl_urquieta_oboe',
                soundcloud: 'https://soundcloud.com/jose-luis-urquieta'
              },
            },
            {
              name: 'Lican Antay',
              description: 'Desde sus inicios en 2003, este grupo musical andino se ha dedicado a crear, recrear, interpretar y difundir  manifestaciones musicales propias de la tradición latinoamericana,  con acento en las costumbres de los pueblos del altiplano andino. Su repertorio se nutre de variadas formas musicales tradicionales andinas, que representan el legado patrimonial musical, que nos han heredado los antiguos hombres del altiplano andino.',
              artwork: {
                type: 'Nombre del concierto:',
                name: 'Concierto MACHAQ MARA Cosmovisión en el Imaginario Andino'
              },
              social_media: {
                ig: 'https://www.instagram.com/licanantay.cl/?hl=es',
                fb: 'https://www.facebook.com/p/Lican-Antay-100031308979320/?locale=es_LA',
                spotify:
                  'https://open.spotify.com/intl-es/artist/1ht5AAzQ5HX0damtSjsZQh'
              }
            },
            {
              name: 'Congreso',
              description: 'Agrupación musical de estilo fusión latinoamericana fundada en Quilpué en 1969, y liderada por Sergio "Tilo" González. En más de 50 años cuentan con 18 álbumes de estudio y  cuatro en vivo, incluido un DVD. Se iniciaron en la Nueva canción chilena y más tarde viraron hacia el rock progresivo. Luego, un sonido fusión que incorpora jazz, música contemporánea, pop y música étnica, sonido denominado por ellos como la Nueva música latinoamericana.',
              social_media: {
                ig: 'https://www.instagram.com/licanantay.cl/?hl=es',
                fb: 'https://www.facebook.com/p/Lican-Antay-100031308979320/?locale=es_LA',
                spotify:
                  'https://open.spotify.com/intl-es/artist/1ht5AAzQ5HX0damtSjsZQh'
              }
            },
          ]
        },
      ]
    }
  },
  {
    day: 'Viernes 28',
    color: {
      border: 'border-day-2',
      background: 'bg-day-2',
      text: 'text-day-2',
      textHover: 'hover:text-day-2',
      borderHover: 'hover:border-day-2',
      backgroundHover: 'hover:bg-day-2',
      afterBackground: 'after:bg-day-2'
    },
    schedule: {
      '10:00': [
        EXPO('Inauguración Expo Arte Co'),
        {
          title:
            'Taller: "Hasta que leer se haga costumbre: Psicopedagogía de la mediación lectora"',
          description: 'Este taller es una jornada de aprendizaje intensiva y de carácter formativo. Se basa en los principios del aprendizaje activo, y busca que los participantes mejoren sus conocimientos y habilidades en torno a la mediación lectora y escritora. Está dirigido a docentes, personal de la educación, familias y público en general interesado en promover la lectura y escritura. Lo imparten David Santos Arrieta y Constanza Fernández López.',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          city: CITIES.ls,
          time: ['10:00', '18:00']
        }
      ],
      '12:00': [
        {
          title: 'Obra: "El mensajero sideral en la región estrella"',
          subTitle: 'Compañía "Ojos de Agua"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.teatroMunicipal,
          city: CITIES.ls,
          time: '12:00',
          social_media: {
            ig: 'https://www.instagram.com/titeresojosdeagua/',
            fb: 'https://www.facebook.com/titeresojosdeagua'
          },
          more_info: [
            ['Elenco:', 'Dos actrices titiriteras y un técnico audiovisual.'],
            ['Duración:', '60 minutos'],
            ['Clasificación:', 'Todo espectador.']
          ]
        }
      ],
      '17:00': [
        {
          title: 'Obra: "Todo pa`l patrón, nada pa`l dolor"',
          subTitle: 'Compañía "Teatro Gárgaras"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.salonAuditorioIllapel,
          city: CITIES.ill,
          time: '17:00',
          more_info: [
            ['Dirección y Dramaturgia:', 'Rodrigo Castillo Cuello.'],
            ['Elenco:', 'Luis Jiménez, Jean Franco Mendieta, Rodrigo Carmona.'],
            ['Clasificación:', 'Todo espectador.']
          ]
        }
      ],
      '18:00': [
        {
          title: 'Lanzamiento de libro: "Un largo solo"',
          subTitle: 'Expone: Bruno Montané Krebs',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          city: CITIES.ls,
          time: '18:00',
          more_info: [
            ['Autor:', 'Bruno Montané Krebs.'],
            ['Edición:', 'Geisse Navarro.'],
            ['Prólogo:', 'Nibaldo Acero.'],
            ['Editorial:', 'Bordelibre Ediciones.']
          ]
        }
      ],
      '18:30': [
        {
          title: 'Obra "Idilio"',
          subTitle: 'Compañía "La Voraz"',
          description: '“Idilio” narra la historia de cómo dos individuos completamente desconocidos y de realidades muy diferentes logran entablar una relación basada en el concepto de amor romántico. Esta historia aparenta ser idílica, pero esconde la realidad de violencia que sufren muchas familias chilenas.',
          category: CATEGORIES.escenicas,
          location: PLACES.plazaIllapel,
          city: CITIES.ill,
          time: '18:30',
          social_media: {
            ig: 'https://www.instagram.com/idilio.circo/'
          },
          more_info: [
            ['Dirección:', 'Carolina Cuturrufo.'],
            ['Elenco:', 'Sebastián Araya, Valentina Pierotic, Nikola Gonzales.'],
          ]
        }
      ],
      '19:00': [
        {
          title:
            'Conversatorio: "Conversas en Red: La bandera de Chile, un homenaje a la resistencia y la memoria"',
          subTitle: 'Expone: Red Feminista del Libro',
          description: 'Este taller tiene como propósitos dar a conocer y difundir la poesía de Elvira Hernández como referente poético para generaciones jóvenes de poetas, vincular la poesía como género discursivo que rebasa los límites de la misma creación estética, y relacionar la poesía con aristas políticas propias del discurso artístico.',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          city: CITIES.ls,
          time: '19:00',
          more_info: [
            ['Participan:', 'Paula Ceballos Huerta, Ehurodice Rivera Oyarce, Valeria Maturana Fuentes.'],
            ['Moderadora:', 'Marcela Reyes Harris.']
          ]
        },
        {
          title: 'Obra: "Letargia"',
          subTitle: 'Compañía "Las Maires"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.tmo,
          city: CITIES.ov,
          time: '19:00',
          social_media: {
            ig: 'https://www.instagram.com/colectivolasmairesteatro/?hl=es-la',
            fb: 'https://www.facebook.com/colectivolasmairesteatro/?locale=es_LA'
          },
          more_info: [
            ['Dramaturgia y dirección:', 'Margarita Castro Acuña'],
            ['Elenco:', 'María de Los Ángeles Espinoza Ogalde'],
            ['Duración:', '50 min. aprox.'],
            ['Clasificación:', '+ 14 años.']
          ]
        },
        {
          title: 'Obra: "Lambert. La rebelión de los Serenos"',
          subTitle: 'Colectivo Teatral Con-Zumo',
          description: '"Lambert. La rebelión de los Serenos" es una obra que mezcla realidad histórica con ficción para hacer un paralelo con el Chile actual y traer a la memoria sucesos narrados desde nuestra propia identidad regional.',
          category: CATEGORIES.escenicas,
          location: PLACES.aulaMagna,
          city: CITIES.ls,
          time: '19:00',
          social_media: {
            ig: 'https://www.instagram.com/colectivoconzumoteatro/',
            fb: 'https://www.facebook.com/colectivoteatral.conzumo/'
          },
          more_info: [
            ['Dramaturgia y dirección:', 'Héctor Álvarez Godoy'],
            ['Elenco:', 'Nicolás Yusta / Javiera Vegas / Cristopher Rodríguez / Ivannia Malebrán / Vanessa Vaccaro / Nicolás Rivera y Charly.'],
          ]
        },
        {
          title: 'Obra: "Pino(shit)"',
          subTitle: 'Compañía "Didascalia y viceversa"',
          description: 'Una cocinera prepara la tradicional empanada de pino mientras viaja con los ingredientes e historias llenas de recuerdos impregnados de una cultura típica chilena.',
          category: CATEGORIES.escenicas,
          location: PLACES.palace,
          city: CITIES.cq,
          time: '19:00',
          social_media: {
            ig: 'https://www.instagram.com/didascalia_y_viceversa/?hl=es-la',
            fb: 'https://www.facebook.com/obratango.barrial'
          },
          more_info: [
            ['Dramaturgia y Dirección:', 'Constanza Silva Núñez'],
            ['Elenco:', 'Romina Urbina Briones | Constanza Silva Nuñez.']
          ]
        },
        {
          title: 'Pre Estreno "Amadiela"',
          subTitle: 'Mijael Milies',
          description: '',
          category: CATEGORIES.audiovisual,
          location: PLACES.museoArqueologico,
          city: CITIES.ls,
          time: '19:00'
        }
      ],
      '21:00': [
        {
          title: 'Concierto 360°',
          subTitle: 'Chicoria Sánchez y Cafuzo',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          city: CITIES.ls,
          time: '21:00',
          exhibitors: [
            {
              name: 'Chicoria Sánchez',
              description: '',
              social_media: {}
            },
            {
              name: 'Cafuzo',
              description: '',
              social_media: {}
            },
          ]
        }
      ]
    }
  },
  {
    day: 'Sábado 29',
    color: {
      border: 'border-day-3',
      background: 'bg-day-3',
      text: 'text-day-3',
      textHover: 'hover:text-day-3',
      borderHover: 'hover:border-day-3',
      backgroundHover: 'hover:bg-day-3',
      afterBackground: 'after:bg-day-3'
    },
    schedule: {
      '10:00': [
        EXPO('Exposición Artes Visuales'),
        {
          title: 'Taller: "Noche cerrada al descampado: Ejercicios ded escritura para iluminar el camino"',
          subTitle: 'Imparten: "Los viajeros del Mary Celeste"',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          city: CITIES.ls,
          time: ['10:00', '18:00'],
          more_info: [
            ['Duración:', 'De 10:00 a 13:00hrs y luego de 15:00 a 18:00hrs.']
          ]
        }
      ],
      '11:00': [
        {
          title: 'Taller de introducción y apreciación musical y sonora para cine',
          subTitle: 'Imparte: Mijael Milies',
          description: '',
          category: CATEGORIES.audiovisual,
          location: PLACES.galeria,
          city: CITIES.cq,
          time: ['11:00', "18:00"]
        }
      ],
      '12:00': [
        {
          title: 'Obra: "Caleta de canciones"',
          subTitle: 'Banda Purreira de Chicoría Sánchez en colaboración con Colectiva Danza La Manada',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.teatroMunicipal,
          city: CITIES.ls,
          time: '12:00'
        }
      ],
      '16:00': [
        {
          title: 'Concierto en Illapel',
          subTitle: 'Sexto Sol, Franka Miranda y Chinoy',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.plazaIllapel,
          city: CITIES.ill,
          time: '16:00',
          exhibitors: [
            {
              name: 'Sexto Sol',
              description: '',
              social_media: {}
            },
            {
              name: 'Franka Miranda',
              description: '',
              social_media: {}
            },
            {
              name: 'Chinoy',
              description: '',
              social_media: {}
            },
          ]
        }
      ],
      '18:00': [
        {
          title: 'Lanzamiento Libro Bajo el Acero Camaleónico el juguetero celestial escribe diarios químicos',
          subTitle: 'Expone: Pía Ahumada',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          city: CITIES.ls,
          time: '18:00'
        }
      ],
      '19:00': [
        {
          title: 'Lanzamiento Libro "Botánica"',
          subTitle: 'Expone: "Caos de Couve"',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          city: CITIES.ls,
          time: '19:00'
        },
        {
          title: 'Obra: "Siervas, prisioneras del buen pastor"',
          subTitle: 'Compañía Con-Zumo',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.aulaMagna,
          city: CITIES.ls,
          time: '19:00'
        },
        {
          title: 'Obra: "Stella Terral"',
          subTitle: 'Compañía Teatro Puerto',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.palace,
          city: CITIES.cq,
          time: '19:00'
        }
      ],
      '20:00': [
        {
          title: 'Concierto en La Serena',
          subTitle: '20.98, D43 y PAU',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.teatroMunicipal,
          city: CITIES.ls,
          time: '20:00',
          exhibitors: [
            {
              name: '20.98',
              description: '',
              social_media: {}
            },
            {
              name: 'D43',
              description: '',
              social_media: {}
            },
            {
              name: 'PAU',
              description: '',
              social_media: {}
            },
          ]
        }
      ],
      '21:00': [
        {
          title: 'Concierto en el Centenario',
          subTitle: 'Buen Punto, Natural Esencia, La Cumbia Record y Camiseta 22',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          city: CITIES.ls,
          time: '21:00',
          exhibitors: [
            {
              name: 'Buen Punto',
              description: '',
              social_media: {}
            },
            {
              name: 'Natural Esencia',
              description: '',
              social_media: {}
            },
            {
              name: 'La Cumbia Records',
              description: '',
              social_media: {}
            },
            {
              name: 'Camiseta 22',
              description: '',
              social_media: {}
            },
          ]
        }
      ],

    }
  },
  {
    day: 'Domingo 30',
    color: {
      border: 'border-day-4',
      background: 'bg-day-4',
      text: 'text-day-4',
      textHover: 'hover:text-day-4',
      borderHover: 'hover:border-day-4',
      backgroundHover: 'hover:bg-day-4',
      afterBackground: 'after:bg-day-4'
    },
    schedule: {
      '10:00': [
        EXPO('Exposición Artes Visuales'),
        {
          title: 'Muestra de Artesanía',
          subTitle: '10 Artesanos y 3 Expositores',
          description: '',
          category: CATEGORIES.artesania,
          location: PLACES.mall,
          city: CITIES.cq,
          time: ['10:00', '20:00'],
          exhibitors: [
            {
              name: '',
              artwork: {
                type: '',
                name: ''
              },
              social_media: {}
            }
          ]
        }
      ],
      '11:00': [
        {
          title: 'Taller de Escritura y Bioma',
          subTitle: 'Expone: Caos de Couve',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          city: CITIES.ls,
          time: ['11:00', '12:30']
        }
      ],
      '12:00': [
        {
          title: 'Obra: "Tatul, El paraíso en la tierra"',
          subTitle: 'Compañía: La Chinchilla Subversiva',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.teatroMunicipal,
          city: CITIES.ls,
          time: '12:00'
        }
      ],
      '15:00': [
        {
          title: 'Taller: Cómo contar cuentos de terror y no morir de miedo',
          subTitle: 'Expone: Nancy Ramos',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          city: CITIES.ls,
          time: ['15:00', '18:00']
        }
      ],
      '18:00': [
        {
          title: 'Obra Circo: "Vía"',
          subTitle: 'Compañía: Circo Cuarta Estación',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.trenes,
          city: CITIES.ov,
          time: '18:00'
        }
      ],
      '19:00': [
        {
          title: 'Obra: "Victor, Trasciende"',
          subTitle: 'Compañía: Núcleo de Autoría Escénica',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.aulaMagna,
          city: CITIES.ls,
          time: '19:00'
        }
      ],
      '20:00': [
        {
          title: 'Concierto en el Centenario',
          subTitle: 'Natalia Corvetto, Animales de Lumiere, Electrodomésticos',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          city: CITIES.ls,
          time: '20:00',
          exhibitors: [
            {
              name: 'Natalia Corvetto',
              description: '',
              social_media: {}
            },
            {
              name: 'Animales de Lumiere',
              description: '',
              social_media: {}
            },
            {
              name: 'Electrodomésticos',
              description: '',
              social_media: {}
            },
          ]
        }
      ],
    }
  }
]
