import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import type { Cafe } from '../../models/cafe';
import { Benefits } from '../shared/benefits/benefits';

registerLocaleData(localeEsAr, 'es-AR');

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, Benefits],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  private readonly rutaActual = inject(ActivatedRoute);
  private readonly servicioProductos = inject(ProductService);
  private readonly carrito = inject(CartService);

  productoSeleccionado = signal<Cafe | null>(null);
  cantidad = signal(1);
  cargando = signal(true);
  noEncontrado = signal(false);
  errorCarga = signal(false);

  ngOnInit(): void {
    this.rutaActual.paramMap.pipe(
      switchMap(parametros => {
        const identificador = parametros.get('id') ?? '';
        this.cargando.set(true);
        this.noEncontrado.set(false);
        this.errorCarga.set(false);
        this.productoSeleccionado.set(null);
        this.cantidad.set(1);
        if (!/^[a-f\d]{24}$/i.test(identificador)) return of(null);
        return this.servicioProductos.getProductById(identificador);
      })
    ).subscribe({
      next: (productoRecibido: Cafe | null) => {
        if (!productoRecibido) {
          this.noEncontrado.set(true);
        } else {
          this.productoSeleccionado.set(productoRecibido);
        }
        this.cargando.set(false);
      },
      error: (errorRespuesta: HttpErrorResponse) => {
        this.noEncontrado.set(errorRespuesta.status === 404);
        this.errorCarga.set(errorRespuesta.status !== 404);
        this.cargando.set(false);
      }
    });
  }

  cambiarCantidad(cambio: number): void {
    const producto = this.productoSeleccionado();
    if (!producto || producto.stock <= 0) return;
    this.cantidad.update(actual => Math.min(producto.stock, Math.max(1, actual + cambio)));
  }

  agregarAlCarrito(): void {
    const producto = this.productoSeleccionado();
    if (!producto) return;

    const resultado = this.carrito.agregar(producto, this.cantidad());
    if (!resultado.agregado) {
      alert(`No podés agregar más de ${producto.nombre}: ya alcanzaste el stock (${resultado.stock} unidades).`);
    } else if (resultado.capped) {
      alert(`Solo hay ${resultado.stock} unidades de ${producto.nombre}; agregamos las disponibles.`);
    }
  }
}
