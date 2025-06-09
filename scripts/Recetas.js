// Importar utilidades de autenticación
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from '/scripts/utils/auth.js';

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    // Cargar el sidebar
    await cargarSidebar();
    
    // Configurar el nombre de usuario en el sidebar si existe
    const username = localStorage.getItem(AUTH_KEYS.USERNAME);
    if (username) {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = username;
        }
    }
    
    // Configurar el cierre de sesión
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            limpiarSesion();
            window.location.href = '/pages/Login.html';
        });
    }
});

// Mostrar mensajes
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

function mostrarExito(mensaje) {
    mostrarMensaje(mensaje, 'success');
}

function mostrarError(mensaje) {
    mostrarMensaje(mensaje, 'danger');
}

// Cargar el sidebar
async function cargarSidebar() {
    try {
        const response = await fetch('/components/Sidebar.html');
        if (!response.ok) {
            throw new Error('Error al cargar el sidebar');
        }
        const html = await response.text();
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.innerHTML = html;
            // Asegurarse de que el sidebar esté visible
            document.body.classList.add('sidebar-visible');
            
            // Resaltar el enlace activo según la página actual
            const path = window.location.pathname.split('/').pop().toLowerCase();
            const links = sidebar.querySelectorAll('a.nav-link');
            
            links.forEach((link) => {
                const href = link.getAttribute('href')?.toLowerCase();
                if (href && href.includes(path)) {
                    link.classList.remove('text-dark');
                    link.classList.add('text-primary');
                }
            });
        } else {
            console.error('No se encontró el elemento con id "sidebar"');
        }
    } catch (error) {
        console.error('Error al cargar sidebar:', error);
        mostrarError('Error al cargar la interfaz');
    }
}
