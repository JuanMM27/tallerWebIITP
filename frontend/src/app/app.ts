import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink], // 👈 Importamos RouterOutlet y RouterLink para la navegación limpia
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Café Nominal';
}