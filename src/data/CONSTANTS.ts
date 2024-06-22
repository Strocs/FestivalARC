export const enum CATEGORIES {
  visuales = 'Artes Visuales',
  musica = 'Música',
  literatura = 'Literatura',
  audiovisual = 'Audiovisual',
  escenicas = 'Artes Escénicas',
  artesania = 'Artesanía'
}

export const enum ARTWORK {
  obra = 'Obra',
  perf = 'Obra/Performance'
}

export const enum CITIES {
  ls = 'La Serena',
  cq = 'Coquimbo',
  ov = 'Ovalle',
  ill = 'Illapel'
}

interface Places {
  [key: string]: {
    city: CITIES
    name: string
    maps: string
    tickets?: {
      title: string
      url: Array<string[]>
    }
  }
}

export const TICKETS = {
  form: 'Inscripción',
  ticket: 'Tickets'
}

export const PLACES: Places = {
  consistorial: {
    city: CITIES.cq,
    name: 'Auditorio Consistorial Municipalidad de Coquimbo',
    maps: 'https://maps.app.goo.gl/gjx2duh2gBYcgavS9',
    tickets: {
      title: TICKETS.ticket,
      url: []
    }
  },
  salaExposiciones: {
    city: CITIES.ls,
    name: 'Sala de Exposiciones ULS',
    maps: 'https://maps.app.goo.gl/pisAF9ngFG5T4axT8',
  },
  kamino: {
    city: CITIES.ls,
    name: 'Centro Cultural KAMINO520',
    maps: 'https://maps.app.goo.gl/cvmGA86tmypHZBdi6',
    tickets: {
      title: TICKETS.form,
      url: [
        ['descampado', 'https://forms.fillout.com/t/2BAonQG1FVus'],
        ['Hasta que leer', 'https://forms.fillout.com/t/iVkD68JP3Tus'],
        ['Bioma', 'https://forms.fillout.com/t/wm9RVtM31wus'],
        ['cuentos de terror', 'https://forms.fillout.com/t/8BdAn2L6Jbus'],
      ]
    }
  },
  teatroMunicipal: {
    city: CITIES.ls,
    name: 'Teatro Municipal',
    maps: 'https://maps.app.goo.gl/y7FDYBx99Rqe74zp9',
    tickets: {
      title: TICKETS.ticket,
      url: []
    }
  },
  salonAuditorioIllapel: {
    city: CITIES.ill,
    name: 'Salón Auditorio Casa de la Cultura',
    //!CONFIRMAR
    maps: 'https://maps.app.goo.gl/i57HCbemPUR8fncM6',
    tickets: {
      title: TICKETS.ticket,
      url: []
    }
  },
  casaEditorial: {
    city: CITIES.ls,
    name: 'Casa Editorial ULS',
    maps: 'https://maps.app.goo.gl/EEebachieKw2XMFg8',
    tickets: {
      title: TICKETS.ticket,
      url: []
    }
  },
  plazaIllapel: {
    city: CITIES.ill,
    name: 'Plaza de Armas de Illapel',
    maps: 'https://maps.app.goo.gl/Yhp6wgqTXBwnkz2L8'
  },
  tmo: {
    city: CITIES.ov,
    name: 'TMO',
    maps: 'https://maps.app.goo.gl/UMdNtVXba8yXuwbW7',
    tickets: {
      title: TICKETS.ticket,
      url: [
        ['Concierto en Ovalle', 'https://ticketplus.cl/events/festival-arc-2024-concierto-en-ovalle'],
        ['Letargia', 'https://ticketplus.cl/events/festival-arc-2024-obra-letargia'],
      ]
    }
  },
  aulaMagna: {
    city: CITIES.ls,
    name: 'Aula Magna ULS',
    maps: 'https://maps.app.goo.gl/LXGkY7zeLjkUzMk56',
    tickets: {
      title: TICKETS.ticket,
      url: []
    }
  },
  palace: {
    city: CITIES.cq,
    name: 'Centro Cultural Palace',
    maps: 'https://maps.app.goo.gl/B2WmfVJsYDXPpN2SA',
    tickets: {
      title: TICKETS.ticket,
      url: []
    }

  },
  museoArqueologico: {
    city: CITIES.ls,
    name: 'Auditorio "Francisco Cornely" - Museo Arqueológico',
    maps: 'https://maps.app.goo.gl/v3UzAYEbksXcpP6r7',
    tickets: {
      title: TICKETS.ticket,
      url: []
    }
  },
  centenario: {
    city: CITIES.ls,
    name: 'Teatro Centenario',
    maps: 'https://maps.app.goo.gl/481jS6rK1gF2sbzU6',
    tickets: {
      title: TICKETS.ticket,
      url: []

    }
  },
  galeria: {
    city: CITIES.cq,
    name: 'Galería Chile Arte',
    maps: 'https://maps.app.goo.gl/UCCkdb6gUVPqqj8v7',
    tickets: {
      title: TICKETS.form,
      url: [
        ['musical y sonora', 'https://forms.fillout.com/t/aJvtV9czT1us']
      ]

    }
  },
  mall: {
    city: CITIES.cq,
    name: 'Mall VIVO Coquimbo',
    maps: 'https://maps.app.goo.gl/JDjx58sF5rf4Gf3H6'
  },
  trenes: {
    city: CITIES.ov,
    name: 'Estación de Trenes de Ovalle',
    maps: 'https://maps.app.goo.gl/Xe8JCsaNnChKuUfc8'
  }
}
