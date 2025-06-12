// Importar la verificación de autenticación
import { verificarAutenticacion,AUTH_KEYS } from './utils/auth.js';
import endpoints from './utils/endpoints.js';


const API_BASE_URL = "http://localhost:5080/system_clinic/api/v0.1/service/";

const ESPECIALITY_URL = "http://localhost:5080/system_clinic/api/v0.1/specialty/";

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }

    // Cargar el sidebar
    await cargarSidebar();

    // Cargar especialidades
    await cargarEspecialidades();

    // Invocar enviarFormulario aquí:
    enviarFormulario();

    // Configurar el nombre de usuario
    const adminName = localStorage.getItem('adminName');
    if (adminName) {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = adminName;
        }
    }

    // Cierre de sesión
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



function enviarFormulario(){
    const $nombre_servicio = document.querySelector("#nombre");
    const $precio_servicio = document.querySelector("#costo");
    const $especialidad_servicio = document.querySelector("#selectEspecialidad")
    const $btn_especialidad = document.querySelector("#btn_form");

    $btn_especialidad.addEventListener('click', async (e)=>{   

        e.preventDefault();

        let nombreServicio = $nombre_servicio.value;
        let precioServicio = $precio_servicio.value;
        let especialidadServicio = $especialidad_servicio.value;
        
        try {
            const res = await fetch( endpoints().service.save(especialidadServicio) ,{
                method:"POST",
                headers:getAuthHeaders(),
                body:JSON.stringify({
                    "name_Service": nombreServicio,
                    "price": precioServicio
                })
            })
            const data = await res.json();
            console.log("Se agregó correctamente el servicio", data);
            mostrarMensaje("Servicio agregado correctamente", "success");
        } catch (error) {
            console.error("Error al agregar servicio:", error);
            mostrarError("Hubo un error al agregar el servicio");
        }
    })
}


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

function mostrarError(mensaje) {
    mostrarMensaje(mensaje, 'danger');
}

// Cargar el sidebar
async function cargarSidebar() {
    try {
        const response = await fetch("/components/Sidebar.html");
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

function getAuthHeaders() {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
        console.error('No se encontró el token de autenticación');
        cerrarSesion();
        return {};
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Función para cargar las especialidades en el select
async function cargarEspecialidades() {
    try {
        console.log('Iniciando carga de especialidades...');
        const headers = getAuthHeaders();
        console.log('Headers:', headers);
        
        const response = await fetch(ESPECIALITY_URL + "list", {
            headers: headers
        });
        
        console.log('Respuesta recibida:', response);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta:', errorText);
            const error = await handleApiError(response);
            throw error;
        }
        
        const result = await response.json();
        console.log('Datos de especialidades recibidos:', result);
        
        const selectEspecialidad = document.getElementById('selectEspecialidad');
        
        if (!selectEspecialidad) {
            console.error('No se encontró el elemento selectEspecialidad');
            return [];
        }
        
        // Limpiar opciones existentes excepto la primera
        while (selectEspecialidad.options.length > 1) {
            selectEspecialidad.remove(1);
        }
        
        // Verificar que result.data existe y es un array
        if (!result.data || !Array.isArray(result.data)) {
            console.error('Formato de datos inesperado:', result);
            throw new Error('Formato de datos inesperado al cargar especialidades');
        }
        
        // Agregar las especialidades al select
        result.data.forEach(especialidad => {
            const option = document.createElement('option');
            option.value = especialidad.id_specialty || especialidad.id;
            option.textContent = especialidad.specialty_name || especialidad.name || 'Sin nombre';
            selectEspecialidad.appendChild(option);
        });
        
        console.log('Especialidades cargadas correctamente en el selector');
        return result.data;

    } catch (error) {
        console.error('Error al cargar especialidades en el selector:', error);
        mostrarError('No se pudieron cargar las especialidades en el selector');
        return [];
    }
}
