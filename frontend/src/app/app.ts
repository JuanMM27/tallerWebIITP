import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogSearchService } from './services/catalog-search';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  catalogSearch = inject(CatalogSearchService);
  searchOpen = signal(false);

  toggleSearch() {
    this.searchOpen.update(open => !open);
  }
}
