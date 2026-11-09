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
  // Mensaje de stock por producto (se muestra debajo del selector, en rojo)
  mensajeStock = signal<Record<string, string>>({});
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

  cantidadEnCarrito(producto: Cafe): number {
    return this.carrito.lista().find(item => item.productId === producto._id)?.cantidad ?? 0;
  }

  // Stock que aún se puede agregar: el stock del producto menos lo que ya está en el carrito
  maxDisponible(producto: Cafe): number {
    return Math.max(0, producto.stock - this.cantidadEnCarrito(producto));
  }

  cantidadDe(producto: Cafe): number {
    const maximo = this.maxDisponible(producto);
    const guardado = this.cantidades()[producto._id] ?? 1;
    return Math.min(Math.max(1, guardado), maximo);
  }

  mensajeDeStock(producto: Cafe): string {
    return this.mensajeStock()[producto._id] ?? '';
  }

  incrementarCantidad(producto: Cafe): void {
    const maximo = this.maxDisponible(producto);
    const actual = this.cantidadDe(producto);
    if (actual >= maximo) {
      this.mostrarMensajeStock(producto, 'No hay más stock');
      return;
    }
    this.cantidades.update(mapa => ({ ...mapa, [producto._id]: actual + 1 }));
    this.limpiarMensajeStock(producto);
  }

  decrementarCantidad(producto: Cafe): void {
    const actual = this.cantidadDe(producto);
    if (actual <= 1) return;
    this.cantidades.update(mapa => ({ ...mapa, [producto._id]: actual - 1 }));
    this.limpiarMensajeStock(producto);
  }

  fueAgregado(producto: Cafe): boolean {
    return this.agregadoRecientemente()[producto._id] === true;
  }

  agregarAlCarrito(producto: Cafe) {
    const resultado = this.carrito.agregar(producto, this.cantidadDe(producto));
    if (!resultado.agregado) {
      this.mostrarMensajeStock(producto, 'No hay más stock');
      return;
    }
    if (resultado.capped) {
      this.mostrarMensajeStock(producto, `Solo hay ${resultado.stock} unidades`);
    } else {
      this.limpiarMensajeStock(producto);
    }
    // Feedback visual en el botón: "✓ Agregado" durante un instante
    this.agregadoRecientemente.update(mapa => ({ ...mapa, [producto._id]: true }));
    setTimeout(() => {
      this.agregadoRecientemente.update(mapa => ({ ...mapa, [producto._id]: false }));
    }, 1200);
  }

  private mostrarMensajeStock(producto: Cafe, texto: string): void {
    this.mensajeStock.update(mapa => ({ ...mapa, [producto._id]: texto }));
  }

  private limpiarMensajeStock(producto: Cafe): void {
    this.mensajeStock.update(mapa => {
      if (!(producto._id in mapa)) return mapa;
      const copia = { ...mapa };
      delete copia[producto._id];
      return copia;
    });
  }
}
