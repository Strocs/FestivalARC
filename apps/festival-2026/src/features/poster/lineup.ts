export interface LineupArtist {
  id: string
  name: string
  group: 'national' | 'regional' | 'stage'
  company?: string
}

// Confirmed names only. Activities, dates, venues and biographies are not inferred.
// Fixed editorial mix across categories; Javiera Mena and Gepe stay in the upper third.
export const lineup: readonly LineupArtist[] = [
  { id: 'polter-ovalle', name: 'Polter', group: 'regional' },
  { id: 'lobas', name: 'Lobas', group: 'stage', company: 'Circo Kaleidoscopio' },
  { id: 'nino-cohete', name: 'Niño Cohete', group: 'national' },
  { id: 'yaru', name: 'Yaru', group: 'stage', company: 'Compañía La Feroz' },
  { id: 'shicris', name: 'Shicris', group: 'regional' },
  { id: 'javiera-mena', name: 'Javiera Mena', group: 'national' },
  { id: 'el-humedal', name: 'El Humedal', group: 'stage', company: 'Compañía Los Mil Nombres' },
  { id: 'dulce-y-agraz', name: 'Dulce y Agraz', group: 'national' },
  { id: 'freshki', name: 'Freshki', group: 'regional' },
  { id: 'gepe', name: 'Gepe', group: 'national' },
  { id: 'pulsando', name: 'Pulsando', group: 'stage', company: 'Escuela Zapato Rojo y Compañía' },
  { id: 'javier-barria', name: 'Javier Barría', group: 'national' },
  { id: 'quita-de-bulla-salamanca', name: 'Quitá de Bulla', group: 'regional' },
  { id: 'removernos-a-cielo-abierto', name: 'Removernos a Cielo Abierto', group: 'stage', company: 'Colectivo Zona de Obras' },
  { id: 'fernando-milagros', name: 'Fernando Milagros', group: 'national' },
  { id: 'yatiri', name: 'Yatiri', group: 'stage', company: 'Fundación Sociedad Bach La Serena' },
  { id: 'jazztacuatico', name: 'Jazztacuatico', group: 'regional' },
  { id: 'rosario-alfonso', name: 'Rosario Alfonso', group: 'national' },
  { id: 'red-lambe-norte', name: 'Red Lambe Norte', group: 'stage', company: 'Red Lambe Norte Chile' },
  { id: 'duerme-y-cae', name: 'Duerme y Cae!', group: 'regional' },
  { id: 'claudio-valenzuela', name: 'Claudio Valenzuela', group: 'national' },
  { id: 'awicha', name: 'Awicha', group: 'stage', company: 'Laboratorio Creativo Remolino' },
  { id: 'fernando-ubiergo', name: 'Fernando Ubiergo', group: 'national' },
  { id: 'kalishe', name: 'Kalishe', group: 'regional' },
  { id: 'narrando-mundos-en-bicicleta', name: 'Narrando Mundos en Bicicleta', group: 'stage', company: 'Títeres Ojos de Agua (Ovalle)' },
  { id: 'pedro-piedra', name: 'Pedro Piedra', group: 'national' },
  { id: 'weinkeys-blackbeat', name: 'Weinkeys + blackbeat', group: 'regional' },
  { id: 'bendita-agua', name: 'Bendita Agua', group: 'stage', company: 'Compañía La Boda (Vicuña)' },
  { id: 'nunez-briceno', name: 'Núñez Briceño', group: 'national' },
  { id: 'las-luciernagas-y-el-origen-del-fuego', name: 'Las Luciérnagas y el Origen del Fuego', group: 'stage', company: 'Compañía Cuenta Cuentos Tricahue' },
  { id: 'stendhal', name: 'Stendhal', group: 'regional' },
  { id: 'jose-alfredo-fuentes', name: 'José Alfredo Fuentes', group: 'national' },
  { id: 'llamada-de-emergencia', name: 'Llamada de Emergencia', group: 'stage', company: 'Compañía Noche de Payasas' },
  { id: 'last-whisper', name: 'Last Whisper', group: 'regional' },
  { id: 'innundaremos', name: 'Innundaremos', group: 'national' },
  { id: 'martin-v-s-trampolino-maletines', name: 'Martín V/S Trampolino Maletines', group: 'stage', company: 'Compañía de Teatro Viento Norte' },
  { id: 'guaype-club-infantil', name: 'Guaype Club (Infantil)', group: 'national' },
  { id: 'medinamico', name: 'Medinamico', group: 'regional' },
  { id: 'trans-humante', name: 'Trans-Humante', group: 'stage', company: 'Espacio La Isla (Ovalle)' },
  { id: 'dejenme-dormir', name: 'Dejenme Dormir', group: 'national' },
  { id: 'juan-manotas-y-el-origen-del-carnaval', name: 'Juan Manotas y el Origen del Carnaval', group: 'stage', company: 'Compañía de Teatro Pucará' },
  { id: 'nando-garcia', name: 'Nando García', group: 'national' },
  { id: 'absurdo', name: 'Absurdo', group: 'stage', company: 'Circo Kalendero' },
  { id: 'lero', name: 'Leró', group: 'national' },
  { id: 'esteban-y-los-hurtados', name: 'Esteban y los Hurtados', group: 'regional' },
  { id: 'josefa-errazuriz-dj', name: 'Josefa Errazuriz (DJ)', group: 'national' },
]
