// Importar la verificación de autenticación
import { verificarAutenticacion } from '/scripts/utils/auth.js';

const API_BASE_URL = "http://localhost:5080/system_clinic/api/v0.1/doctor/";
const ESPECIALITY_URL = "http://localhost:5080/system_clinic/api/v0.1/specialty/";

// Función para obtener los headers con autenticación
function getAuthHeaders() {
    const token = localStorage.getItem('adminId'); // El token se guarda en adminId
    if (!token) {
        console.error('No se encontró el token de autenticación');
        // Forzar cierre de sesión si no hay token
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminName');
        window.location.href = '/pages/Login.html';
        return {};
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Función para manejar respuestas de error de la API
async function handleApiError(response) {
    if (response.status === 401) {
        // Token expirado o inválido
        console.error('Error de autenticación - Token expirado o inválido');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminName');
        window.location.href = '/pages/Login.html';
        return new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    
    const error = await response.json().catch(() => ({}));
    console.error('Error en la petición:', error);
    return new Error(error.message || 'Error en la petición al servidor');
}

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
    
    // Inicializar la página de doctores
    await inicializarPagina();
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

// Función para manejar el envío del formulario
async function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Obtener los valores del formulario
    const doctorData = {
        first_name: formData.get('nombre'),
        last_name: formData.get('apellido'),
        email: formData.get('correo'),
        address: formData.get('direccion'),
        phone: formData.get('telefono'),
        landline_phone: formData.get('telefonoFijo'),
        dni: formData.get('dni'),
        cmp: formData.get('cmp'),
        username: formData.get('correo'),
        password: formData.get('password')
    };
    
    const especialidadId = formData.get('especialidad');
    
    try {
        // Obtener el ID del administrador del localStorage
        const adminId = localStorage.getItem('adminId');
        if (!adminId) {
            mostrarError('No se encontró el ID del administrador. Por favor, inicie sesión nuevamente.');
            setTimeout(() => {
                window.location.href = '/pages/Login.html';
            }, 2000);
            return;
        }
        
        // Hacer la petición al backend
        const response = await fetch(`${API_BASE_URL}save/assignAdmin/${adminId}/assignSpecialty/${especialidadId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(doctorData)
        });
        
        if (!response.ok) {
            const error = await handleApiError(response);
            throw error;
        }
        
        const result = await response.json();
        
        if (result.success) {
            mostrarExito('Doctor registrado exitosamente');
            form.reset();
            // Opcional: Actualizar la lista de doctores
            // await cargarDoctores();
        } else {
            throw new Error(result.message || 'Error al registrar el doctor');
        }
    } catch (error) {
        console.error('Error al registrar doctor:', error);
        mostrarError(error.message || 'Error al conectar con el servidor');
    }
}

// Función para inicializar el formulario
function inicializarFormulario() {
    const form = document.getElementById('doctorForm');
    if (form) {
        form.addEventListener('submit', manejarEnvioFormulario);
    }
}

// Funciones de búsqueda
async function buscarPorCMP() {
    const cmp = document.getElementById('searchCMP')?.value.trim();
    if (!cmp) {
        mostrarError('Por favor ingrese un CMP para buscar');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}getCMP?cmp=${encodeURIComponent(cmp)}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await handleApiError(response);
            throw error;
        }
        
        const result = await response.json();
        // Mostrar resultados en la tabla
        actualizarTablaDoctores(result.data || [result]);
        
    } catch (error) {
        console.error('Error al buscar doctor por CMP:', error);
        mostrarError(error.message || 'Error al buscar doctor');
    }
}

async function buscarPorNombre() {
    const nombre = document.getElementById('searchNombre')?.value.trim();
    if (!nombre) {
        mostrarError('Por favor ingrese un nombre para buscar');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}search?name=${encodeURIComponent(nombre)}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await handleApiError(response);
            throw error;
        }
        
        const result = await response.json();
        // Mostrar resultados en la tabla
        actualizarTablaDoctores(result.data || []);
        
    } catch (error) {
        console.error('Error al buscar doctores por nombre:', error);
        mostrarError(error.message || 'Error al buscar doctores');
    }
}

// Función para cargar la lista de doctores
async function cargarDoctores() {
    try {
        console.log('Cargando lista de doctores...');
        const response = await fetch(`${API_BASE_URL}list?page=0`, {
            headers: getAuthHeaders()
        });
        
        console.log('Respuesta de lista de doctores:', response);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al cargar doctores:', errorText);
            const error = await handleApiError(response);
            throw error;
        }
        
        const result = await response.json();
        console.log('Datos de doctores recibidos:', result);
        
        // Actualizar la tabla con los doctores
        actualizarTablaDoctores(result.data || []);
        return result.data;
    } catch (error) {
        console.error('Error al cargar la lista de doctores:', error);
        mostrarError(error.message || 'Error al cargar la lista de doctores');
        throw error;
    }
}

// Función para actualizar la tabla de doctores
function actualizarTablaDoctores(doctores) {
    const tbody = document.getElementById('tablaDoctores');
    if (!tbody) {
        console.error('No se encontró el elemento tbody para la tabla de doctores');
        return;
    }
    
    if (!doctores || doctores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No se encontraron doctores.</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = doctores.map(doctor => `
        <tr>
            <td>${doctor.id_doctor || doctor.id || ''}</td>
            <td>${doctor.first_name || ''}</td>
            <td>${doctor.last_name || ''}</td>
            <td>${doctor.cmp || ''}</td>
            <td>${doctor.email || ''}</td>
            <td>${doctor.phone || ''}</td>
            <td>${doctor.specialty?.specialty_name || doctor.specialty_name || 'No especificada'}</td>
        </tr>
    `).join('');
    
    console.log('Tabla de doctores actualizada:', doctores);
}

// Función para inicializar la página
async function inicializarPagina() {
    try {
        console.log('Inicializando página de doctores...');
        
        // Cargar especialidades y doctores en paralelo
        await Promise.all([
            cargarEspecialidades(),
            cargarDoctores()
        ]);
        
        // Configurar el formulario
        inicializarFormulario();
        
        // Configurar los botones de búsqueda
        const btnBuscarCMP = document.querySelector('#searchCMP')?.nextElementSibling;
        const btnBuscarNombre = document.querySelector('#searchNombre')?.nextElementSibling;
        
        if (btnBuscarCMP) {
            btnBuscarCMP.addEventListener('click', buscarPorCMP);
        }
        
        if (btnBuscarNombre) {
            btnBuscarNombre.addEventListener('click', buscarPorNombre);
        }
        
        console.log('Página de doctores inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la página de doctores:', error);
        mostrarError('Error al cargar la página. Por favor, recarga la página.');
    }
}