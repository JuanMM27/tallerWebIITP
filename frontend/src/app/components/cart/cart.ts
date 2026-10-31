import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';

registerLocaleData(localeEsAr, 'es-AR');

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  private readonly carrito = inject(CartService);
  private readonly servicioProductos = inject(ProductService);

  items = this.carrito.lista;
  cantidadTotal = this.carrito.cantidadTotal;
  subtotal = this.carrito.subtotal;
  total = this.carrito.total;
  estaVacio = this.carrito.estaVacio;

  avisoStock = signal(false);
  verificandoStock = signal(false);

  ngOnInit(): void {
    this.verificarStock();
  }

  incrementar(productId: string): void {
    this.carrito.incrementar(productId);
  }

  decrementar(productId: string): void {
    this.carrito.decrementar(productId);
  }

  quitar(productId: string): void {
    this.carrito.quitar(productId);
  }

  vaciar(): void {
    this.carrito.vaciar();
  }

  // Re-valida el stock contra el backend (fuente de verdad) para corregir
  // cantidades si el stock cambió desde que se agregó el producto.
  private verificarStock(): void {
    const items = this.items();
    if (items.length === 0) return;

    this.verificandoStock.set(true);
    this.servicioProductos.validateStock(
      items.map(item => ({ productId: item.productId, cantidad: item.cantidad }))
    ).subscribe({
      next: respuesta => {
        const resultados = [...respuesta.ok, ...respuesta.insuficiente];
        let huboAjuste = false;
        resultados.forEach(resultado => {
          if (this.carrito.sincronizarStock(resultado.productId, resultado.stock)) {
            huboAjuste = true;
          }
        });
        this.avisoStock.set(huboAjuste);
        this.verificandoStock.set(false);
      },
      error: () => this.verificandoStock.set(false)
    });
  }
}
