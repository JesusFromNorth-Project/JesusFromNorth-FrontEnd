window.addEventListener("DOMContentLoaded", function () {
	// Mostrar nombre de usuario si está en localStorage
	const userDiv = document.getElementById("sidebar-user");
	const adminName = localStorage.getItem("adminName");
	if (userDiv && adminName) {
		userDiv.textContent = `👤 ${adminName}`;
	}

	const logout = document.getElementById("logout-link");
	if (logout) {
		logout.addEventListener("click", function (e) {
			e.preventDefault();
			// Limpiar storage/cookies si es necesario
			localStorage.removeItem("adminName");
			window.location.href = "../pages/Login.html";
		});
	}
});
