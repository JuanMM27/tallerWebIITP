import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogSearchService } from '../../services/catalog-search';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  catalogSearch = inject(CatalogSearchService);
  auth = inject(AuthService);
  private router = inject(Router);
  searchOpen = signal(false);

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleSearch() {
    this.searchOpen.update(open => !open);
  }
}
