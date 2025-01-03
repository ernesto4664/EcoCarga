import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../api.service';
import { AlertController, LoadingController  } from '@ionic/angular';
import { Observable } from 'rxjs';

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
  secondaryLoading: boolean = false; // Indicador de carga específico para "Sí, mantener filtros"
  private iconPath = 'assets/icon/';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.listenForRouteChanges();  // Escuchar cambios en la navegación

    // Verificar si es la primera carga
    const isFirstLoad = this.apiService.isFirstLoad();
    const isCacheValid = this.apiService.checkFirstSearchCacheValidity();

   // console.log('Cache validity:', isCacheValid);
   // console.log('Is first load:', isFirstLoad);

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
         // console.log('Regresaste a first-search');
          const isCacheValid = this.apiService.checkFirstSearchCacheValidity();
         // console.log('Cache validity al regresar:', isCacheValid);
          if (isCacheValid) {
           // console.log('Mostrando alerta de filtros guardados');
            this.showCacheAlert();
          } else {
           // console.log('Cache no válida, limpiando filtros y haciendo nueva consulta a la API');
            this.clearFilters();
            this.fetchAllConnectors();  // Hacer un nuevo ping a la API sin filtros si la caché no es válida
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

  //console.log('Cache validity:', isCacheValid);
 // console.log('Is first load:', isFirstLoad);

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
   // console.log('Filtros cargados desde la caché:', cachedFilters);
    this.typeAC = cachedFilters.typeAC;
    this.typeDC = cachedFilters.typeDC;
    this.selectedIndexes = cachedFilters.selectedIndexes;
    this.selectedConnectors = cachedFilters.selectedConnectors;
    this.filterConnectors(); // Aplicar filtros cargados

    // Hacer una nueva consulta a la API con los filtros cargados
   // console.log('Forzando una nueva consulta a la API con los filtros cargados');
    this.fetchAllConnectorsWithFilter(); // Hacer ping a la API
  }
}

  // Métodos show/hide específicos para el preloader secundario
  /*showSecondaryPreloader() {
    this.secondaryLoading = true;
  }

  hideSecondaryPreloader() {
    this.secondaryLoading = false;
  }*/

    async showCacheAlert() {
      const alert = await this.alertController.create({
        header: 'Filtros guardados',
        message: '¿Deseas mantener los mismos filtros de la búsqueda anterior?',
        buttons: [
          {
            text: 'No, reiniciar filtros',
            role: 'cancel',
            handler: () => {
             // console.log('Opción seleccionada: No, reiniciar filtros');
              this.clearFilters();  // Reiniciar los filtros seleccionados
              this.apiService.clearCache();  // Limpiar la caché vieja para evitar interferencias
              this.fetchAllConnectors();  // Hacer una nueva consulta a la API
            }
          },
          {
            text: 'Sí, mantener filtros',
            handler: () => {
             // console.log('Opción seleccionada: Sí, mantener filtros');
              this.secondaryLoading = true;  // Mostrar el preloader
    
              this.loadCachedFilters();  // Cargar los filtros guardados
    
              // Forzar nueva consulta con los filtros
              this.apiService.clearCache();  // Limpiar la caché vieja para forzar una nueva consulta
              this.fetchAllConnectorsWithFilter().subscribe(
                () => {
                  this.secondaryLoading = false;  // Ocultar el preloader cuando termine
                  this.navigateToSecondSearch();  // Navegar a la siguiente página solo cuando todo esté listo
                },
                (error) => {
                  console.error('Error al cargar conectores con filtros:', error);
                  this.secondaryLoading = false;  // Ocultar el preloader incluso si hay un error
                }
              );
            }
          }
        ],
        cssClass: 'custom-alert-buttons'
      });
      await alert.present();
    }
  
// Nueva función para hacer el ping a la API con filtros cargados
fetchAllConnectorsWithFilter(): Observable<any> {
  this.loading = true;
 // console.log('Consultando la API con filtros aplicados...');

  return new Observable((observer) => {
    this.apiService.fetchAllLocations().subscribe(
      (response: any) => {
       // console.log('Respuesta de la API:', response);

        if (Array.isArray(response)) {
          // Procesar la respuesta de la API
          this.allConnectors = response.reduce((acc: any[], station: any) =>
            acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any }) =>
              innerAcc.concat(evse.connectors), [])), []);

        //  console.log('Aplicando filtros a los conectores...');
          this.filterConnectors();  // Aplicar los filtros seleccionados a los conectores recibidos
        } else {
          console.error('Formato de respuesta inesperado:', response);
        }
        this.loading = false;
        observer.next();  // Emitir que la operación ha finalizado
        observer.complete();
      },
      (error) => {
        console.error('Error al recuperar conectores:', error);
        this.loading = false;
        observer.error(error);  // Emitir el error
      }
    );
  });
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
    this.filterConnectors();  // Mantiene los conectores en función del tipo seleccionado.
    this.preserveSelections();  // Preserva los conectores seleccionados.
  }

  //función para mantener las selecciones al cambiar entre AC y DC.
preserveSelections() {
  const preservedIndexes: number[] = [];
  const preservedConnectors: any[] = [];

  this.selectedConnectors.forEach((selected) => {
    const matchingIndex = this.uniqueConnectors.findIndex(
      (connector) =>
        connector.standard === selected.standard &&
        connector.power_type === selected.power_type
    );

    if (matchingIndex !== -1) {
      preservedIndexes.push(matchingIndex);
      preservedConnectors.push(this.uniqueConnectors[matchingIndex]);
    }
  });

  // Actualizamos las selecciones preservadas.
  this.selectedIndexes = preservedIndexes;
  this.selectedConnectors = preservedConnectors;
}

// Nueva función para consultar la API SIN filtros
fetchAllConnectors() {
  this.loading = true;
  //console.log('Consultando la API para obtener todos los conectores sin filtros (actualización general)...');
  
  this.apiService.fetchAllLocations().subscribe(
    (response: any) => {
     // console.log('Respuesta de la API:', response);
  
      if (Array.isArray(response) && response.length > 0) {
        this.allConnectors = response.reduce((acc: any[], station: any) => {
          if (station && Array.isArray(station.evses)) {
            return acc.concat(station.evses.reduce((innerAcc: any[], evse: { connectors: any; }) => {
              if (evse && Array.isArray(evse.connectors)) {
                return innerAcc.concat(evse.connectors);
              }
              return innerAcc;
            }, []));
          }
          return acc;
        }, []);
  
       // console.log('Conectores obtenidos:', this.allConnectors.length);
        this.filterConnectors(); // Aplicar la configuración actual
  
      } else {
        console.warn('No se encontraron datos de conectores o la respuesta tiene un formato inesperado.');
        this.allConnectors = [];
        this.connectors = [];
        this.uniqueConnectors = [];
      }
  
      this.loading = false;
    },
    (error) => {
      console.error('Error al recuperar conectores:', error);
      this.loading = false;
    }
  );
}
  

// Método para filtrar los conectores en función de los tipos seleccionados
filterConnectors() {
  if (!this.typeAC && !this.typeDC) {
    // Si no se selecciona ningún tipo, limpiar la lista de conectores
    this.connectors = [];
    this.uniqueConnectors = [];
    return;
  }

  // Definir estándares permitidos para AC y DC
  const validStandardsAC = ['Tipo 2', 'Tipo 1', 'GB/T AC'];
  const validStandardsDC = ['CCS 2', 'CCS 1', 'CHAdeMO', 'GB/T DC'];

  // Filtrar conectores según los tipos de energía seleccionados
  this.connectors = this.allConnectors.filter((connector) => {
    if (connector.status === 'FUERA DE LINEA') return false;

    const powerType = connector.power_type || this.getPowerTypeByStandard(connector.standard);
    const isAC = powerType === 'AC';
    const isDC = powerType === 'DC';

    // Log para verificar qué conectores están siendo incluidos o excluidos
   // console.log(`Conector ${connector.standard} con power_type ${powerType}: ${isAC ? 'AC' : 'DC'}`);

    if (this.typeAC && isAC && validStandardsAC.includes(connector.standard)) {
      return true;
    }
    if (this.typeDC && isDC && validStandardsDC.includes(connector.standard)) {
      return true;
    }

    return false;
  });

  // Ordenar primero AC y luego DC
  this.connectors.sort((a, b) => {
    const aIsAC = a.power_type === 'AC' ? -1 : 1;
    const bIsAC = b.power_type === 'AC' ? -1 : 1;
    return aIsAC - bIsAC;
  });

  // Remover duplicados por estándar
  this.uniqueConnectors = this.getUniqueConnectors(this.connectors);

  // Log para ver cuántos conectores quedan después del filtro
  //console.log('Conectores disponibles después de filtrar:', this.connectors.length);

  // Si después de aplicar los filtros no queda ningún conector, mostrar todos
  if (this.connectors.length === 0) {
   // console.log('No se encontraron conectores filtrados, mostrando todos.');
    this.uniqueConnectors = this.allConnectors;
  }
}

// Método auxiliar para asignar el power_type basado en el estándar si es null
getPowerTypeByStandard(standard: string): string {
  const acStandards = ['Tipo 2', 'Tipo 1', 'GB/T AC'];
  const dcStandards = ['CCS 2', 'CCS 1', 'CHAdeMO', 'GB/T DC'];

  if (acStandards.includes(standard)) {
    return 'AC';
  }
  if (dcStandards.includes(standard)) {
    return 'DC';
  }
  return 'Desconocido'; // Si el estándar no coincide con ninguno conocido, devolver 'Desconocido'
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
     // console.log(`Conectores seleccionados para el estándar ${selected.standard}:`, matchingConnectors);
    });
  }

// Método para obtener el ícono del conector
getIconPath(connector: any): string {
  // Asignar power_type si es null basado en el standard
  if (!connector.power_type) {
    connector.power_type = this.getPowerTypeByStandard(connector.standard);
  }

  const iconMap: { [key: string]: string } = {
    'Tipo 2 (SOCKET - AC)': 'Tipo2AC.png',
    'Tipo 2 (CABLE - AC)': 'Tipo2AC.png',
    'CCS 2 (CABLE - DC)': 'combinadotipo2.png',
    'CCS 2 (SOCKET - DC)': 'combinadotipo2.png',
    'CCS 1 (CABLE - DC)': 'Tipo1DC.png',
    'CCS 1 (SOCKET - DC)': 'Tipo1DC.png',
    'GB/T AC (CABLE - AC)': 'GBT_AC.png',
    'GB/T AC (SOCKET - AC)': 'GBT_AC.png',
    'Tipo 1 (CABLE - AC)': 'Tipo1AC.png',
    'Tipo 1 (SOCKET - AC)': 'Tipo1AC.png',
    'CHAdeMO (CABLE - DC)': 'CHADEMO.png',
    'CHAdeMO (SOCKET - DC)': 'CHADEMO.png',
    'GB/T DC (CABLE - DC)': 'GBT_DC.png',
  };

  // Construir la clave para buscar en el mapa de íconos
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
      'GB/T AC': 'Conector GB/T AC',
      'CCS 2': 'CCS 2 (Combinado tipo 2)',
      'CCS 1': 'CCS 1 (Combinado tipo 1)',
      'CHAdeMO': 'CHAdeMO',
      'GB/T DC': 'Conector GB/T DC',
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
   // console.log('Almacenando filtros en cache:', filters);  // Log para verificar los filtros antes de almacenar
    this.apiService.storeFirstSearchCache(filters);
  }
}
