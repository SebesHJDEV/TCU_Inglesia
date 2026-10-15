// Navegación y vistas de diseño. No escribe en la base de datos.
const menuButton = document.querySelector(".mobile-menu-toggle");
const navigation = document.getElementById("main-navigation");
const sidebarFooter = document.querySelector(".sidebar-footer");
const mobileLayout = window.matchMedia("(max-width: 900px)");

function setMenuOpen(open) {
  const collapsed = mobileLayout.matches && !open;
  navigation.hidden = collapsed;
  sidebarFooter.hidden = collapsed;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.querySelector(".menu-text").textContent = open ? "Cerrar" : "Menú";
}

function syncMenuLayout() {
  const focusInside = navigation.contains(document.activeElement) || sidebarFooter.contains(document.activeElement);
  menuButton.hidden = !mobileLayout.matches;
  setMenuOpen(false);
  if (mobileLayout.matches && focusInside) menuButton.focus();
}

menuButton.addEventListener("click", () => setMenuOpen(navigation.hidden));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileLayout.matches && !navigation.hidden && !document.querySelector("dialog[open]")) {
    setMenuOpen(false);
    menuButton.focus();
  }
});
mobileLayout.addEventListener("change", syncMenuLayout);
syncMenuLayout();

const notice = document.getElementById("panel-aviso");
let noticeTimeout;
function showNotice(message) {
  window.clearTimeout(noticeTimeout);
  notice.textContent = message;
  notice.hidden = false;
  noticeTimeout = window.setTimeout(() => { notice.hidden = true; }, 8000);
}
document.querySelectorAll("[data-preview-action]").forEach((button) => {
  button.addEventListener("click", () => showNotice(button.dataset.previewAction));
});

const filterForm = document.querySelector("[data-filter-preview]");
if (filterForm) {
  const status = filterForm.querySelector(".filter-status");
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "Filtros preparados para la vista de diseño. La búsqueda todavía no consulta la base de datos.";
  });
  filterForm.addEventListener("reset", () => {
    status.textContent = "Filtros limpiados. La búsqueda se conectará al directorio en la siguiente etapa.";
  });
}

const reportForm = document.querySelector("[data-report-preview]");
if (reportForm) {
  reportForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = Array.from(reportForm.querySelectorAll('[name="columnas"]:checked'));
    const status = reportForm.querySelector(".report-status");
    if (!selected.length) {
      status.textContent = "Selecciona al menos una columna para preparar la vista previa.";
      reportForm.querySelector('[name="columnas"]').focus();
      return;
    }
    const row = document.getElementById("reporte-columnas");
    row.replaceChildren();
    selected.forEach((input) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = input.closest("label").textContent.trim();
      row.append(cell);
    });
    document.getElementById("reporte-vacio").colSpan = selected.length;
    status.textContent = `${selected.length} columnas seleccionadas. Vista previa sin datos conectados.`;
  });
}

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.openDialog).showModal();
  });
});
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});
const adminForm = document.querySelector("[data-admin-preview]");
if (adminForm) {
  adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = adminForm.querySelector(".dialog-feedback");
    feedback.textContent = "La estructura de la cuenta está lista para revisar. Esta maqueta no crea usuarios ni asigna permisos.";
    feedback.hidden = false;
  });
}
