import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Catalog } from './components/catalog/catalog';
import { ProductDetail } from './components/product-detail/product-detail';
import { ProductForm } from './components/product-form/product-form';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { RecuperarPassword } from './components/recuperar-password/recuperar-password';
import { RestablecerPassword } from './components/restablecer-password/restablecer-password';
import { Origenes } from './components/origenes/origenes';
import { NuestraHistoria } from './components/nuestra-historia/nuestra-historia';
import { Cart } from './components/cart/cart';
import { MisPedidos } from './components/mis-pedidos/mis-pedidos';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cafes', component: Catalog },
  { path: 'cafes/:id', component: ProductDetail },
  { path: 'carrito', component: Cart },
  { path: 'mis-pedidos', component: MisPedidos, canActivate: [authGuard] },
  { path: 'origenes', component: Origenes },
  { path: 'nuestra-historia', component: NuestraHistoria },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'recuperar-password', component: RecuperarPassword },
  { path: 'restablecer-password', component: RestablecerPassword },
  { path: 'admin/crear', component: ProductForm, canActivate: [adminGuard] },
  { path: 'admin/editar/:id', component: ProductForm, canActivate: [adminGuard] }
];