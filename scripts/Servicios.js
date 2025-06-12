// 1. IMPORTACIONES
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from '/scripts/utils/auth.js';

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:5080/system_clinic/api/v0.1/service/";

// 3. FUNCIONES SÍNCRONAS
/**
 * Muestra un mensaje en la interfaz
 * @param {string} mensaje - Texto del mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (danger, success, etc.)
 */
function mostrarMensaje(mensaje, tipo = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.main-content')?.insertAdjacentElement('afterbegin', alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

/**
 * Muestra un mensaje de éxito
 * @param {string} mensaje - Texto del mensaje
 */
function mostrarExito(mensaje) {
    mostrarMensaje(mensaje, 'success');
}

/**
 * Muestra un mensaje de error
 * @param {string} mensaje - Texto del mensaje de error
 */
function mostrarError(mensaje) {
    mostrarMensaje(mensaje, 'danger');
}

// 4. FUNCIONES ASÍNCRONAS
// Cargar el sidebar basado en el rol del usuario
async function cargarSidebar() {
    try {
        const role = localStorage.getItem("role");
        let sideBarPath = role === "ADMIN" ? 
            "../components/SidebarAdmin.html" :
            "../components/SidebarDoctor.html";

        const response = await fetch(sideBarPath);
        if (!response.ok) throw new Error('Error al cargar el sidebar');
        
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

// 5. EVENTOS Y ASIGNACIONES GLOBALES
// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    // Cargar el sidebar
    await cargarSidebar();
    
    // Configurar el nombre de usuario en el sidebar si existe
    const adminName = localStorage.getItem(AUTH_KEYS.USERNAME);
    if (adminName) {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = adminName;
        }
    }
    
    // Configurar el cierre de sesión
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            limpiarSesion();
            window.location.href = 'Login.html';
        });
    }
});

// Hacer que las funciones estén disponibles globalmente
window.mostrarMensaje = mostrarMensaje;
window.mostrarExito = mostrarExito;
window.mostrarError = mostrarError;