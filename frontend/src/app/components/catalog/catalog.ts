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

  agregarAlCarrito(producto: Cafe) {
    const resultado = this.carrito.agregar(producto, 1);
    if (!resultado.agregado) {
      alert(`No podés agregar más de ${producto.nombre}: ya alcanzaste el stock (${resultado.stock} unidades).`);
    } else if (resultado.capped) {
      alert(`Solo hay ${resultado.stock} unidades de ${producto.nombre}; agregamos las disponibles.`);
    }
  }
}
