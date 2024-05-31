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
  selectedIndexes: number[] = [];
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

  fetchGeneralConnectors() {
    this.apiService.getConnectors().subscribe(
      (response: any) => {
        console.log('General API Response:', response);
        if (Array.isArray(response)) {
          this.connectors = response;
          console.log('General connectors:', this.connectors);
        } else {
          console.error('Unexpected API response format:', response);
        }
      },
      (error) => {
        console.error('Error fetching general connectors:', error);
      }
    );
  }

  filterConnectors() {
    console.log('Filtering connectors');
    if (!this.typeAC && !this.typeDC) {
      this.connectors = [];
      console.log('No type selected, connectors:', this.connectors);
      return;
    }

    const filteredConnectors: any[] = [];
    if (this.typeAC) {
      filteredConnectors.push(...this.allConnectors.filter(connector => connector.power_type.startsWith('AC')));
    }
    if (this.typeDC) {
      filteredConnectors.push(...this.allConnectors.filter(connector => connector.power_type.startsWith('DC')));
    }

    this.connectors = filteredConnectors;
    console.log('Filtered connectors:', this.connectors);
  }

  async selectConnector(index: number) {
    const selectedConnector = this.connectors[index];
    
    if (this.selectedIndexes.includes(index)) {
      this.selectedIndexes = this.selectedIndexes.filter(i => i !== index);
    } else {
      if (this.selectedIndexes.length < 2) {
        this.selectedIndexes.push(index);
      } else {
        await this.showAlertMessage(
          'Atención',
          'Solo puedes seleccionar hasta dos conectores. Deselecciona uno antes de seleccionar otro.',
          'REGRESAR'
        );
        return;
      }
    }

    if (this.selectedIndexes.length === 1) {
      await this.showAlertMessage(
        'Atención',
        'Recuerda que puedes seleccionar dos conectores.',
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
    const selectedConnectors = this.selectedIndexes.map(index => this.connectors[index]);
    const navigationExtras = {
      state: {
        selectedConnectors
      },
    };
    this.router.navigate(['/second-search'], navigationExtras);
  }
}
