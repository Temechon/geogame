import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MaptilerComponent } from './maptiler/maptiler.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MaptilerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'geogame';
}
