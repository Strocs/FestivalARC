interface SITE {
  title: string
  description: string
  lang: string
  OG_image: string
  favicon: string
  URL: {
    site: string
    facebook: string
    instagram: string
    twitter: string
    youtube: string
  }
}

export const SITE: SITE = {
  title: 'ARC 2024 | ',
  description: 'El Festival de las Artes Región de Coquimbo (Festival ARC 2024) presenta novedades, trasladando sus fechas al periodo de las vacaciones de invierno, del 27 al 30 de junio. En esta décima tercera edición, el evento se concentra en la conurbación de La Serena y Coquimbo, extendiéndose a las comunas de Ovalle e Illapel.',
  lang: 'es',
  OG_image: 'OG_image.png',
  favicon: 'ARC24.png',
  URL: {
    site: 'https://festivalarc.cl',
    facebook: 'https://web.facebook.com/FestivalARC',
    instagram: 'https://www.instagram.com/festival_arc',
    twitter: 'https://x.com/festivalarc',
    youtube: 'https://www.youtube.com/@festivalarc5632'
  }
}