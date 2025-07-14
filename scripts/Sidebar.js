// 1. IMPORTACIONES
import { limpiarSesion, AUTH_KEYS } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const LOGIN_PAGE = "/pages/Login.html";

// 3. FUNCIONES SÍNCRONAS
/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario está autenticado, false en caso contrario
 */
function verificarAutenticacion() {
  const adminId = localStorage.getItem(AUTH_KEYS.USER_ID);
  if (!adminId) {
    window.location.href = LOGIN_PAGE;
    return false;
  }
  return true;
}

/**
 * Muestra el nombre de usuario y su rol en la barra lateral
 */
function mostrarNombreUsuario() {
  const usernameDisplay = document.getElementById("username-display");
  const userRoleDisplay = document.getElementById("user-role");
  const username = localStorage.getItem(AUTH_KEYS.USERNAME);
  const role = localStorage.getItem(AUTH_KEYS.ROLE) || "Usuario";

  if (usernameDisplay && username) {
    usernameDisplay.textContent = username;
  }

  if (userRoleDisplay) {
    // Formatear el rol para mostrarlo más bonito
    const formattedRole =
      role === "admin"
        ? "Administrador"
        : role === "doctor"
        ? "Doctor"
        : role;
    userRoleDisplay.textContent = formattedRole;
  }
}

function configurarCerrarSesion() {
  const logout = document.getElementById("logout-link");
  if (logout) {
    logout.addEventListener("click", function (e) {
      e.preventDefault();
      limpiarSesion();
      window.location.href = LOGIN_PAGE;
    });
  }
}

// 4. FUNCIONES ASÍNCRONAS

// 5. EVENTOS Y ASIGNACIONES GLOBALES
// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }

  // Configurar la interfaz de usuario
  mostrarNombreUsuario();
  configurarCerrarSesion();
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-sidebar");
  const sidebar = document.getElementById("sidebar");

  if (toggleButton && sidebar) {
    toggleButton.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      document.body.classList.toggle("sidebar-open");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      document.body.classList.contains("sidebar-open") &&
      !sidebar.contains(e.target) &&
      !toggleButton.contains(e.target)
    ) {
      sidebar.classList.remove("active");
      document.body.classList.remove("sidebar-open");
    }
  });
});

// Hacer que las funciones estén disponibles globalmente si es necesario
window.verificarAutenticacion = verificarAutenticacion;
