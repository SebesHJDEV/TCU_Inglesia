// Validación de interfaz. El backend deberá repetirla antes de guardar datos.
const registroForm = document.getElementById("registro-form");
const registroAviso = document.getElementById("registro-aviso");
const registroBoton = registroForm.querySelector('[type="submit"]');
const registroCampos = Array.from(registroForm.querySelectorAll("input"));
let registroEnviando = false;

function mostrarAviso(mensaje, tipo = "error") {
  registroAviso.textContent = mensaje;
  registroAviso.dataset.type = tipo;
  registroAviso.hidden = false;
}

// Cada campo conserva su ayuda y recibe un mensaje accesible de error.
registroCampos.forEach((campo) => {
  const error = document.createElement("p");
  error.id = `${campo.id}-error`;
  error.className = "field-error";
  error.hidden = true;
  campo.closest(".field").append(error);
  campo.setAttribute("aria-describedby", [campo.getAttribute("aria-describedby"), error.id].filter(Boolean).join(" "));
  campo.addEventListener("input", () => {
    campo.removeAttribute("aria-invalid");
    error.hidden = true;
    registroAviso.hidden = true;
  });
});

function normalizarRegistro() {
  registroForm.querySelector("#correo").value = registroForm.querySelector("#correo").value.trim().toLowerCase();
  ["nombres", "primer_apellido", "segundo_apellido"].forEach((id) => {
    const campo = document.getElementById(id);
    campo.value = campo.value.normalize("NFC").trim().replace(/\s+/g, " ");
  });
  // No se modifica la contraseña: sus espacios y mayúsculas son significativos.
}

registroForm.querySelector("#correo").addEventListener("blur", normalizarRegistro);

function validarRegistro() {
  normalizarRegistro();
  let primerError = null;
  registroCampos.forEach((campo) => {
    let mensaje = "";
    if (campo.required && !campo.value) mensaje = "Completa este campo.";
    else if (campo.id === "cedula" && !/^[0-9]{9}$/.test(campo.value)) mensaje = "Escribe una cédula de 9 dígitos, sin guiones.";
    else if (campo.id === "correo" && campo.validity.typeMismatch) mensaje = "Escribe un correo válido, como nombre@ejemplo.com.";
    else if (campo.maxLength > 0 && campo.value.length > campo.maxLength) mensaje = `Usa como máximo ${campo.maxLength} caracteres.`;
    else if (campo.id === "clave" && campo.value.length < 12) mensaje = "Usa una contraseña de al menos 12 caracteres.";
    else if (campo.id === "confirmar" && campo.value !== document.getElementById("clave").value) mensaje = "Las contraseñas no coinciden.";
    const error = document.getElementById(`${campo.id}-error`);
    error.textContent = mensaje;
    error.hidden = !mensaje;
    campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
    if (mensaje && !primerError) primerError = campo;
  });
  if (primerError) {
    mostrarAviso("Revisa los campos señalados antes de continuar.");
    primerError.focus();
    return false;
  }
  return true;
}

// Esta función es la llamada AJAX: envía JSON a nuestra ruta de FastAPI.
async function solicitarRegistro(datos) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(datos),
      signal: controller.signal,
    });
    // No mostrar HTML ni errores internos del servidor como mensajes al usuario.
    const respuesta = await response.json().catch(() => null);
    if (response.status === 501) throw new Error("El registro aún no está habilitado. No se ha creado ninguna cuenta.");
    if (response.status === 409) throw new Error("La cédula o el correo ya están registrados.");
    if (response.status === 422 || response.status === 400) throw new Error("Revisa los datos: el servidor no pudo validarlos.");
    if (response.status === 429) throw new Error("Hay demasiados intentos. Espera un momento y vuelve a intentarlo.");
    if (!response.ok) throw new Error("No se pudo completar el registro. Inténtalo más tarde.");
    if (response.status !== 201 || respuesta?.status !== "created") throw new Error("No se pudo confirmar la creación de la cuenta.");
    return respuesta;
  } finally {
    clearTimeout(timeout);
  }
}

registroForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (registroEnviando || !validarRegistro()) return;
  const datos = Object.fromEntries(new FormData(registroForm));
  registroEnviando = true;
  registroBoton.disabled = true;
  registroBoton.textContent = "Enviando…";
  registroForm.setAttribute("aria-busy", "true");
  mostrarAviso("Enviando los datos…", "info");
  try {
    await solicitarRegistro(datos);
    registroForm.reset();
    mostrarAviso("Tu cuenta se creó correctamente.", "success");
    if (window.Swal) {
      await window.Swal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Tu cuenta se creó correctamente.",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#213b4d",
        iconColor: "#367154",
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: { popup: "efrata-alert" },
      });
    } else {
      // Mantener la confirmación si la librería externa no pudo cargar.
      window.alert("Cuenta creada. Tu cuenta se creó correctamente.");
    }
    // Navegación de la demostración; no crea una sesión.
    window.location.assign("/");
  } catch (error) {
    const mensaje = error.name === "AbortError"
      ? "El servidor tardó demasiado. No pudimos confirmar el registro."
      : error instanceof TypeError
        ? "No se pudo conectar con el servidor. Revisa tu conexión."
        : error.message;
    mostrarAviso(mensaje);
  } finally {
    registroEnviando = false;
    registroBoton.disabled = false;
    registroBoton.textContent = "Crear cuenta";
    registroForm.removeAttribute("aria-busy");
    registroAviso.focus();
  }
});
