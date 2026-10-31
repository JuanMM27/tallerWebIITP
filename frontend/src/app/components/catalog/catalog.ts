import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogSearchService } from '../../services/catalog-search';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import type { Cafe } from '../../models/cafe';
import { Benefits } from '../shared/benefits/benefits';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Benefits],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {
  private servicioProductos = inject(ProductService);
  private servicioBusquedaCatalogo = inject(CatalogSearchService);
  private carrito = inject(CartService);
  auth = inject(AuthService);

  productos = signal<Cafe[]>([]);
  cargando = signal(true);
  errorCarga = signal(false);
  // Cantidad seleccionada por producto (para agregar varias unidades desde el catálogo)
  cantidades = signal<Record<string, number>>({});
  // Feedback visual: producto que se acaba de agregar
  agregadoRecientemente = signal<Record<string, boolean>>({});
  consultaBusqueda = this.servicioBusquedaCatalogo.query;
  clasificacionSeleccionada = signal('Todos');
  clasificaciones = computed(() => [
    ...new Set(this.productos().map(producto => producto.clasificacion))
  ].sort());

  productosFiltrados = computed(() => {
    const consulta = this.consultaBusqueda().toLowerCase().trim();
    const clasificacion = this.clasificacionSeleccionada();

    return this.productos().filter(producto => {
      const coincideTexto = producto.nombre.toLowerCase().includes(consulta)
        || producto.descripcion.toLowerCase().includes(consulta);
      const coincideClasificacion = clasificacion === 'Todos'
        || producto.clasificacion === clasificacion;

      return coincideTexto && coincideClasificacion;
    });
  });

  constructor() {
    this.servicioProductos.getProducts().subscribe({
      next: productos => { this.productos.set(productos); this.cargando.set(false); },
      error: () => { this.errorCarga.set(true); this.cargando.set(false); }
    });
  }

  eliminarProducto(identificador: string) {
    if (confirm('¿Estás seguro de que deseas dar de baja este lote?')) {
      this.servicioProductos.deleteProduct(identificador).subscribe({
        next: () => this.productos.update(productos => productos.filter(producto => producto._id !== identificador)),
        error: () => alert('No se pudo eliminar el producto.')
      });
    }
  }

  cantidadDe(producto: Cafe): number {
    return this.cantidades()[producto._id] ?? 1;
  }

  incrementarCantidad(producto: Cafe): void {
    const actual = this.cantidadDe(producto);
    if (actual >= producto.stock) {
      alert(`No hay más stock disponible de ${producto.nombre}.`);
      return;
    }
    this.cantidades.update(mapa => ({ ...mapa, [producto._id]: actual + 1 }));
  }

  decrementarCantidad(producto: Cafe): void {
    const actual = this.cantidadDe(producto);
    if (actual <= 1) return;
    this.cantidades.update(mapa => ({ ...mapa, [producto._id]: actual - 1 }));
  }

  fueAgregado(producto: Cafe): boolean {
    return this.agregadoRecientemente()[producto._id] === true;
  }

  agregarAlCarrito(producto: Cafe) {
    const resultado = this.carrito.agregar(producto, this.cantidadDe(producto));
    if (!resultado.agregado) {
      alert(`No podés agregar más de ${producto.nombre}: ya alcanzaste el stock (${resultado.stock} unidades).`);
      return;
    }
    if (resultado.capped) {
      alert(`Solo hay ${resultado.stock} unidades de ${producto.nombre}; agregamos las disponibles.`);
    }
    // Feedback visual en el botón: "✓ Agregado" durante un instante
    this.agregadoRecientemente.update(mapa => ({ ...mapa, [producto._id]: true }));
    setTimeout(() => {
      this.agregadoRecientemente.update(mapa => ({ ...mapa, [producto._id]: false }));
    }, 1200);
  }
}
