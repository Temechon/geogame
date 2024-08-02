import { Component } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { latLng, LatLngBounds, tileLayer } from 'leaflet';


@Component({
  selector: 'map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  options = {
    layers: [
      // Utilisation de OpenStreetMap comme couche de fond
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
      // tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
      //   attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors',
      //   subdomains: 'abcd', // Subdomains for CARTO
      //   maxZoom: 19 // Max zoom level supported
      // })
    ],
    zoom: 2,
    center: latLng(0, 0), // Centre de la carte
    maxBounds: new LatLngBounds(
      latLng(-90, -180),
      latLng(90, 180)
    )
  };
}
