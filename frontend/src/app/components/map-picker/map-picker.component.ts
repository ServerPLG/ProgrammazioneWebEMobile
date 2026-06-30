import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput, IonButton } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { GeocodeService } from '../../services/geocode.service';

export interface MapLocation {
  lat: number;
  lon: number;
  city: string;
  displayName: string;
}

const ICON = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, IonInput, IonButton],
  template: `
    <div class="map-search-row" *ngIf="!readOnly">
      <ion-input
        type="text"
        class="form-control"
        [(ngModel)]="searchQuery"
        [name]="inputName"
        [ngModelOptions]="{ standalone: true }"
        [placeholder]="placeholder"
        (keydown.enter)="onSearchEnter($event)"
      ></ion-input>
      <ion-button type="button" fill="outline" (click)="search()">Cerca</ion-button>
      <ion-button type="button" fill="outline" (click)="useMyLocation()">📍 Usa la mia posizione</ion-button>
    </div>
    <div class="dc-map" #mapEl></div>
    <div class="map-selected-location" *ngIf="selectedText">{{ selectedText }}</div>
  `,
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  @Input() lat: number | null = null;
  @Input() lon: number | null = null;
  @Input() zoom = 5;
  @Input() readOnly = false;
  @Input() popupText = '';
  @Input() placeholder = 'Cerca una citta...';
  @Input() inputName = 'mapCity';
  @Input() set initialCity(value: string) {
    if (value && !this.searchQuery) this.searchQuery = value;
  }

  @Output() locationChange = new EventEmitter<MapLocation>();

  searchQuery = '';
  selectedText = '';

  private map?: L.Map;
  private marker?: L.Marker;

  constructor(private geocode: GeocodeService) {}

  ngAfterViewInit(): void {
    const centerLat = this.lat ?? 41.9028;
    const centerLon = this.lon ?? 12.4964;
    const zoom = this.lat && this.lon ? this.zoom || 13 : 5;

    this.map = L.map(this.mapEl.nativeElement).setView([centerLat, centerLon], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    if (!this.readOnly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.placeMarker(e.latlng.lat, e.latlng.lng);
        this.reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
    }

    if (this.lat && this.lon) {
      this.placeMarker(this.lat, this.lon, false);
      if (this.readOnly && this.popupText) {
        this.marker?.bindPopup(this.popupText).openPopup();
      }
    }

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private placeMarker(lat: number, lng: number, recenter = true): void {
    if (!this.map) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { icon: ICON, draggable: !this.readOnly }).addTo(this.map);
      if (!this.readOnly) {
        this.marker.on('dragend', () => {
          const pos = this.marker!.getLatLng();
          this.reverseGeocode(pos.lat, pos.lng);
        });
      }
    }
    if (recenter) this.map.setView([lat, lng], 13);
  }

  private emit(lat: number, lon: number, city: string, displayName: string): void {
    this.locationChange.emit({ lat, lon, city, displayName });
  }

  private async reverseGeocode(lat: number, lon: number): Promise<void> {
    const result = await this.geocode.reverse(lat, lon);
    if (result) {
      if (result.city) this.searchQuery = result.city;
      this.selectedText = `📍 ${result.displayName}`;
      this.emit(lat, lon, this.searchQuery, result.displayName);
    } else {
      this.emit(lat, lon, this.searchQuery, '');
    }
  }

  onSearchEnter(event: Event): void {
    event.preventDefault();
    this.search();
  }

  async useMyLocation(): Promise<void> {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const { latitude, longitude } = pos.coords;
      this.placeMarker(latitude, longitude);
      this.reverseGeocode(latitude, longitude);
    } catch {
      this.selectedText = '❌ Impossibile ottenere la posizione (permesso negato?)';
    }
  }

  async search(): Promise<void> {
    const query = (this.searchQuery || '').trim();
    if (!query) return;
    const result = await this.geocode.search(query);
    if (result) {
      this.placeMarker(result.lat, result.lon);
      this.selectedText = `📍 ${result.displayName}`;
      this.emit(result.lat, result.lon, query, result.displayName);
    } else {
      this.selectedText = '❌ Nessun risultato trovato';
    }
  }
}
