import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Catalog } from './components/catalog/catalog';
import { ProductForm } from './components/product-form/product-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cafes', component: Catalog },
  { path: 'admin/crear', component: ProductForm },
  { path: 'admin/editar/:id', component: ProductForm }
];
