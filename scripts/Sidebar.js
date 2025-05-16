window.addEventListener("DOMContentLoaded", function () {
	const logout = document.getElementById("logout-link");
	if (logout) {
		logout.addEventListener("click", function (e) {
			e.preventDefault();
			window.location.href = "../pages/Login.html";
		});
	}
});
