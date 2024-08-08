import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { config, Map } from '@maptiler/sdk';

import '@maptiler/sdk/dist/maptiler-sdk.css';
import { SpinnerComponent } from '../spinner/spinner.component';
import { first } from 'rxjs';

interface CountryInfo {
  name: string;
  flag: string;
}
@Component({
  selector: 'maptiler',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './maptiler.component.html',
  styleUrl: './maptiler.component.scss'
})
export class MaptilerComponent {
  map: Map;

  countriesMap: { [iso3: string]: CountryInfo } = {}; // Stockage des données des pays par code ISO3

  isLoading = true;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private http: HttpClient) { }


  ngOnInit(): void {
    config.apiKey = 'iSxzLuMQ4PQGPwqvdWzS';
    this.loadCountryData();
  }

  ngAfterViewInit() {
    const initialState = { lng: 0, lat: 0, zoom: 0 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: "8df536cd-80fc-4fe1-95c3-b3dcd40b7499",
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

    // Charger le fichier GeoJSON depuis le répertoire assets
    this.http.get('assets/countries.geojson').subscribe((geojsonData: any) => {
      // Ajouter les données GeoJSON à la carte
      this.map.on('load', () => {
        this.map.addSource('countries', {
          'type': 'geojson',
          'data': geojsonData
        });

        this.map.addLayer({
          'id': 'country-fill',
          'type': 'fill',
          'source': 'countries',
          'layout': {},
          'paint': {
            'fill-color': '#ffffff',  // Couleur de remplissage des pays
            'fill-opacity': 0
          }
        });

        this.map.addLayer({
          'id': 'country-borders',
          'type': 'line',
          'source': 'countries',
          'layout': {},
          'paint': {
            'line-color': '#333',
            'line-width': 0
          }
        });

        // Détection des clics sur les pays
        this.map.on('click', 'country-fill', (e: any) => {
          const countryName = e.features[0].properties.name;
          console.log(e.features[0].properties.ADMIN);

          const countryISO3 = e.features[0].properties.ISO_A3;  // Récupérer le code ISO3 du pays cliqué
          const countryInfo = this.countriesMap[countryISO3];

          if (countryInfo) {
            alert(`Vous avez cliqué sur : ${countryInfo.name}\nDrapeau: ${countryInfo.flag}`);
          } else {
            alert("Informations sur le pays introuvables.");
          }
        });

        // Changer le curseur au survol pour indiquer l'interactivité
        this.map.on('mouseenter', 'country-fill', () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'country-fill', () => {
          this.map.getCanvas().style.cursor = '';
        });
      });
    });
  }

  loadCountryData() {
    this.isLoading = true;
    this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=translations,flags,cca3').pipe(first())
      .subscribe(data => {
        data.forEach(country => {
          const iso3 = country.cca3;  // Code ISO3
          const nameFr = country.translations?.fra?.common || country.name.common; // Nom en français
          const flagUrl = country.flags?.png || ''; // Drapeau
          this.countriesMap[iso3] = { name: nameFr, flag: flagUrl };
        });
        this.isLoading = false;
      });
  }

}
