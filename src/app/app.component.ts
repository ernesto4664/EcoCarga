import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showMenu: boolean = false;
  showHeader: boolean = true;
  showHamburgerMenu: boolean = true;
  showBackButton: boolean = false;
  pageTitle: string = 'EcoCarga';

  constructor(private platform: Platform, private router: Router, private location: Location, private apiService: ApiService) {
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
    const viewConfig: { [key: string]: { showHeader: boolean; showHamburgerMenu: boolean; pageTitle: string; showBackButton: boolean } } = {
      'welcome': { showHeader: false, showHamburgerMenu: false, pageTitle: 'BIENVENIDOS', showBackButton: false },
      'informacionpreliminar': { showHeader: true, showHamburgerMenu: false, pageTitle: 'INFORMACIÓN IMPORTANTE', showBackButton: false },
      'viewone': { showHeader: true, showHamburgerMenu: false, pageTitle: 'TERMINOS Y CONDICIONES', showBackButton: false },
      'first-search': { showHeader: true, showHamburgerMenu: true, pageTitle: 'CONECTORES', showBackButton: false },
      'second-search': { showHeader: true, showHamburgerMenu: false, pageTitle: 'CARGADORES', showBackButton: true },
      'contact-us': { showHeader: true, showHamburgerMenu: false, pageTitle: 'CONTACTO', showBackButton: true },
      'station-details': { showHeader: true, showHamburgerMenu: false, pageTitle: 'DETALLES DE LA ESTACIÓN', showBackButton: true },
      'terminos-condiciones': { showHeader: true, showHamburgerMenu: false, pageTitle: 'TERMINOS Y CONDICIONES', showBackButton: true },
      'electrolineras': { showHeader: true, showHamburgerMenu: false, pageTitle: 'ELECTROLINERAS ACTIVAS', showBackButton: true },
    };
  
    const config = Object.entries(viewConfig).find(([key]) => url.includes(key))?.[1];
    if (config) {
      this.showHeader = config.showHeader;
      this.showHamburgerMenu = config.showHamburgerMenu;
      this.pageTitle = config.pageTitle;
      this.showBackButton = config.showBackButton;
    } else {
      // Configuración predeterminada
      this.showHeader = true;
      this.showHamburgerMenu = true; // Asegúrate de que se establezca un valor predeterminado aquí también.
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

  navigateToinformation() {
    this.showMenu = false;
    this.router.navigate(['/informacionpreliminar']);
  }

  navigateToterminos() {
    this.showMenu = false;
    this.router.navigate(['/terminos-condiciones']);
  }

  goBack() {
    this.location.back();
  }

  clearCache() {
    this.apiService.clearCache();
  }
}
