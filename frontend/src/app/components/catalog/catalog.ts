import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogSearchService } from '../../services/catalog-search';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {
  private productService = inject(ProductService);
  private catalogSearch = inject(CatalogSearchService);

  products = toSignal(this.productService.getProducts(), { initialValue: [] });
  searchQuery = this.catalogSearch.query;
  selectedClassification = signal('Todos');
  classifications = computed(() => [
    ...new Set(this.products().map(product => product.clasificacion))
  ].sort());

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const classification = this.selectedClassification();

    return this.products().filter(product => {
      const matchesText = product.nombre.toLowerCase().includes(query)
        || product.descripcion.toLowerCase().includes(query);
      const matchesCategory = classification === 'Todos'
        || product.clasificacion === classification;

      return matchesText && matchesCategory;
    });
  });

  onDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas dar de baja este lote?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => window.location.reload(),
        error: () => alert('No se pudo eliminar el producto.')
      });
    }
  }
}
