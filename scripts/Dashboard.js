import { Calendar } from "@fullcalendar/core";
import LocaleEs from "@fullcalendar/core/locales/es";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

const container = document.querySelector(".calendar-container");

const calendar = new Calendar(container, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: "dayGridMonth",
    locale: LocaleEs,
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
    },
    events: [
        {
            id: "1",
            title: "Cita con el doctor",
            start: "2025-06-04T10:00:00",
            end: "2025-06-04T11:00:00",
        },
        {
            id: "2",
            title: "Revisión anual",
            start: "2025-06-05T14:00:00",
            end: "2025-06-05T15:00:00",
        },
        {
            id: "3",
            title: "Consulta de seguimiento",
            start: "2025-06-02T09:00:00",
            end: "2025-06-02T10:00:00",
        }
    ],
    selectable: true,
    eventClick: (data) => {
        // Aquí puedes manejar el evento al hacer clic en un evento del calendario
        // Por ejemplo, mostrar un mensaje o redirigir a otra página
        console.log(data.event.title);
    },
    select: (info) => {
        // Formatea la fecha seleccionada
        const fecha = new Date(info.startStr);
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' };
        const fechaTexto = fecha.toLocaleDateString('es-ES', opciones);

        // Si hay hora de inicio y fin
        let horaTexto = '';
        if (info.start && info.end) {
            const horaInicio = info.start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const horaFin = info.end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            horaTexto = `${horaInicio} a ${horaFin}`;
        }

        // Muestra la fecha en el modal
        document.getElementById('fechaSeleccionada').innerHTML =
            `<strong>${fechaTexto}</strong><br>${horaTexto}`;

        // Abre el modal con Bootstrap 5
        const modal = new bootstrap.Modal(document.getElementById('modalCita'));
        modal.show();
    },
});

calendar.render();



