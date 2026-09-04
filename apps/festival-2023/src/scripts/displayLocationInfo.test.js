import test from 'node:test'
import assert from 'node:assert/strict'

function createElement(classNames = []) {
	const classes = new Set(classNames)
	return {
		classList: {
			add: (...names) => names.forEach((name) => classes.add(name)),
			remove: (...names) => names.forEach((name) => classes.delete(name)),
			contains: (name) => classes.has(name)
		},
		querySelector: () => null,
		querySelectorAll: () => [],
		parentElement: null
	}
}

test('changes dynamic backgrounds without leaving bg-main or a white download shadow', async () => {
	const header = createElement(['bg-main'])
	const footer = createElement(['bg-main'])
	const resetButton = createElement(['bg-main'])
	const resetLayer = createElement(['border-main', 'text-main'])
	const unrelatedSpan = createElement(['unrelated-span'])
	const downloadLayer = createElement(['button_top', 'bg-main', 'text-white', 'border-white'])
	const downloadButton = createElement(['button', 'bg-white'])
	const searchBar = createElement(['bg-main', 'text-main'])
	const logo = createElement(['fill-main'])

	header.querySelector = (selector) => selector === '#logo-text' ? logo : null
	resetButton.querySelector = (selector) => selector === 'span' ? resetLayer : null
	downloadLayer.parentElement = downloadButton

	global.document = {
		querySelector: (selector) => ({
			header,
			'header .download-schedule-button .button_top': downloadLayer,
			span: unrelatedSpan,
			footer,
			'#reset-button': resetButton,
			'#map-container': null,
			'#map-guide': null,
			nav: null
		})[selector] || null,
		querySelectorAll: () => [],
		getElementById: (id) => id === 'search-bar' ? searchBar : null
	}

	const { changeElementStyles } = await import('./displayLocationInfo.js?background-test')

	changeElementStyles(0, true)
	for (const element of [header, footer, downloadLayer, resetButton]) {
		assert.equal(element.classList.contains('bg-main'), false)
		assert.equal(element.classList.contains('bg-pale-purple'), true)
	}

	changeElementStyles(0, false)
	for (const element of [header, footer, downloadLayer, resetButton]) {
		assert.equal(element.classList.contains('bg-main'), true)
		assert.equal(element.classList.contains('bg-pale-purple'), false)
	}

	changeElementStyles(5, true)
	assert.equal(downloadButton.classList.contains('bg-white'), false)
	assert.equal(downloadButton.classList.contains('bg-neutral-700'), true)
	assert.equal(downloadLayer.classList.contains('text-white'), false)
	assert.equal(downloadLayer.classList.contains('border-white'), false)
	assert.equal(downloadLayer.classList.contains('text-neutral-700'), true)
	assert.equal(downloadLayer.classList.contains('border-neutral-700'), true)

	changeElementStyles(5, false)
	assert.equal(downloadButton.classList.contains('bg-white'), true)
	assert.equal(downloadButton.classList.contains('bg-neutral-700'), false)
	assert.equal(downloadLayer.classList.contains('text-white'), true)
	assert.equal(downloadLayer.classList.contains('border-white'), true)
})
