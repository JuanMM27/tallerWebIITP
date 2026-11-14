import { Component, inject, computed, signal } from '@angular/core';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Cafe } from '../../models/cafe';
import { Benefits } from '../shared/benefits/benefits';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, Benefits],
  host: { class: 'contenedorComponenteInicio' },
  templateUrl: './home.html', 
  styleUrl: './home.css'
})
export class Home {
  private servicioProductos = inject(ProductService);
  private carrito = inject(CartService);
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

  // Feedback por producto: botón "✓ Agregado" y mensaje de stock (en vez de alert)
  agregadoRecientemente = signal<Record<string, boolean>>({});
  mensajeStock = signal<Record<string, string>>({});

  agregarAlCarrito(producto: Cafe) {
    const resultado = this.carrito.agregar(producto, 1);
    if (!resultado.agregado) {
      this.mensajeStock.update(mapa => ({ ...mapa, [producto._id]: 'Ya tenés todo el stock en el carrito' }));
      return;
    }
    this.mensajeStock.update(mapa => ({ ...mapa, [producto._id]: '' }));
    this.agregadoRecientemente.update(mapa => ({ ...mapa, [producto._id]: true }));
    setTimeout(() => {
      this.agregadoRecientemente.update(mapa => ({ ...mapa, [producto._id]: false }));
    }, 1200);
  }

  fueAgregado(producto: Cafe): boolean {
    return this.agregadoRecientemente()[producto._id] === true;
  }

  mensajeDeStock(producto: Cafe): string {
    return this.mensajeStock()[producto._id] ?? '';
  }

}