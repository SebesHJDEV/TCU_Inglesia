// Vista de campos: no hace peticiones, no guarda en el navegador ni crea cuentas.
document.querySelectorAll("[data-person-preview]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = form.querySelector(".form-feedback");
    feedback.textContent = "Ya puedes revisar la distribución de tus datos. El envío todavía no está habilitado: no se ha guardado ninguna información.";
    feedback.hidden = false;
    feedback.focus({ preventScroll: true });
    feedback.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  });
});
