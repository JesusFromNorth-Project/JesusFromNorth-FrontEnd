// 1. IMPORTACIONES
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from './utils/auth.js';

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1/specialty/";

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
/**
 * Carga el componente Sidebar y configura sus eventos
 */
async function cargarSidebar() {
    try {
        const response = await fetch("../components/Sidebar.html");
        if (!response.ok) throw new Error('Error al cargar el sidebar');
        
        const html = await response.text();
        const sidebarElement = document.getElementById("sidebar-placeholder");
        if (!sidebarElement) {
            console.error('No se encontró el elemento con id "sidebar-placeholder"');
            return;
        }
        
        sidebarElement.innerHTML = html;

        // Configurar el nombre de usuario en el sidebar después de cargarlo
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

/**
 * Renderiza la tabla de especialidades obtenidas del servidor
 */
async function renderTabla() {
    if (!verificarAutenticacion()) return;

    try {
        const token = localStorage.getItem(AUTH_KEYS.TOKEN);
        const res = await fetch(`${API_BASE_URL}list`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (res.status === 401 || res.status === 403) {
            // Token expirado o inválido
            limpiarSesion();
            window.location.href = 'Login.html';
            return;
        }
        
        const response = await res.json();
        const especialidades = response.data || [];

        const tbody = document.getElementById("tablaEspecialidades");
        tbody.innerHTML = "";
        
        if (especialidades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay especialidades registradas.</td></tr>';
            return;
        }

        especialidades.forEach((esp) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${esp.id_specialty || ''}</td>
                <td>${esp.specialty_name || ''}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEspecialidad('${esp.id_specialty || ''}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn btn-info btn-sm ms-2" onclick="verServicios('${esp.id_specialty || ''}')">
                        <i class="fas fa-list"></i> Ver Servicios
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        mostrarError("Error al cargar las especialidades");
    }
}

/**
 * Elimina una especialidad por su ID
 * @param {string} id - ID de la especialidad a eliminar
 */
async function eliminarEspecialidad(id) {
    if (!verificarAutenticacion()) return;
    
    if (!confirm("¿Está seguro de eliminar esta especialidad?")) return;

    try {
        const res = await fetch(`${API_BASE_URL}${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem(AUTH_KEYS.TOKEN)}`
            }
        });

        if (res.status === 204) {
            mostrarExito("Especialidad eliminada exitosamente");
            await renderTabla();
        } else {
            const data = await res.json();
            mostrarError(data.message || "Error al eliminar la especialidad");
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError("Error de conexión con el servidor");
    }
}

/**
 * Obtiene y muestra los servicios asociados a una especialidad
 * @param {string} id - ID de la especialidad
 */
async function verServicios(id) {
    if (!verificarAutenticacion()) return;

    try {
        const res = await fetch(`${API_BASE_URL}${id}/services`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem(AUTH_KEYS.TOKEN)}`
            }
        });
        const data = await res.json();
        
        if (res.ok) {
            const servicios = data.data.services || [];
            console.log('Servicios:', servicios);
            // Aquí puedes mostrar los servicios en un modal o en otra sección
        } else {
            mostrarError(data.message || "Error al obtener los servicios");
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError("Error de conexión con el servidor");
    }
}

// 5. EVENTOS Y ASIGNACIONES GLOBALES
// Hacer que las funciones estén disponibles globalmente
window.eliminarEspecialidad = eliminarEspecialidad;
window.verServicios = verServicios;

// Inicialización de la aplicación
window.addEventListener("DOMContentLoaded", async () => {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        window.location.href = 'Login.html';
        return;
    }
    
    // Cargar el sidebar
    await cargarSidebar();

    // Configurar formulario de especialidades
    const formulario = document.getElementById("especialidadForm");
    if (formulario) {
        formulario.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            // Obtener referencias a los elementos del formulario
            const submitButton = this.querySelector('button[type="submit"]');
            const inputEspecialidad = this.elements['especialidad'];
            const originalButtonText = submitButton?.innerHTML;
            
            // Obtener y validar el valor del campo
            const nombreEspecialidad = inputEspecialidad?.value.trim();
            
            // Validaciones
            if (!nombreEspecialidad) {
                mostrarError("El nombre de la especialidad es requerido");
                inputEspecialidad?.focus();
                return;
            }
            
            if (nombreEspecialidad.length < 3) {
                mostrarError("El nombre debe tener al menos 3 caracteres");
                inputEspecialidad?.focus();
                return;
            }
            
            if (nombreEspecialidad.length > 100) {
                mostrarError("El nombre no puede tener más de 100 caracteres");
                inputEspecialidad?.focus();
                return;
            }
            
            // Sanitizar el nombre (remover caracteres especiales)
            const nombreSpeciality = nombreEspecialidad.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ.,-]/gi, '');
            
            // Deshabilitar botón y mostrar indicador de carga
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
            }

            try {
                const res = await fetch(API_BASE_URL, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem(AUTH_KEYS.TOKEN)}`
                    },
                    body: JSON.stringify({
                        name_specialty: nombreSpeciality
                    })
                });

                const data = await res.json();
                
                if (res.ok) {
                    mostrarExito("Especialidad guardada exitosamente");
                    this.reset();
                    await renderTabla();
                } else {
                    mostrarError(data.message || "Error al guardar la especialidad");
                }
            } catch (error) {
                console.error('Error:', error);
                mostrarError("Error de conexión con el servidor");
            } finally {
                // Restaurar estado del botón
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            }
        });
    }

    // Cargar datos iniciales
    renderTabla();
});