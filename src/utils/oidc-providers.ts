const API_BASE_URL = 'http://localhost:8080/system_clinic/api/v0.1';

export const authLogin = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error en la autenticación');
    }

    const data = await response.json();

    localStorage.setItem('authentication', JSON.stringify(data));

    return data;
  } catch (error) {
    throw new Error('Credenciales incorrectas o error de red');
  }
};

export const getAuthStatus = async () => {
  try {
    const auth = localStorage.getItem('authentication');
    if (auth) {
      return JSON.parse(auth);
    }
    return undefined;
  } catch {
    return undefined;
  }
};

export const logout = () => {
  localStorage.removeItem('authentication');
};
