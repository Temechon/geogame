import { Component } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {

}
