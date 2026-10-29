import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { Cafe, DatosCafe } from '../../models/cafe';
import { ProductService } from '../../services/product';

function obtenerMensajeError(respuesta: HttpErrorResponse, mensajePredeterminado: string): string {
  const cuerpoRespuesta: unknown = respuesta.error;
  if (typeof cuerpoRespuesta === 'object' && cuerpoRespuesta !== null && 'message' in cuerpoRespuesta) {
    const mensaje = cuerpoRespuesta.message;
    if (typeof mensaje === 'string') return mensaje;
  }
  return mensajePredeterminado;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  private servicioProductos = inject(ProductService);
  private enrutador = inject(Router);
  private rutaActual = inject(ActivatedRoute);

  modoEdicion = signal(false);
  identificadorProducto = signal<string | null>(null);

  datosCafe = signal<DatosCafe>({
    nombre: '',
    descripcion: '',
    clasificacion: 'Grano Entero',
    gramaje: '250g',
    precio: 0,
    stock: 1,
    imagen: ''
  });

  archivoSeleccionado: File | null = null;
  archivoTocado = signal(false);

  ngOnInit(): void {
    const identificador = this.rutaActual.snapshot.paramMap.get('id');
    if (identificador) {
      this.modoEdicion.set(true);
      this.identificadorProducto.set(identificador);
      this.cargarDatosProducto(identificador);
    }
  }

  cargarDatosProducto(identificador: string): void {
    this.servicioProductos.getProductById(identificador).subscribe({
      next: (cafeRecibido: Cafe) => {
        this.datosCafe.set({
          nombre: cafeRecibido.nombre,
          descripcion: cafeRecibido.descripcion,
          clasificacion: cafeRecibido.clasificacion,
          gramaje: cafeRecibido.gramaje,
          precio: cafeRecibido.precio,
          stock: cafeRecibido.stock,
          imagen: cafeRecibido.imagen || ''
        });
      },
      error: () => {
        alert('No se pudo cargar el producto.');
      }
    });
  }

  seleccionarArchivo(evento: Event): void {
    const entrada = evento.target;
    if (!(entrada instanceof HTMLInputElement)) return;

    this.archivoTocado.set(true);
    this.archivoSeleccionado = entrada.files?.[0] ?? null;
  }

  get imagenInvalida(): boolean {
    return !this.modoEdicion() && !this.archivoSeleccionado;
  }

  guardarProducto(): void {
    if (this.imagenInvalida) {
      this.archivoTocado.set(true);
      return;
    }

    const datosFormulario = new FormData();
    datosFormulario.append('nombre', this.datosCafe().nombre);
    datosFormulario.append('descripcion', this.datosCafe().descripcion);
    datosFormulario.append('clasificacion', this.datosCafe().clasificacion);
    datosFormulario.append('gramaje', this.datosCafe().gramaje);
    datosFormulario.append('precio', this.datosCafe().precio.toString());
    datosFormulario.append('stock', this.datosCafe().stock.toString());

    if (this.archivoSeleccionado) {
      datosFormulario.append('imagen', this.archivoSeleccionado);
    }

    if (this.modoEdicion()) {
      const identificador = this.identificadorProducto();
      if (!identificador) return;

      this.servicioProductos.updateProduct(identificador, datosFormulario).subscribe({
        next: () => {
          this.enrutador.navigate(['/']);
        },
        error: (errorRespuesta: HttpErrorResponse) => {
          alert(obtenerMensajeError(errorRespuesta, 'No se pudo actualizar el café. Revisá que el servidor y la base de datos estén disponibles.'));
        }
      });
    } else {
      this.servicioProductos.createProduct(datosFormulario).subscribe({
        next: () => {
          this.enrutador.navigate(['/']);
        },
        error: (errorRespuesta: HttpErrorResponse) => {
          alert(obtenerMensajeError(errorRespuesta, 'No se pudo guardar el café. Revisá que el servidor y la base de datos estén disponibles.'));
        }
      });
    }
  }
}
