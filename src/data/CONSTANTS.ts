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
    maps: ''
  },
  casaEditorial: {
    city: CITIES.ls,
    name: 'Casa Editorial ULS',
    maps: 'https://maps.app.goo.gl/EEebachieKw2XMFg8'
  },
  plazaIllapel: {
    city: CITIES.ill,
    name: 'Plaza de Armas de Illapel',
    maps: ''
  },
  tmo: { city: CITIES.ov, name: 'TMO', maps: '' },
  aulaMagna: { city: CITIES.ls, name: 'Aula Magna ULS', maps: '' },
  palace: { city: CITIES.cq, name: 'Centro Cultural Palace', maps: '' },
  museoArqueologico: {
    city: CITIES.ls,
    name: 'Salón Auditorio "Francisco Cornely" - Museo Arqueológico',
    maps: ''
  },
  centenario: { city: CITIES.ls, name: 'Teatro Centenario', maps: '' },
  galeria: { city: CITIES.cq, name: 'Galería Chile Arte', maps: '' },
  mall: { city: CITIES.cq, name: 'Mall VIVO Coquimbo', maps: '' },
  trenes: { city: CITIES.ov, name: 'Estación de Trenes de Ovalle', maps: '' }
}
