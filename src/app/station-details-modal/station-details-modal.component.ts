import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
      <div class="station-info" style="display: flex; align-items: center;">
        <img style="width: 25px; height: 40px; margin-right: 10px;" src="assets/icon/location.png" alt="Pin Icon" />
        <p>
          <strong>Dirección:</strong> {{ station.address }}<br>
          <strong>Región:</strong> {{ station.region }}<br>
          <strong>Comuna:</strong> {{ station.commune }}
        </p>
      </div>

      <!-- Acordeón para los horarios -->
      <ion-accordion-group>
        <ion-accordion value="horarios">
          <ion-item slot="header">
            <ion-label style="display: flex;">
              <img src="assets/icon/hours.png" alt="Horarios" class="icon">
              <p>Horarios:</p>
            </ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-item class="show-item custom-item">
              <div [innerHTML]="getOpeningHours(station)"></div>
              <div *ngIf="station.opening_times?.exceptional_openings?.length > 0">
                <p>Excepcionales Aperturas: {{ getExceptionalOpenings(station) }}</p>
              </div>
              <div *ngIf="station.opening_times?.exceptional_closings?.length > 0">
                <p>Excepcionales Cierres: {{ getExceptionalClosings(station) }}</p>
              </div>
            </ion-item>
          </div>
        </ion-accordion>
      </ion-accordion-group>

      <!-- Conectores disponibles -->
      <div class="available-connectors-bar" *ngIf="availableConnectors.length > 0">
        <strong>Conectores disponibles:</strong>
      </div>
      <div class="connector-details">
        <div *ngFor="let connector of availableConnectors" class="connector-item">
          <img [src]="connector.icon" alt="{{ connector.text }}">
          <span style="color: green;" [ngClass]="connector.textStyle">{{ connector.text }}</span>
        </div>
      </div>

      <!-- Conectores cargando -->
      <div class="occupied-connectors-bar" *ngIf="occupiedConnectors.length > 0">
        <strong>Conectores cargando:</strong>
      </div>
      <div class="connector-details">
        <div *ngFor="let connector of occupiedConnectors" class="connector-item">
          <img [src]="connector.icon" alt="{{ connector.text }}">
          <span style="color: red;">{{ connector.text }}</span>
        </div>
      </div>

      <!-- Conectores no disponibles -->
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
    .icon {
      margin-right: 8px; 
      width: 24px; 
      height: 24px; 
    }
  `]
})

export class StationDetailsModalComponent {
  @Input() station: any;
  @Input() availableConnectors: any[] = [];
  @Input() occupiedConnectors: any[] = [];
  @Input() unavailableConnectors: any[] = [];
  accordionValue = ''; // Inicialización del valor del acordeón

  constructor(private modalCtrl: ModalController, private sanitizer: DomSanitizer) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  goToStation() {
    this.modalCtrl.dismiss({ action: 'goToStation' });
  }

  stopEventAndToggleAccordion(event: Event, accordionValue: string) {
    event.stopPropagation();
    event.preventDefault();
    this.accordionValue = this.accordionValue === accordionValue ? '' : accordionValue;
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }

  // Métodos para horarios de aperturas y cierres
  getOpeningHours(station: any): SafeHtml {
    const regularHours = station.opening_times.regular_hours;

    if (station.opening_times.twentyfourseven) {
      return this.sanitizer.bypassSecurityTrustHtml('Abierto 24/7');
    }

    if (regularHours.length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml('No disponible');
    }

    let result: string[] = [];
    let weekdayRanges: { start: number; end: number; period_begin: string; period_end: string }[] = [];

    const diasCubiertos = new Set(regularHours.map((h: { weekday: any }) => h.weekday));

    for (let i = 1; i <= 7; i++) {
      if (!diasCubiertos.has(i)) {
        regularHours.push({
          weekday: i,
          period_begin: 'Cerrado',
          period_end: 'Cerrado'
        });
      }
    }

    for (let i = 0; i < regularHours.length; i++) {
      const currentDay = regularHours[i];
      const lastRange = weekdayRanges[weekdayRanges.length - 1];

      if (
        lastRange &&
        lastRange.period_begin === currentDay.period_begin &&
        lastRange.period_end === currentDay.period_end &&
        lastRange.end === currentDay.weekday - 1
      ) {
        lastRange.end = currentDay.weekday;
      } else {
        weekdayRanges.push({
          start: currentDay.weekday,
          end: currentDay.weekday,
          period_begin: currentDay.period_begin,
          period_end: currentDay.period_end,
        });
      }
    }

    weekdayRanges.forEach((range) => {
      const dayStart = this.getDayName(range.start);
      const dayEnd = this.getDayName(range.end);
      const hours = range.period_begin === 'Cerrado' ? 'Cerrado' : `${range.period_begin} a ${range.period_end}`;

      if (dayStart === dayEnd) {
        result.push(`${dayStart}: ${hours}`);
      } else {
        result.push(`De ${dayStart} ${range.period_begin} a ${dayEnd} ${range.period_end}`);
      }
    });

    return this.sanitizer.bypassSecurityTrustHtml(result.join('<br>'));
  }

  getDayName(weekday: number): string {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[weekday - 1];
  }

  getExceptionalOpenings(station: any): string {
    return station.opening_times.exceptional_openings.map((opening: any) => {
      return `${opening.period_begin} a ${opening.period_end}`;
    }).join(', ');
  }

  getExceptionalClosings(station: any): string {
    return station.opening_times.exceptional_closings.map((closing: any) => {
      return `${closing.period_begin} a ${closing.period_end}`;
    }).join(', ');
  }

}