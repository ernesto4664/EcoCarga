import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-viewone',
  templateUrl: './viewone.page.html',
  styleUrls: ['./viewone.page.scss'],
})
export class ViewonePage {
  constructor(private router: Router) {}  // Asegúrate de que 'router' esté declarado aquí

  navigateToInformacionPreliminar() {
    console.log("Navigating to InformacionpreliminarPage");
    this.router.navigateByUrl('/informacionpreliminar');
  }
}