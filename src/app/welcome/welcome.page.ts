// welcome.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../global-data.service'; // Importa tu servicio de datos globales

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(private router: Router, private globalDataService: GlobalDataService) { }

  ngOnInit() {
    this.globalDataService.fetchAllConnectors();
    setTimeout(() => {
      this.router.navigateByUrl('/informacionpreliminar');
    }, 5000); // Redirecciona después de 5 segundos
  }
}
