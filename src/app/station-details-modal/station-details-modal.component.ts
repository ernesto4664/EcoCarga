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
        <img style="width: 25px; height: 40px;" src="assets/icon/location.png" alt="Pin Icon" />
        <span class="station-name">{{ station.address }}</span>
      </div>

      <!-- Barra verde para "Conectores disponibles" -->
      <div class="available-connectors-bar" *ngIf="availableConnectors.length > 0">
        <strong>Conectores disponibles:</strong>
      </div>
      <div class="connector-details">
        <div *ngFor="let connector of availableConnectors" class="connector-item">
          <img [src]="connector.icon" alt="{{ connector.text }}">
          <span style="color: green;" [ngClass]="connector.textStyle">{{ connector.text }}</span>
        </div>
      </div>

      <!-- Barra roja para "Conectores cargando" -->
      <div class="occupied-connectors-bar" *ngIf="occupiedConnectors.length > 0">
        <strong>Conectores cargando:</strong>
      </div>
      <div class="connector-details">
        <div *ngFor="let connector of occupiedConnectors" class="connector-item">
          <img [src]="connector.icon" alt="{{ connector.text }}">
          <span style="color: red;">{{ connector.text }}</span>
        </div>
      </div>

      <!-- Barra amarilla para "Conectores no disponibles" -->
      <div class="unavailable-connectors-bar" *ngIf="unavailableConnectors.length > 0">
        <strong>Conectores no disponibles:</strong>
      </div>
      <div class="connector-details">
        <div *ngFor="let connector of unavailableConnectors" class="connector-item">
          <img [src]="connector.icon" alt="{{ connector.text }}">
          <span style="color: #ffcc00;">{{ connector.text }}</span>
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
      margin: 15px 0;
      border-radius: 4px;
    }
    .occupied-connectors-bar {
      background-color: #f53d3d;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .unavailable-connectors-bar {
      background-color: #ffcc00;
      color: black;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      margin: 15px 0;
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
  @Input() availableConnectors: any[] = [];
  @Input() occupiedConnectors: any[] = [];
  @Input() unavailableConnectors: any[] = [];

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  goToStation() {
    this.modalCtrl.dismiss({ action: 'goToStation' });
  }
}
