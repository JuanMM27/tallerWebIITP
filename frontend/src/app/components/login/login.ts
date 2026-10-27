import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  correo = signal('');
  password = signal('');
  mensajeError = signal('');
  cargando = signal(false);

  onSubmit() {
    this.mensajeError.set('');
    this.cargando.set(true);

    this.authService.login(this.correo(), this.password()).subscribe({
      next: () => {
        this.cargando.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/cafes';
        this.router.navigateByUrl(returnUrl);
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
