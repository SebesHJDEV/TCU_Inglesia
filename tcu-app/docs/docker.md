# Paso 1: imagen Docker de la aplicación

El `Dockerfile` prepara Python 3.11, instala las dependencias de producción desde `uv.lock` y copia el backend y el frontend. `uv sync --locked` comprueba la coherencia del archivo de dependencias y su bloqueo; no actualiza las versiones durante la construcción.

La aplicación arranca con Uvicorn en el puerto 8000 y con un usuario sin privilegios de administrador. No utiliza `--reload`: para aplicar cambios de código se construye otra imagen y se reemplaza el contenedor de la aplicación.

`.dockerignore` limita los archivos enviados al constructor. No se copian `.env`, el entorno virtual de Windows, claves SSH, respaldos ni archivos de Git. Las variables de conexión se proporcionarán al ejecutar el contenedor.

## Construir en Windows

Con Docker Desktop iniciado y usando contenedores Linux, ejecutar desde `tcu-app` en PowerShell:

```powershell
docker build -t efrata-app:local .
```

La imagen contiene el programa y sus dependencias. No contiene los datos de PostgreSQL. El mismo Dockerfile puede construirse para Linux AMD64 en la computadora y Linux ARM64 en Oracle; una imagen construida para una arquitectura no se convierte automáticamente en la otra al copiarla.

## Comprobar las páginas sin conectar una base

```powershell
docker run --rm --name efrata-app-prueba -p 127.0.0.1:8001:8000 efrata-app:local
```

Abrir [la aplicación de prueba](http://127.0.0.1:8001). El puerto 8001 evita ocupar el 8000 que puede utilizar Uvicorn local. Esta prueba permite comprobar `/`, `/login`, `/registro` y los archivos estáticos. La consulta de datos y el registro de usuarios necesitan la configuración de PostgreSQL, que se incorporará en el siguiente paso.

Para detener la prueba, pulsar **Ctrl+C** en esa terminal. `--rm` retira este contenedor temporal al detenerlo.

## Paso 2: conectar con PostgreSQL existente en Oracle

Se comprobó que `iglesia-db` utiliza `postgres:17-bookworm`, publica `127.0.0.1:5432` y monta el volumen `efrata-postgres` en `/var/lib/postgresql/data`. Inicialmente está conectado a la red predeterminada `bridge`.

`compose.yaml` administra solo la aplicación. PostgreSQL conserva su contenedor y su volumen existentes. Para comunicar ambos contenedores se utilizará una red compartida creada por separado. En Ubuntu, ejecutar una vez:

```bash
sudo docker network create efrata-interna
sudo docker network connect efrata-interna iglesia-db
```

La nueva red permite localizar PostgreSQL por el nombre `iglesia-db`. `external: true` significa que Compose utiliza una red ya existente y no administra su creación o eliminación; no significa que la base se publique en Internet. Es una red bridge definida por el usuario, no una red configurada con `--internal`.

Compose establece `PGHOST=iglesia-db` y `PGPORT=5432`. Dentro de un contenedor, `127.0.0.1` apunta al propio contenedor, por lo que la configuración del túnel local no corresponde a esta conexión.

Antes de iniciar Compose en Oracle se debe transferir el código y crear allí `.env.server`, junto a `compose.yaml`, con `POSTGRES_PASSWORD` correspondiente a `iglesia_app`. Ese archivo está excluido de Git y del contexto de construcción; no debe contener la contraseña del administrador. No se modifica el `.env` de desarrollo local.

Una vez preparados esos archivos, la construcción debe hacerse en Oracle para obtener una imagen ARM64. El comando previsto es `sudo docker compose up -d --build`. No ejecutarlo antes de preparar la red, los archivos y las credenciales.

La aplicación se publica inicialmente solo en `127.0.0.1:8000` del servidor para una prueba mediante SSH. La política de reinicio es `unless-stopped` y los registros se limitan a tres archivos de 10 MB. HTTPS y GitHub Actions siguen pendientes.

Si se reemplaza manualmente el contenedor de PostgreSQL en el futuro, será necesario conectarlo nuevamente a `efrata-interna`. Su ciclo de vida permanece separado del de la aplicación.

Referencia: [guía oficial de uv para Docker](https://docs.astral.sh/uv/guides/integration/docker/).

## Paso 3: acceso web con HTTPS

Se agregó Caddy a Compose y un `Caddyfile` para `efrata.duckdns.org`. Caddy comparte la red `web` con la app y reenvía las solicitudes a `app:8000`. PostgreSQL continúa en `efrata-interna`; Caddy no pertenece a esa red.

Se publican los puertos TCP 80 y 443. El dominio debe apuntar a la IPv4 pública del servidor y las reglas de Oracle y del servidor deben permitir el tráfico web. Caddy solicita y renueva el certificado automáticamente cuando puede validar el dominio. Los volúmenes `caddy_data` y `caddy_config` conservan su estado; no eliminar esos volúmenes al actualizar.

Después de copiar `compose.yaml` y `Caddyfile` al servidor, comprobar la sintaxis con `sudo docker compose config --quiet` y `sudo docker compose run --rm --no-deps caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`. Estas comprobaciones no prueban la accesibilidad pública ni la emisión del certificado.

Para aplicar la configuración, usar `sudo docker compose up -d` y revisar `sudo docker compose logs --tail 60 caddy`. Esta configuración publica las rutas actuales de la app; HTTPS no implementa el login ni los permisos administrativos pendientes. GitHub Actions también sigue pendiente.

Referencia: [HTTPS automático de Caddy](https://caddyserver.com/docs/automatic-https).
