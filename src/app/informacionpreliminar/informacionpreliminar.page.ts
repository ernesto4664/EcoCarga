import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-informacionpreliminar',
  templateUrl: './informacionpreliminar.page.html',
  styleUrls: ['./informacionpreliminar.page.scss'],
})
export class InformacionpreliminarPage implements AfterViewInit, OnInit {
  showSkipButton = false; 
  showPrevButton = false; 
  nextButtonText = 'Empezar'; 

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Verificar si se accede desde el menú
    const fromMenu = this.route.snapshot.paramMap.get('fromMenu');

    // Si no se accede desde el menú, aplicar lógica de caché
    if (!fromMenu || fromMenu !== 'menu') {
      const pageViewedDate = localStorage.getItem('informacionPreliminarViewedDate');
      if (pageViewedDate) {
        const currentTime = new Date().getTime();
        const viewedTime = new Date(pageViewedDate).getTime();
        const oneYearInMillis = 365 * 24 * 60 * 60 * 1000;

        if ((currentTime - viewedTime) < oneYearInMillis) {
          this.router.navigate(['/viewone']);
        }
      }
    }
  }

  ngAfterViewInit() {
    const swiper = (document.querySelector('swiper-container') as any)?.swiper;
    if (swiper) {
      swiper.on('slideChange', () => {
        this.showSkipButton = swiper.isEnd; 
        this.showPrevButton = swiper.activeIndex > 0; 
        this.nextButtonText = swiper.activeIndex > 0 ? 'Siguiente' : 'Empezar'; 
      });
    }
  }

  next() {
    const swiper = (document.querySelector('swiper-container') as any)?.swiper;
    if (swiper) {
      swiper.slideNext();
    }
  }

  prev() {
    const swiper = (document.querySelector('swiper-container') as any)?.swiper;
    if (swiper) {
      swiper.slidePrev();
    }
  }

  skip() {
    localStorage.setItem('informacionPreliminarViewedDate', new Date().toISOString());
    this.router.navigate(['/viewone']);
  }
}
