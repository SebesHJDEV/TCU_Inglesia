-- Ejecutar explícitamente una vez; repetir no elimina los registros.
CREATE TABLE IF NOT EXISTS prueba (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre varchar(100) NOT NULL CHECK (length(trim(nombre)) > 0),
    mensaje varchar(300) NOT NULL CHECK (length(trim(mensaje)) > 0)
);
