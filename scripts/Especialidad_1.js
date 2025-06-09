// Importar la verificación de autenticación
import { verificarAutenticacion } from '/scripts/utils/auth.js';

const API_BASE_URL = "http://192.168.18.55:8080/system_clinic/api/v0.1/specialty/";

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }
    
    // Cargar el sidebar
    await cargarSidebar();
    
    // Configurar el nombre de usuario en el sidebar si existe
    const adminName = localStorage.getItem('adminName');
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
            localStorage.removeItem('adminId');
            localStorage.removeItem('adminName');
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
        const adminName = localStorage.getItem('adminName');
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
                localStorage.removeItem('adminId');
                localStorage.removeItem('adminName');
                window.location.href = '/pages/Login.html';
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

// Renderizar tabla de especialidades
async function renderTabla() {
    if (!verificarAutenticacion()) return;

    try {
        const res = await fetch(`${API_BASE_URL}list`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("adminId")}`
            }
        });
        
        if (res.status === 401 || res.status === 403) {
            // Token expirado o inválido
            localStorage.removeItem("adminId");
            localStorage.removeItem("adminName");
            window.location.href = "/pages/Login.html";
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

// Hacer que las funciones estén disponibles globalmente
window.eliminarEspecialidad = eliminarEspecialidad;
window.verServicios = verServicios;

// Inicialización
window.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAutenticacion()) return;
    
    // Cargar el sidebar
    await cargarSidebar();

    // Configurar formulario
    document.getElementById("especialidadForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const specialty_name = this.specialty_name.value.trim();
        
        if (!specialty_name) {
            mostrarError("El nombre de la especialidad es requerido");
            return;
        }

        try {
            const res = await fetch(API_BASE_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("adminId")}`
                },
                body: JSON.stringify({
                    name_specialty: specialty_name
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
        }
    });

    // Cargar datos iniciales
    renderTabla();
});

// Eliminar especialidad
async function eliminarEspecialidad(id) {
    if (!verificarAutenticacion()) return;
    
    if (!confirm("¿Está seguro de eliminar esta especialidad?")) return;

    try {
        const res = await fetch(`${API_BASE_URL}${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("adminId")}`
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

// Ver servicios de la especialidad
async function verServicios(id) {
    if (!verificarAutenticacion()) return;

    try {
        const res = await fetch(`${API_BASE_URL}/${id}/services`);
        const data = await res.json();
        
        if (res.ok) {
            const servicios = data.data.services || [];
            // Aquí puedes mostrar los servicios en un modal o en otra sección
            console.log('Servicios:', servicios);
        } else {
            mostrarError(data.message || "Error al obtener los servicios");
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError("Error de conexión con el servidor");
    }
}