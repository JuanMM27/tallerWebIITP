import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatalogSearchService {
  query = signal('');
}
