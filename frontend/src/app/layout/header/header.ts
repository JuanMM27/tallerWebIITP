import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CatalogSearchService } from '../../services/catalog-search';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  catalogSearch = inject(CatalogSearchService);
  auth = inject(AuthService);
  private carrito = inject(CartService);
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  searchOpen = signal(false);
  menuAbierto = signal(false);
  // Desplegable de la cuenta (solo presentación: agrupa Mis pedidos y Salir).
  menuCuenta = signal(false);

  cantidadCarrito = this.carrito.cantidadTotal;
  inicialUsuario = computed(() => (this.auth.usuario()?.nombre || '?').charAt(0).toUpperCase());

  cerrarSesion() {
    this.cerrarMenu();
    this.menuCuenta.set(false);
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
    this.menuCuenta.set(false);
    this.searchOpen.update(open => !open);
  }
    toggleMenu() {
    this.searchOpen.set(false);
    this.menuAbierto.update(abierto => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  toggleCuenta() {
    this.searchOpen.set(false);
    this.menuCuenta.update(abierto => !abierto);
  }

  cerrarCuenta() {
    this.menuCuenta.set(false);
  }

  // Cierra el desplegable de la cuenta al hacer clic fuera del header o con Escape.
  @HostListener('document:click', ['$event'])
  alHacerClicFuera(evento: MouseEvent) {
    if (!this.host.nativeElement.contains(evento.target as Node)) {
      this.menuCuenta.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape() {
    this.menuCuenta.set(false);
  }
}
