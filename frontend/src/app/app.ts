import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogSearchService } from './services/catalog-search';
import { AuthService } from './services/auth';

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
  auth = inject(AuthService);
  private router = inject(Router);

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleSearch() {
    this.searchOpen.update(open => !open);
  }
}
