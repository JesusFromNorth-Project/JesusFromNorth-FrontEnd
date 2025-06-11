// 1. IMPORTACIONES
import { limpiarSesion, AUTH_KEYS } from './utils/auth.js';

// 2. CONSTANTES Y URLS
const LOGIN_PAGE = '/pages/Login.html';

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
 * Muestra el nombre de usuario en la barra lateral
 */
function mostrarNombreUsuario() {
    const userDiv = document.getElementById("sidebar-user");
    const adminName = localStorage.getItem(AUTH_KEYS.USERNAME);
    if (userDiv && adminName) {
        userDiv.textContent = `👤 ${adminName}`;
    }
}

/**
 * Configura el evento de cierre de sesión
 */
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

// Hacer que las funciones estén disponibles globalmente si es necesario
window.verificarAutenticacion = verificarAutenticacion;
