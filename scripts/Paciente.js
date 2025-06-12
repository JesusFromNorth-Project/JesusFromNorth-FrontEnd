// 1. IMPORTACIONES
import {
  verificarAutenticacion,
  limpiarSesion,
  AUTH_KEYS,
} from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1/patient/";

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
 * Mapea los datos del formulario al formato esperado por la API
 * @param {Object} datosFormulario - Datos del formulario
 * @returns {Object} Datos mapeados para la API
 */
function mapearDatosFormulario(datosFormulario) {
  return {
    nombre: datosFormulario.nombre || "",
    apellidos: datosFormulario.apellidos || "",
    dni: datosFormulario.dni || "",
    fechaNacimiento: datosFormulario.fechaNacimiento || null,
    edad: datosFormulario.edad ? parseInt(datosFormulario.edad, 10) : null,
    direccion: datosFormulario.direccion || "",
    telefono: datosFormulario.telefono || "",
    celular: datosFormulario.celular || "",
    genero: datosFormulario.genero || "",
    antecedentesMedicos: datosFormulario.antecedentesMedicos || "",
  };
}

// 4. FUNCIONES ASÍNCRONAS
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
 * Crea un nuevo paciente en el sistema
 * @param {Object} datosPaciente - Datos del paciente a crear
 * @returns {Promise<Object>} Datos del paciente creado
 */
async function crearPaciente(datosPaciente) {
  try {
    const adminId = localStorage.getItem(AUTH_KEYS.USER_ID);
    if (!adminId) {
      throw new Error(
        "No se encontró el ID del administrador. Por favor, inicie sesión nuevamente."
      );
    }

    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    const response = await fetch(`${API_BASE_URL}${adminId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datosPaciente),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear el paciente");
    }

    const result = await response.json();
    mostrarExito("Paciente creado exitosamente");
    return result.data;
  } catch (error) {
    console.error("Error al crear paciente:", error);
    mostrarError(error.message || "Error al crear el paciente");
    throw error;
  }
}

// Obtiene un paciente por su ID
// idPaciente - ID del paciente a buscar
// Retorna los datos del paciente encontrado
async function obtenerPacientePorId(idPaciente) {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    const response = await fetch(`${API_BASE_URL}${idPaciente}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Paciente no encontrado");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error al obtener paciente:", error);
    mostrarError(error.message || "Error al obtener los datos del paciente");
    throw error;
  }
}

// Busca un paciente por su número de DNI
// dni - Número de documento de identidad del paciente
// Retorna los datos del paciente encontrado
async function buscarPacientePorDni(dni) {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}?dni=${encodeURIComponent(dni)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Paciente no encontrado");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error al buscar paciente por DNI:", error);
    mostrarError(error.message || "Error al buscar el paciente por DNI");
    throw error;
  }
}

// Actualiza los datos de un paciente existente
// idPaciente - ID del paciente a actualizar
// datosActualizados - Objeto con los campos a actualizar
// Retorna true si la actualización fue exitosa
async function actualizarPaciente(idPaciente, datosActualizados) {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    const response = await fetch(`${API_BASE_URL}${idPaciente}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datosActualizados),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar el paciente");
    }

    mostrarExito("Paciente actualizado exitosamente");
    return true;
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    mostrarError(error.message || "Error al actualizar el paciente");
    throw error;
  }
}

// Elimina un paciente por su ID
// idPaciente - ID del paciente a eliminar
// Retorna true si la eliminación fue exitosa
async function eliminarPaciente(idPaciente) {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    const confirmacion = confirm(
      "¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer."
    );
    if (!confirmacion) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}${idPaciente}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al eliminar el paciente");
    }

    mostrarExito("Paciente eliminado exitosamente");
    return true;
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    mostrarError(error.message || "Error al eliminar el paciente");
    throw error;
  }
}

// Obtiene una lista paginada de pacientes
// pagina - Número de página a cargar (por defecto 0)
// Retorna un objeto con la lista de pacientes y metadatos de paginación
async function listarPacientes(pagina = 0) {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    const response = await fetch(`${API_BASE_URL}list?page=${pagina}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al cargar la lista de pacientes");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al listar pacientes:", error);
    mostrarError(error.message || "Error al cargar la lista de pacientes");
    throw error;
  }
}

// Busca pacientes por apellido con paginación
// apellido - Apellido o parte del apellido a buscar
// pagina - Número de página a cargar (por defecto 0)
// Retorna un objeto con la lista de pacientes encontrados y metadatos de paginación
async function buscarPacientesPorApellido(apellido, pagina = 0) {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    if (!apellido || typeof apellido !== "string" || apellido.trim() === "") {
      throw new Error("El apellido de búsqueda no puede estar vacío");
    }

    const response = await fetch(
      `${API_BASE_URL}list/?lastName=${encodeURIComponent(
        apellido
      )}&page=${pagina}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Error al buscar pacientes por apellido"
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al buscar pacientes por apellido:", error);
    mostrarError(error.message || "Error al buscar pacientes por apellido");
    throw error;
  }
}

// Exporta la lista de pacientes a un archivo Excel
// Retorna true si la exportación fue exitosa
async function exportarPacientesAExcel() {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      throw new Error(
        "No se encontró el token de autenticación. Por favor, inicie sesión nuevamente."
      );
    }

    // Mostrar indicador de carga
    const btnExportar = document.getElementById("btn-exportar-excel");
    const btnOriginalText = btnExportar?.innerHTML;
    if (btnExportar) {
      btnExportar.disabled = true;
      btnExportar.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exportando...';
    }

    const response = await fetch(`${API_BASE_URL}export/excel`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al exportar pacientes a Excel");
    }

    // Crear un enlace para descargar el archivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacientes_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    mostrarExito("Exportación a Excel completada exitosamente");
    return true;
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    mostrarError(error.message || "Error al exportar pacientes a Excel");
    throw error;
  } finally {
    // Restaurar el botón de exportar
    const btnExportar = document.getElementById("btn-exportar-excel");
    if (btnExportar) {
      btnExportar.disabled = false;
      btnExportar.innerHTML = btnOriginalText || "Exportar a Excel";
    }
  }
}

/**
 * Maneja el envío del formulario de paciente
 * @param {Event} event - Evento de envío del formulario
 */
async function manejarEnvioFormulario(event) {
  event.preventDefault();

  const form = event.target;
  const btnSubmit = form.querySelector('button[type="submit"]');
  const btnOriginalText = btnSubmit?.innerHTML;

  try {
    // Mostrar indicador de carga
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    }

    const formData = new FormData(form);
    const datosPaciente = Object.fromEntries(formData.entries());
    const datosMapeados = mapearDatosFormulario(datosPaciente);

    if (datosPaciente.idPaciente) {
      await actualizarPaciente(datosPaciente.idPaciente, datosMapeados);
      mostrarExito("Paciente actualizado correctamente");
    } else {
      await crearPaciente(datosMapeados);
      mostrarExito("Paciente creado correctamente");
    }

    // Recargar la tabla de pacientes si existe la función
    if (typeof cargarPacientes === "function") {
      await cargarPacientes();
    }

    // Limpiar el formulario
    form.reset();

    // Si hay un campo oculto para el ID, limpiarlo (para nuevos registros)
    const idPacienteInput = form.querySelector('[name="idPaciente"]');
    if (idPacienteInput) {
      idPacienteInput.value = "";
    }
  } catch (error) {
    console.error("Error al guardar el paciente:", error);
    mostrarError(error.message || "Error al guardar el paciente");
    throw error; // Relanzar el error para que pueda ser manejado por el llamador si es necesario
  } finally {
    // Restaurar el botón
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = btnOriginalText || "Guardar";
    }
  }
}

//Inicializa la tabla de pacientes usando DataTables Instancia de DataTable
function inicializarTablaPacientes() {
  const token = localStorage.getItem(AUTH_KEYS.TOKEN);
  if (!token) {
    mostrarError("No se encontró el token de autenticación");
    return null;
  }

  return $("#tablaPacientes").DataTable({
    ajax: {
      url: `${API_BASE_URL}list?page=0`,
      dataSrc: "data",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      error: function (xhr, error, thrown) {
        console.error("Error al cargar datos:", error);
        mostrarError("Error al cargar la lista de pacientes");
      },
    },
    columns: [
      { data: "id_patient" },
      { data: "first_name" },
      { data: "last_name" },
      { data: "dni" },
      {
        data: "birthdate",
        render: function (data) {
          return data ? new Date(data).toLocaleDateString() : "";
        },
      },
      { data: "age" },
      { data: "email" },
      { data: "phone" },
      { data: "cell_phone" },
      { data: "address" },
      {
        data: "gender",
        render: function (data) {
          return data === "M" ? "Femenino" : "Masculino";
        },
      },
      { data: "antecedent" },
      {
        data: null,
        orderable: false,
        render: function (data) {
          return `
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-primary btn-editar" data-id="${data.id_patient}" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${data.id_patient}" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
        },
      },
    ],
    language: {
      url: "//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json",
    },
    responsive: true,
    autoWidth: false,
    pageLength: 10,
    order: [[0, "desc"]],
  });
}

// 5. EVENTOS Y ASIGNACIONES GLOBALES
// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }

  // Cargar el sidebar
  await cargarSidebar();

  // Configurar el nombre de usuario en el sidebar si existe
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
      limpiarSesion();
      window.location.href = "Login.html";
    });
  }

  // Inicializar la tabla de pacientes si existe
  if (typeof inicializarTablaPacientes === "function") {
    await inicializarTablaPacientes();
  }
});

// Hacer que las funciones estén disponibles globalmente
window.buscarPacientePorDni = buscarPacientePorDni;
window.crearPaciente = crearPaciente;
window.obtenerPacientePorId = obtenerPacientePorId;
window.actualizarPaciente = actualizarPaciente;
window.eliminarPaciente = eliminarPaciente;
window.listarPacientes = listarPacientes;
window.buscarPacientesPorApellido = buscarPacientesPorApellido;
window.exportarPacientesAExcel = exportarPacientesAExcel;
window.manejarEnvioFormulario = manejarEnvioFormulario;
