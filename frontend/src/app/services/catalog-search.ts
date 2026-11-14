import { Injectable, signal } from '@angular/core';

// Búsqueda compartida entre el header y el catálogo.
// - query: lo que el usuario está escribiendo (borrador).
// - consultaAplicada: la búsqueda con la que realmente se filtra. Solo cambia
//   al tocar "Aplicar filtros" o Enter, para no filtrar con cada tecla.
@Injectable({ providedIn: 'root' })
export class CatalogSearchService {
  query = signal('');
  consultaAplicada = signal('');

  aplicar(): void {
    this.consultaAplicada.set(this.query().trim());
  }

  limpiar(): void {
    this.query.set('');
    this.consultaAplicada.set('');
  }
}