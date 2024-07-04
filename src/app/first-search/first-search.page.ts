import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-first-search',
  templateUrl: './first-search.page.html',
  styleUrls: ['./first-search.page.scss'],
})
export class FirstSearchPage implements OnInit, OnDestroy {
  typeAC: boolean = false;
  typeDC: boolean = false;
  connectors: any[] = [];
  allConnectors: any[] = [];
  uniqueConnectors: any[] = [];
  selectedIndexes: number[] = [];
  selectedConnectors: any[] = [];
  showAlert = false;
  loading: boolean = false; // Indicador de carga
  private iconPath = 'assets/icon/';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.fetchAllConnectors();
  }

  ngOnDestroy() {
    this.apiService.stopConnectorStatusUpdates();
  }

  onCheckboxChange() {
    this.filterConnectors();
  }

  fetchAllConnectors() {
    this.loading = true; // Mostrar preloader
    this.apiService.fetchAllLocations().subscribe(
      (response: any) => {
        console.log('Respuesta API:', response);
        if (Array.isArray(response)) {
          this.allConnectors = response.reduce((acc: any[], station: any) => 
            acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any; }) => 
              innerAcc.concat(evse.connectors), [])), []);
          console.log('Todos los conectores:', this.allConnectors);
          this.filterConnectors();
        } else {
          console.error('Formato de respuesta API inesperado:', response);
        }
        this.loading = false; // Ocultar preloader
      },
      (error) => {
        console.error('Error al recuperar conectores:', error);
        this.loading = false; // Ocultar preloader en caso de error
      }
    );
  }

  filterConnectors() {
    console.log('Filtrado de conectores');
    if (!this.typeAC && !this.typeDC) {
      this.connectors = [];
      this.uniqueConnectors = [];
      console.log('Ningún tipo de conector seleccionado :', this.connectors);
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
    console.log('Todos los conectores filtrados:', this.connectors);

    this.uniqueConnectors = this.getUniqueConnectors(filteredConnectors);
    console.log('Conectores únicos para pantalla.:', this.uniqueConnectors);
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
        cssClass: 'alert-button secondary',
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
        cssClass: 'alert-button',
      });
    }

    const alert = await this.alertController.create({
      header,
      message,
      buttons,
      cssClass: 'custom-alert',
    });

    await alert.present();
  }

  navigateToSecondSearch() {
    let allSelectedConnectors: any[] = [];
    this.selectedConnectors.forEach(selected => {
      allSelectedConnectors = allSelectedConnectors.concat(
        this.connectors.filter(connector => connector.standard === selected.standard)
      );
    });

    const navigationExtras = {
      state: {
        selectedConnectors: allSelectedConnectors
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

  getIconPath(connector: any): string {
    const iconMap: { [key: string]: string } = {
      'IEC_62196_T2 (SOCKET - AC_1_PHASE)': 'Tipo2AC.png',
      'IEC_62196_T2 (SOCKET - AC_2_PHASE)': 'Tipo2AC.png',
      'IEC_62196_T2 (SOCKET - AC_3_PHASE)': 'Tipo2AC.png',
      'IEC_62196_T2 (CABLE - AC_1_PHASE)': 'Tipo2AC.png',
      'IEC_62196_T2 (CABLE - AC_2_PHASE)': 'Tipo2AC.png',
      'IEC_62196_T2 (CABLE - AC_3_PHASE)': 'Tipo2AC.png',
      'IEC_62196_T2_COMBO (CABLE - AC_1_PHASE)': 'combinadotipo2.png',
      'IEC_62196_T2_COMBO (CABLE - AC_2_PHASE_SPLIT)': 'combinadotipo2.png',
      'IEC_62196_T2_COMBO (CABLE - AC_3_PHASE)': 'combinadotipo2.png',
      'GBT_AC (CABLE - AC_1_PHASE)': 'GBT_AC.png',
      'IEC_62196_T1 (CABLE - AC_1_PHASE)': 'Tipo1AC.png',
      'CHADEMO (CABLE - DC)': 'CHADEMO.png',
      'IEC_62196_T1_COMBO (CABLE - DC)': 'Tipo1DC.png',
      'GBT_DC (CABLE - DC)': 'GBT_DC.png',
    };

    const key = `${connector.standard} (${connector.format} - ${connector.power_type})`;
    return this.iconPath + (iconMap[key] || 'default.png');
  }

  getConnectorDisplayName(connector: any): string {
    const displayNameMap: { [key: string]: string } = {
      'IEC_62196_T2': 'Conector tipo 2',
      'IEC_62196_T1': 'Conector tipo 1',
      'IEC_62196_T1_COMBO': 'Combinado tipo 1',
      'IEC_62196_T2_COMBO': 'Combinado tipo 2',
      'CHADEMO': 'CHAdeMO',
      'GBT_AC': 'Conector GBT AC',
      'GBT_DC': 'Conector GBT DC',
    };

    return displayNameMap[connector.standard] || connector.standard;
  }
}
