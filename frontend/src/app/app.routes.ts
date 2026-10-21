import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ProductForm } from './components/product-form/product-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin/crear', component: ProductForm },
  { path: 'admin/editar/:id', component: ProductForm }
];