import { Injectable, computed, signal } from '@angular/core';
import type { Cafe } from '../models/cafe';

// Contrato compartido del carrito (ver plan sección 3.1).
// Se guarda como "foto" del producto al agregarlo: no se re-consulta el precio/nombre.
export interface CartItem {
  productId: string;      // _id de Mongo
  nombre: string;
  clasificacion: string;
  precio: number;
  gramaje: string;
  cantidad: number;       // >= 1
  stock: number;          // stock disponible al momento de agregar
}

export interface ResultadoAgregar {
  agregado: boolean;      // false si ya estaba en el máximo de stock
  capped: boolean;        // true si no se pudo agregar toda la cantidad pedida
  stock: number;          // stock disponible (para armar el mensaje)
}

const CLAVE_CARRITO = 'cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly items = signal<CartItem[]>(this.leerCarrito());

  // Exponemos el estado como signals (la vista reacciona a los cambios).
  readonly lista = this.items.asReadonly();

  readonly cantidadTotal = computed(() =>
    this.items().reduce((suma, item) => suma + item.cantidad, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((suma, item) => suma + item.precio * item.cantidad, 0)
  );

  readonly total = this.subtotal; // sin envío ni impuestos por ahora

  readonly estaVacio = computed(() => this.items().length === 0);

  /**
   * Agrega un producto al carrito, respetando el stock.
   * Devuelve un resultado para que la vista pueda avisar "solo quedan X".
   */
  agregar(producto: Cafe, cantidad: number = 1): ResultadoAgregar {
    const cantidadPedida = Math.max(1, cantidad);
    const stockDisponible = producto.stock;
    const existente = this.items().find(item => item.productId === producto._id);
    const cantidadActual = existente?.cantidad ?? 0;

    if (stockDisponible <= 0 || cantidadActual >= stockDisponible) {
      return { agregado: false, capped: true, stock: stockDisponible };
    }

    const cantidadAgregada = Math.min(cantidadPedida, stockDisponible - cantidadActual);
    const nuevaCantidad = cantidadActual + cantidadAgregada;

    if (existente) {
      this.items.update(items => items.map(item =>
        item.productId === producto._id
          ? { ...item, cantidad: nuevaCantidad, stock: stockDisponible }
          : item
      ));
    } else {
      this.items.update(items => [...items, {
        productId: producto._id,
        nombre: producto.nombre,
        clasificacion: producto.clasificacion,
        precio: producto.precio,
        gramaje: producto.gramaje,
        cantidad: nuevaCantidad,
        stock: stockDisponible,
      }]);
    }

    this.persistir();
    return {
      agregado: true,
      capped: cantidadAgregada < cantidadPedida,
      stock: stockDisponible,
    };
  }

  incrementar(productId: string): void {
    this.items.update(items => items.map(item =>
      item.productId === productId && item.cantidad < item.stock
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
    this.persistir();
  }

  decrementar(productId: string): void {
    this.items.update(items => items.map(item =>
      item.productId === productId && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
    this.persistir();
  }

  cambiarCantidad(productId: string, cantidad: number): void {
    this.items.update(items => items.map(item => {
      if (item.productId !== productId) return item;
      const nueva = Math.max(1, Math.min(cantidad, item.stock));
      return { ...item, cantidad: nueva };
    }));
    this.persistir();
  }

  quitar(productId: string): void {
    this.items.update(items => items.filter(item => item.productId !== productId));
    this.persistir();
  }

  vaciar(): void {
    this.items.set([]);
    this.persistir();
  }

  /**
   * Actualiza el stock conocido de un ítem (viene del backend, que es la fuente
   * de verdad). Si el stock bajó, capa la cantidad. Devuelve true si ajustó algo.
   */
  sincronizarStock(productId: string, stock: number): boolean {
    const item = this.items().find(i => i.productId === productId);
    if (!item) return false;

    const nuevoStock = Math.max(0, stock);
    const nuevaCantidad = Math.min(item.cantidad, nuevoStock);
    const ajusto = nuevaCantidad < item.cantidad;

    this.items.update(items => items.map(i =>
      i.productId === productId
        ? { ...i, stock: nuevoStock, cantidad: nuevaCantidad }
        : i
    ));
    this.persistir();
    return ajusto;
  }

  private persistir(): void {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(this.items()));
  }

  private leerCarrito(): CartItem[] {
    try {
      const guardado = localStorage.getItem(CLAVE_CARRITO);
      if (!guardado) return [];
      const parseado = JSON.parse(guardado);
      return Array.isArray(parseado) ? parseado : [];
    } catch {
      return [];
    }
  }
}
