import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { config, helpers, Map, Popup, Source } from '@maptiler/sdk';

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

  randomCountry: CountryInfo;

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
    // const initialState = { lng: 15, lat: 35, zoom: 1.8 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: "fcef867f-146b-47a5-bf7a-465dc76e0d59",
      minZoom: 1.8,
      maxZoom: 5,
      doubleClickZoom: false
    });

    // Charger le fichier GeoJSON depuis le répertoire assets
    this.http.get('assets/countries.geojson').pipe(first()).subscribe((geojsonData: any) => {
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
            'line-color': '#777',
            'line-width': 0.15
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
          const selectedFeature = e.features[0];
          console.log("click", e);

          const countryISO3 = e.features[0].properties.ISO_A3;  // Récupérer le code ISO3 du pays cliqué
          const countryInfo = this.countriesMap[countryISO3];
          console.log(countryInfo);

          // Mettez à jour la couche avec le pays sélectionné
          // this.clicked.push(selectedFeature)
          // const s = this.map.getSource('selected-country') as any;
          // s.setData({
          //   type: 'FeatureCollection',
          //   features: this.clicked
          // });

          // Find the whole geometry of the country
          const country = geojsonData.features.filter(feature => feature.properties.ISO_A3 === countryISO3)
          console.log("found", country[0]);

          helpers.addPolygon(this.map, {
            data: country[0],
            fillColor: "#13678A",
            fillOpacity: 0.75
          } as any);
        });

        // Changer le curseur au survol pour indiquer l'interactivité
        this.map.on('mouseenter', 'country-fill', () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'country-fill', () => {
          this.map.getCanvas().style.cursor = '';
        });

        this.randomCountry = this.pickRandomCountry()
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
          const capitalInfo = country.capitalInfo.latlng || [0, 0];
          this.countriesMap[iso3] = { name: nameFr, flag: flagUrl, population, capitalInfo, capital };
        });

        // Trier les pays après avoir chargé les données
        this.sortCountriesByPopularity();

        // Load map
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
  }

  pickRandomCountry() {
    const countryKeys = Object.keys(this.countriesMap);
    const randomKey = countryKeys[Math.floor(Math.random() * countryKeys.length)];
    const randomCountry = this.countriesMap[randomKey];
    // Supprime le pays sélectionné de la liste
    delete this.countriesMap[randomKey];
    return randomCountry;
  }

}
