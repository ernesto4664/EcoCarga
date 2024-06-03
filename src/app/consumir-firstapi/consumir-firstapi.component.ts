import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-consumir-firstapi',
  templateUrl: './consumir-firstapi.component.html',
  styleUrls: ['./consumir-firstapi.component.scss'],
})
export class ConsumirFirstapiComponent  implements OnInit {

  datos: any;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
   /* this.cargarDatos();*/
  }
/*
  cargarDatos() {
    this.apiService.getDatos().subscribe({
      next: (res) => {
        console.log(res);
        this.datos = res;
      },
      error: (err) => console.error('Error al obtener los datos:', err)
    });
  }*/
}
