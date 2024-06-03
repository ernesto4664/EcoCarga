import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-first-search',
  templateUrl: './first-search.page.html',
  styleUrls: ['./first-search.page.scss'],
})
export class FirstSearchPage implements OnInit {
  typeAC: boolean = false;
  typeDC: boolean = false;
  connectors: any[] = [];
  allConnectors: any[] = [];
  uniqueConnectors: any[] = [];
  selectedIndexes: number[] = [];
  selectedConnectors: any[] = [];
  showAlert = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.fetchAllConnectors();
  }

  onCheckboxChange() {
    this.filterConnectors();
  }

  fetchAllConnectors() {
    this.apiService.getConnectors().subscribe(
      (response: any) => {
        console.log('API Response:', response);
        if (Array.isArray(response)) {
          this.allConnectors = response;
          console.log('All connectors:', this.allConnectors);
          this.filterConnectors();
        } else {
          console.error('Unexpected API response format:', response);
        }
      },
      (error) => {
        console.error('Error fetching connectors:', error);
      }
    );
  }

  filterConnectors() {
    console.log('Filtering connectors');
    if (!this.typeAC && !this.typeDC) {
      this.connectors = [];
      this.uniqueConnectors = [];
      console.log('No type selected, connectors:', this.connectors);
      return;
    }

    let filteredConnectors: any[] = [];
    if (this.typeAC) {
      filteredConnectors = filteredConnectors.concat(this.allConnectors.filter(connector => connector.power_type.startsWith('AC')));
    }
    if (this.typeDC) {
      filteredConnectors = filteredConnectors.concat(this.allConnectors.filter(connector => connector.power_type.startsWith('DC')));
    }

    this.connectors = filteredConnectors;
    console.log('All filtered connectors:', this.connectors); // Mantiene todos los conectores filtrados

    // Unificar conectores por standard para visualización
    this.uniqueConnectors = this.getUniqueConnectors(filteredConnectors);
    console.log('Unique connectors for display:', this.uniqueConnectors);
  }

  getUniqueConnectors(connectors: any[]): any[] {
    const uniqueConnectors = new Map<string, any>();

    connectors.forEach(connector => {
      const key = connector.standard;
      if (!uniqueConnectors.has(key)) {
        uniqueConnectors.set(key, connector);
      }
    });

    return Array.from(uniqueConnectors.values());
  }

  async selectConnector(index: number) {
    const selectedConnector = this.uniqueConnectors[index];

    if (this.selectedIndexes.includes(index)) {
      this.selectedIndexes = this.selectedIndexes.filter(i => i !== index);
      this.selectedConnectors = this.selectedConnectors.filter(connector => connector.standard !== selectedConnector.standard || connector.power_type !== selectedConnector.power_type);
    } else {
      if (this.selectedIndexes.length < 2) {
        this.selectedIndexes.push(index);
        this.selectedConnectors.push(selectedConnector);
      } else {
        await this.showAlertMessage(
          'Atención',
          'Solo puedes seleccionar hasta dos estándares de conectores. Deselecciona uno antes de seleccionar otro.',
          'REGRESAR'
        );
        return;
      }
    }

    this.printSelectedConnectors();

    if (this.selectedIndexes.length === 1) {
      await this.showAlertMessage(
        'Atención',
        'Recuerda que puedes seleccionar dos estándares de conectores.',
        'REGRESAR',
        'CONTINUAR'
      );
    } else if (this.selectedIndexes.length === 2) {
      await this.showAlertMessage(
        'Está seguro de su selección?',
        'Si está seguro puede continuar con su proceso de selección de las especificaciones de su vehículo.',
        'REGRESAR',
        'CONTINUAR'
      );
    }
  }

  async showAlertMessage(header: string, message: string, cancelButtonText: string, confirmButtonText: string = '') {
    const buttons = [
      {
        text: cancelButtonText,
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirmación cancelada');
        },
      },
    ];

    if (confirmButtonText) {
      buttons.push({
        text: confirmButtonText,
        handler: () => {
          this.navigateToSecondSearch();
        },
        role: '',
        cssClass: ''
      });
    }

    const alert = await this.alertController.create({
      header,
      message,
      buttons,
    });

    await alert.present();
  }

  navigateToSecondSearch() {
    const navigationExtras = {
      state: {
        selectedConnectors: this.selectedConnectors,
        allFilteredConnectors: this.connectors.filter(connector => 
          this.selectedConnectors.some(selected => 
            selected.standard === connector.standard && selected.power_type === connector.power_type
          )
        )
      },
    };
    this.router.navigate(['/second-search'], navigationExtras);
  }

  printSelectedConnectors() {
    this.selectedConnectors.forEach(selected => {
      const matchingConnectors = this.connectors.filter(connector => connector.standard === selected.standard);
      console.log(`Conectores seleccionados para el estándar ${selected.standard}:`, matchingConnectors);
    });
  }
}
