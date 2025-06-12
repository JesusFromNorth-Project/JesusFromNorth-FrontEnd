// Claves para el almacenamiento local
const AUTH_KEYS = {
  TOKEN: "jwtToken",
  USER_ID: "adminId",
  USERNAME: "adminName",
  ROLE: "role",
};

//Verifica si el usuario está autenticadotrue si está autenticado, false en caso contrario
function verificarAutenticacion() {
  const token = localStorage.getItem(AUTH_KEYS.TOKEN);
  const userId = localStorage.getItem(AUTH_KEYS.USER_ID);

  if (!token || !userId) {
    limpiarSesion();
    window.location.href = "../pages/Login.html";
    return false;
  }

  return true;
}

//Limpia todos los datos de autenticación
function limpiarSesion() {
  Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
}

export { verificarAutenticacion, limpiarSesion, AUTH_KEYS };
