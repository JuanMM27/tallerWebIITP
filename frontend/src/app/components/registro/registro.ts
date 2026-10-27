import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, DatosRegistro } from '../../services/auth';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private authService = inject(AuthService);

  nombre = signal('');
  apellido = signal('');
  direccion = signal('');
  correo = signal('');
  password = signal('');

  mensajeError = signal('');
  cargando = signal(false);
  registroExitoso = signal(false);

  passwordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}';

  onSubmit() {
    this.mensajeError.set('');
    this.cargando.set(true);

    const datos: DatosRegistro = {
      nombre: this.nombre(),
      apellido: this.apellido(),
      direccion: this.direccion(),
      correo: this.correo(),
      password: this.password(),
    };

    this.authService.register(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.registroExitoso.set(true);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set(
          err.error?.message ||
            'No se pudo conectar con el servidor. Intentá de nuevo en unos minutos.',
        );
      },
    });
  }
}
