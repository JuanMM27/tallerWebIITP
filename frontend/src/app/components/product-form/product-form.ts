import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  productId = signal<string | null>(null);

  product = signal({
    nombre: '',
    descripcion: '',
    clasificacion: 'Grano Entero',
    gramaje: '250g',
    precio: 0,
    stock: 1,
    imagen: ''
  });

  selectedFile: File | null = null;
  fileTouched = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProductData(id);
    }
  }

  loadProductData(id: string) {
    this.productService.getProductById(id).subscribe({
      next: (prod: any) => {
        this.product.set({
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          clasificacion: prod.clasificacion,
          gramaje: prod.gramaje,
          precio: prod.precio,
          stock: prod.stock,
          imagen: prod.imagen || ''
        });
      },
      error: () => {
        alert('No se pudo cargar el producto.');
      }
    });
  }

  onFileSelected(event: any) {
    this.fileTouched.set(true);
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }
  get isImageInvalid(): boolean {
    return !this.isEditMode() && !this.selectedFile;
  }

  onSubmit() {

    if (this.isImageInvalid) {
      this.fileTouched.set(true);
      return;
    }
    const formData = new FormData();
    formData.append('nombre', this.product().nombre);
    formData.append('descripcion', this.product().descripcion);
    formData.append('clasificacion', this.product().clasificacion);
    formData.append('gramaje', this.product().gramaje);
    formData.append('precio', this.product().precio.toString());
    formData.append('stock', this.product().stock.toString());

    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    if (this.isEditMode()) {
      const id = this.productId();
      if (!id) return;

      this.productService.updateProduct(id, formData).subscribe({
        next: () => {
          this.router.navigate(['/']); 
        },
        error: (error) => {
          alert(error.error?.message || 'No se pudo actualizar el café. Revisá que el servidor y la base de datos estén disponibles.');
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.router.navigate(['/']); 
        },
        error: (error) => {
          alert(error.error?.message || 'No se pudo guardar el café. Revisá que el servidor y la base de datos estén disponibles.');
        }
      });
    }
  }
}