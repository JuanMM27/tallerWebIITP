import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-recuperar-password',
  styleUrl: './recuperar-password.css',
  templateUrl: './recuperar-password.html',
})
export class RecuperarPassword {
  private authService = inject(AuthService);

  correo = signal('');
  mensajeError = signal('');
  mensajeExito = signal('');
  cargando = signal(false);

  onSubmit() {
    this.mensajeError.set('');
    this.cargando.set(true);

    this.authService.solicitarRecuperacion(this.correo()).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.mensajeExito.set(respuesta.message);
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
