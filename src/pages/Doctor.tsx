import React, { useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Table,
  InputGroup,
} from "react-bootstrap";
import {
  FaUserMd,
  FaIdBadge,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaAddressCard,
} from "react-icons/fa";
import { ContentHeader } from "@components";

const Doctor = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cmp: "",
    correo: "",
    telefono: "",
    especialidad: "",
  });

  const [doctores, setDoctores] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctores([...doctores, { ...form, id: doctores.length + 1 }]);
    setForm({
      nombre: "",
      apellido: "",
      cmp: "",
      correo: "",
      telefono: "",
      especialidad: "",
    });
  };

  return (
    <div>
      <ContentHeader title="Gestión de Doctores" />
      <section className="content">
        <div className="container-fluid">
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaUserMd className="me-2" />
              <span>Datos del Doctor</span>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaUser />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Nombre"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaAddressCard />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Apellido(s)"
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaIdBadge />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="CMP"
                        name="cmp"
                        value={form.cmp}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Correo"
                        name="correo"
                        value={form.correo}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaPhone />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Teléfono"
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
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
                  </Col>
                </Row>
                <div className="text-end">
                  <Button type="submit" variant="primary">
                    Guardar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <div className="mb-2 d-flex align-items-center" style={{ gap: "2rem" }}>
            <h5 className="mb-0 me-4">Buscar Doctor</h5>
            <div className="d-flex align-items-center me-5">
              <Form.Control style={{ width: 120 }} size="sm" type="text" placeholder="CMP" />
              <Button size="sm" variant="primary" className="ms-3">
                Buscar
              </Button>
            </div>
            <div className="d-flex align-items-center">
              <Form.Control style={{ width: 140 }} size="sm" type="text" placeholder="Nombre" />
              <Button size="sm" variant="primary" className="ms-3">
                Buscar
              </Button>
            </div>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>CMP</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Especialidad</th>
              </tr>
            </thead>
            <tbody>
              {doctores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    No hay doctores registrados.
                  </td>
                </tr>
              ) : (
                doctores.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.nombre}</td>
                    <td>{doc.apellido}</td>
                    <td>{doc.cmp}</td>
                    <td>{doc.correo}</td>
                    <td>{doc.telefono}</td>
                    <td>{doc.especialidad}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default Doctor;
