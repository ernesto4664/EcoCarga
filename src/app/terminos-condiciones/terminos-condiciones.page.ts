import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TermsAndConditionsService } from '../services/terms-and-conditions.service';

@Component({
  selector: 'app-terminos-condiciones',
  templateUrl: './terminos-condiciones.page.html',
  styleUrls: ['./terminos-condiciones.page.scss'],
})
export class TerminosCondicionesPage implements OnInit {
  latestTerms: any;

  constructor(private location: Location, private termsService: TermsAndConditionsService) {}

  ngOnInit() {
    this.termsService.getTermsAndConditions().subscribe(
      data => {
        this.latestTerms = data[0]; // Obtener el término más reciente
      },
      error => {
        console.error('Error en el componente:', error);
      }
    );
  }

  goBack() {
    this.location.back();
  }
}
