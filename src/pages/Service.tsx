import React, { useState } from "react";
import { Card, Button, Form, Table, InputGroup, Dropdown } from "react-bootstrap";
import { FaUserMd, FaUserMinus, FaHouseUser } from "react-icons/fa";

const especialidadesLista = [
  "Cardiologia",
  "Obstetricia",
  "Pediatria",
  "Odontologia",
];

const Service: React.FC = () => {
  const [form, setForm] = useState({
    nombre: "",
    especialidad: "",
    costo: "",
  });

  const [servicios, setServicios] = useState<any[]>([
    {
      id: 1,
      nombre: "Nombre 1",
      especialidad: "Cardiologia",
      costo: "$1.20",
    },
    {
      id: 2,
      nombre: "Nombre 2",
      especialidad: "Obstetricia",
      costo: "$1.20",
    },
    {
      id: 3,
      nombre: "Nombre 3",
      especialidad: "Pediatria",
      costo: "$1.20",
    },
    {
      id: 4,
      nombre: "Nombre 3",
      especialidad: "Odontologia",
      costo: "$1.20",
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServicios([...servicios, { ...form, id: servicios.length + 1 }]);
    setForm({ nombre: "", especialidad: "", costo: "" });
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* INICIO MODIFICACIÓN: Sidebar vertical */}
      <nav
        className="border-end"
        style={{
          backgroundColor: "#58a2eb",
          width: 220,
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
        }}
      >
        <div className="p-3">
          <h4 className="mb-4 text-primary">
            <FaUserMd className="me-2" />
            Menú
          </h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <a className="nav-link text-dark" href="#">
                <span className="me-2">🏠</span>Dashboard
              </a>
            </li>
            <li className="nav-item mb-2">
              <a className="nav-link active text-primary" href="/doctor">
                <FaUserMd className="me-2" />
                Doctor
              </a>
            </li>
            <li className="nav-item mb-2">
              <a className="nav-link text-dark" href="/doctor">
                <FaUserMinus className="me-2" />
                Paciente
              </a>
            </li>
            <li className="nav-item mb-2">
              <a className="nav-link text-dark" href="#">
                <FaHouseUser className="me-2" />
                Citas
              </a>
            </li>
            <li className="nav-item mb-2">
              <a className="nav-link text-dark" href="#">
                <span className="me-2">💉</span>Recetas
              </a>
            </li>
            <li className="nav-item mb-2">
              <a className="nav-link text-dark" href="#">
                <span className="me-2">📋</span>Gestion
              </a>
            </li>
            <li className="nav-item mb-2">
              <a className="nav-link text-dark" href="/specialty">
                <span className="me-2">⚙️</span>Especialidad
              </a>
            </li>
            <li className="nav-item mb-2">
              <a className="nav-link text-dark" href="/service">
                <span className="me-2">⚙️</span>Servicio
              </a>
            </li>
          </ul>
        </div>
      </nav>
      {/* Contenido principal */}
      <div style={{ marginLeft: 220, width: "90%" }}>
        <div className="container-fluid" style={{ marginTop: 30 }}>
          <h2 className="mb-4">Datos de Servicio</h2>
          <div className="d-flex justify-content-between">
            {/* Formulario */}
            <Card style={{ width: 420, marginTop: 20 }}>
              <Card.Body>
                <h4 className="text-center mb-4">Servicio</h4>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <InputGroup>
                      <InputGroup.Text>
                        <FaUserMd />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Nombre"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <InputGroup>
                      <InputGroup.Text>
                        <FaUserMd />
                      </InputGroup.Text>
                      <Form.Control
                        as="select"
                        name="especialidad"
                        value={form.especialidad}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Especialidad</option>
                        {especialidadesLista.map((esp) => (
                          <option key={esp} value={esp}>
                            {esp}
                          </option>
                        ))}
                      </Form.Control>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <InputGroup>
                      <InputGroup.Text>S/.</InputGroup.Text>
                      <Form.Control
                        placeholder="Costo"
                        name="costo"
                        value={form.costo}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                  <div className="d-flex justify-content-center">
                    <Button variant="primary" type="submit">
                      Guardar
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            {/* Tabla centrada */}
            <div className="d-flex justify-content-center mt-4">
              <Table
                striped
                bordered
                hover
                style={{ minWidth: 800, maxWidth: 800 }}
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Costo</th>
                    <th style={{width:80}}>Acccion</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        No hay servicios registrados.
                      </td>
                    </tr>
                  ) : (
                    servicios.map((serv) => (
                      <tr key={serv.id}>
                        <td>{serv.id}</td>
                        <td>{serv.nombre}</td>
                        <td>{serv.especialidad}</td>
                        <td>{serv.costo}</td>
                        <td>
                            <td style={{ width: 80 , textAlign: "center" }}>
                          <Dropdown>
                            <Dropdown.Toggle variant="secondary" size="sm">
                              <span
                                style={{ fontSize: "1.5rem", lineHeight: 0 }}
                              >
                                ⋮
                              </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => {
                                  /* lógica para editar */
                                }}
                              >
                                Editar
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => {
                                  /* lógica para eliminar */
                                }}
                              >
                                Eliminar
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                            </td>
                       </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
