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
import type { ItemStockResultado } from '../../services/product';

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

  // Mensaje cuando el stock cambió y se ajustó el carrito ('' = sin aviso)
  avisoStock = signal('');
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
      // Después del login vuelve al carrito.
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/carrito' } });
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

        // Stock insuficiente: el backend devuelve el stock real de cada producto.
        // Ajustamos el carrito y volvemos al listado para que el usuario revise.
        const insuficiente: ItemStockResultado[] | undefined = error.error?.insuficiente;
        if (error.status === 400 && Array.isArray(insuficiente) && insuficiente.length > 0) {
          this.aplicarStock(insuficiente);
          this.mostrandoPago.set(false);
          return;
        }

        if (error.status === 0) {
          this.errorPago.set('No pudimos conectarnos con el servidor. Revisá tu conexión e intentalo de nuevo.');
        } else if (error.status === 401) {
          this.errorPago.set('Tu sesión venció. Iniciá sesión de nuevo para terminar la compra.');
        } else {
          this.errorPago.set(error.error?.message || 'No se pudo confirmar el pedido. Intentalo de nuevo.');
        }
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
        this.aplicarStock([...respuesta.ok, ...respuesta.insuficiente]);
        this.verificandoStock.set(false);
      },
      error: () => this.verificandoStock.set(false)
    });
  }

  // Sincroniza el carrito con el stock real y arma el aviso para el usuario.
  private aplicarStock(resultados: ItemStockResultado[]): void {
    const nombres = new Map(this.items().map(i => [i.productId, i.nombre]));
    const quitados: string[] = [];
    const ajustados: string[] = [];

    resultados.forEach(resultado => {
      const nombre = nombres.get(resultado.productId) ?? 'Un producto';
      const cambio = this.carrito.sincronizarStock(resultado.productId, resultado.stock);
      if (cambio === 'quitado') quitados.push(nombre);
      if (cambio === 'ajustado') ajustados.push(`${nombre} (quedan ${resultado.stock})`);
    });

    const partes: string[] = [];
    if (quitados.length) partes.push(`Se agotó y lo quitamos del carrito: ${quitados.join(', ')}.`);
    if (ajustados.length) partes.push(`Ajustamos la cantidad por stock: ${ajustados.join(', ')}.`);
    this.avisoStock.set(partes.join(' '));
  }
}