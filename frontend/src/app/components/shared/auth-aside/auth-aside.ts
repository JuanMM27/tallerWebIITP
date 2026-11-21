import { Component } from '@angular/core';

// Panel de marca que acompaña a las pantallas de acceso (login, registro y recupero).
// Solo presentación: los estilos viven en styles.css (.t-auth__aside).
@Component({
  selector: 'app-auth-aside',
  standalone: true,
  host: { class: 't-auth__aside', 'aria-hidden': 'true' },
  template: `
    <p class="t-auth__quote">Café de origen, tostado en pequeños lotes y servido <em>con intención.</em></p>
    <img class="t-auth__aside-img" src="/img/CafeTerraHome.png" alt="" />
    <p class="t-auth__caption">TERRA · Café de especialidad</p>
  `
})
export class AuthAside {}
