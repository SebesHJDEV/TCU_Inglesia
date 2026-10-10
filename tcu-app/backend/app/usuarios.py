import hashlib
import re
import secrets

from backend.app.database import get_connection


def registrar_usuario(datos):
    # Recibir únicamente los campos esperados.
    campos = (
        "cedula",
        "nombres",
        "primer_apellido",
        "segundo_apellido",
        "correo",
        "clave",
    )

    valores = {}

    for campo in campos:
        valor = datos.get(campo, "")

        if not isinstance(valor, str):
            raise ValueError(f"El campo {campo} debe ser texto.")

        valores[campo] = valor

    # Normalizar los datos. La contraseña no se modifica.
    cedula = valores["cedula"].strip().replace("-", "")
    nombres = " ".join(valores["nombres"].split())
    primer_apellido = " ".join(valores["primer_apellido"].split())
    segundo_apellido = " ".join(valores["segundo_apellido"].split())
    correo = valores["correo"].strip().lower()
    clave = valores["clave"]

    # Validaciones del backend.
    if not re.fullmatch(r"[0-9]{9}", cedula):
        raise ValueError("La cédula debe contener 9 dígitos.")

    if not 1 <= len(nombres) <= 100:
        raise ValueError("El nombre debe contener entre 1 y 100 caracteres.")

    if not 1 <= len(primer_apellido) <= 100:
        raise ValueError(
            "El primer apellido debe contener entre 1 y 100 caracteres."
        )

    if len(segundo_apellido) > 100:
        raise ValueError("El segundo apellido no puede superar 100 caracteres.")

    if (
        len(correo) > 254
        or not re.fullmatch(r"[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)+", correo)
    ):
        raise ValueError("El correo electrónico no tiene un formato válido.")

    if not 12 <= len(clave) <= 128:
        raise ValueError("La contraseña debe contener entre 12 y 128 caracteres.")

    # Generar un hash con scrypt y una sal aleatoria para cada contraseña.
    sal = secrets.token_bytes(16)

    hash_clave = hashlib.scrypt(
        clave.encode("utf-8"),
        salt=sal,
        n=131072,
        r=8,
        p=1,
        dklen=64,
        maxmem=256 * 1024 * 1024,
    )

    # Guardamos también los parámetros para verificarla en el futuro login.
    password_hash = (
        f"scrypt$131072$8$1${sal.hex()}${hash_clave.hex()}"
    )

    # Llamar al procedimiento usando parámetros, sin concatenar SQL.
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CALL public.crear_usuario(
                    %s, %s, %s, %s, %s, %s
                )
                """,
                (
                    cedula,
                    nombres,
                    primer_apellido,
                    segundo_apellido or None,
                    correo,
                    password_hash,
                ),
            )