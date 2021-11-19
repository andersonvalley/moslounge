import lazyLoadInstance from './modules/lazy'
import WOW from 'wow.js'
import Parallax from 'parallax-js'

document.addEventListener('DOMContentLoaded', () => {
  lazyLoadInstance.update()
  new WOW().init()

  const scene = document.getElementById('scene')
  const parallaxInstance = new Parallax(scene)

  window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader')
    preloader.classList.add('preloader_hidden')
  })
})
