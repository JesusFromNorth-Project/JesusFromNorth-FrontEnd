import React, { useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Table,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import { FaUserMd, FaUserMinus, FaHouseUser } from "react-icons/fa";

const Specialty: React.FC = () => {
  const [form, setForm] = useState({
    nombre: "",
    especialidad: "",
  });

  const [especialidades, setEspecialidades] = useState<any[]>([
    { id: 1, nombre: "Nombre 1", especialidad: "Cardiologia" },
    { id: 2, nombre: "Nombre 2", especialidad: "Obstetricia" },
    { id: 3, nombre: "Nombre 3", especialidad: "Pediatria" },
    { id: 4, nombre: "Nombre 3", especialidad: "Odontologia" },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEspecialidades([
      ...especialidades,
      { ...form, id: especialidades.length + 1 },
    ]);
    setForm({ nombre: "", especialidad: "" });
  };

  return (
    // INICIO MODIFICACIÓN: Contenedor flex para sidebar y contenido principal
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
      <div style={{ marginLeft: 220, width: "80%" }}>
        <div className="container-fluid" style={{ marginTop: 30 }}>
          <h2 className="mb-4">Datos de la Especialidad</h2>
          <div className="d-flex justify-content-between">
            {/* Formulario */}
            <Card style={{ width: 450, marginBottom: 30 }}>
              <Card.Body>
                <h4 className="text-center mb-5">Especialidad</h4>
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
                  <Form.Group className="mb-5">
                    <InputGroup>
                      <InputGroup.Text>
                        <FaUserMd />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Especialidad"
                        name="especialidad"
                        value={form.especialidad}
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
            {/* Tabla */}
            <div className="d-flex justify-content-center">
              <Table bordered hover style={{ minWidth: 500 }}>
                <thead>
                  <tr className="table-secondary">
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    {/* INICIO MODIFICACIÓN: Columna de acción */}
                   <th style={{width:80}}>Acccion</th>
                    {/* FIN MODIFICACIÓN */}
                  </tr>
                </thead>
                <tbody>
                  {especialidades.map((esp) => (
                    <tr key={esp.id}>
                      <td>{esp.id}</td>
                      <td>{esp.nombre}</td>
                      <td>{esp.especialidad}</td>
                      {/* INICIO MODIFICACIÓN: Botón de tres puntos con menú */}
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
                      {/* FIN MODIFICACIÓN */}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Specialty;
