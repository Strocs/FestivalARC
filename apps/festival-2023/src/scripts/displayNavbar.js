import { changeElementStyles, showLocationsInfo, locationsInfo, menu, navbar } from '.'

const publicationBase = document.documentElement.dataset.publicationBase || '/'
const publicationRoot = `${publicationBase.replace(/\/$/, '')}/`

function showNavBar(show) {
	if (show) {
		navbar.style.left = '0'
		navbar.style.opacity = '1'
	} else {
		navbar.style.left = '-448px'
	}
}

navbar.querySelectorAll('a').forEach((anchor) => {
	anchor.addEventListener('click', () => {
		showNavBar(false)
	})
})

navbar.addEventListener('transitionend', (e) => {
	if (navbar !== e.target) return
	if (navbar.style.left === '-448px') {
		navbar.style.opacity = '0'
	}
})
menu.forEach((el) =>
	el.addEventListener('change', (e) => {
		if (e.target.checked) {
			showNavBar(true)
			if (window.location.pathname === publicationRoot) {
				locationsInfo.forEach((location, index) => {
					showLocationsInfo(location, false)
					changeElementStyles(index, false)
				})
			}
			return
		}
		showNavBar(false)
	})
)
