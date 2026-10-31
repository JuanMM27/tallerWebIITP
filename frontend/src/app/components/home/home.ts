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

  agregarAlCarrito(producto: Cafe) {
    const resultado = this.carrito.agregar(producto, 1);
    if (!resultado.agregado) {
      alert(`No podés agregar más de ${producto.nombre}: ya alcanzaste el stock (${resultado.stock} unidades).`);
    } else if (resultado.capped) {
      alert(`Solo hay ${resultado.stock} unidades de ${producto.nombre}; agregamos las disponibles.`);
    }
  }

}
