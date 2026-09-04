export interface CallDiscipline {
  name: string
  url: string
}

export interface CallCategory {
  title: string
  disciplines: CallDiscipline[]
}

export interface CallDeadline {
  prefix: string
  start: string
  connector: string
  end: string
  suffix: string
  month: string
}

export const call = {
  title: 'Convocatoria Festival ARC 2026',
  deadline: {
    prefix: 'Convocatoria regional:',
    start: '04',
    connector: 'al',
    end: '25',
    suffix: 'de',
    month: 'septiembre',
  } satisfies CallDeadline,
  categories: [
    {
      title: 'Presentaciones y exhibiciones',
      disciplines: [
        { name: 'Música', url: 'https://forms.gle/sWnZWC3jQJRz2efJ6' },
        { name: 'Artes Escénicas', url: 'https://forms.gle/9W7jtppD7HSLmRaQ6' },
        { name: 'Artes Visuales', url: 'https://forms.gle/3tt6BztVrTx9Vzfr9' },
        { name: 'Audiovisual', url: 'https://forms.gle/ht2giybovxR92UgM8' },
      ],
    },
    {
      title: 'Espacio ferial y mercado creativo',
      disciplines: [
        { name: 'Literatura / Editorial', url: 'https://forms.gle/QFDcZWVbKdNezYhf6' },
        { name: 'Artesanía', url: 'https://forms.gle/paco4xhhivmc4p5B7' },
        { name: 'Diseño e Ilustración', url: 'https://forms.gle/4mMLLuQCh5kGUq8L6' },
      ],
    },
  ],
} as const
