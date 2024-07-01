import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router, NavigationEnd, Event } from '@angular/router';
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
  pageTitle: string = 'EcoCarga';

  constructor(private platform: Platform, private router: Router) {
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
    } else if (url.includes('informacionpreliminar')) {
      this.showHeader = true;
      this.showHamburgerMenu = false;
      this.pageTitle = 'INFORMACIÓN IMPORTANTE';
    }  else if (url.includes('viewone')) {
        this.showHeader = true;
        this.pageTitle = 'TERMINOS Y CONDICIONES';
    } else if (url.includes('first-search')) {
      this.showHeader = true;
      this.showHamburgerMenu = true;
      this.pageTitle = 'CONECTORES';
    } else if (url.includes('second-search')) {
      this.showHeader = true;
      this.pageTitle = 'ESTACIONES'; // Ajusta el título según sea necesario
    } else if (url.includes('contact-us')) {
      this.showHeader = true;
      this.pageTitle = 'CONTACTO';
    } else if (url.includes('station-details')) {
      this.showHeader = true;
      this.pageTitle = 'DETALLES DE LA ESTACION';
    } else if (url.includes('electrolineras')) {
      this.showHeader = true;
      this.pageTitle = 'ELECTROLINERAS ACTIVAS';
    } else {
      this.showHeader = true;
      this.pageTitle = 'EcoCarga'; // Ajusta el título según sea necesario
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
}
