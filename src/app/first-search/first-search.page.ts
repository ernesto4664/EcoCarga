import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
    this.listenForRouteChanges();
  
    // Verificar si es la primera carga
    const isFirstLoad = this.apiService.isFirstLoad();
    const isCacheValid = this.apiService.checkFirstSearchCacheValidity();
  
    console.log('Cache validity:', isCacheValid);
    console.log('Is first load:', isFirstLoad);
  
    if (isFirstLoad) {
      // Si es la primera vez, limpiar los filtros y NO mostrar la alerta
      this.clearFilters();
      this.apiService.setFirstLoad(false); // Marcar como ya no es la primera vez
    } else if (isCacheValid) {
      // Si no es la primera vez y la caché es válida, mostrar la alerta
      this.showCacheAlert();
    }
  
    // Siempre busca los conectores
    this.fetchAllConnectors();
  }

  ngOnDestroy() {
    this.apiService.stopConnectorStatusUpdates();
  }

  listenForRouteChanges() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/first-search') {
          this.showCacheAlert();  // Mostrar alerta si vuelve a first-search
        }
      }
    });
}

checkCacheAndShowAlert() {
  const isFirstLoad = this.apiService.isFirstLoad();
  const isCacheValid = this.apiService.checkFirstSearchCacheValidity();

  console.log('Cache validity:', isCacheValid);
  console.log('Is first load:', isFirstLoad);

  // Si es la primera carga, limpiar los filtros y no mostrar alerta
  if (isFirstLoad) {
    this.clearFilters();
    this.apiService.setFirstLoad(false); // Marcar como ya no es la primera vez
    return; // Salir de la función si es la primera carga
  }

  // Mostrar la alerta solo si la cache es válida
  if (isCacheValid) {
    this.showCacheAlert();
  } else {
    this.clearFilters(); // Limpiar filtros si la cache no es válida
  }
}

  loadCachedFilters() {
    const cachedFilters = this.apiService.getFirstSearchCache();
    if (cachedFilters) {
      this.typeAC = cachedFilters.typeAC;
      this.typeDC = cachedFilters.typeDC;
      this.selectedIndexes = cachedFilters.selectedIndexes;
      this.selectedConnectors = cachedFilters.selectedConnectors;
      this.filterConnectors(); // Aplicar filtros cargados
    }
  }

  async showCacheAlert() {
    const alert = await this.alertController.create({
      header: 'Filtros guardados',
      message: '¿Deseas mantener los mismos filtros de la búsqueda anterior?',
      buttons: [
        {
          text: 'No, reiniciar filtros',
          role: 'cancel',
          handler: () => {
            this.clearFilters();
          }
        },
        {
          text: 'Sí, mantener filtros',
          handler: () => {
            this.loadCachedFilters();
            this.navigateToSecondSearch();
          }
        }
      ]
    });
    await alert.present();
  }

  clearFilters() {
    this.typeAC = false;
    this.typeDC = false;
    this.selectedIndexes = [];
    this.selectedConnectors = [];
    this.connectors = [];
    this.uniqueConnectors = [];
  }

  onCheckboxChange() {
    this.filterConnectors();
  }

  fetchAllConnectors() {
    this.loading = true; // Mostrar preloader
    this.apiService.fetchAllLocations().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.allConnectors = response.reduce((acc: any[], station: any) => 
            acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any; }) => 
              innerAcc.concat(evse.connectors), [])), []);
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
    if (!this.typeAC && !this.typeDC) {
      this.connectors = [];
      this.uniqueConnectors = [];
      return;
    }

    this.connectors = this.allConnectors.filter(connector => {
      if (connector.status === 'FUERA DE LINEA') return false;
      if (this.typeAC && !this.typeDC && connector.power_type?.startsWith('AC')) return true;
      if (this.typeDC && !this.typeAC && connector.power_type?.startsWith('DC')) return true;
      if (this.typeAC && this.typeDC) return connector.power_type?.startsWith('AC') || connector.power_type?.startsWith('DC');
      return false;
    });

    this.uniqueConnectors = this.getUniqueConnectors(this.connectors);
  }

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
        'Recuerda que puedes seleccionar conectores AC y DC.',
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
    const buttons: any[] = [
      {
        text: cancelButtonText,
        role: 'cancel',
      },
    ];

    if (confirmButtonText) {
      buttons.push({
        text: confirmButtonText,
        handler: () => {
          this.navigateToSecondSearch();
        },
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

  // Método para obtener el ícono del conector
  getIconPath(connector: any): string {
    if (!connector.standard || !connector.format || !connector.power_type) {
      console.warn('Conector con datos incompletos encontrado:', connector);
      return this.iconPath + 'default.jpeg';  // Icono por defecto si faltan datos
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
    return this.iconPath + (iconMap[key] || 'default.jpeg');  // Icono por defecto si no hay coincidencia en el mapa
  }

  // Método para mostrar el nombre del conector
  getConnectorDisplayName(connector: any): string {
    if (!connector.standard) {
      console.warn('Conector con standard faltante encontrado y excluido:', connector);
      return '';  // No mostrar nada si falta el estándar
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

  // Método para almacenar filtros en el cache
  storeFirstSearchCache() {
    const filters = {
      typeAC: this.typeAC,
      typeDC: this.typeDC,
      selectedIndexes: this.selectedIndexes,
      selectedConnectors: this.selectedConnectors,
    };
    this.apiService.storeFirstSearchCache(filters);
  }
}
