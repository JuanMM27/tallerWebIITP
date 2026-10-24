# Memoria contextual del proyecto — Aplicación web de tienda online

## 1. Propósito de este archivo

Este documento resume el alcance académico del trabajo práctico (TP) para que una IA pueda comprender el problema, proponer soluciones coherentes y ayudar con el desarrollo sin ampliar innecesariamente los requisitos.

**Regla principal:** cumplir los requerimientos del enunciado y resolverlos correctamente como una aplicación integrada. No agregar complejidad o funcionalidades nuevas sin una razón clara o sin consultar antes si cambian el alcance del TP.

## 2. Contexto académico y tecnológico

- **Tipo de proyecto:** aplicación web de tienda online.
- **Tamaño del grupo:** 4 alumnos.
- **Frontend requerido:** Angular.
- **Backend requerido:** Node.js.
- **Objetivo:** implementar gestión de usuarios, visualización de productos y un flujo de compra mediante carrito y pedido.
- **Nivel esperado:** trabajo práctico académico; no se exige construir un sistema empresarial ni una arquitectura de producción.

## 3. Requerimientos del enunciado

Las funcionalidades marcadas como requeridas son la prioridad. Las opcionales no deben tratarse como obligatorias sin una decisión del grupo o una indicación docente.

### 3.1. Gestión de usuarios

| Funcionalidad | Prioridad |
|---|---|
| Registro (signup) | Requerida |
| Inicio de sesión (signin) | Requerida |
| Recuperación de contraseña | Opcional |

**Datos mínimos de usuario:**
- Email
- Contraseña
- Nombre
- Apellido
- Dirección

**Reglas explícitas:**
- No se puede registrar más de un usuario con el mismo email.
- Se debe validar la complejidad de la contraseña.

### 3.2. Gestión de productos

| Funcionalidad | Prioridad |
|---|---|
| Visualizar productos | Requerida |
| Agregar un producto al carrito | Requerida |
| Ver el pedido/carrito | Requerida |
| Cargar un producto nuevo | Opcional |

**Datos mínimos de producto:**
- Nombre
- Descripción
- Clasificación
- Precio

Desde la visualización de productos, el usuario debe poder agregar un producto al carrito. En la vista del carrito/pedido se debe mostrar el detalle de los productos que se planea comprar.

> El enunciado menciona expresamente la carga de productos nuevos como opcional. La edición y eliminación de productos no aparecen en los requisitos originales proporcionados; no deben asumirse como obligatorias.

## 4. Criterio de evaluación aclarado por el docente

El docente indicó que la prioridad es cumplir el PDF y demostrar criterio al implementar los requerimientos. No espera funcionalidades añadidas porque sí ni tecnologías avanzadas que no sean necesarias.

Se evaluará:

1. Cumplimiento de los requerimientos del PDF.
2. Coherencia entre las funcionalidades cuando se usan en conjunto.
3. Ausencia de inconsistencias evidentes en los flujos.
4. Consideración de situaciones y errores que pueda encontrar el usuario.
5. Interfaz clara, cómoda, accesible y adaptable (responsive) a computadora, tablet y celular.
6. Código organizado y comprensible para otros desarrolladores.
7. Capacidad del grupo para justificar sus decisiones técnicas y funcionales.

### Principio clave: comportamiento real, aunque algunas operaciones sean simuladas

No alcanza con crear pantallas y botones que parezcan funcionar. Las acciones deben tener resultados lógicos y comunicarse claramente al usuario. Por ejemplo, si se simula una compra, la aplicación debe reflejar correctamente el resultado de la operación.

El docente **no exige** JWT, un sistema avanzado de roles/permisos ni seguridad de nivel productivo si no forman parte de los objetivos del TP. Se pueden simular ciertos comportamientos cuando sea suficiente para el objetivo académico, manteniendo coherencia en la experiencia.

## 5. Criterios de diseño e implementación

Estos criterios ayudan a implementar correctamente lo pedido. No significan que cada uno deba convertirse en un subsistema complejo.

### 5.1. Roles y acciones coherentes

Aunque el PDF no detalle perfiles, el docente sugiere reconocer que puede haber perfiles con funciones distintas, como:
- **Comprador:** explora productos, agrega artículos al carrito y consulta su pedido.
- **Administrador/gestor de productos:** podría cargar productos si el grupo decide implementar la funcionalidad opcional.

No es obligatorio construir un sistema completo de roles. Si se diferencian perfiles, las restricciones deben ser consistentes y pueden implementarse de manera sencilla, de acuerdo con lo que permita el TP. No presentar como requisito obligatorio algo que el enunciado deja opcional.

### 5.2. Flujo de compra

El recorrido principal debería ser comprensible y consistente:

1. El usuario visualiza el catálogo de productos.
2. Agrega uno o más productos al carrito.
3. Consulta el carrito y el detalle del pedido.
4. La interfaz informa claramente qué productos se seleccionaron y, cuando corresponda, sus cantidades y subtotales.
5. Si el grupo implementa la confirmación de compra, esta debe producir un resultado coherente. El cobro puede simularse; no es necesario integrar una pasarela de pago real.

**Importante:** el enunciado exige ver el pedido/carrito, pero el texto proporcionado no define expresamente todos los detalles de una confirmación final de compra. La confirmación puede ser una decisión de diseño razonable para completar el flujo; validar con el docente si genera dudas de alcance.

### 5.3. Stock y consistencia de datos

El docente plantea el stock como un ejemplo de criterio, no como una especificación detallada de inventario. Si el proyecto decide modelar stock o cantidades limitadas, debe evitar permitir compras de cantidades superiores a las disponibles. No desarrollar un sistema complejo de inventario salvo que sea necesario o acordado.

### 5.4. Validaciones y estados de error

La aplicación debería manejar de forma clara, como mínimo, los casos relevantes para las funciones implementadas:

- Formulario de registro incompleto o con datos inválidos.
- Email ya registrado.
- Contraseña que no cumple la complejidad exigida.
- Inicio de sesión con credenciales incorrectas.
- Intento de agregar un producto no disponible, si existe esa condición.
- Carrito vacío.
- Acciones que no pueden completarse o errores del backend.

Mostrar mensajes comprensibles y evitar fallos silenciosos. Las reglas importantes deben validarse también en el backend, no únicamente en Angular.

### 5.5. Navegación, accesibilidad y responsive

- Los botones deben hacer lo que indica su texto.
- El usuario debe entender dónde está y cómo continuar o volver.
- Los formularios deben comunicar errores de manera clara.
- La interfaz debe ser utilizable en computadora, tablet y celular.
- Priorizar una experiencia simple y consistente antes que agregar pantallas innecesarias.

## 6. Seguridad y arquitectura: nivel adecuado al TP

Distinguir entre lo que ve el usuario y lo que valida el sistema internamente.

- Validar datos en el frontend para mejorar la experiencia y volver a validarlos en el backend.
- Impedir emails duplicados mediante una regla confiable en el backend y/o la persistencia.
- No guardar contraseñas en texto plano; utilizar un mecanismo de hash apropiado en el backend.
- No exponer secretos ni credenciales en el código del frontend.
- No incorporar JWT, permisos avanzados, microservicios ni otras tecnologías por defecto si no son necesarias para el alcance académico.

Estas recomendaciones son criterios básicos de implementación responsable, no una indicación de convertir el TP en una aplicación de producción. El grupo debe poder explicar las decisiones adoptadas.

## 7. Qué es obligatorio y qué no

### Obligatorio según el enunciado
- Registro de usuario.
- Inicio de sesión.
- Validación de complejidad de contraseña.
- Unicidad del email.
- Datos mínimos del usuario.
- Visualización de productos.
- Agregar productos al carrito.
- Ver el pedido/carrito con el detalle de los productos.
- Datos mínimos de los productos.
- Frontend en Angular y backend en Node.js.

### Opcional según el enunciado
- Recuperación de contraseña.
- Carga de nuevos productos.

### Criterios de calidad esperados por el docente
- Flujos coherentes de punta a punta.
- Manejo razonable de errores y situaciones límite.
- Interfaz clara, accesible y responsive.
- Código organizado.
- Decisiones justificables.
- Acciones funcionales, aunque alguna operación de negocio se simule.

### No asumir como obligatorio
- JWT o una solución avanzada de autenticación/autorización.
- Sistema empresarial de roles y permisos.
- Pasarela de pago real.
- Inventario complejo.
- Funcionalidades de administración no mencionadas en el enunciado.
- Recuperación de contraseña o carga de productos, dado que son opcionales.
- Edición o eliminación de productos, ya que no aparecen en el enunciado proporcionado.

## 8. Instrucciones para una IA que ayude con este proyecto

Al proponer código, arquitectura, tareas o diseños:

1. **Respetar el alcance.** Separar claramente requisitos obligatorios, opcionales y sugerencias.
2. **No sobrediseñar.** Preferir la solución más sencilla que cumpla correctamente el objetivo.
3. **Pensar en el flujo completo.** Verificar cómo se conectan registro, login, catálogo y carrito.
4. **No crear botones decorativos.** Toda acción visible debe tener un comportamiento definido y funcional.
5. **Validar casos límite.** Considerar formularios inválidos, email duplicado, credenciales incorrectas y carrito vacío.
6. **Mantener coherencia frontend/backend.** Angular no debe ser la única capa que haga cumplir reglas importantes.
7. **Explicar las decisiones.** Indicar por qué se propone una solución y qué requisito cubre.
8. **Marcar las suposiciones.** Si falta una definición, explicitarla y proponer la alternativa mínima razonable.
9. **Consultar antes de ampliar el alcance.** Si una propuesta agrega una funcionalidad sustancial o una tecnología compleja, presentarla como opcional y sugerir confirmar con el docente.
10. **Favorecer código legible y mantenible.** Organizarlo de modo que los cuatro integrantes puedan comprenderlo y explicarlo.

## 9. Decisiones de diseño (preguntas abiertas resueltas)

Estas preguntas fueron respondidas por el grupo y son las decisiones acordadas que deben respetarse al implementar:

1. **Persistencia del carrito:** se conserva al recargar la página, pero se limpia al cerrar sesión.
2. **Compra como invitado:** no se permite; solo se puede comprar con la sesión iniciada.
3. **Confirmación final:** sí se implementa una confirmación final del pedido, pero sin pasarela de pago (el cobro se simula).
4. **Cantidades y stock:** sí, se manejan cantidades por producto y stock disponible.
5. **Carga opcional de productos:** se refiere a la funcionalidad "Cargar un producto nuevo" (marcada como opcional en §3.2). Ya está desarrollada (crear/editar/eliminar desde el panel de administración); queda definir quién puede usarla.
6. **Pedidos confirmados:** sí, se deben crear y persistir los pedidos confirmados; esto forma parte de la feature del carrito.
7. **Complejidad de la contraseña:** las reglas concretas las define el integrante que desarrolle la funcionalidad de registro/login.

## 10. Resumen ejecutivo

Construir una tienda web académica con **Angular + Node.js** que permita registrar e iniciar sesión, mostrar productos y armar/ver un carrito con el detalle del pedido. El registro debe validar la complejidad de la contraseña y evitar emails duplicados. La recuperación de contraseña y la carga de productos son opcionales.

El objetivo no es desarrollar una plataforma comercial completa, sino entregar las funciones solicitadas de manera integrada, consistente, clara, responsive y bien organizada. Simular una operación está bien cuando corresponde, pero la aplicación debe mostrar un resultado lógico y manejar errores. Evitar tecnologías y funcionalidades innecesarias, y consultar al docente cuando una decisión pueda cambiar el alcance.
