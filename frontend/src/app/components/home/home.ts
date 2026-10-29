import { Component, inject, computed, signal } from '@angular/core';
import { ProductService } from '../../services/product';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Cafe } from '../../models/cafe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  host: { class: 'contenedorComponenteInicio' },
  templateUrl: './home.html', 
  styleUrl: './home.css'
})
export class Home {
  private servicioProductos = inject(ProductService);
  productos = signal<Cafe[]>([]);
  cargando = signal(true);
  errorCarga = signal(false);
  productosDestacados = computed(() => this.productos().slice(0, 4));

  constructor() {
    this.servicioProductos.getProducts().subscribe({
      next: productos => { this.productos.set(productos); this.cargando.set(false); },
      error: () => { this.errorCarga.set(true); this.cargando.set(false); }
    });
  }

}
