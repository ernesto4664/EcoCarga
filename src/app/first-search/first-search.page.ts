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
    this.listenForRouteChanges();  // Escuchar cambios en la navegación

    // Verificar si es la primera carga
    const isFirstLoad = this.apiService.isFirstLoad();
    const isCacheValid = this.apiService.checkFirstSearchCacheValidity();

    console.log('Cache validity:', isCacheValid);
    console.log('Is first load:', isFirstLoad);

    if (isFirstLoad) {
      this.clearFilters();
      this.apiService.setFirstLoad(false);  // Ya no es la primera carga
    } else if (isCacheValid) {
      this.showCacheAlert();  // Mostrar alerta si la cache es válida
    }

    this.fetchAllConnectors();  // Buscar los conectores siempre
  }

  listenForRouteChanges() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/first-search') {
          console.log('Regresaste a first-search');
          const isCacheValid = this.apiService.checkFirstSearchCacheValidity();
          console.log('Cache validity al regresar:', isCacheValid);
          if (isCacheValid) {
            console.log('Mostrando alerta de filtros guardados');
            this.showCacheAlert();
          }
        }
      }
    });
  }
  
  ngOnDestroy() {
    this.apiService.stopConnectorStatusUpdates();
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
      ],
      cssClass: 'custom-alert-buttons'  // Clase CSS personalizada
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
    this.loading = true; // Mostrar indicador de carga
  
    this.apiService.fetchAllLocations().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.allConnectors = response.reduce((acc: any[], station: any) => 
            acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any; }) => 
              innerAcc.concat(evse.connectors), [])), []);
          this.filterConnectors(); // Aplicar filtros a los conectores
        } else {
          console.error('Formato de respuesta inesperado:', response);
        }
        this.loading = false; // Ocultar indicador de carga
      },
      (error) => {
        console.error('Error al recuperar conectores:', error);
        this.loading = false; // Ocultar indicador de carga en caso de error
      }
    );
  }

  filterConnectors() {
    if (!this.typeAC && !this.typeDC) {
      this.connectors = [];
      this.uniqueConnectors = [];
      return;
    }
  
    // Definimos los estándares permitidos para AC y DC
    const validStandardsAC = ['Tipo 2', 'Tipo 1', 'GB/T AC'];
    const validStandardsDC = ['CCS 2', 'CCS 1', 'CHAdeMO', 'GB/T DC'];
  
    // Filtramos los conectores basados en los tipos de energía (AC o DC)
    this.connectors = this.allConnectors.filter(connector => {
      if (connector.status === 'FUERA DE LINEA') return false;
  
      const isAC = connector.power_type?.startsWith('AC');
      const isDC = connector.power_type?.startsWith('DC');
  
      // Filtramos según los estándares y el tipo de energía
      if (this.typeAC && isAC && validStandardsAC.includes(connector.standard)) {
        return true;
      }
      if (this.typeDC && isDC && validStandardsDC.includes(connector.standard)) {
        return true;
      }
  
      return false; // Excluir conectores que no coinciden con los estándares permitidos
    });
  
    // Remover duplicados por estándar
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
    // Almacenar los filtros actuales en la caché
    this.storeFirstSearchCache();
  
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
      'Tipo 1 (SOCKET - AC)': 'Tipo1AC.png',
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
      'GB/T AC': 'Conector GBT AC',
      'CCS 2': 'CCS 2 (Combinado tipo 2)',
      'CCS 1': 'CCS 1 (Combinado tipo 1)',
      'CHAdeMO': 'CHAdeMO',
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
    console.log('Almacenando filtros en cache:', filters);  // Verificar los filtros antes de almacenar
    this.apiService.storeFirstSearchCache(filters);
  }
}
