// Importar la verificación de autenticación
import { verificarAutenticacion } from "/scripts/utils/auth.js";

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }

  // Cargar el sidebar
  await cargarSidebar();

  // Configurar el nombre de usuario en el sidebar si existe
  const adminName = localStorage.getItem("adminName");
  if (adminName) {
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
      usernameElement.textContent = adminName;
    }
  }

  // Configurar el cierre de sesión
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminName");
      window.location.href = "/pages/Login.html";
    });
  }
});

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo = "danger") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
  alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document
    .querySelector(".main-content")
    ?.insertAdjacentElement("afterbegin", alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

function mostrarError(mensaje) {
  mostrarMensaje(mensaje, "danger");
}

// Cargar el sidebar basado en el rol del usuario
async function cargarSidebar() {
  try {
    const role = localStorage.getItem("role");
    let sideBarPath =
      role === "ADMIN"
        ? "../components/SidebarAdmin.html"
        : "../components/SidebarDoctor.html";

    const response = await fetch(sideBarPath);
    if (!response.ok) throw new Error("Error al cargar el sidebar");

    const html = await response.text();
    const sidebarElement = document.getElementById("sidebar-placeholder");
    if (!sidebarElement) {
      console.error('No se encontró el elemento con id "sidebar-placeholder"');
      return;
    }

    sidebarElement.innerHTML = html;

    // Resaltar el enlace activo según la página actual
    const path = window.location.pathname.split("/").pop().toLowerCase();
    const links = document.querySelectorAll("#sidebar-placeholder a.nav-link");

    links.forEach((link) => {
      const href = link.getAttribute("href")?.toLowerCase();
      if (href && href.includes(path)) {
        link.classList.remove("text-dark");
        link.classList.add("text-primary");
      }
    });
  } catch (error) {
    console.error("Error al cargar sidebar:", error);
    mostrarError("Error al cargar la interfaz");
  }
}
