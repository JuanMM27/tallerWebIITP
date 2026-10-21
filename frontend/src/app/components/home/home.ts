import { Component, inject, signal, computed} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../services/product';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogSearchService } from '../../services/catalog-search';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  host: { class: 'contenedorComponenteInicio' },
  templateUrl: './home.html', 
  styleUrl: './home.css'
})
export class Home {
  private productService = inject(ProductService);
  private catalogSearch = inject(CatalogSearchService);

  products = toSignal(this.productService.getProducts(), { initialValue: [] });
  searchQuery = this.catalogSearch.query;
  selectedClassification = signal('Todos');

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const classification = this.selectedClassification();

    return this.products().filter(p => {
      const matchesText = p.nombre.toLowerCase().includes(query) || 
                          p.descripcion.toLowerCase().includes(query);
      const matchesCategory = classification === 'Todos' || p.clasificacion === classification;
      return matchesText && matchesCategory;
    });
  });

  onDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas dar de baja este lote?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          window.location.reload(); 
        },
        error: () => {
          alert('No se pudo eliminar el producto.');
        }
      });
    }
  }
}
