export type ClasificacionCafe = 'Grano Entero' | 'Molido' | 'Soluble' | 'Capsulas';

export type GramajeCafe = '250g' | '500g' | '1kg';

export interface DatosCafe {
  nombre: string;
  descripcion: string;
  clasificacion: ClasificacionCafe;
  gramaje: GramajeCafe;
  precio: number;
  stock: number;
  imagen: string;
}

export interface Cafe extends DatosCafe {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface RespuestaActualizarCafe {
  message: string;
  updatedProduct: Cafe;
}

export interface RespuestaEliminarCafe {
  message: string;
  deletedProduct: Cafe;
}
