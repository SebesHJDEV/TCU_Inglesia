from psycopg.rows import dict_row

from backend.app.database import get_connection


def list_test_records():
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                "SELECT id, nombre, mensaje FROM prueba ORDER BY id DESC"
            )
            return cursor.fetchall()