import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Catalog } from './components/catalog/catalog';
import { ProductForm } from './components/product-form/product-form';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { adminGuard } from './guards/admin-guard';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cafes', component: Catalog },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'admin/crear', component: ProductForm, canActivate: [adminGuard] },
  { path: 'admin/editar/:id', component: ProductForm, canActivate: [adminGuard] }
];
