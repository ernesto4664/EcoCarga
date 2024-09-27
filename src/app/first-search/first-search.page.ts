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
    console.log('Checkbox AC:', this.typeAC);  // Verificar valor de typeAC
    console.log('Checkbox DC:', this.typeDC);  // Verificar valor de typeDC
    this.filterConnectors();
  }

  fetchAllConnectors() {
    this.loading = true; // Mostrar preloader
    this.apiService.fetchAllLocations().subscribe(
      (response: any) => {
        console.log('Respuesta completa de la API:', response);  // <--- Imprime la respuesta completa
        if (Array.isArray(response)) {
          this.allConnectors = response.reduce((acc: any[], station: any) => 
            acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any; }) => 
              innerAcc.concat(evse.connectors), [])), []);
          console.log('Todos los conectores:', this.allConnectors);  // <--- Imprime todos los conectores antes del filtrado
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
  
    // Validación inicial: si no hay tipo seleccionado, limpiar conectores.
    if (!this.typeAC && !this.typeDC) {
      this.connectors = [];
      this.uniqueConnectors = [];
      console.log('Ningún tipo de conector seleccionado :', this.connectors);
      return;
    }
  
    // Asegúrate de que `allConnectors` no sea nulo o indefinido
    if (!this.allConnectors || !Array.isArray(this.allConnectors)) {
      console.warn('allConnectors es nulo o no es un array.');
      this.connectors = [];
      this.uniqueConnectors = [];
      return;
    }
  
    // Filtrar conectores basado en los tipos seleccionados
    this.connectors = this.allConnectors.filter(connector => {
      // Excluir conectores con propiedades nulas o indefinidas, o con estado "FUERA DE LINEA"
      if (!connector.standard || !connector.format || !connector.power_type || connector.status === 'FUERA DE LINEA') {
        console.warn('Conector excluido por tener propiedades nulas/indefinidas o estar fuera de línea:', connector);
        return false;
      }
  
      // Filtrar solo conectores de tipo AC si solo el checkbox de AC está seleccionado
      if (this.typeAC && !this.typeDC && connector.power_type?.startsWith('AC')) {
        console.log('Conector AC encontrado:', connector);  // Log para cada conector AC
        return true;
      }
  
      // Filtrar solo conectores de tipo DC si solo el checkbox de DC está seleccionado
      if (this.typeDC && !this.typeAC && connector.power_type?.startsWith('DC')) {
        console.log('Conector DC encontrado:', connector);  // Log para cada conector DC
        return true;
      }
  
      // Si ambos están seleccionados, muestra ambos tipos
      if (this.typeAC && this.typeDC) {
        return connector.power_type?.startsWith('AC') || connector.power_type?.startsWith('DC');
      }
  
      return false;
    });
  
    console.log('Todos los conectores filtrados:', this.connectors);
  
    this.uniqueConnectors = this.getUniqueConnectors(this.connectors);
    console.log('Conectores únicos para pantalla:', this.uniqueConnectors);
  }
  
  
  // Método para obtener conectores únicos
  getUniqueConnectors(connectors: any[]): any[] {
    const unique = new Set();
    return connectors.filter(connector => {
      const isDuplicate = unique.has(connector.standard);
      unique.add(connector.standard);
      return !isDuplicate;
    });
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
    if (!connector.standard || !connector.format || !connector.power_type) {
      console.warn('Conector con datos incompletos encontrado:', connector);
      return this.iconPath + 'default.jpeg';  // Icono por defecto
    }
  
    const iconMap: { [key: string]: string } = {
      'Tipo 2 (SOCKET - AC)': 'Tipo2AC.png',
      'Tipo 2 (CABLE - AC)': 'Tipo2AC.png',
      'CCS 2 (CABLE - DC)': 'combinadotipo2.png',
      'CCS 1 (CABLE - DC)': 'Tipo1DC.png',
      'GB/T AC (CABLE - AC)': 'GBT_AC.png',
      'Tipo 1 (CABLE - AC)': 'Tipo1AC.png',
      'CHAdeMO (CABLE - DC)': 'CHADEMO.png',
      'GB/T DC (CABLE - DC)': 'GBT_DC.png',
    };
  
    const key = `${connector.standard} (${connector.format} - ${connector.power_type})`;
    return this.iconPath + (iconMap[key] || 'default.jpeg');
  }

  getConnectorDisplayName(connector: any): string {
    if (!connector.standard) {
      console.warn('Conector con standard faltante encontrado y excluido:', connector);
      return '';  // No mostrar nada
    }
  
    const displayNameMap: { [key: string]: string } = {
      'Tipo 2': 'Conector tipo 2',
      'Tipo 1': 'Conector tipo 1',
      'CCS 2': 'CCS 2 (Combinado tipo 2)',
      'CCS 1': 'CCS 1 (Combinado tipo 1)',
      'CHAdeMO': 'CHAdeMO',
      'GB/T AC': 'Conector GBT AC',
      'GB/T DC': 'Conector GBT DC',
    };
  
    return displayNameMap[connector.standard] || connector.standard;
  }
}
