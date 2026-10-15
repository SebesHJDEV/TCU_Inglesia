# Estructura visual de Efrata

Se separó el formulario público del panel administrativo. Esta etapa define los campos, las pantallas y la navegación; no conecta los nuevos formularios con PostgreSQL.

| Ruta | Pantalla |
| --- | --- |
| `/` | Formulario público de información personal, contacto y trabajo |
| `/registro` | Redirección al formulario público |
| `/login` | Maqueta del acceso administrativo y enlace al panel de demostración |
| `/admin` | Inicio del panel, resumen y accesos rápidos |
| `/admin/personas` | Directorio con buscador y filtros de contacto, oficio y situación laboral |
| `/admin/personas/nueva` | Campos para agregar una persona desde el panel |
| `/admin/personas/ficha` | Estructura de una ficha sin datos personales |
| `/admin/reportes` | Selección de grupo y columnas del reporte |
| `/admin/administradores` | Cuentas administrativas y ventana de creación de ejemplo |

`PanelBase.html` comparte el menú y el pie del panel. `CamposPersona.html` contiene una macro reutilizada por el formulario público y la página administrativa de nueva persona. Los cambios de campos se realizan en esa macro para conservar ambas vistas alineadas.

`styles.css` contiene los estilos generales y del panel. `formulario.css` agrega la distribución del formulario público y los campos compartidos. `Panel.js` controla el menú móvil, el diálogo de administrador y las interacciones de las maquetas. `Formulario.js` muestra una explicación al revisar el formulario sin enviar ni almacenar sus valores.

Los indicadores del inicio utilizan guiones, no cifras ficticias. El directorio y la lista de administradores muestran estados vacíos explícitos. Reportes permite modificar las columnas de su vista previa, pero no consulta registros ni exporta archivos. El formulario público no pide contraseña, no crea una cuenta y no incluye enlaces administrativos.

El login conserva el comportamiento de demostración y no verifica credenciales. Las rutas `/admin` todavía se pueden visitar directamente: ocultar enlaces en la página pública no sustituye la autenticación ni la autorización, pendientes de la siguiente etapa.

La API de prueba y la API de registro de cuentas existentes se conservan, pero las nuevas pantallas no las utilizan. El formulario de personas deberá disponer de su propio modelo y operación de guardado cuando se revise el esquema de la base. No se deben enviar sus campos a la API antigua de creación de cuentas.

La estructura se adapta a escritorio y celular, con menú desplegable, campos en una columna en pantallas pequeñas y tablas desplazables dentro de su sección. No utiliza Bootstrap. Los cambios se revisan localmente antes de hacer commit, push y ejecutar el despliegue manual de GitHub.
