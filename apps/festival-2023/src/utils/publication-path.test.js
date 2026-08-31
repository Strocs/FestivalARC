import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { MUSEO } from '../data/MUSEO.js'
import { withPublicationBase } from './publication-path.js'

test('prefixes local routes and assets without duplicating the publication base', () => {
  assert.equal(withPublicationBase('/', '/ediciones/2023'), '/ediciones/2023/')
  assert.equal(withPublicationBase('/festival', '/ediciones/2023'), '/ediciones/2023/festival')
  assert.equal(withPublicationBase('gaviota/evento', '/ediciones/2023'), '/ediciones/2023/gaviota/evento')
  assert.equal(withPublicationBase('/ediciones/2023/festival', '/ediciones/2023'), '/ediciones/2023/festival')
})

test('references the case-sensitive museum asset that exists in public output', () => {
  const event = MUSEO.schedule.flatMap((day) => day.events).find(({ id }) => id === 'claudia-campos-mendoza')

  assert.equal(event?.image.url, '/arqueologico/CAMPOS.JPG')
  assert.equal(existsSync(new URL('../../public/arqueologico/CAMPOS.JPG', import.meta.url)), true)
})

test('leaves external, mail, and fragment references unchanged', () => {
  assert.equal(withPublicationBase('//cdn.example.com/image.png', '/ediciones/2023'), '//cdn.example.com/image.png')
  assert.equal(withPublicationBase('https://example.com/image.png', '/ediciones/2023'), 'https://example.com/image.png')
  assert.equal(withPublicationBase('mailto:contacto@example.com', '/ediciones/2023'), 'mailto:contacto@example.com')
  assert.equal(withPublicationBase('#details', '/ediciones/2023'), '#details')
})
