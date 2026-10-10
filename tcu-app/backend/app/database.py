import os
import psycopg

def get_connection():
    return psycopg.connect(
        host=os.environ["PGHOST"],
        port=os.environ["PGPORT"],
        dbname=os.environ["POSTGRES_DB"],
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
        connect_timeout=5,
    )
