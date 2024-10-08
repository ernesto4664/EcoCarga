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
      <h2>{{ station?.address }}</h2>

      <!-- Barra estilo verde con texto blanco para "Conectores disponibles" -->
      <div class="available-connectors-bar" *ngIf="availableConnectors.length > 0">
        <strong>Conectores disponibles:</strong>
      </div>

      <!-- Detalles de los conectores disponibles -->
      <div class="connector-details">
        <div *ngFor="let connector of availableConnectors" class="connector-item">
          <img [src]="connector.icon" alt="Icono conector">
          <span>{{ connector.text }}</span>
        </div>
      </div>

      <!-- Barra estilo amarillo con texto blanco para "Conectores ocupados" -->
      <div class="occupied-connectors-bar" *ngIf="occupiedConnectors.length > 0">
        <strong>Conectores ocupados:</strong>
      </div>

      <!-- Detalles de los conectores ocupados -->
      <div class="connector-details">
        <div *ngFor="let connector of occupiedConnectors" class="connector-item">
          <img [src]="connector.icon" alt="Icono conector">
          <span>{{ connector.text }}</span>
        </div>
      </div>

      <!-- Botón IR -->
      <ion-button expand="block" color="primary" (click)="goToStation()">IR</ion-button>
    </ion-content>
  `,
  styles: [`
    /* Estilo personalizado para el header */
    .custom-header {
      background-color: #31B17D !important;
      color: white !important;
      text-align: center !important;
    }

    /* Barra estilo verde para conectores disponibles */
    .available-connectors-bar {
      background-color: #28a745;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      margin-bottom: 15px;
      border-radius: 4px;
    }

    /* Barra estilo amarillo para conectores ocupados */
    .occupied-connectors-bar {
      background-color: #ffc107;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      margin-bottom: 15px;
      border-radius: 4px;
    }

    /* Estilo para alinear ícono y texto en una sola línea */
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
      width: 60px;  /* Aumentamos el tamaño del ícono a 60x60 */
      height: 60px;
    }

    /* Alineación del texto centrado verticalmente */
    .connector-item span {
      vertical-align: middle;
      line-height: 60px;  /* Coincide con la altura del ícono */
    }

    /* Espacio adicional para el botón IR */
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
  @Input() availableConnectors: Array<{ icon: string, text: string }> = [];
  @Input() occupiedConnectors: Array<{ icon: string, text: string }> = [];

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  goToStation() {
    this.modalCtrl.dismiss({ action: 'goToStation' });
  }
}
