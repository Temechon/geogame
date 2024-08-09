import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { config, Map, Source } from '@maptiler/sdk';

import '@maptiler/sdk/dist/maptiler-sdk.css';
import { SpinnerComponent } from '../spinner/spinner.component';
import { first } from 'rxjs';

interface CountryInfo {
  name: string;
  flag: string;
  population: number;
  capital: string;
  capitalInfo: [lat: number, long: number];

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

  // Stockage des données des pays par code ISO3
  countriesMap: { [iso3: string]: CountryInfo } = {};

  isLoading = true;

  clicked: Array<any> = [];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) { }


  ngOnInit(): void {
    config.apiKey = 'iSxzLuMQ4PQGPwqvdWzS';
  }
  ngAfterViewInit() {
    this.loadCountryData();
  }

  loadMap() {
    const initialState = { lng: 15, lat: 35, zoom: 1.8 };

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


        // Ajoutez une couche pour le pays sélectionné
        this.map.addSource('selected-country', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        this.map.addLayer({
          id: 'selected-country-fill',
          type: 'fill',
          source: 'selected-country',
          layout: {},
          paint: {
            'fill-color': '#ff0000', // Rouge pour le pays sélectionné
            'fill-opacity': 0.7
          }
        });

        // Détection des clics sur les pays
        this.map.on('click', 'country-fill', (e: any) => {
          console.log(e);

          const selectedFeature = e.features[0];
          const countryISO3 = e.features[0].properties.ISO_A3;  // Récupérer le code ISO3 du pays cliqué
          const countryInfo = this.countriesMap[countryISO3];

          if (countryInfo) {
            alert(`Vous avez cliqué sur : ${countryInfo.name}\nDrapeau: ${countryInfo.flag}`);
          } else {
            alert("Informations sur le pays introuvables.");
          }

          // Mettez à jour la couche avec le pays sélectionné
          console.log(selectedFeature);
          this.clicked.push(selectedFeature)

          const s = this.map.getSource('selected-country') as any;
          s.setData({
            type: 'FeatureCollection',
            features: this.clicked
          });
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
    this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=translations,flags,cca3,capitalInfo,population,capital').pipe(first())
      .subscribe(data => {
        data.forEach(country => {
          const iso3 = country.cca3;  // Code ISO3
          const nameFr = country.translations?.fra?.common || country.name.common; // Nom en français
          const flagUrl = country.flags?.png || ''; // Drapeau
          const population = country.population || 0;
          const capital = country.capital || '';
          const capitalInfo = country.capitalInfo || [0, 0];
          this.countriesMap[iso3] = { name: nameFr, flag: flagUrl, population, capitalInfo, capital };
        });

        // Trier les pays après avoir chargé les données
        this.sortCountriesByPopularity();

        this.isLoading = false;
        this.changeDetector.detectChanges();
        this.loadMap();
      });
  }
  sortCountriesByPopularity() {
    const sortedCountries = Object.values(this.countriesMap).sort((a, b) => {
      return b.population - a.population; // Tri décroissant
    });

    console.log('Pays triés par population :', sortedCountries);
    // Vous pouvez utiliser sortedCountries comme vous le souhaitez
  }

}
