import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogSearchService } from '../../services/catalog-search';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

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
  private carrito = inject(CartService);
  private router = inject(Router);
  searchOpen = signal(false);
  menuAbierto = signal(false);

  cantidadCarrito = this.carrito.cantidadTotal;

  cerrarSesion() {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // Enter en el buscador del header: aplica la búsqueda y lleva al catálogo.
  buscar() {
    this.catalogSearch.aplicar();
    this.searchOpen.set(false);
    this.router.navigate(['/cafes']);
  }

  toggleSearch() {
    this.menuAbierto.set(false);
    this.searchOpen.update(open => !open);
  }

  toggleMenu() {
    this.searchOpen.set(false);
    this.menuAbierto.update(abierto => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }
}
