import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-informacionpreliminar',
  templateUrl: './informacionpreliminar.page.html',
  styleUrls: ['./informacionpreliminar.page.scss'],
})
export class InformacionpreliminarPage implements AfterViewInit {
  showSkipButton = false; // Variable para controlar la visibilidad del botón "Saltar"

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // Acceder a Swiper aquí
    const swiper = (document.querySelector('swiper-container') as any)?.swiper;
    if (swiper) {
      swiper.on('slideChange', () => {
        this.showSkipButton = swiper.isEnd; // Mostrar el botón "Saltar" solo en el último slide
      });
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

  skip() {
    // Redirigir a otra página
    this.router.navigate(['/first-search']);
  }
}
