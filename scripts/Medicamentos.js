// Importar utilidades de autenticación
import {
  verificarAutenticacion,
  limpiarSesion,
  AUTH_KEYS,
} from "/scripts/utils/auth.js";

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }

  // Cargar el sidebar
  await cargarSidebar();

  // Configurar el nombre de usuario en el sidebar si existe
  const username = localStorage.getItem(AUTH_KEYS.USERNAME);
  if (username) {
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  }

  // Configurar el cierre de sesión
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      limpiarSesion();
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

function mostrarExito(mensaje) {
  mostrarMensaje(mensaje, "success");
}

function mostrarError(mensaje) {
  mostrarMensaje(mensaje, "danger");
}


// Cargar el sidebar (con soporte para rol ADMIN)
async function cargarSidebar() {
  try {
    // Detectar el rol desde localStorage
    const role = localStorage.getItem("role");

    // Si es ADMIN, usar SidebarAdmin.html, si no Sidebar.html
    const sidebarPath =
      role === "ADMIN"
        ? "/components/SidebarAdmin.html"
        : "/components/Sidebar.html";

    // Cargar el archivo correspondiente
    const response = await fetch(sidebarPath);
    if (!response.ok) {
      throw new Error("Error al cargar el sidebar");
    }

    // Insertar el HTML en el placeholder
    const html = await response.text();
    const sidebar = document.getElementById("sidebar-placeholder");

    if (sidebar) {
      sidebar.innerHTML = html;

      // Mostrar sidebar (si es responsive o con animación)
      document.body.classList.add("sidebar-visible");

      // Detectar la página activa y resaltar su link
      const path = window.location.pathname.split("/").pop().toLowerCase();
      const links = sidebar.querySelectorAll("a.nav-link");

      links.forEach((link) => {
        const href = link.getAttribute("href")?.toLowerCase();
        if (href && href.includes(path)) {
          link.classList.remove("text-dark");
          link.classList.add("text-primary", "fw-bold");
        }
      });
    } else {
      console.error('No se encontró el elemento con id "sidebar-placeholder"');
    }
  } catch (error) {
    console.error("Error al cargar sidebar:", error);
    if (typeof mostrarError === "function") {
      mostrarError("Error al cargar la interfaz");
    }
  }
}
