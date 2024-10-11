import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-station-details-modal',
  template: `
    <ion-header>
      <ion-toolbar class="custom-header" style="--background: #31B17D !important; color: white;">
        <ion-title>{{ station?.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
    <div class="station-info">
      <img
        style="width: 25px; height: 40px;"
        src="assets/icon/location.png"
        alt="Pin Icon"
        class="icon"
      />
      <span class="station-name">{{ station.address }}</span>
    </div>

      <!-- Barra estilo verde para "Conectores disponibles" -->
      <div class="available-connectors-bar" *ngIf="availableConnectors.length > 0">
        <strong>Conectores disponibles:</strong>
      </div>

      <!-- Detalles de los conectores disponibles -->
      <div class="connector-details">
        <div *ngFor="let connector of availableConnectors" class="connector-item">
          <img [src]="connector.icon" alt="{{ connector.text }}">
          <span style="color: green;" [ngClass]="connector.textStyle">{{ connector.text }}</span>
        </div>
      </div>

      <!-- Barra estilo rojo para "Conectores ocupados" -->
      <div class="occupied-connectors-bar" *ngIf="occupiedConnectors.length > 0">
        <strong>Conectores cargando:</strong>
      </div>

      <!-- Detalles de los conectores ocupados -->
      <div class="connector-details">
        <div *ngFor="let connector of occupiedConnectors" class="connector-item">
          <img [src]="connector.icon" alt="{{ connector.text }}">
          <span style="color: red;">{{ connector.text }}</span>
        </div>
      </div>

      <ion-button expand="block" color="primary" (click)="goToStation()">IR</ion-button>
    </ion-content>
  `,
  styles: [`
    .custom-header {
      background-color: #31B17D !important;
      color: white !important;
      text-align: center !important;
    }
    .available-connectors-bar {
      background-color: #28a745;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      margin-top: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .occupied-connectors-bar {
      background-color: #f53d3d;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      margin-bottom: 15px;
      margin-top: 15px;
      border-radius: 4px;
    }
    .connector-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .connector-item {
      display: flex;
      align-items: center;
      font-size: 16px;
    }
    .connector-item img {
      margin-right: 10px;
      width: 60px;
      height: 60px;
    }
    ion-button {
      margin-top: 20px;
    }
    ion-content {
      background-color: #dff3eb;
    }
  `]
})
export class StationDetailsModalComponent {
  @Input() station: any;
  @Input() availableConnectors: Array<{
textStyle: string|string[]|Set<string>|{ [klass: string]: any; }|null|undefined;
standard: any; icon: string, text: string 
}> = [];
  @Input() occupiedConnectors: Array<{
standard: any; icon: string, text: string 
}> = [];

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  goToStation() {
    this.modalCtrl.dismiss({ action: 'goToStation' });
  }

  getIconPath(connector: any): string {
    if (!connector.power_type) {
      connector.power_type = this.getPowerTypeByStandard(connector.standard);
    }

    const iconMap: { [key: string]: string } = {
      'GB/T AC (CABLE - AC)': 'GBT_AC.png',
      'Tipo 1 (CABLE - AC)': 'Tipo1AC.png',
      'Tipo 1 (SOCKET - AC)': 'Tipo1AC.png',
      'Tipo 2 (SOCKET - AC)': 'Tipo2AC.png',
      'Tipo 2 (CABLE - AC)': 'Tipo2AC.png',
      'CCS 2 (CABLE - DC)': 'combinadotipo2.png',
      'CHAdeMO (CABLE - DC)': 'CHADEMO.png',
      'CCS 1 (CABLE - DC)': 'Tipo1DC.png',
      'GB/T DC (CABLE - DC)': 'GBT_DC.png',
    };

    const key = `${connector.standard} (${connector.format} - ${connector.power_type})`;
    return 'assets/icon/' + (iconMap[key] || 'default.jpeg');
  }

  getPowerTypeByStandard(standard: string): string {
    const acStandards = ['Tipo 2', 'Tipo 1', 'GB/T AC'];
    const dcStandards = ['CCS 2', 'CCS 1', 'CHAdeMO', 'GB/T DC'];

    if (acStandards.includes(standard)) {
      return 'AC';
    }
    if (dcStandards.includes(standard)) {
      return 'DC';
    }
    return 'Desconocido';
  }
}
