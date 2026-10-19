import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from './services/product'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Café Nominal';
  
  private productService = inject(ProductService);
  products = toSignal(this.productService.getProducts(), { initialValue: [] });
}