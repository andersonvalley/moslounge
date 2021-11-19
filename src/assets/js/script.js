import lazyLoadInstance from './modules/lazy'
import WOW from 'wow.js'

document.addEventListener('DOMContentLoaded', () => {
  lazyLoadInstance.update()
  new WOW().init()
  burgerMenu()
  scrollHeader()
  chooseAddress()
  countNumbers()
  interiorSlider()
})
