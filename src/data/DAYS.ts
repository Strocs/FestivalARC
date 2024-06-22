import type { Day } from '@cTypes/types'
import { CATEGORIES, PLACES } from './CONSTANTS'
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
          description:
            'El Festival ARC 2024 se inicia con un evento inaugural que se desarrollará en el Auditorio Consistorial de la Municipalidad de Coquimbo, a las 20:00 hrs., y que contará con la participación del oboísta serenense, José Luis Urquieta, la agrupación de música andina, Lican Antay y la legendaria banda nacional, Congreso, entre autoridades y público general que se convocará ese día.',
          category: CATEGORIES.musica,
          location: PLACES.consistorial,
          time: '20:00',
          gallery: [
            { name: 'Congreso', imgName: 'congreso-1.jpg' },
            { name: 'Lican Antay', imgName: 'lican-antay-3.jpg' },
            { name: 'José Luis Urquieta', imgName: 'josé-luis-urquieta-3.jpg' },
          ],
          exhibitors: [
            {
              name: 'José Luis Urquieta',
              description:
                'Reconocido como un importante y activo artista latinoamericano. Sus propuestas lo han llevado a realizar conciertos por más de treinta países, en diversos continentes. Nace en La Serena, donde comienza sus estudios en la cátedra de Oboe de su padre José Urquieta Varela en la Escuela Experimental de Música “Jorge Peña Hen”. Luego estudia en la Pontificia Universidad Católica de Chile y más tarde se radica en Europa.',
              artwork: {
                type: 'Nombre del concierto',
                name: 'Nuevos Aires Chilenos para Oboe'
              },
              social_media: {
                x: 'https://x.com/oboejl82',
                fb: 'https://www.facebook.com/jose.l.urquieta',
                yt: 'https://www.youtube.com/channel/UC0QSl0J8ZILkp63uxvvtuRQ',
                ig: 'https://www.instagram.com/jl_urquieta_oboe',
                soundcloud: 'https://soundcloud.com/jose-luis-urquieta'
              }
            },
            {
              name: 'Lican Antay',
              description:
                'Desde sus inicios en 2003, este grupo musical andino se ha dedicado a crear, recrear, interpretar y difundir  manifestaciones musicales propias de la tradición latinoamericana,  con acento en las costumbres de los pueblos del altiplano andino. Su repertorio se nutre de variadas formas musicales tradicionales andinas, que representan el legado patrimonial musical, que nos han heredado los antiguos hombres del altiplano andino.',
              artwork: {
                type: 'Nombre del concierto',
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
              description:
                'Agrupación musical de estilo fusión latinoamericana fundada en Quilpué en 1969, y liderada por Sergio "Tilo" González. En más de 50 años cuentan con 18 álbumes de estudio y  cuatro en vivo, incluido un DVD. Se iniciaron en la Nueva canción chilena y más tarde viraron hacia el rock progresivo. Luego, un sonido fusión que incorpora jazz, música contemporánea, pop y música étnica, sonido denominado por ellos como la Nueva música latinoamericana.',
              social_media: {
                ig: 'https://www.instagram.com/grupocongresooficial/?hl=es',
                fb: 'https://www.facebook.com/GrupoCongresoOficial/?locale=es_LA',
                x: 'https://x.com/grupocongreso',
                spotify:
                  'https://open.spotify.com/intl-es/artist/0S7gyQcve5aVdbPiUjym4H'
              }
            }
          ]
        }
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
          subTitle: 'Imparten: David Santos y Constanza Fernandez',
          description:
            'Este taller es una jornada de aprendizaje intensiva y de carácter formativo. Se basa en los principios del aprendizaje activo, y busca que los participantes mejoren sus conocimientos y habilidades en torno a la mediación lectora y escritora. Está dirigido a docentes, personal de la educación, familias y público en general interesado en promover la lectura y escritura. Lo imparten David Santos Arrieta y Constanza Fernández López.',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          time: ['10:00', '18:00'],
          gallery: [
            { name: 'Hasta que leer se haga costumbre', imgName: 'hasta-que-leer-se-haga-costumbre-1.jpeg' },
            { name: 'Hasta que leer se haga costumbre', imgName: 'hasta-que-leer-se-haga-costumbre-3.jpeg' },
            { name: 'Hasta que leer se haga costumbre', imgName: 'hasta-que-leer-se-haga-costumbre-4.jpeg' },
          ],
          more_info: [
            ['Duración:', 'De 10:00 a 13:00hrs y luego de 15:00 a 18:00hrs.']
          ]
        }
      ],
      '12:00': [
        {
          title: 'Obra: "El mensajero sideral en la región estrella"',
          subTitle: 'Compañía "Ojos de Agua"',
          description:
            'Una obra que invita a conocer a Galileo Galilei en su desenfrenada búsqueda de respuestas sobre el universo y su mágico encuentro con una sabia del mundo antiguo en la región estrella.',
          category: CATEGORIES.escenicas,
          location: PLACES.teatroMunicipal,
          time: '12:00',
          gallery: [
            { name: 'El mensajero sideral en la region estrella', imgName: 'el-mensajero-sideral-en-la-region-estrella-1.jpg' },
            { name: 'El mensajero sideral en la region estrella', imgName: 'el-mensajero-sideral-en-la-region-estrella-2.jpg' },
            { name: 'El mensajero sideral en la region estrella', imgName: 'el-mensajero-sideral-en-la-region-estrella-3.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/titeresojosdeagua/',
            fb: 'https://www.facebook.com/titeresojosdeagua'
          },
          more_info: [
            ['Elenco:', 'Dos actrices titiriteras y un técnico audiovisual.'],
            ['Duración:', '60 minutos.'],
            ['Clasificación:', 'Todo espectador.']
          ]
        }
      ],
      '17:00': [
        {
          title: 'Obra: "Todo pa`l patrón, nada pa`l dolor"',
          subTitle: 'Compañía "Teatro Gárgaras"',
          description:
            'Un derrumbe apocalíptico surgido por la depredación de la minería, provoca un nuevo socavón en Tierra Amarilla quedando atrapados dos hombres bajo un ambiente oscuro y oprimente. Estos dos hombres se enfrentan a sus propios temores, sus rencores, se desafían entre ellos mismos, sin importarles la situación desesperada que están viviendo.',
          category: CATEGORIES.escenicas,
          location: PLACES.salonAuditorioIllapel,
          time: '17:00',
          gallery: [
            { name: 'Todo pal patron nada pal dolor', imgName: 'todo-pal-patron-nada-pal-dolor-1.jpg' },
            { name: 'Todo pal patron nada pal dolor', imgName: 'todo-pal-patron-nada-pal-dolor-2.jpg' },
            { name: 'Todo pal patron nada pal dolor', imgName: 'todo-pal-patron-nada-pal-dolor-3.jpg' },
          ],
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
          description:
            '“Un largo solo” hace gala de lo conciso y maduro de Bruno Montané, de sus reiterados intentos de alumbrar el mundo, de hacerlo inteligible y habitable, y de una observación de la existencia que, a pesar de su sutileza y elegancia, manifiesta claramente un ímpetu y vitalidad admirable, que hicieron a su amigo Roberto Bolaño decir que era una poesía hecha de “sangre suspendida en el aire”.',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          time: '18:00',
          gallery: [
            { name: 'Un Largo Solo', imgName: 'un-largo-solo-1.jpg' },
            { name: 'Un Largo Solo', imgName: 'un-largo-solo-2.jpg' },
            { name: 'Un Largo Solo', imgName: 'un-largo-solo-3.jpg' },
          ],
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
          description:
            '“Idilio” narra la historia de cómo dos individuos completamente desconocidos y de realidades muy diferentes logran entablar una relación basada en el concepto de amor romántico. Esta historia aparenta ser idílica, pero esconde la realidad de violencia que sufren muchas familias chilenas.',
          category: CATEGORIES.escenicas,
          location: PLACES.plazaIllapel,
          time: '18:30',
          gallery: [
            { name: 'Idilio', imgName: 'idilio-1.jpg' },
            { name: 'Idilio', imgName: 'idilio-3.jpg' },
            { name: 'Idilio', imgName: 'idilio-4.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/idilio.circo/'
          },
          more_info: [
            ['Dirección:', 'Carolina Cuturrufo.'],
            ['Elenco:', 'Sebastián Araya, Valentina Pierotic, Nikola Gonzales.']
          ]
        }
      ],
      '19:00': [
        {
          title:
            'Conversatorio: "Conversas en Red: La bandera de Chile, un homenaje a la resistencia y la memoria"',
          subTitle: 'Expone: Red Feminista del Libro',
          description:
            'Este taller tiene como propósitos dar a conocer y difundir la poesía de Elvira Hernández como referente poético para generaciones jóvenes de poetas, vincular la poesía como género discursivo que rebasa los límites de la misma creación estética, y relacionar la poesía con aristas políticas propias del discurso artístico.',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          time: '19:00',
          gallery: [
            { name: 'Conversas en Red', imgName: 'conversas-en-red-1.jpeg' },
            { name: 'Conversas en Red', imgName: 'conversas-en-red-2.jpg' },
          ],
          more_info: [
            [
              'Participan:',
              'Paula Ceballos Huerta, Ehurodice Rivera Oyarce y Valeria Maturana Fuentes.'
            ],
            ['Moderadora:', 'Marcela Reyes Harris.']
          ]
        },
        {
          title: 'Obra: "Letargia"',
          subTitle: 'Compañía "Las Maires"',
          description:
            'Nury, una profesora de 60 años padece de una enfermedad colectiva- Letargia – Un estado de somnolencia prolongada. Para su tratamiento y pronta recuperación habita en su última clase, las memorias más oscuras de la vida. Nury recurre a exponer momentos preliminares de su propia vida para reflexionar sobre la educación sistemática, la educación emocional y familiar a través de los típicos juegos didácticos de enseñanza.',
          category: CATEGORIES.escenicas,
          location: PLACES.tmo,
          time: '19:00',
          gallery: [
            { name: 'Letargia', imgName: 'letargia-1.jpg' },
            { name: 'Letargia', imgName: 'letargia-2.jpg' },
            { name: 'Letargia', imgName: 'letargia-3.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/colectivolasmairesteatro/?hl=es-la',
            fb: 'https://www.facebook.com/colectivolasmairesteatro/?locale=es_LA'
          },
          more_info: [
            ['Dramaturgia y Dirección:', 'Margarita Castro Acuña.'],
            ['Elenco:', 'María de Los Ángeles Espinoza Ogalde.'],
            ['Duración:', '50 min. aprox.'],
            ['Clasificación:', '+ 14 años.']
          ]
        },
        {
          title: 'Obra: "Lambert. La rebelión de los Serenos"',
          subTitle: 'Compañía "Colectivo Teatral Con-Zumo"',
          description:
            '"Lambert. La rebelión de los Serenos" es una obra que mezcla realidad histórica con ficción para hacer un paralelo con el Chile actual y traer a la memoria sucesos narrados desde nuestra propia identidad regional.',
          category: CATEGORIES.escenicas,
          location: PLACES.aulaMagna,
          time: '19:00',
          gallery: [
            { name: 'Lambert La rebelion de los Serenos', imgName: 'lambert-la-rebelion-de-los-serenos-2.jpg' },
            { name: 'Lambert La rebelion de los Serenos', imgName: 'lambert-la-rebelion-de-los-serenos-3.jpg' },
            { name: 'Lambert La rebelion de los Serenos', imgName: 'lambert-la-rebelion-de-los-serenos-4.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/colectivoconzumoteatro/',
            fb: 'https://www.facebook.com/colectivoteatral.conzumo/'
          },
          more_info: [
            ['Dramaturgia y Dirección:', 'Héctor Álvarez Godoy.'],
            [
              'Elenco:',
              'Nicolás Yusta / Javiera Vegas / Cristopher Rodríguez / Ivannia Malebrán / Vanessa Vaccaro / Nicolás Rivera y Charly.'
            ]
          ]
        },
        {
          title: 'Obra: "PINO(SHIT)"',
          subTitle: 'Compañía "Didascalia y viceversa"',
          description:
            'Una cocinera prepara la tradicional empanada de pino mientras viaja con los ingredientes e historias llenas de recuerdos impregnados de una cultura típica chilena.',
          category: CATEGORIES.escenicas,
          location: PLACES.palace,
          time: '19:00',
          gallery: [
            { name: 'PINO(SHIT)', imgName: 'pino(shit)-1.jpg' },
            { name: 'PINO(SHIT)', imgName: 'pino(shit)-2.jpg' },
            { name: 'PINO(SHIT)', imgName: 'pino(shit)-3.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/didascalia_y_viceversa/?hl=es-la',
            fb: 'https://www.facebook.com/obratango.barrial'
          },
          more_info: [
            ['Dramaturgia y Dirección:', 'Constanza Silva Núñez'],
            ['Elenco:', 'Romina Urbina Briones y Constanza Silva Nuñez.']
          ]
        },
        {
          title: 'Preestreno "Amadiela"',
          subTitle: 'Mijael Milies',
          description:
            'Largometraje de Mijael Milies García, producido por Calle Producciones. ¿Quien es Amadiela? Es una historia de misterio y suspenso que narra la travesía de Amadiela por el infierno terrenal encontrándose con personas muertas que le dejan una señal. El mar es un portal que la seduce y le invita a entrar para seguir viajando. Amadiela se hace parte de este mundo de horror que la rodea sin temor a lo que sucederá.',
          category: CATEGORIES.audiovisual,
          location: PLACES.museoArqueologico,
          time: '19:00',
          gallery: [
            { name: 'Amadiela', imgName: 'amadiela-1.jpg' },
            { name: 'Amadiela', imgName: 'amadiela-2.jpg' },
          ],
          more_info: [
            ['Duración:', '65 min'],
            ['Dirección:', 'Mijael Milies'],
            ['Guión:', 'Mijael Milies - Felipe Cortés'],
            ['Producción:', 'Mijael Milies, Carla Pasten, Jony Olea'],
            [
              'Teaser:',
              'https://www.youtube.com/watch?v=eP5jYuBedRo&feature=youtu.be'
            ]
          ]
        }
      ],
      '21:00': [
        {
          title: 'Concierto 360°',
          subTitle: 'Chicoria Sánchez y CaFuZo',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          time: '21:00',
          gallery: [
            { name: 'CaFuZo', imgName: 'cafuzo-1.jpg' },
            { name: 'Chicoria Sanchez', imgName: 'chicoria-sanchez-2.jpeg' },
          ],
          exhibitors: [
            {
              name: 'Chicoria Sánchez',
              description: 'Juan Antonio Sánchez Dittborn, más conocido en la escena musical chilena como Chicoria, es un guitarrista y compositor chileno nacido en Alemania dedicado principalmente a la fusión latinoamericana y el desarrollo del folklore desde técnicas de la música clásica. Además es considerado como uno de los compositores chilenos más importantes para guitarra en la actualidad.',
              social_media: {
                ig: 'https://www.instagram.com/chicoriasanchez_oficial/?hl=es',
                fb: 'https://es-la.facebook.com/JuanAntonioChicoriaSanchez/'
              }
            },
            {
              name: 'CaFuZo Fusión Latinoamericana',
              description: 'El grupo CaFuZo, nace el año 2001, formándose en sus inicios con la participación de integrantes provenientes de distintas agrupaciones musicales, reconocidas en el ámbito artístico- musical de la cuarta región – Chile. CaFuZo recoge lo esencial de los ritmos pertenecientes a América Latina, desarrollando su lenguaje musical a través de arreglos basados en los principios de la armonía popular, clásica y moderna.',
              social_media: {
                ig: 'https://www.instagram.com/cafuzo_fusion/?hl=es',
                fb: 'https://www.facebook.com/cafuzofusion/?locale=es_LA',
                spotify: 'https://open.spotify.com/intl-es/artist/0Xnn3eYTjPRbp1nNyGGsFz'
              }
            }
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
          title:
            'Taller: “Noche cerrada al descampado: Ejercicios de escritura para iluminar el camino”',
          subTitle: 'Imparten: "Los Viajeros del Mary Celeste"',
          description: 'En este taller, impartido por Los Viajeros del Mary Celeste, se realizará una breve introducción sobre las dinámicas que se han utilizado en talleres previos, donde se entrega una síntesis de las principales herramientas y recursos temáticos que han podido explorar a lo largo de los años. Luego, se pondrá en práctica a través de cuatro ejercicios escriturales. La propuesta consta de un solo taller, dividido en dos sesiones.',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          time: ['10:00', '18:00'],
          gallery: [
            { name: 'Taller Noche cerrada al descampado', imgName: 'taller-noche-cerrada-al-descampado-1.png' },
          ],
          social_media: {
            spotify: 'https://open.spotify.com/show/0145EyAYA8vdCCFezFvfVd'
          },
          more_info: [
            ['Duración:', 'De 10:00 a 13:00hrs y luego de 15:00 a 18:00hrs.']
          ]
        }
      ],
      '11:00': [
        {
          title:
            'Taller de introducción y apreciación musical y sonora para cine',
          subTitle: 'Imparte: Mijael Milies',
          description: 'Impartido por el cineasta Mijael Milies, este taller es una experiencia donde los alumnos/as a través de la teoría y la práctica conocerán las herramientas necesarias para entender la importancia del sonido y la música en el cine. El taller pretende ahondar de forma individual para que el alumno/a logre comprender y generar sensaciones sonoras que se transmiten en una película.',
          category: CATEGORIES.audiovisual,
          location: PLACES.galeria,
          time: ['11:00', '18:00'],
          gallery: [
            { name: 'Taller de introducción y apreciación musical y sonora para cine', imgName: 'taller-de-introducción-y-apreciación-musical-y-sonora-para-cine-1.jpg' }
          ],
          social_media: {
            ig: 'https://www.instagram.com/sheitan_sata/?hl=am-et'
          }
        }
      ],
      '12:00': [
        {
          title: 'Obra: "Caleta de canciones"',
          subTitle:
            'Banda Purreira de Chicoría Sánchez en colaboración con Colectiva Danza La Manada',
          description: 'Espectáculo interdisciplinario, un viaje de historias divertidas y cuentos, con música original de raíz latinoamericana con sonoridades del mundo, que mediante la danza, elementos teatrales y la música en vivo invitan al goce y disfrute. Destinado a las infancias y sus familias, la invitación es a cantar y jugar con las palabras y los sentidos.',
          category: CATEGORIES.escenicas,
          location: PLACES.teatroMunicipal,
          time: '12:00',
          gallery: [
            { name: 'Caleta de canciones', imgName: 'caleta-de-canciones-1.jpg' },
            { name: 'Caleta de canciones', imgName: 'caleta-de-canciones-2.jpg' },
            { name: 'Caleta de canciones', imgName: 'caleta-de-canciones-3.jpg' },
          ],
          more_info: [
            ['Dirección musical y de danza:', 'Chicoria Sánchez y Natalie Gutiérrez.'],
            ['Duración:', '40 minutos.'],
            ['Elenco de música y de danza:', 'Chicoria Sánchez, Pola Castillo, Inti Sánchez, Ankatu Alquinta, América Janequeo, Talo Pinto y Compañía de Danza La Manada.'],
          ],
          social_media: {
            ig: 'https://www.instagram.com/danzalamanada/?hl=am-et',
            fb: 'https://www.facebook.com/people/La-Manada/100064313599955/?locale=bg_BG&_rdr',
            yt: 'https://www.youtube.com/channel/UC0hx1ttycYARhmQm-klOUlw'
          }
        }
      ],
      '16:00': [
        {
          title: 'Concierto en Illapel',
          subTitle: 'Sexto Sol, Franka Miranda y Chinoy',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.plazaIllapel,
          time: '16:00',
          gallery: [
            { name: 'Chinoy', imgName: 'chinoy-4.png' },
            { name: 'Franka Miranda', imgName: 'franka-miranda-2.jpg' },
            { name: 'Sexto Sol', imgName: 'sexto-sol-3.jpg' },
          ],
          exhibitors: [
            {
              name: 'Sexto Sol',
              description: 'Sexto Sol es una banda chilena independiente que cultiva la música fusión a través de la combinación de sonoridades y géneros musicales como el rock alternativo, el folklore andino y ritmos latinos, logrando con sus letras reflexivas, una identidad propia y un sonido innovador.',
              social_media: {
                ig: 'https://www.instagram.com/sexto.sol/',
                fb: 'https://www.facebook.com/sextosol.elqui/?locale=es_LA',
                yt: 'https://www.youtube.com/channel/UC2CGsV5CcqUUUnLQFuHB2Zw',
                spotify: 'https://open.spotify.com/artist/3sHPR6Q6XN7WUPJDJaVwme'
              }
            },
            {
              name: 'Franka Miranda',
              description: 'Franka Miranda es cantautora, compositora, feminista y disidente andacollina presente en la escena cultural local hace más de cinco años. Su música nos invita a reflexionar sobre temáticas de contingencia social.',
              social_media: {
                ig: 'https://www.instagram.com/franka.miranda/?hl=es',
                fb: 'https://www.facebook.com/franka.miranda.r/',
                yt: 'https://www.youtube.com/channel/UCt3JlmlrEOMLtYYT8iFnOXQ',
                spotify: 'https://open.spotify.com/intl-es/artist/0g7OGTKlAWuwh7kdTR5ngF'
              }
            },
            {
              name: 'Chinoy',
              description: 'Chinoy, uno de los más singulares músicos de Chile. Con una amplia trayectoria dentro del rock y la música popular contemporánea, ha dado conciertos y recitales en América Latina, Europa y Asia. En paralelo a la música, y con vehemencia expresionista, Chinoy se ha desarrollado como pintor. A partir del 2014, hasta el presente, realiza exposiciones itinerantes a lo largo de todo Chile.',
              social_media: {
                ig: 'https://www.instagram.com/chinoyoficial/?hl=es',
                fb: 'https://www.facebook.com/ChinoyOficial/?locale=es_LA',
                x: 'https://twitter.com/chinoyoficial',
                yt: 'https://www.youtube.com/channel/UC_-UFHIiejTWKesw0d3GQZA',
                spotify: 'https://open.spotify.com/intl-es/artist/7ah2GYpn05JkpAIk7vop8g'
              }
            }
          ]
        }
      ],
      '18:00': [
        {
          title:
            'Lanzamiento del libro: “Bajo el arco camaleónico el juguetero celestial escribe diarios químicos”',
          subTitle: 'Expone: Pía Ahumada',
          description: 'Este libro fue escrito entre los años 2017 y 2022, premiado por el Fondo Editorial Municipal Manuel Concha (La Serena) y finalmente entregado (el libro físico) en verano de 2024. El lanzamiento del libro se realizó durante la 39a Feria del Libro de La Serena realizada en 2024. La publicación se divide en dos partes. El primero presenta una novela breve y el segundo una selección de cuentos.',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          time: '18:00',
          gallery: [
            { name: 'Bajo el Arco Camaleonico', imgName: 'bajo-el-arco-camaleonico-1.jpg' },
            { name: 'Bajo el Arco Camaleonico', imgName: 'bajo-el-arco-camaleonico-2.jpg' },
            { name: 'Bajo el Arco Camaleonico', imgName: 'bajo-el-arco-camaleonico-3.jpg' },
          ],
          more_info: [
            ['Autor:', 'Pía Ahumada Seura.'],
            ['Año de publicación:', '2023.'],
            ['Editorial:', 'Municipalidad de La Serena. Fondo Editorial Municipal Manuel Concha.']
          ]
        }
      ],
      '19:00': [
        {
          title: 'Lanzamiento del libro: “Botánica”',
          subTitle: 'Expone: "Caos de Couve"',
          description: '“Botánica” encuentra en las plantas un espejo para preguntarnos por el Yo. Observa, en cada verso, el ritmo del crecimiento, los acontecimientos que nos conforman y quedan como un nudo en el tallo. El pulso de la semilla olvidada remueve la tierra que la cubre. Cuidados, podas, contemplación. Y las raíces, el origen, el propio y el de las plantas.',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          time: '19:00',
          gallery: [
            { name: 'Botanica', imgName: 'botanica-1.jpg' },
            { name: 'Botanica', imgName: 'botanica-2.jpg' },
            { name: 'Botanica', imgName: 'botanica-4.jpg' },
          ],
          more_info: [
            ['Autor:', 'Ashle Ozuljevic Subaique'],
            ['Editorial:', 'Editorial Liliputiense (España, 2020) y Oxímoron (Chile, 2023)']
          ]
        },
        {
          title: 'Obra: “Siervas del buen pastor”',
          subTitle: 'Compañía "Colectivo Teatral Con-Zumo"',
          description: 'Esta obra tiene su inspiración dramatúrgica en acontecimientos que ocurrieron en un centro de prisioneras políticas el año 1973, en la ciudad de La Serena en el contexto del golpe de estado militar y la posterior dictadura política implantada en Chile por casi dos décadas.',
          category: CATEGORIES.escenicas,
          location: PLACES.aulaMagna,
          time: '19:00',
          gallery: [
            { name: 'Siervas del buen pastor', imgName: 'siervas-del-buen-pastor-2.png' },
            { name: 'Siervas del buen pastor', imgName: 'siervas-del-buen-pastor-3.jpg' },
            { name: 'Siervas del buen pastor', imgName: 'siervas-del-buen-pastor-4.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/colectivoconzumoteatro/',
            fb: 'https://www.facebook.com/colectivoteatral.conzumo/'
          },
          more_info: [
            ['Dramaturgia y Dirección:', 'Héctor Álvarez Godoy.'],
            ['Elenco:', 'Vanessa Vaccaro / Javiera Vegas / Margarita Castro / Camila Molina / Nicolás Yusta.'],
            ['Duración:', '60 minutos.']
          ]
        },
        {
          title: 'Obra: “Stella terral”',
          subTitle: 'Compañía "TeatroPuerto"',
          description: 'Este es el tercer montaje del Proyecto Escritoras, el cual, a través del armado del espacio para una conferencia de prensa, se visitará en presente a la escritora serenense Stella Díaz Varín, quien a través de su irreverencia nos llevará a cuestionarnos sobre temas como la muerte, el arte y la política.',
          category: CATEGORIES.escenicas,
          location: PLACES.palace,
          time: '19:00',
          gallery: [
            { name: 'Stella terral', imgName: 'stella-terral-1.jpg' },
            { name: 'Stella terral', imgName: 'stella-terral-2.jpg' },
            { name: 'Stella terral', imgName: 'stella-terral-3.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/teatropuerto.cl/?hl=es',
            fb: 'https://www.facebook.com/teatropuerto/?locale=es_LA'
          },
          more_info: [
            ['Dramaturgia:', 'Dayán Guerrero.'],
            ['Dirección:', 'Rodrigo Zarricueta.'],
            ['Elenco:', 'April Gregory'],
          ]
        }
      ],
      '20:00': [
        {
          title: 'Concierto en Ovalle',
          subTitle: '20.98, D43 y PAU',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.tmo,
          time: '20:00',
          gallery: [
            { name: 'PAU', imgName: 'pau-1.jpg' },
            { name: 'D43', imgName: 'd43-3.jpg' },
            { name: '20.98', imgName: '20.98-1.jpeg' },
          ],
          exhibitors: [
            {
              name: '20.98',
              description: 'La casa de un caracol, la cotidianidad y la psicodelia oscilan mezclados en las canciones de 20.98, un proyecto formado en el año 2020 por Fabian, experimentando con sonidos sacados del Lo-fi hiphop y el pop creando su primer álbum de bajo presupuesto instrumental llamado ATHOME.',
              social_media: {
                ig: 'https://www.instagram.com/20.98__?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D',
                yt: 'https://www.youtube.com/@user-io7sx7by1o/videos',
                spotify: 'https://open.spotify.com/intl-es/artist/5BY3C7BPtWIrS3qXKvbQCB?si=fGO2_6q8SqGiAO_cDL14pA&nd=1&dlsi=255d105a551349ef',
                soundcloud: 'https://soundcloud.com/20-98'
              }
            },
            {
              name: 'D43',
              description: 'D43 es una banda de rock pop unida por la sangre, ya que esta se conforma por familiares de la región de Coquimbo. La banda nace en el año 2018, convirtiéndose en un nombre recurrente de festivales y conciertos en la región, y posicionando a D43 como pista clave para entender la música Rock Pop de la escena actual.',
              social_media: {
                ig: 'https://www.instagram.com/d43banda/',
                fb: 'https://www.facebook.com/D43banda',
                spotify: 'https://open.spotify.com/intl-es/album/0kUk51sVaELlrRIxuHB6k1?si=ZUviZz-cR4ayBLxN5J3gQg&nd=1&dlsi=eaef5ee0b7364afb',
                yt: 'https://www.youtube.com/watch?v=a2yigB1O0Fw'
              }
            },
            {
              name: 'PAU',
              description: '“Pau” es Pablo Acuña, cantautor y productor musical chileno. El año 2020 debutó con su álbum “Latencia” que le valió el inmediato reconocimiento espontáneo entre sus pares. Este disco lo lleva a ganar el Premio Pulsar 2021 en la categoría “Mejor Nuevo Artista”. Actualmente, se encuentra en el proceso de composición de su siguiente disco el cual será publicado a través de BlackVitamina Records.',
              social_media: {
                ig: 'https://www.instagram.com/paumusica/?hl=es',
                x: 'https://twitter.com/paumusicacl?lang=es',
                spotify: 'https://open.spotify.com/intl-es/artist/3K8xLmnOqUqGGaLzL0DvL3',
                yt: 'https://www.youtube.com/channel/UCmL6JhLX8neSIXDSyimdKow'
              }
            }
          ]
        }
      ],
      '21:00': [
        {
          title: 'Concierto en el Centenario',
          subTitle:
            'Buen Punto, Natural Esencia, La Cumbia Record y Camiseta 22',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          time: '21:00',
          gallery: [
            { name: 'Camiseta 22', imgName: 'camiseta-22-1.jpeg' },
            { name: 'La Cumbia Records', imgName: 'la-cumbia-records-1.jpeg' },
            { name: 'Natural Esencia', imgName: 'natural-esencia-1.jpg' },
            { name: 'Buen Punto', imgName: 'buen-punto-2.jpg' },
          ],
          exhibitors: [
            {
              name: 'Buen Punto',
              description: 'Buen Punto es una banda chilena que desde el año 2016 trabaja para crear música independiente, fusionando pop lationamericano, con funk y soul.',
              social_media: {
                spotify: 'https://open.spotify.com/intl-es/artist/6o69qjnuT4UNeKWx0JcLts?si=HM1VwpN-TyuU5AYjiT3Rlg&nd=1&dlsi=f014a620be054e7d',
                ig: 'https://www.instagram.com/buenpunto.musica',
                fb: 'https://www.facebook.com/buenpuntochile'
              }
            },
            {
              name: 'Natural Esencia',
              description: 'Natural Esencia, es un grupo de música de Hip Hop y Reggae, conformado por Luis Morales / Mc Mao (cantante), Victor Daine / Dolape (cantante) y Manuel Saavedra / Manu RMX (dj / productor). Oriundos de la ciudad Illapel, el grupo se conformó en el año 2018.',
              social_media: {
                ig: 'http://www.instagram.com/naturalesenciaoficial',
                yt: 'http://www.youtube.com/NaturalEsencia',
                spotify: 'https://open.spotify.com/intl-es/artist/0PJ2BWfL0Fqo6JThPjIRdJ?si=dZqvgFVmQgu7hzHSsJUF-Q',
                flickr: 'https://www.flickr.com/naturalesenciaoficial'
              }
            },
            {
              name: 'La Cumbia Records',
              description: 'Esta agrupación musical de Coquimbo fue fundada en el 2022. Mezclan la cumbia con sonidos como la salsa, el ska, el rock, el reggae y el punk, otorgando a sus ritmos y melodías una riqueza y vitalidad inigualables. Se erigen como representantes de la nueva cumbia coquimbana.',
              social_media: {
                ig: 'https://www.instagram.com/lacumbiarecords/',
                fb: 'https://www.facebook.com/p/La-Cumbia-Records-100068493217367/',
                yt: 'https://www.youtube.com/channel/UCWL28DkMaFdBb8kK90xulJA',
                spotify: 'https://open.spotify.com/intl-es/artist/7hqJNHJj2CRGd7UPBNvZ5i'
              }
            },
            {
              name: 'Camiseta 22',
              description: 'Camiseta 22 es la continuación natural de Guachupé, una de las bandas más convocantes de la escena musical chilena y que traspasa dicha energía y compromiso con sus hinchas en este nuevo proyecto.',
              social_media: {
                ig: 'https://www.instagram.com/camiseta22oficial/?hl=es',
                fb: 'https://www.facebook.com/camiseta22_oficial/',
                spotify: 'https://open.spotify.com/intl-es/artist/32lMy5o72ghZijsNvPOeUf?autoplay=true',
                yt: 'https://www.youtube.com/channel/UCHE4s22M0xunLbN4Yal0vMw'
              }
            }
          ]
        }
      ]
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
          //! REVISAR INFO ARTESANOS
          title: 'Muestra de Artesanía',
          subTitle: '10 Artesanos y 3 Expositores',
          description: 'Esta exposición se realizará el domingo 30 de junio, desde las 10:00 a las 20:00 horas, en el Mall Vivo Coquimbo. Serán 10 artesanos y tres expositores (Valentina La Mura, Mario Ignacio Bubo Barahona y María Paz Lillo).',
          category: CATEGORIES.artesania,
          location: PLACES.mall,
          time: ['10:00', '20:00'],
        }
      ],
      '11:00': [
        {
          title: 'Taller de escritura y Bioma: exploración de la naturaleza a través de la literatura',
          //! REVISAR QUIEN IMPARTE
          subTitle: 'Expone: Caos de Couve',
          description: 'Taller de escritura creativa que reúne tres géneros literarios -poesía, crónica y relato breve- a partir de un tema central: la escritura de la naturaleza. Este foco temático que puede indagarse desde una gran diversidad de posibilidades (lo científico, lo ancestral-popular, lo psicoemocional, lo ecológico, entre otros), se desarrollará desde lo identitario regional.',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          time: ['11:00', '12:30'],
          gallery: [
            { name: 'Bioma', imgName: 'bioma-1.jpg' },
            { name: 'Bioma', imgName: 'bioma-2.jpg' },
            { name: 'Bioma', imgName: 'bioma-3.jpg' },
          ],
        }
      ],
      '12:00': [
        {
          //! FALTA INFO
          title: 'Obra: "Tatul, el paraíso en la tierra"',
          subTitle: 'Compañía "La chinchilla subversiva"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.teatroMunicipal,
          time: '12:00',
          gallery: [
            { name: 'Tatul', imgName: 'tatul-1.jpeg' },
            { name: 'Tatul', imgName: 'tatul-2.jpeg' },
            { name: 'Tatul', imgName: 'tatul-3.jpeg' },
          ],
        }
      ],
      '15:00': [
        {
          title: 'Taller “Cómo contar cuentos de terror y no morir de miedo”',
          subTitle: 'Imparte: Nancy Ramos Fuentes',
          description: 'En este taller se trabajará con cuentos cortos de terror, misterio y/o suspenso. Se realizará un ejercicio práctico de escritura y luego tras la lectura de los textos creados y otros textos clásicos del terror, se dará paso de forma lúdica al arte de la narración oral. Se entregarán pautas para la creación de textos y de expresión en la narrativa oral.',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          time: ['15:00', '18:00'],
          gallery: [
            { name: 'Como contar cuentos de terror', imgName: 'como-contar-cuentos-de-terror-1.jpg' },
            { name: 'Como contar cuentos de terror', imgName: 'como-contar-cuentos-de-terror-2.jpg' },
            { name: 'Como contar cuentos de terror', imgName: 'como-contar-cuentos-de-terror-3.jpg' },
          ],
          more_info: [
            ['Clasificación:', '+ 14 años.']
          ]
        }
      ],
      '18:00': [
        {
          title: 'Obra Circo: "Vía"',
          subTitle: 'Compañía "Circo La Cuarta Estación"',
          description: '“VIA” es un espectáculo de circo contemporáneo que utiliza las antiguas estaciones de trenes abandonadas como espacio y las vías del tren como soporte para desplegar 5 dispositivos escenotécnicos rodantes. Las estaciones se transforman en un gran escenario y el público se convierte en un pasajero más de este viaje en el tiempo.',
          category: CATEGORIES.escenicas,
          location: PLACES.trenes,
          time: '18:00',
          gallery: [
            { name: 'Vía', imgName: 'vía-1.jpg' },
            { name: 'Vía', imgName: 'vía-2.jpg' },
            { name: 'Vía', imgName: 'vía-3.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/circolacuartaestacion/',
            fb: 'https://www.facebook.com/circolacuarta.estacion.18/?locale=es_LA',
            yt: 'https://www.youtube.com/channel/UCJPKBpXnNA1AeCF-tE-6dOg'
          },
          more_info: [
            ['Dirección teatro y circo:', 'Carolina Cuturrufo y Sebastián Araya.'],
            ['Elenco:', 'Valentina Pierotic / Felipe Vergara / Paula Masciangelo / Álvaro Leiva / Julieta García / Sebastian Araya / Daniela Miles / Nicola Gonzalez / Joan Uren / Sofia Devoto / Mariano Scaldafferro/ Daniela Julian.'],
            ['Duración:', '55 minutos.']
          ]
        }
      ],
      '19:00': [
        {
          title: 'Obra: “Víctor Trasciende”',
          subTitle: 'Compañía "Núcleo de autoría escénica"',
          description: 'Es una obra de artes escénicas teatrales desarrollada como acto conmemorativo de los 50 años del Golpe de Estado en Chile. El espectáculo escénico unipersonal es construido a partir de una investigación que estudió la vida y obra del artista, asesinado en 1973.',
          category: CATEGORIES.escenicas,
          location: PLACES.aulaMagna,
          time: '19:00',
          gallery: [
            { name: 'Victor Trasciende', imgName: 'victor-trasciende-1.jpg' },
            { name: 'Victor Trasciende', imgName: 'victor-trasciende-4.jpg' },
            { name: 'Victor Trasciende', imgName: 'victor-trasciende-6.jpg' },
          ],
          social_media: {
            ig: 'https://www.instagram.com/nucleo_autoria_escenica/',
            fb: 'https://www.facebook.com/NucleoAutoriaEscenica/'
          },
          more_info: [
            ['Dirección y dramaturgia:', 'Julio Bustamante - Luis Arenas.'],
            ['Elenco:', 'Luis Arenas.'],
          ]
        }
      ],
      '20:00': [
        {
          title: 'Concierto en el Centenario',
          subTitle: 'Natalia Corvetto, Animales de Lumiere, Electrodomésticos',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          time: '20:00',
          gallery: [
            { name: 'Electrodomesticos', imgName: 'electrodomesticos-1.png' },
            { name: 'Animales de Lumiere', imgName: 'animales-de-lumiere-3.png' },
            { name: 'Natalia Corvetto', imgName: 'natalia-corvetto-3.jpg' },
          ],
          exhibitors: [
            {
              name: 'Natalia Corvetto',
              description: 'La coquimbana Natalia Corvetto es parte de una extensa línea de cultoras de música moderna. Su propuesta se fundamenta en los ritmos de la música popular latinoamericana, el bolero y la bossa nova como columnas centrales. Corvetto se inició en el canto a temprana edad, primero en una Iglesia y luego como solista en conciertos de la Big Band de la Universidad de La Serena.',
              social_media: {
                ig: 'https://www.instagram.com/nataliacorvetto/?hl=es',
                fb: 'https://www.facebook.com/nataliacorvetto/?locale=es_LA',
                yt: 'https://www.youtube.com/c/NataliaCorvetto',
                spotify: 'https://open.spotify.com/intl-es/artist/28N1JN0g59VCHSfg2v2n75'
              }
            },
            {
              name: 'Animales de Lumiere',
              description: 'Es una banda que emergió a mediados del 2012 en Chile, que fusiona sonidos del New Wave, el ambiente del post rock y el espíritu del post punk. Sus integrantes son: Ignacio Lemus (voz y guitarra), Felipe Cortés (bajo) y Gabriel Herrera (batería y secuencias).',
              social_media: {
                ig: 'https://www.instagram.com/animalesdelumiere/',
                fb: 'https://www.facebook.com/animalesdelumiere/?locale=es_LA',
                yt: 'https://www.youtube.com/channel/UCUKaayU5YSt0AGTyRTp7kyw',
                spotify: 'https://open.spotify.com/intl-es/artist/3ohdepkEGvG0O1ZleThcia'
              }
            },
            {
              name: 'Electrodomésticos',
              description: 'Electrodomésticos es un grupo musical chileno de rock alternativo e industrial, formado en Santiago en 1984. Tras disolverse en 1992 con dos álbumes, la agrupación volvió en 2002 durante tres años, manteniéndose activo establemente desde 2011.',
              social_media: {
                ig: 'https://www.instagram.com/loselectro/?hl=es',
                fb: 'https://www.facebook.com/ElectrodomesticosOficial/?locale=es_LA',
                yt: 'https://www.youtube.com/channel/UCEjZv4eRuoijq7mBpWH4Jvw',
                spotify: 'https://open.spotify.com/intl-es/artist/1jW8O5TTQQUb1G05GLxSEn?autoplay=true'
              }
            }
          ]
        }
      ]
    }
  }
]
