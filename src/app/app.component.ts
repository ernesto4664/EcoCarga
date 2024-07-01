import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showMenu: boolean = false;
  showHeader: boolean = true;
  showHamburgerMenu: boolean = true;
  showBackButton: boolean = false; // Propiedad para controlar la visibilidad del botón de retroceso
  pageTitle: string = 'EcoCarga';

  constructor(private platform: Platform, private router: Router, private location: Location) {
    this.initializeApp();
    this.setupRouteListener();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) {
        StatusBar.setStyle({ style: Style.Dark });
        SplashScreen.hide();
      }
    });
  }

  setupRouteListener() {
    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateHeaderVisibilityAndTitle(event.urlAfterRedirects);
      });
  }

  updateHeaderVisibilityAndTitle(url: string) {
    if (url.includes('welcome')) {
      this.showHeader = false;
      this.pageTitle = 'BIENVENIDOS';
      this.showBackButton = false;
    } else if (url.includes('informacionpreliminar')) {
      this.showHeader = true;
      this.showHamburgerMenu = false;
      this.showBackButton = false;
      this.pageTitle = 'INFORMACIÓN IMPORTANTE';
    } else if (url.includes('viewone')) {
      this.showHeader = true;
      this.pageTitle = 'TERMINOS Y CONDICIONES';
      this.showBackButton = false;
    } else if (url.includes('first-search')) {
      this.showHeader = true;
      this.showHamburgerMenu = true;
      this.pageTitle = 'CONECTORES';
      this.showBackButton = false;
    } else if (url.includes('second-search')) {
      this.showHeader = true;
      this.pageTitle = 'ESTACIONES';
      this.showBackButton = true;
    } else if (url.includes('contact-us')) {
      this.showHeader = true;
      this.pageTitle = 'CONTACTO';
      this.showBackButton = true;
    } else if (url.includes('station-details')) {
      this.showHeader = true;
      this.pageTitle = 'DETALLES DE LA ESTACION';
      this.showBackButton = true;
    } else if (url.includes('electrolineras')) {
      this.showHeader = true;
      this.pageTitle = 'ELECTROLINERAS ACTIVAS';
      this.showBackButton = true;
    } else {
      this.showHeader = true;
      this.pageTitle = 'EcoCarga';
      this.showBackButton = false;
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  navigateToElectrolineras() {
    this.showMenu = false;
    this.router.navigate(['/electrolineras']);
  }

  navigateTosearch() {
    this.showMenu = false;
    this.router.navigate(['/first-search']);
  }

  navigateTocontact() {
    this.showMenu = false;
    this.router.navigate(['/contact-us']);
  }

  goBack() {
    this.location.back();
  }
}
