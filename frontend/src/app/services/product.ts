import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Cafe, RespuestaActualizarCafe, RespuestaEliminarCafe } from "../models/cafe";

export interface PaginaProductos {
    productos: Cafe[];
    total: number;
    pagina: number;
    limite: number;
    clasificaciones: string[];
}

export type DisponibilidadProductos = 'todos' | 'con_stock' | 'sin_stock';
export type OrdenPrecioProductos = 'ninguno' | 'precio_asc' | 'precio_desc';

// Contrato compartido del carrito: validación de stock 
export interface ItemValidacionStock {
    productId: string;
    cantidad: number;
}

export interface ItemStockResultado {
    productId: string;
    cantidad: number;
    stock: number;
}

export interface RespuestaValidarStock {
    ok: ItemStockResultado[];
    insuficiente: ItemStockResultado[];
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private clienteHttp = inject(HttpClient);
    private urlApi = 'http://localhost:4000/api/products';

    getProducts(): Observable<Cafe[]> {
        return this.clienteHttp.get<Cafe[]>(this.urlApi);
    }

    obtenerPaginaProductos(pagina: number, limite = 8, busqueda = '', clasificacion = 'Todos', 
        disponibilidad: DisponibilidadProductos = 'todos',orden: OrdenPrecioProductos = 'ninguno'): Observable<PaginaProductos> {
        return this.clienteHttp.get<PaginaProductos>(this.urlApi, {
        params: { pagina, limite, busqueda, clasificacion, disponibilidad, orden }
    });
}

    validateStock(items: ItemValidacionStock[]): Observable<RespuestaValidarStock> {
        return this.clienteHttp.post<RespuestaValidarStock>(`${this.urlApi}/validate-stock`, items);
    }

    getProductById(identificador: string): Observable<Cafe> {
        return this.clienteHttp.get<Cafe>(`${this.urlApi}/${identificador}`);
    }

    createProduct(datosFormulario: FormData): Observable<Cafe>{
        return this.clienteHttp.post<Cafe>(this.urlApi, datosFormulario);
    }

    updateProduct(identificador: string, datosFormulario: FormData): Observable<RespuestaActualizarCafe> {
        return this.clienteHttp.put<RespuestaActualizarCafe>(`${this.urlApi}/${identificador}`, datosFormulario);
    }

    deleteProduct(identificador: string): Observable<RespuestaEliminarCafe> {
        return this.clienteHttp.delete<RespuestaEliminarCafe>(`${this.urlApi}/${identificador}`);
    }
}
