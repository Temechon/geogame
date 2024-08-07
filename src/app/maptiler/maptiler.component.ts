import { Map, MapStyle, config, Marker } from '@maptiler/sdk';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import '@maptiler/sdk/dist/maptiler-sdk.css';

@Component({
  selector: 'maptiler',
  standalone: true,
  imports: [],
  templateUrl: './maptiler.component.html',
  styleUrl: './maptiler.component.scss'
})
export class MaptilerComponent {
  map: Map | undefined;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    config.apiKey = 'iSxzLuMQ4PQGPwqvdWzS';
  }
  ngAfterViewInit() {
    const initialState = { lng: 0, lat: 0, zoom: 0 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: "8df536cd-80fc-4fe1-95c3-b3dcd40b7499",
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });
  }
}
