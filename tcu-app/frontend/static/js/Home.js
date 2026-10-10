const boton = document.getElementById("cargar-datos");
const tabla = document.getElementById("tabla-registros");
const estado = document.getElementById("estado-datos");

// En escritorio se conserva el menú lateral; en celular se abre con el botón.
const menuToggle = document.querySelector(".mobile-menu-toggle");
const navigation = document.getElementById("main-navigation");
const mobileLayout = window.matchMedia("(max-width: 950px)");

function setMenuOpen(open) {
  navigation.hidden = mobileLayout.matches && !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.querySelector(".menu-text").textContent = open ? "Cerrar" : "Menú";
}

function syncMenuLayout() {
  const focusWasInside = navigation.contains(document.activeElement);
  menuToggle.hidden = !mobileLayout.matches;
  setMenuOpen(false);
  if (mobileLayout.matches && focusWasInside) menuToggle.focus();
}

menuToggle.addEventListener("click", () => setMenuOpen(navigation.hidden));
navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!mobileLayout.matches || !link) return;
  setMenuOpen(false);
  if (link.getAttribute("href") === "#registros") {
    document.getElementById("registros").focus({ preventScroll: true });
  } else {
    menuToggle.focus();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileLayout.matches && !navigation.hidden) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});
mobileLayout.addEventListener("change", syncMenuLayout);
syncMenuLayout();

boton.addEventListener("click", async () => {
  boton.disabled = true;
  estado.textContent = "Cargando...";
  tabla.setAttribute("aria-busy", "true");

  try {
    const respuesta = await fetch("/api/prueba");

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los datos.");
    }

    const registros = await respuesta.json();

    // Limpiar las filas anteriores para no duplicarlas.
    tabla.replaceChildren();

    for (const registro of registros) {
      const fila = document.createElement("tr");

      for (const valor of [registro.id, registro.nombre, registro.mensaje]) {
        const celda = document.createElement("td");
        celda.textContent = valor;
        fila.appendChild(celda);
      }

      tabla.appendChild(fila);
    }

    if (registros.length === 0) {
      const fila = tabla.insertRow();
      fila.className = "empty-row";
      const celda = fila.insertCell();
      celda.colSpan = 3;
      celda.textContent = "Todavía no hay registros guardados.";
    }

    estado.textContent = registros.length === 0
      ? "No hay registros."
      : `${registros.length} registros cargados.`;
  } catch (error) {
    estado.textContent = "No se pudieron actualizar los datos. Intenta cargar de nuevo.";
    console.error(error);
  } finally {
    boton.disabled = false;
    tabla.setAttribute("aria-busy", "false");
  }
});

