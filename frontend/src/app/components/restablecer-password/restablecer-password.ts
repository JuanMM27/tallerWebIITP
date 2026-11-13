import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-restablecer-password',
  styleUrl: './restablecer-password.css',
  templateUrl: './restablecer-password.html',
})
export class RestablecerPassword {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // El token llega en el enlace: /restablecer-password?token=...
  token = this.route.snapshot.queryParamMap.get('token') ?? '';

  password = signal('');
  confirmacion = signal('');
  mensajeError = signal('');
  cargando = signal(false);
  restablecido = signal(false);

  // Misma regla de complejidad que en el registro.
  passwordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}';

  noCoinciden = computed(() => this.confirmacion() !== '' && this.password() !== this.confirmacion());

  onSubmit() {
    if (this.noCoinciden()) return;

    this.mensajeError.set('');
    this.cargando.set(true);

    this.authService.restablecerPassword(this.token, this.password()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.restablecido.set(true);
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
