import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartService } from './cart';

export interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  direccion: string;
  rol: 'cliente' | 'admin';
}

export interface DatosRegistro {
  correo: string;
  password: string;
  nombre: string;
  apellido: string;
  direccion: string;
}

interface RespuestaLogin {
  message: string;
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private cart = inject(CartService);
  private apiUrl = 'http://localhost:4000/api/auth';

  usuario = signal<Usuario | null>(this.leerUsuarioGuardado());
  estaLogueado = computed(() => this.usuario() !== null);
  esAdmin = computed(() => this.usuario()?.rol === 'admin');

  register(datos: DatosRegistro): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datos);
  }

  login(correo: string, password: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap((respuesta) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        this.usuario.set(respuesta.usuario);
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario.set(null);
    // El carrito persiste al recargar pero se limpia al cerrar sesión (ver plan 1.1).
    this.cart.vaciar();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  }
}
