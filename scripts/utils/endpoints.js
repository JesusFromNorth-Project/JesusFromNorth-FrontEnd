const endpoints = (IP="localhost:5080") => {
    const url = `http://${IP}/system_clinic/api/v0.1/`;
    return {
        service:{
            save: (id_specialty) => url+`service/save/assignSpecialty/${id_specialty}`
        },
        specialty:{
            save: url+"specialty/",
            delete:(id_specialty) => url+`specialty/${id_specialty}`,
            getList:url+"specialty/list",
            getSpecialtyByName:(name) => url+`specialty/name/${name}`,
            getSpecialtyWithSpecialtyById:(id_specialty) => url+`specialty/${id_specialty}/services` 
        },
        doctor: {
            saveWithUsername: (adminId, specialtyId) => url + `doctor/save/assignAdmin/${adminId}/assignSpecialty/${specialtyId}`,
            save: (adminId, specialtyId) => url + `doctor/${adminId}/${specialtyId}`,
            getById: (doctorId) => url + `doctor/${doctorId}`,
            getAll: (page) => url + `doctor/list?page=${page}`,
            getBySpecialty: (specialtyId, page) => url + `doctor/list/${specialtyId}?page=${page}`,
            update: (doctorId) => url + `doctor/${doctorId}`,
            delete: (doctorId) => url + `doctor/${doctorId}`,
            getByCMP: (cmp) => url + `doctor/getCMP?cmp=${cmp}`,
            getByDNI: (dni) => url + `doctor/getDNI?dni=${dni}`,
            exportExcel: url + `doctor/export/excel`
        }
    }
}
export default endpoints;


