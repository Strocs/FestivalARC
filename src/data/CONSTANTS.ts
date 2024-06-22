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
  }
}

export const PLACES: Places = {
  consistorial: {
    city: CITIES.cq,
    name: 'Auditorio Consistorial Municipalidad de Coquimbo',
    maps: 'https://maps.app.goo.gl/gjx2duh2gBYcgavS9'
  },
  salaExposiciones: {
    city: CITIES.ls,
    name: 'Sala de Exposiciones ULS',
    maps: 'https://maps.app.goo.gl/pisAF9ngFG5T4axT8'
  },
  kamino: {
    city: CITIES.ls,
    name: 'Centro Cultural KAMINO520',
    maps: 'https://maps.app.goo.gl/cvmGA86tmypHZBdi6'
  },
  teatroMunicipal: {
    city: CITIES.ls,
    name: 'Teatro Municipal',
    maps: 'https://maps.app.goo.gl/y7FDYBx99Rqe74zp9'
  },
  salonAuditorioIllapel: {
    city: CITIES.ill,
    name: 'Salón Auditorio Casa de la Cultura',
    //!CONFIRMAR
    maps: 'https://maps.app.goo.gl/1HsbeJyJsNGqupmN9'
  },
  casaEditorial: {
    city: CITIES.ls,
    name: 'Casa Editorial ULS',
    maps: 'https://maps.app.goo.gl/EEebachieKw2XMFg8'
  },
  plazaIllapel: {
    city: CITIES.ill,
    name: 'Plaza de Armas de Illapel',
    maps: 'https://maps.app.goo.gl/Yhp6wgqTXBwnkz2L8'
  },
  tmo: {
    city: CITIES.ov,
    name: 'TMO',
    maps: 'https://maps.app.goo.gl/UMdNtVXba8yXuwbW7'
  },
  aulaMagna: {
    city: CITIES.ls,
    name: 'Aula Magna ULS',
    maps: 'https://maps.app.goo.gl/LXGkY7zeLjkUzMk56'
  },
  palace: {
    city: CITIES.cq,
    name: 'Centro Cultural Palace',
    maps: 'https://maps.app.goo.gl/B2WmfVJsYDXPpN2SA'
  },
  museoArqueologico: {
    city: CITIES.ls,
    name: 'Auditorio "Francisco Cornely" - Museo Arqueológico',
    maps: 'https://maps.app.goo.gl/v3UzAYEbksXcpP6r7'
  },
  centenario: {
    city: CITIES.ls,
    name: 'Teatro Centenario',
    maps: 'https://maps.app.goo.gl/481jS6rK1gF2sbzU6'
  },
  galeria: {
    city: CITIES.cq,
    name: 'Galería Chile Arte',
    maps: 'https://maps.app.goo.gl/UCCkdb6gUVPqqj8v7'
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
