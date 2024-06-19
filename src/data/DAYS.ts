import { CATEGORIES, CITIES, PLACES } from "./CONSTANTS"

export interface DAY {
  day: string
  color: { [key: string]: string }
  schedule: {
    [key: string]: ACTIVITY[]
  }
}

export interface ACTIVITY {
  title: string
  subTitle?: string
  description: string
  category: string
  location: {
    name: string
    maps: string
  }
  city: string
  time: string[] | string
  tickets?: string
  gallery?: string[]
  social_media?: {
    [key: string]: string
  }
}

export const DAYS: DAY[] = [
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
          title: 'José Luis Urquieta',
          subTitle: 'Inauguración ARC 2024',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.consistorial,
          city: CITIES.cq,
          time: '20:00'
        },
        {
          title: 'Lican Antay',
          subTitle: 'Inauguración ARC 2024',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.consistorial,
          city: CITIES.cq,
          time: '20:00'
        },
        {
          title: 'Congreso',
          subTitle: 'Inauguración ARC 2024',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.consistorial,
          city: CITIES.cq,
          time: '20:00'
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
        {
          title: 'Inauguración Expo Arte Co',
          subTitle: '10 Artistas Regionales',
          description: '',
          category: CATEGORIES.visuales,
          location: PLACES.salaExposiciones,
          city: CITIES.ls,
          time: ['10:00', '18:00']
        },
        {
          title: 'Taller "Hasta que leer se haga costumbre: Psicopedagogía de la mediación lectora"',
          subTitle: 'Imparten "David Santos & Constanza Fernandez"',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.kamino,
          city: CITIES.ls,
          time: ['10:00', '18:00']
        },
      ],
      '12:00': [
        {
          title: 'Obra "El Mensajero Sideral en la Región Estrella',
          subTitle: 'Compañía "Ojos de Agua"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.teatroMunicipal,
          city: CITIES.ls,
          time: '12:00'
        },
      ],
      '17:00': [
        {
          title: 'Obra "Todo pal patrón, nada pal dolor"',
          subTitle: 'Compañía "Teatro Gárgaras"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.salonAuditorioIllapel,
          city: CITIES.ill,
          time: '17:00'
        },
      ],
      '18:00': [
        {
          title: 'Lanzamiento Libro "Un Largo Solo"',
          subTitle: 'Expone: Bruno Montané Krebs',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          city: CITIES.ls,
          time: '18:00'
        },
      ],
      '18:30': [
        {
          title: 'Obra "Idilio"',
          subTitle: 'Compañía "La Voraz"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.plazaIllapel,
          city: CITIES.ill,
          time: '18:30'
        },
      ],
      '19:00': [
        {
          title: 'Conversatorio: Conversas en Red: La bandera de Chile, un homenaje a la resistencia y la memoria',
          subTitle: 'Expone: Red Feminista del Libro',
          description: '',
          category: CATEGORIES.literatura,
          location: PLACES.casaEditorial,
          city: CITIES.ls,
          time: '19:00'
        },
        {
          title: 'Obra "Letargia"',
          subTitle: 'Compañía "Las Maires"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.tmo,
          city: CITIES.ov,
          time: '19:00'
        },
        {
          title: 'Obra "Lambert, La rebelión de los Serenos"',
          subTitle: 'Colectivo Teatral "Con-Zumo"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.aulaMagna,
          city: CITIES.ls,
          time: '19:00'
        },
        {
          title: 'Obra "Pino(Shit)"',
          subTitle: 'Compañía "[Didascalia] y viceversa Colectivo Artístico"',
          description: '',
          category: CATEGORIES.escenicas,
          location: PLACES.palace,
          city: CITIES.cq,
          time: '19:00'
        },
        {
          title: 'Pre Estreno "Amadiela"',
          subTitle: 'Mijael Milies',
          description: '',
          category: CATEGORIES.audiovisual,
          location: PLACES.museoArqueologico,
          city: CITIES.ls,
          time: '19:00'
        },
      ],
      '21:00': [
        {
          title: 'Concierto 360°',
          subTitle: '',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          city: CITIES.ls,
          time: '21:00'
        },
        {
          title: 'Chicoria Sánchez',
          subTitle: '',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          city: CITIES.ls,
          time: '21:00'
        },
        {
          title: 'Cafuzo',
          subTitle: '',
          description: '',
          category: CATEGORIES.musica,
          location: PLACES.centenario,
          city: CITIES.ls,
          time: '21:00'
        },
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
      '': [
        {
          title: '',
          subTitle: '',
          description: '',
          category: '',
          location: { name: '', maps: '' },
          city: '',
          time: ['']
        },
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
      '': [
        {
          title: '',
          subTitle: '',
          description: '',
          category: '',
          location: { name: '', maps: '' },
          city: '',
          time: ['']
        },
      ]
    }
  }
]
