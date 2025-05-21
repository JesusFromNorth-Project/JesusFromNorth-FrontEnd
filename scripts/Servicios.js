const form = document.getElementById("formServicio");
const tabla = document.querySelector("#tablaServicios tbody");
let id = 4;

const servicios = [
	{ id: 1, nombre: "Nombre 1", especialidad: "Cardiología", costo: "S/1.20" },
	{ id: 2, nombre: "Nombre 2", especialidad: "Obstetricia", costo: "S/1.20" },
	{ id: 3, nombre: "Nombre 3", especialidad: "Pediatría", costo: "S/1.20" },
	{ id: 4, nombre: "Nombre 4", especialidad: "Odontología", costo: "S/1.20" },
];

const servicioApiUrl = "http://localhost:8080/service/";
const servicioListUrl = "http://localhost:8080/service/list";

function renderServicios() {
	tabla.innerHTML = "";
	servicios.forEach((s) => {
		const row = document.createElement("tr");
		row.innerHTML = `
			<td>${s.id}</td>
			<td>${s.nombre}</td>
			<td>${s.especialidad}</td>
			<td>${s.costo}</td>
			<td class="text-center">
				<div class="dropdown">
					<button class="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">⋮</button>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="#">Editar</a></li>
						<li><a class="dropdown-item" href="#">Eliminar</a></li>
					</ul>
				</div>
			</td>
		`;
		tabla.appendChild(row);
	});
}

window.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("formServicio");
	form.addEventListener("submit", async function (e) {
		e.preventDefault();
		const nombre = this.nombre.value;
		const especialidad = this.especialidad.value;
		const costo = this.costo.value;
		if (!nombre || !especialidad || !costo) {
			alert("Completa todos los campos");
			return;
		}
		const body = {
			service_name: nombre,
			price: parseFloat(costo),
			id_specialty: especialidad,
		};
		try {
			const res = await fetch(servicioApiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (res.ok) {
				alert("Servicio guardado exitosamente");
				this.reset();
				// Recargar tabla después de guardar
				renderServicios();
			} else {
				const data = await res.json();
				alert(data.message || "Error al guardar servicio");
			}
		} catch (error) {
			alert("Error de conexión con el servidor");
		}
	});
});

renderServicios();
