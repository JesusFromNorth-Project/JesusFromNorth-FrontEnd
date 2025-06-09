const url = "http://localhost:8080/system_clinic/api/v0.1";

// Esperar a que el DOM esté listo
window.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("loginForm");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = form.username.value;
		const password = form.password.value;
		try {
			const endpoint = "/auth/login";
			const session = {
				username: username,
				password: password,
			};
			const res = await fetch(url + endpoint, {
				method: "post",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(session),
			});
			if (res.ok) {
				// Guardar el nombre de usuario en localStorage para mostrarlo en el sidebar
				const data = await res.json();
				// Guardar el token JWT
				localStorage.setItem("adminId", data.token);
				localStorage.setItem("role", data.role);
				localStorage.setItem("adminName", username);
				window.location.href = "Dashboard.html";
			} else {
				const data = await res.json();
				alert(data.message || "Credenciales incorrectas");
			}
		} catch (error) {
			alert("Error de conexión con el servidor");
		}
	});
});

/*
//get
const endpointGET = async () => {
	try {
		const endpoint = "list";
		const res = await fetch(http://localhost:8080/customer/${endpoint});
		const data = await res.json();
		console.log(data);
	} catch (error) {
	 	console.log(error);
	}
}
	
endpointGET();


//post
const endpointPOST = async () => {
	try {
		const endpoint = "/";
		const jsonPersona = {
			"nombre":"pedro",
			"apellido":"perales",
			"campo":"seguridad"
		}
		
		const res = await fetch(http://localhost:8080/customer${endpoint},{
		method:'post',
		headers:{"Content-Type": "application/json"},
		body:JSON.stringify(jsonPersona)
	});
		const data = await res.text();
		console.log(data);
	
	} catch (error) {
	 	console.log(error);
		}
	}

*/
