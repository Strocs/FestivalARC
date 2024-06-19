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
      backgroundHover: 'hover:bg-day-1'
    },
    schedule: {
      '20:00': [
        {
          title: 'José Luis Urquieta',
          subTitle: 'Inauguración ARC 2024',
          description: '',
          category: CATEGORIES.musica,
          location: { name: 'Auditorio Consistorial Municipalidad de Coquimbo', maps: 'https://www.google.com/maps/place/Construcci%C3%B3n+Edificio+Consistorial+de+Coquimbo/@-29.9547736,-71.3371278,15z/data=!4m2!3m1!1s0x0:0xd10e3a76020a2809?sa=X&ved=1t:2428&ictx=111' },
          city: 'Coquimbo',
          time: '20:00'
        },
        {
          title: 'Lican Antay',
          subTitle: 'Inauguración ARC 2024',
          description: '',
          category: CATEGORIES.musica,
          location: { name: 'Auditorio Consistorial Municipalidad de Coquimbo', maps: 'https://www.google.com/maps/place/Construcci%C3%B3n+Edificio+Consistorial+de+Coquimbo/@-29.9547736,-71.3371278,15z/data=!4m2!3m1!1s0x0:0xd10e3a76020a2809?sa=X&ved=1t:2428&ictx=111' },
          city: 'Coquimbo',
          time: '20:00'
        },
        {
          title: 'Congreso',
          subTitle: 'Inauguración ARC 2024',
          description: '',
          category: CATEGORIES.musica,
          location: { name: 'Auditorio Consistorial Municipalidad de Coquimbo', maps: 'https://www.google.com/maps/place/Construcci%C3%B3n+Edificio+Consistorial+de+Coquimbo/@-29.9547736,-71.3371278,15z/data=!4m2!3m1!1s0x0:0xd10e3a76020a2809?sa=X&ved=1t:2428&ictx=111' },
          city: 'Coquimbo',
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
      backgroundHover: 'hover:bg-day-2'
    },
    schedule: {
      '10:00': [
        {
          title: 'Inauguración Expo Arte Co',
          subTitle: '10 Artistas Regionales',
          description: '',
          category: CATEGORIES.visuales,
          location: { name: 'Sala de Exposiciones ULS', maps: '' },
          city: 'La Serena',
          time: ['10:00', '18:00']
        },
        {
          title: 'TALLER "HASTA QUE LEER SE HAGA COSTUMBRE: PSICOPEDAGOGÍA DE LA MEDIACIÓN LECTORA"',
          subTitle: 'IMPARTEN "DAVID SANTOS & CONSTANZA FERNANDEZ"',
          description: '',
          category: CATEGORIES.literatura,
          location: { name: '', maps: '' },
          city: 'La Serena',
          time: ['10:00', '13:00']
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
      backgroundHover: 'hover:bg-day-3'
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
      backgroundHover: 'hover:bg-day-4'
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
