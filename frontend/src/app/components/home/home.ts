import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../services/product';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogSearchService } from '../../services/catalog-search';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  host: { class: 'contenedorComponenteInicio' },
  templateUrl: './home.html', 
  styleUrl: './home.css'
})
export class Home {
  private productService = inject(ProductService);
  private catalogSearch = inject(CatalogSearchService);

  products = toSignal(this.productService.getProducts(), { initialValue: [] });
  searchQuery = this.catalogSearch.query;
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    return this.products().filter(p => {
      const matchesText = p.nombre.toLowerCase().includes(query) || 
                          p.descripcion.toLowerCase().includes(query);
      return matchesText;
    });
  });

}
