// Maqueta visual: no envía, almacena ni valida credenciales contra el servidor.
document.querySelectorAll(".show-password").forEach((button) => {
  const input = document.getElementById(button.dataset.password);
  const label = button.getAttribute("aria-label");
  button.addEventListener("click", () => {
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.textContent = visible ? "Ocultar" : "Mostrar";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? label.replace("Mostrar", "Ocultar") : label);
  });
});
document.querySelectorAll(".access-form:not(#registro-form)").forEach((form) => {
  const correo = form.querySelector("#correo");
  const normalizarCorreo = () => {
    correo.value = correo.value.trim().toLowerCase();
  };
  correo.addEventListener("blur", normalizarCorreo);
  form.addEventListener("submit", (event) => event.preventDefault());
  form.querySelector(".preview-action").addEventListener("click", () => {
    normalizarCorreo();
    if (!form.reportValidity()) return;
    form.querySelector(".form-status").textContent = "Esta es una vista previa. El acceso y la creación de cuentas estarán disponibles más adelante.";
  });
});
