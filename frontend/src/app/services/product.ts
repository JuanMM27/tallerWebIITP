import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Cafe, RespuestaActualizarCafe, RespuestaEliminarCafe } from "../models/cafe";

// Contrato compartido del carrito: validación de stock (ver plan sección 3.3)
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
