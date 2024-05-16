import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-informacionpreliminar',
  templateUrl: './informacionpreliminar.page.html',
  styleUrls: ['./informacionpreliminar.page.scss'],
})
export class InformacionpreliminarPage implements AfterViewInit {

  constructor() {}

  ngAfterViewInit() {
    // Acceder a Swiper aquí
    const swiper = (document.querySelector('swiper-container') as any)?.swiper;
    if (swiper) {
      // Swiper está disponible, puedes llamar a los métodos slideNext() y slidePrev() aquí
    }
  }

  next() {
    // Lógica para la diapositiva siguiente
    const swiper = (document.querySelector('swiper-container') as any)?.swiper;
    if (swiper) {
      swiper.slideNext();
    }
  }

  prev() {
    // Lógica para la diapositiva anterior
    const swiper = (document.querySelector('swiper-container') as any)?.swiper;
    if (swiper) {
      swiper.slidePrev();
    }
  }
}
