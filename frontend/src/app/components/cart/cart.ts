import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { OrderService } from '../../services/order';
import type { Pedido } from '../../services/order';

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
  private readonly servicioPedidos = inject(OrderService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  items = this.carrito.lista;
  cantidadTotal = this.carrito.cantidadTotal;
  subtotal = this.carrito.subtotal;
  total = this.carrito.total;
  estaVacio = this.carrito.estaVacio;

  avisoStock = signal(false);
  verificandoStock = signal(false);

  // Estado del checkout (pago simulado)
  mostrandoPago = signal(false);
  procesandoPago = signal(false);
  errorPago = signal('');
  pedidoConfirmado = signal<Pedido | null>(null);

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

  abrirPago(): void {
    // Solo se puede comprar con sesión iniciada.
    if (!this.auth.estaLogueado()) {
      this.router.navigate(['/login']);
      return;
    }
    this.errorPago.set('');
    this.mostrandoPago.set(true);
  }

  cancelarPago(): void {
    this.mostrandoPago.set(false);
    this.errorPago.set('');
  }

  confirmarPago(): void {
    if (this.items().length === 0) return;

    const payload = {
      productos: this.items().map(item => ({
        productId: item.productId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio
      })),
      total: this.total()
    };

    this.procesandoPago.set(true);
    this.errorPago.set('');

    this.servicioPedidos.createOrder(payload).subscribe({
      next: pedido => {
        this.pedidoConfirmado.set(pedido);
        this.mostrandoPago.set(false);
        this.procesandoPago.set(false);
        // Tras confirmar, se limpia el carrito.
        this.carrito.vaciar();
      },
      error: (error: HttpErrorResponse) => {
        this.procesandoPago.set(false);
        this.errorPago.set(error.error?.message || 'No se pudo confirmar el pedido. Intentalo de nuevo.');
      }
    });
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
