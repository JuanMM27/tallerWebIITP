import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:4000/api/products';

    getProducts(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getProductById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    createProduct(productData: any): Observable<any>{
        return this.http.post<any>(this.apiUrl, productData);
    }

    updateProduct(id: string, productData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, productData);
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}