// 1. IMPORTACIONES
import {
  verificarAutenticacion,
  limpiarSesion,
  AUTH_KEYS,
} from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1/service/";
const SPECIALTY_URL = "http://localhost:8080/system_clinic/api/v0.1/specialty/";

// 3. FUNCIONES SÍNCRONAS

/**
 * Obtiene los headers de autenticación para las peticiones a la API
 * @returns {Object} Headers de autenticación
 */
function getAuthHeaders() {
  const token = localStorage.getItem(AUTH_KEYS.TOKEN);
  if (!token) {
    console.error("No se encontró el token de autenticación");
    cerrarSesion();
    return {};
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json"
  };
}

/**
 * Cierra la sesión del usuario y redirige al login
 */
function cerrarSesion() {
  limpiarSesion();
  window.location.href = "Login.html";
}

/**
 * Muestra un mensaje en la interfaz
 * @param {string} mensaje - Texto del mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (danger, success, etc.)
 */
function mostrarMensaje(mensaje, tipo = "danger") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.querySelector(".main-content")?.insertAdjacentElement("afterbegin", alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

/**
 * Muestra un mensaje de éxito
 * @param {string} mensaje - Texto del mensaje
 */
function mostrarExito(mensaje) {
  mostrarMensaje(mensaje, "success");
}

/**
 * Muestra un mensaje de error
 * @param {string} mensaje - Texto del mensaje de error
 */
function mostrarError(mensaje) {
  mostrarMensaje(mensaje, "danger");
}

// 4. FUNCIONES ASÍNCRONAS

/**
 * Carga el sidebar según el rol del usuario
 */
async function cargarSidebar() {
  try {
    const role = localStorage.getItem("role");
    const sideBarPath = role === "ADMIN" 
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
    resaltarEnlaceActivo();
  } catch (error) {
    console.error("Error al cargar sidebar:", error);
    mostrarError("Error al cargar la interfaz");
  }
}

/**
 * Resalta el enlace activo en el sidebar según la página actual
 */
function resaltarEnlaceActivo() {
  const path = window.location.pathname.split("/").pop().toLowerCase();
  const links = document.querySelectorAll("#sidebar-placeholder a.nav-link");

  links.forEach((link) => {
    const href = link.getAttribute("href")?.toLowerCase();
    if (href && href.includes(path)) {
      link.classList.remove("text-dark");
      link.classList.add("text-primary");
    }
  });
}

/**
 * Carga las especialidades desde la API
 */
async function cargarEspecialidades() {
  try {
    const response = await fetch(`${SPECIALTY_URL}list/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al cargar las especialidades');
    }

    const data = await response.json();
    const especialidades = data.data || [];
    actualizarSelectsEspecialidades(especialidades);
    return especialidades;
  } catch (error) {
    console.error('Error al cargar especialidades:', error);
    mostrarError('Error al cargar las especialidades');
    return [];
  }
}

/**
 * Actualiza los selects de especialidades en el formulario y búsqueda
 * @param {Array} especialidades - Lista de especialidades
 */
function actualizarSelectsEspecialidades(especialidades) {
  const selectForm = document.querySelector('select[name="especialidad"]');
  const selectBusqueda = document.getElementById('filtroEspecialidad');
  
  // Limpiar opciones existentes
  if (selectForm) {
    selectForm.innerHTML = '<option value="" selected disabled>Seleccione una especialidad</option>';
  }
  if (selectBusqueda) {
    selectBusqueda.innerHTML = '<option value="" selected>Todas las especialidades</option>';
  }
  
  // Agregar opciones
  especialidades.forEach(esp => {
    if (selectForm) {
      const option = document.createElement('option');
      option.value = esp.id;
      option.textContent = esp.name || 'Sin nombre';
      selectForm.appendChild(option);
    }
    
    if (selectBusqueda) {
      const optionBusqueda = document.createElement('option');
      optionBusqueda.value = esp.id;
      optionBusqueda.textContent = esp.name || 'Sin nombre';
      selectBusqueda.appendChild(optionBusqueda);
    }
  });
}

/**
 * Carga los servicios desde la API
 * @param {string} [specialtyId] - ID de la especialidad para filtrar (opcional)
 */
async function cargarServicios(specialtyId) {
  try {
    let url = `${API_BASE_URL}list/all`;
    if (specialtyId) {
      url = `${API_BASE_URL}list/bySpeciality/${specialtyId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al cargar los servicios');
    
    const data = await response.json();
    actualizarTablaServicios(data.data);
  } catch (error) {
    console.error('Error al cargar servicios:', error);
    mostrarError('Error al cargar los servicios');
  }
}

/**
 * Actualiza la tabla con la lista de servicios
 * @param {Array} servicios - Array de servicios a mostrar
 */
function actualizarTablaServicios(servicios = []) {
  const tbody = document.querySelector('#tablaServicios tbody');
  if (!tbody) {
    console.error('No se encontró el elemento tbody para la tabla de servicios');
    return;
  }

  tbody.innerHTML = '';

  if (!servicios || servicios.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="4" class="text-center py-4">
        <i class="fas fa-info-circle me-2"></i>
        No hay servicios registrados
      </td>`;
    tbody.appendChild(tr);
    return;
  }

  servicios.forEach(servicio => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${servicio.name_Service || servicio.name || 'N/A'}</td>
      <td>${servicio.specialtyName || servicio.specialty?.specialty_name || 'N/A'}</td>
      <td>$${(servicio.price || 0).toFixed(2)}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" onclick="editarServicio('${servicio.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarServicio('${servicio.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

/**
 * Maneja el envío del formulario de servicio
 * @param {Event} e - Evento del formulario
 */
async function manejarEnvioFormularioServicio(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.innerHTML;

  try {
    // Deshabilitar botón y mostrar carga
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
    }

    // Validar formulario
    const errores = validarFormularioServicio(formData);
    if (errores.length > 0) {
      mostrarError(errores.join("<br>"));
      return;
    }

    const headers = getAuthHeaders();
    if (Object.keys(headers).length === 0) {
      throw new Error("No se pudo autenticar la solicitud");
    }

    const servicioData = {
      name_Service: formData.get("nombre").trim(),
      price: parseFloat(formData.get("costo").trim())
    };

    const specialtyId = formData.get("especialidad").trim();
    const url = `${API_BASE_URL}save/assignSpecialty/${specialtyId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(servicioData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al procesar la solicitud');
    }

    const result = await response.json();
    mostrarExito("Servicio registrado exitosamente");
    form.reset();
    await cargarServicios();
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    mostrarError(error.message || "Error al conectar con el servidor");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText || 'Guardar';
    }
  }
}

/**
 * Valida los datos del formulario de servicio
 * @param {FormData} formData - Datos del formulario
 * @returns {Array} Lista de errores
 */
function validarFormularioServicio(formData) {
  const errores = [];
  const nombre = formData.get("nombre")?.trim();
  const costo = formData.get("costo")?.trim();
  const especialidad = formData.get("especialidad")?.trim();

  if (!nombre) errores.push("El nombre del servicio es requerido");
  if (!costo || isNaN(parseFloat(costo)) || parseFloat(costo) <= 0) {
    errores.push("El costo debe ser un número mayor a cero");
  }
  if (!especialidad) errores.push("Debe seleccionar una especialidad");

  return errores;
}

/**
 * Inicializa el formulario de servicio
 */
function inicializarFormulario() {
  const form = document.getElementById("formServicio");
  if (form) {
    form.addEventListener("submit", manejarEnvioFormularioServicio);
  } else {
    console.error("No se encontró el formulario con ID formServicio");
  }
}

// 5. EVENTOS Y ASIGNACIONES GLOBALES

/**
 * Inicializa la página de servicios
 */
async function inicializarPagina() {
  // Verificar autenticación
  if (!verificarAutenticacion()) return;

  try {
    // Cargar el sidebar
    await cargarSidebar();

    // Configurar el nombre de usuario en el sidebar
    const adminName = localStorage.getItem(AUTH_KEYS.USERNAME);
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
        cerrarSesion();
      });
    }

    // Inicializar componentes
    inicializarFormulario();
    await cargarEspecialidades();
    await cargarServicios();

    // Configurar el botón de búsqueda
    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
      btnBuscar.addEventListener('click', () => {
        const select = document.getElementById('filtroEspecialidad');
        const especialidadId = select ? select.value : '';
        cargarServicios(especialidadId || undefined);
      });
    }

    console.log("Página de servicios inicializada");
  } catch (error) {
    console.error("Error al inicializar la página:", error);
    mostrarError("Error al cargar la página. Por favor, recarga e intenta de nuevo.");
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", inicializarPagina);

// Hacer que las funciones estén disponibles globalmente
window.mostrarMensaje = mostrarMensaje;
window.mostrarExito = mostrarExito;
window.mostrarError = mostrarError;
window.inicializarPagina = inicializarPagina;
window.validarFormularioServicio = validarFormularioServicio;
window.manejarEnvioFormularioServicio = manejarEnvioFormularioServicio;
