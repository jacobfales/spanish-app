# Spanish

App estática, sin dependencias ni compilación. Para probarla:

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000`. Para instalarla en iPhone, sirve estos archivos por **HTTPS**, abre la página en Safari y elige **Compartir → Añadir a pantalla de inicio → Abrir como app web**. En Mac, abre la página en Safari y elige **Archivo → Añadir al Dock**. El modo de instalación depende de la versión del sistema. No basta con abrir `index.html` desde Archivos: los service workers requieren HTTPS (o localhost para pruebas).

Una primera visita con conexión guarda todos los archivos necesarios. Después la app funciona sin conexión. No envía datos ni hace solicitudes a terceros; el enlace del chat solo se abre al pulsarlo. El temporizador guarda su estado localmente y calcula el tiempo transcurrido al volver. El sistema puede silenciar el sonido y la vibración en segundo plano; Safari de iPhone no admite `navigator.vibrate`.

## Actualizar vocabulario

Edita `vocab.json`, una lista JSON de entradas:

```json
{"es":"el poder notarial","en":"power of attorney","grupo":"Legal"}
```

Cada entrada requiere `es`, `en` y `grupo`. Los grupos son `Vocabulario`, `Legal` y `Correcciones`. En Correcciones, `es` es lo que dijiste y `en` es la forma mejorada y su explicación. Conserva comillas dobles y separa las entradas con comas. Valida con `python3 -m json.tool vocab.json`. Recarga con conexión para ver los cambios; se consulta la red primero y se conserva una copia sin conexión.

Al cambiar el código o los iconos, aumenta `CACHE` en `sw.js`. Cierra y vuelve a abrir la app después de cargar la nueva versión. Las palabras y correcciones de Anki se solicitan en el texto del chat; esta app no se conecta a Anki. El chat solo puede guardarlas si dispone de esa función.
