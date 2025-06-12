// 1. IMPORTACIONES
import {
  verificarAutenticacion,
  limpiarSesion,
  AUTH_KEYS,
} from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1/doctor/";
const ESPECIALITY_URL =
  "http://localhost:8080/system_clinic/api/v0.1/specialty/";

// 3. FUNCIONES SÍNCRONAS
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
  document
    .querySelector(".main-content")
    ?.insertAdjacentElement("afterbegin", alertDiv);
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
    Authorization: `Bearer ${token}`,
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
 * Valida los datos del formulario de doctor
 * @param {FormData} formData - Datos del formulario a validar
 * @returns {string[]} Array de mensajes de error
 */
function validarFormularioDoctor(formData) {
  const errors = [];

  // Validar campos obligatorios
  if (!formData.get("first_name")?.trim()) {
    errors.push("El nombre es obligatorio");
  }

  if (!formData.get("last_name")?.trim()) {
    errors.push("Los apellidos son obligatorios");
  }

  if (!formData.get("dni")?.trim()) {
    errors.push("El DNI es obligatorio");
  }

  if (!formData.get("cmp")?.trim()) {
    errors.push("El CMP es obligatorio");
  }

  if (!formData.get("email")?.trim()) {
    errors.push("El correo electrónico es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get("email"))) {
    errors.push("El correo electrónico no es válido");
  }

  // Validar contraseña solo para nuevos registros
  const isEditing =
    document.querySelector('button[type="submit"]')?.dataset.editing === "true";
  if (!isEditing && !formData.get("password")?.trim()) {
    errors.push("La contraseña es obligatoria");
  }

  return errors;
}

/**
 * Configura el botón de cancelar edición
 */
function configurarBotonCancelar() {
  const btnCancelar = document.createElement("button");
  btnCancelar.type = "button";
  btnCancelar.className = "btn btn-secondary ms-2";
  btnCancelar.innerHTML = '<i class="fas fa-times me-1"></i> Cancelar';
  btnCancelar.onclick = cancelarEdicion;

  const form = document.getElementById("formDoctor");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (submitButton && !document.getElementById("btnCancelarEdicion")) {
    btnCancelar.id = "btnCancelarEdicion";
    submitButton.parentNode.appendChild(btnCancelar);
  }
}

/**
 * Cancela la edición y restablece el formulario
 */
function cancelarEdicion() {
  const form = document.getElementById("formDoctor");
  if (!form) return;

  // Restablecer el formulario
  form.reset();

  // Restaurar el botón de enviar
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.textContent = "Registrar Doctor";
    submitButton.innerHTML =
      '<i class="fas fa-save me-1"></i> Registrar Doctor';
    delete submitButton.dataset.editing;
    delete submitButton.dataset.doctorId;
  }

  // Eliminar el botón de cancelar
  const btnCancelar = document.getElementById("btnCancelarEdicion");
  if (btnCancelar) {
    btnCancelar.remove();
  }

  // Desplazarse al principio del formulario
  form.scrollIntoView({ behavior: "smooth" });
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }

  // Inicializar la página de doctores
  await inicializarPagina();
});

// 4. FUNCIONES ASÍNCRONAS
/**
 * Maneja los errores de la API, especialmente los de autenticación
 * @param {Response} response - Respuesta de la API
 * @returns {Promise<Error>} Error con el mensaje correspondiente
 */
async function handleApiError(response) {
  if (response.status === 401 || response.status === 403) {
    console.error("Error de autenticación - Token expirado o inválido");
    cerrarSesion();
    return new Error("Sesión expirada. Por favor, inicie sesión nuevamente.");
  }

  const error = await response.json().catch(() => ({}));
  console.error("Error en la petición:", error);
  return new Error(error.message || "Error en la petición al servidor");
}

// Cargar el sidebar basado en el rol del usuario
async function cargarSidebar() {
  try {
    const role = localStorage.getItem("role");
    let sideBarPath =
      role === "ADMIN"
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
 * Carga las especialidades en el select
 */
async function cargarEspecialidades() {
  try {
    console.log("Iniciando carga de especialidades...");
    const headers = getAuthHeaders();
    console.log("Headers:", headers);

    const response = await fetch(ESPECIALITY_URL + "list", {
      headers: headers,
    });

    console.log("Respuesta recibida:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en la respuesta:", errorText);
      const error = await handleApiError(response);
      throw error;
    }

    const result = await response.json();
    console.log("Datos de especialidades recibidos:", result);

    const selectEspecialidad = document.getElementById("selectEspecialidad");

    if (!selectEspecialidad) {
      console.error("No se encontró el elemento selectEspecialidad");
      return [];
    }

    // Limpiar opciones existentes excepto la primera
    while (selectEspecialidad.options.length > 1) {
      selectEspecialidad.remove(1);
    }

    // Verificar que result.data existe y es un array
    if (!result.data || !Array.isArray(result.data)) {
      console.error("Formato de datos inesperado:", result);
      throw new Error("Formato de datos inesperado al cargar especialidades");
    }

    // Agregar las especialidades al select
    result.data.forEach((especialidad) => {
      const option = document.createElement("option");
      option.value = especialidad.id_specialty || especialidad.id;
      option.textContent =
        especialidad.specialty_name || especialidad.name || "Sin nombre";
      selectEspecialidad.appendChild(option);
    });

    console.log("Especialidades cargadas correctamente en el selector");
    return result.data;
  } catch (error) {
    console.error("Error al cargar especialidades en el selector:", error);
    mostrarError("No se pudieron cargar las especialidades en el selector");
    return [];
  }
}

/**
 * Busca un doctor por su número de colegiatura (CMP)
 * Endpoint: GET /doctor/getCMP?cmp={cmp}
 */
async function buscarPorCMP() {
  const cmp = document.getElementById("searchCMP")?.value.trim();
  if (!cmp) {
    mostrarError("Por favor ingrese un CMP para buscar");
    return;
  }

  try {
    const btnBuscar = document.getElementById("buscarCMP");
    const originalText = btnBuscar.innerHTML;

    // Mostrar estado de carga
    btnBuscar.disabled = true;
    btnBuscar.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status"></span> Buscando...';

    const response = await fetch(
      `${API_BASE_URL}getCMP?cmp=${encodeURIComponent(cmp)}`,
      {
        headers: getAuthHeaders(),
      }
    );

    // Restaurar estado del botón
    btnBuscar.disabled = false;
    btnBuscar.innerHTML = originalText;

    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }

    const result = await response.json();

    // Mostrar resultados en la tabla
    if (result.data) {
      actualizarTablaDoctores([result.data]);
    } else {
      mostrarError("No se encontró ningún doctor con el CMP proporcionado");
      actualizarTablaDoctores([]);
    }
  } catch (error) {
    console.error("Error al buscar doctor por CMP:", error);
    mostrarError(error.message || "Error al buscar doctor por CMP");
  }
}

/**
 * Busca un doctor por su DNI
 * Endpoint: GET /doctor/getDNI?dni={dni}
 */
async function buscarPorDNI() {
  const dni = document.getElementById("searchDNI")?.value.trim();
  if (!dni) {
    mostrarError("Por favor ingrese un DNI para buscar");
    return;
  }

  try {
    const btnBuscar = document.getElementById("buscarDNI");
    const originalText = btnBuscar.innerHTML;

    // Mostrar estado de carga
    btnBuscar.disabled = true;
    btnBuscar.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status"></span> Buscando...';

    const response = await fetch(
      `${API_BASE_URL}getDNI?dni=${encodeURIComponent(dni)}`,
      {
        headers: getAuthHeaders(),
      }
    );

    // Restaurar estado del botón
    btnBuscar.disabled = false;
    btnBuscar.innerHTML = originalText;

    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }

    const result = await response.json();

    // Mostrar resultados en la tabla
    if (result.data) {
      actualizarTablaDoctores([result.data]);
    } else {
      mostrarError("No se encontró ningún doctor con el DNI proporcionado");
      actualizarTablaDoctores([]);
    }
  } catch (error) {
    console.error("Error al buscar doctor por DNI:", error);
    mostrarError(error.message || "Error al buscar doctor por DNI");
  }
}

/**
 * Carga la lista de doctores
 */
async function cargarDoctores() {
  try {
    console.log("Cargando lista de doctores...");
    const response = await fetch(`${API_BASE_URL}list?page=0`, {
      headers: getAuthHeaders(),
    });

    console.log("Respuesta de lista de doctores:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al cargar doctores:", errorText);
      const error = await handleApiError(response);
      throw error;
    }

    const result = await response.json();
    console.log("Datos de doctores recibidos:", result);

    // Actualizar la tabla con los doctores
    actualizarTablaDoctores(result.data || []);
    return result.data;
  } catch (error) {
    console.error("Error al cargar la lista de doctores:", error);
    mostrarError(error.message || "Error al cargar la lista de doctores");
    throw error;
  }
}

/**
 * Actualiza la tabla de doctores
 * @param {Array} doctores - Lista de doctores a mostrar en la tabla
 */
function actualizarTablaDoctores(doctores) {
  const tbody = document.getElementById("tablaDoctores");
  if (!tbody) {
    console.error("No se encontró el elemento tbody para la tabla de doctores");
    return;
  }

  if (!doctores || doctores.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No se encontraron doctores.</td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = doctores
    .map(
      (doctor, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${doctor.first_name || ""}</td>
            <td>${doctor.last_name || ""}</td>
            <td>${doctor.dni || ""}</td>
            <td>${doctor.cmp || ""}</td>
            <td>${doctor.email || ""}</td>
            <td>${doctor.phone || ""}</td>
            <td>${
              doctor.specialty?.specialty_name ||
              doctor.specialty_name ||
              "No especificada"
            }</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editarDoctor('${
                  doctor.id_doctor || doctor.id
                }')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarDoctor('${
                  doctor.id_doctor || doctor.id
                }')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>
    `
    )
    .join("");

  console.log("Tabla de doctores actualizada:", doctores);
}

/**
 * Inicializa el formulario
 */
function inicializarFormulario() {
  const form = document.getElementById("formDoctor");
  if (form) {
    form.addEventListener("submit", manejarEnvioFormulario);
  } else {
    console.error("No se encontró el formulario con ID formDoctor");
  }
}

/**
 * Maneja el envío del formulario
 * @param {Event} event - Evento de envío del formulario
 */
async function manejarEnvioFormulario(event) {
  event.preventDefault();

  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.innerHTML;
  const isEditing = submitButton?.dataset.editing === "true";
  const doctorId = submitButton?.dataset.doctorId;

  try {
    // Deshabilitar el botón de envío
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
    }

    const formData = new FormData(form);

    // Validar el formulario
    const errores = validarFormularioDoctor(formData);
    if (errores.length > 0) {
      mostrarError(errores.join("<br>"));
      return;
    }

    // 1. Obtener headers de autenticación
    const headers = getAuthHeaders();
    if (Object.keys(headers).length === 0) {
      throw new Error("No se pudo autenticar la solicitud");
    }
    headers["Content-Type"] = "application/json";

    // 2. Obtener datos básicos del formulario
    const doctorData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      address: formData.get("address") || null,
      landline_phone: formData.get("landline_phone") || null,
      dni: formData.get("dni"),
      cmp: formData.get("cmp"),
      username: formData.get("username"),
    };

    // 3. Determinar si es creación o actualización
    const isNewDoctor = !isEditing || !doctorId;
    let url;
    let method;

    if (isNewDoctor) {
      // Para nuevo doctor (POST)
      const adminId = localStorage.getItem(AUTH_KEYS.USER_ID);
      if (!adminId) {
        throw new Error("No se pudo identificar al administrador");
      }

      const specialtyId = formData.get("specialty_id");
      if (!specialtyId) {
        throw new Error("Debe seleccionar una especialidad");
      }

      // Validar contraseña para nuevo doctor
      const password = formData.get("password");
      if (!password || password.trim() === "") {
        throw new Error("La contraseña es obligatoria para nuevos doctores");
      }

      doctorData.password = password;
      url = `${API_BASE_URL}save/assignAdmin/${adminId}/assignSpecialty/${specialtyId}`;
      method = "POST";
    } else {
      // Para actualización (PATCH)
      url = `${API_BASE_URL}${doctorId}`;
      method = "PATCH";

      // Incluir la especialidad en el cuerpo para actualización
      const specialtyId = formData.get("specialty_id");
      if (specialtyId) {
        doctorData.id_specialty = specialtyId;
      }

      // Solo incluir contraseña si se proporciona una nueva
      const newPassword = formData.get("password");
      if (newPassword && newPassword.trim() !== "") {
        doctorData.password = newPassword;
      }
    }

    console.log("URL de la petición:", url);
    console.log("Método:", method);
    console.log("Datos del doctor:", doctorData);

    // 4. Realizar la petición
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(doctorData),
      credentials: "include",
    });

    // 5. Manejar la respuesta
    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }

    const result = await response.json();
    console.log("Respuesta del servidor:", result);

    // Mostrar mensaje de éxito
    mostrarExito(
      result.message ||
        (isEditing
          ? "Doctor actualizado exitosamente"
          : "Doctor registrado exitosamente")
    );

    // Limpiar el formulario
    form.reset();

    // Si estábamos editando, restaurar el botón a su estado original
    if (isEditing && submitButton) {
      submitButton.innerHTML = "Registrar Doctor";
      delete submitButton.dataset.editing;
      delete submitButton.dataset.doctorId;
    }

    // Actualizar la lista de doctores
    await cargarDoctores();
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    mostrarError(error.message || "Error al conectar con el servidor");
  } finally {
    // Restaurar el botón de envío
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  }
}

/**
 * Inicializa la página
 */
async function inicializarPagina() {
  if (!verificarAutenticacion()) return;

  // Cargar el sidebar
  await cargarSidebar();

  // Inicializar el formulario
  inicializarFormulario();

  // Cargar las especialidades en el select
  await cargarEspecialidades();

  // Cargar la lista de doctores
  await cargarDoctores();

  // Configurar los botones de búsqueda y eventos
  const btnBuscarDNI = document.getElementById("buscarDNI");
  const btnBuscarCMP = document.getElementById("buscarCMP");
  const btnMostrarTodos = document.getElementById("mostrarTodos");
  const btnExportar = document.getElementById("exportarPacientes");

  // Configurar búsqueda por DNI
  if (btnBuscarDNI) {
    btnBuscarDNI.addEventListener("click", buscarPorDNI);

    // Permitir búsqueda con Enter
    document.getElementById("searchDNI")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarPorDNI();
      }
    });
  } else {
    console.warn("No se encontró el botón de búsqueda por DNI");
  }

  // Configurar búsqueda por CMP
  if (btnBuscarCMP) {
    btnBuscarCMP.addEventListener("click", buscarPorCMP);

    // Permitir búsqueda con Enter
    document.getElementById("searchCMP")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarPorCMP();
      }
    });
  } else {
    console.warn("No se encontró el botón de búsqueda por CMP");
  }

  // Configurar botón Mostrar Todos
  if (btnMostrarTodos) {
    btnMostrarTodos.addEventListener("click", cargarDoctores);
  }

  // Configurar botón de exportar
  if (btnExportar) {
    btnExportar.addEventListener("click", exportarAExcel);
  }

  console.log("Página de doctores inicializada");
}

/**
 * Edita un doctor
 * @param {string} id - ID del doctor a editar
 */
async function editarDoctor(id) {
  try {
    console.log("Obteniendo datos del doctor con ID:", id);

    // 1. Obtener los datos actuales del doctor
    const response = await fetch(`${API_BASE_URL}${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }

    const result = await response.json();
    const doctor = result.data;

    if (!doctor) {
      throw new Error("No se encontraron datos del doctor");
    }

    console.log("Datos del doctor obtenidos:", doctor);

    // 2. Llenar el formulario con los datos actuales
    const form = document.getElementById("formDoctor");
    if (!form) {
      throw new Error("No se encontró el formulario de doctores");
    }

    // Mapear los campos del formulario con los datos del doctor
    const fields = {
      first_name: "first_name",
      last_name: "last_name",
      email: "email",
      phone: "phone",
      address: "address",
      landline_phone: "landline_phone",
      dni: "dni",
      cmp: "cmp",
      username: "username",
    };

    // Llenar los campos del formulario
    Object.entries(fields).forEach(([fieldName, doctorField]) => {
      if (form.elements[fieldName]) {
        form.elements[fieldName].value = doctor[doctorField] || "";
      }
    });

    // Establecer la especialidad si existe
    if (doctor.specialty_id && form.elements["specialty_id"]) {
      form.elements["specialty_id"].value = doctor.specialty_id;
    } else if (doctor.specialty && doctor.specialty.id_specialty) {
      form.elements["specialty_id"].value = doctor.specialty.id_specialty;
    }

    // 3. Cambiar el texto del botón de enviar
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML =
        '<i class="fas fa-save me-1"></i> Actualizar Doctor';
      submitButton.dataset.editing = "true";
      submitButton.dataset.doctorId = id;

      // Mostrar el botón de cancelar
      configurarBotonCancelar();
    }

    // 4. Desplazarse al formulario
    form.scrollIntoView({ behavior: "smooth" });

    // Mostrar mensaje de éxito
    mostrarExito(
      "Datos del doctor cargados. Puede modificar la información y guardar los cambios."
    );
  } catch (error) {
    console.error("Error al cargar datos del doctor:", error);
    mostrarError(error.message || "Error al cargar los datos del doctor");
  }
}

/**
 * Elimina un doctor
 * @param {string} id - ID del doctor a eliminar
 */
async function eliminarDoctor(id) {
  if (
    !confirm(
      "¿Está seguro de que desea eliminar este doctor? Esta acción no se puede deshacer."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }

    const result = await response.json();
    console.log("Doctor eliminado:", result);

    // Mostrar mensaje de éxito
    mostrarExito("Doctor eliminado correctamente");

    // Actualizar la lista de doctores
    await cargarDoctores();
  } catch (error) {
    console.error("Error al eliminar el doctor:", error);
    mostrarError(error.message || "Error al eliminar el doctor");
  }
}

/**
 * Exporta la lista de doctores a un archivo Excel
 */
async function exportarAExcel() {
  const btnExportar = document.getElementById("exportarPacientes");
  if (!btnExportar) return;

  const originalText = btnExportar.innerHTML;

  try {
    // Mostrar estado de carga
    btnExportar.disabled = true;
    btnExportar.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status"></span> Exportando...';

    const response = await fetch(`${API_BASE_URL}export/excel`, {
      headers: getAuthHeaders(),
    });

    // Restaurar estado del botón
    btnExportar.disabled = false;
    btnExportar.innerHTML = originalText;

    if (!response.ok) {
      const error = await handleApiError(response);
      throw error;
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctores_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();

    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Mostrar mensaje de éxito
    mostrarExito("Exportación completada correctamente");
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    mostrarError(error.message || "Error al exportar la lista de doctores");
  } finally {
    // Restaurar el botón de exportar
    if (btnExportar) {
      btnExportar.disabled = false;
      btnExportar.innerHTML = originalText;
    }
  }
}

// 5. EVENTOS Y ASIGNACIONES GLOBALES
// Hacer que las funciones estén disponibles globalmente
window.buscarPorCMP = buscarPorCMP;
window.buscarPorDNI = buscarPorDNI;
window.editarDoctor = editarDoctor;
window.eliminarDoctor = eliminarDoctor;
window.exportarAExcel = exportarAExcel;
