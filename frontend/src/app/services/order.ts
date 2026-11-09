import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Ítem del pedido (contrato del plan, sección 3.2)
export interface ItemPedido {
  productId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

// Payload que envía el frontend al backend (el userId sale del token, no se envía)
export interface DatosPedido {
  productos: ItemPedido[];
  total: number;
}

export interface Pedido {
  _id: string;
  userId: string;
  productos: ItemPedido[];
  total: number;
  estado: 'Pendiente' | 'Pago' | 'Entregado';
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/orders';

  createOrder(payload: DatosPedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, payload);
  }

  getOrders(userId: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/${userId}`);
  }
}
