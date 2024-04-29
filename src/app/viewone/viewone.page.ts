import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-viewone',
  templateUrl: './viewone.page.html',
  styleUrls: ['./viewone.page.scss'],
})
export class ViewonePage implements OnInit {
  items: string[] = [];
  
  // Inicializa 'datos' con una estructura básica que incluye un arreglo 'items' vacío
  datos: any = { items: [] };

  constructor(private apiService: ApiService) { }

  ngOnInit() {

    for (let i = 1; i < 51; i++) {
      this.items.push(`Item ${i}`);
    }

    this.apiService.getDatos().subscribe(
      (data) => {
        // Asignar la respuesta de la API a la variable datos
        this.datos = data;
      },
      (error) => {
        // Manejar errores de la llamada a la API
        console.error('Error al obtener datos de la API:', error);
        // Opcionalmente puedes asignar un valor por defecto si la llamada falla
        this.datos = { items: [] };
      }
    );
  }
  
  // Método para verificar si un valor es de tipo objeto y no nulo
  isObjectType(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }
}