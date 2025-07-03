import { verificarAutenticacion } from "/scripts/utils/auth.js";

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  if (!verificarAutenticacion()) {
    return;
  }

  // Cargar el sidebar
  await cargarSidebar();

  // Configurar el nombre de usuario en el sidebar si existe
  const adminName = localStorage.getItem("adminName");
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
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminName");
      window.location.href = "/pages/Login.html";
    });
  }
});

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo = "danger") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
  alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document
    .querySelector(".main")
    ?.insertAdjacentElement("afterbegin", alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

function mostrarError(mensaje) {
  mostrarMensaje(mensaje, "danger");
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
// Cuando se presiona el botón "Añadir" en el modal de receta
document.getElementById('btnAnadirReceta').addEventListener('click', function() {
  // Cierra el modal de receta
  const recetaModal = bootstrap.Modal.getInstance(document.getElementById('modalReceta'));
  recetaModal.hide();

  // Abre el modal de resumen
  const resumenModal = new bootstrap.Modal(document.getElementById('modalResumenReceta'));
  resumenModal.show();
});

// Guardar medicamentos en un array temporal
let medicamentos = [];

// Al guardar un medicamento
document.getElementById('formReceta').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nombre: form.medicamento.options[form.medicamento.selectedIndex].text,
    dose: form.dose.value,
    frequency: form.frequency.value,
    duration: form.duration.value,
    format: form.medicationFormat.value
  };
  medicamentos.push(data);

  // Mostrar medicamentos ingresados arriba del formulario
  mostrarMedicamentosIngresados();

  // Limpiar formulario
  form.reset();
});

// Mostrar medicamentos ingresados arriba del formulario
function mostrarMedicamentosIngresados() {
  const cont = document.getElementById('medicamentosIngresados');
  cont.innerHTML = medicamentos.map((m, i) => `
    <div class="input-group mb-2">
      <input type="text" class="form-control" value="${m.nombre} Ingresado" readonly>
      <button type="button" class="btn btn-outline-secondary" title="Ver detalles" onclick="verDetalleMedicamento(${i})">
        <i class="fa fa-eye"></i>
      </button>
      <button type="button" class="btn btn-outline-danger" title="Eliminar" onclick="eliminarMedicamento(${i})">
        <i class="fa fa-minus"></i>
      </button>
    </div>
  `).join('');
}

// Eliminar medicamento
function eliminarMedicamento(idx) {
  medicamentos.splice(idx, 1);
  mostrarMedicamentosIngresados();
}

// Ver detalle (puedes personalizar)
function verDetalleMedicamento(idx) {
  alert(JSON.stringify(medicamentos[idx], null, 2));
}

// Al presionar "Añadir", mostrar resumen
document.getElementById('btnAnadirReceta').addEventListener('click', function() {
  // Llenar el resumen
  const lista = document.getElementById('listaMedicamentosResumen');
  lista.innerHTML = medicamentos.map(m => `
    <li class="list-group-item d-flex justify-content-between align-items-center rounded-3 mb-2">
      <span>
        <i class="fa fa-capsules me-2 text-success"></i>
        <strong>${m.nombre}</strong> - ${m.dose}, ${m.frequency}, ${m.duration}, ${m.format}
      </span>
    </li>
  `).join('');
  // Mostrar modal resumen
  const modalReceta = bootstrap.Modal.getInstance(document.getElementById('modalReceta'));
  modalReceta.hide();
  const modalResumen = new bootstrap.Modal(document.getElementById('modalResumenReceta'));
  modalResumen.show();
});

// Añadir otro medicamento desde el resumen
document.getElementById('btnAgregarOtroMedicamento').addEventListener('click', function() {
  const modalResumen = bootstrap.Modal.getInstance(document.getElementById('modalResumenReceta'));
  modalResumen.hide();
  const modalReceta = new bootstrap.Modal(document.getElementById('modalReceta'));
  modalReceta.show();
});
