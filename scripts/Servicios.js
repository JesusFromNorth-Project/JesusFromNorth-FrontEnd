const form = document.getElementById("formServicio");
const tabla = document.querySelector("#tablaServicios tbody");
let id = 4;

const servicios = [
	{ id: 1, nombre: "Nombre 1", especialidad: "Cardiología", costo: "S/1.20" },
	{ id: 2, nombre: "Nombre 2", especialidad: "Obstetricia", costo: "S/1.20" },
	{ id: 3, nombre: "Nombre 3", especialidad: "Pediatría", costo: "S/1.20" },
	{ id: 4, nombre: "Nombre 4", especialidad: "Odontología", costo: "S/1.20" },
];

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

form.addEventListener("submit", function (e) {
	e.preventDefault();
	const data = new FormData(form);
	const nuevoServicio = {
		id: ++id,
		nombre: data.get("nombre"),
		especialidad: data.get("especialidad"),
		costo: `S/${data.get("costo")}`,
	};
	servicios.push(nuevoServicio);
	form.reset();
	renderServicios();
});

renderServicios();
