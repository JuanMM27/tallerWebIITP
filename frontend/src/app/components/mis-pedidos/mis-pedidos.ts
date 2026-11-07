import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrderService } from '../../services/order';
import type { Pedido } from '../../services/order';

registerLocaleData(localeEsAr, 'es-AR');

// Historial de pedidos del usuario logueado (GET /api/orders/:userId).
@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css'
})
export class MisPedidos implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly servicioPedidos = inject(OrderService);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    const usuario = this.auth.usuario();
    if (!usuario) return; // el guard ya evita entrar sin sesión

    this.cargando.set(true);
    this.error.set('');

    this.servicioPedidos.getOrders(usuario.id).subscribe({
      next: pedidos => {
        this.pedidos.set(pedidos);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          error.status === 0
            ? 'No pudimos conectarnos con el servidor. Intentalo de nuevo en unos minutos.'
            : error.error?.message || 'No se pudieron cargar tus pedidos.'
        );
      }
    });
  }

  cantidadUnidades(pedido: Pedido): number {
    return pedido.productos.reduce((suma, item) => suma + item.cantidad, 0);
  }
}