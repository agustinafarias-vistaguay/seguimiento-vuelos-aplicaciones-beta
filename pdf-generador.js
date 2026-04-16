// pdf-generador.js

async function generatePDF(flight, pilot) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    const isSiembra = flight.Especie ? true : false;
    const titleStr = isSiembra ? "ORDEN DE TRABAJO - SIEMBRA" : "ORDEN DE TRABAJO - PULVERIZACIÓN";
    const typeColor = isSiembra ? [16, 185, 129] : [59, 130, 246]; // Verde para Siembra, Azul para Pulve

    // 1. Título y Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(typeColor[0], typeColor[1], typeColor[2]);
    doc.text("VISTAGUAY", margin, y);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(titleStr, 120, y - 2);

    y += 10;
    doc.setDrawColor(typeColor[0], typeColor[1], typeColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);

    // Función auxiliar para formatear la fecha
    function formatPdfDate(dateStr) {
        if (!dateStr) return 'N/A';
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    }

    // 2. Datos Generales de Operación (ELIMINAMOS EL ID DE MISION AQUÍ)
    y += 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DATOS DE LA OPERACIÓN:", margin, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    const infoGeneral = [
        ["Productor:", flight.Empresa || 'N/A'],
        ["Fecha Deseada:", formatPdfDate(flight.Fecha_Aplicacion) || 'N/A'],
        ["Localidad:", flight.Localidad_Texto || 'N/A'],
        ["Contacto:", flight.Contacto || 'N/A'],
        ["Hectáreas:", `${flight.Hectareas || '0'} Ha`],
        ["Cultivo:", flight.Cultivo || 'N/A'],
        ["Obstáculos:", flight.Obstaculos || 'Ninguno']
    ];

    infoGeneral.forEach(row => {
        doc.setFont("helvetica", "bold");
        doc.text(row[0], margin, y);
        doc.setFont("helvetica", "normal");
        const textVal = doc.splitTextToSize(row[1], 100);
        doc.text(textVal, margin + 40, y);
        y += (textVal.length * 5) + 2;
    });

    // 3. Receta Técnica Dinámica
    y += 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(isSiembra ? "RECETA TÉCNICA:" : "ESPECIFICACIONES DEL TRATAMIENTO:", margin, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    let infoTecnica = [];

    if (isSiembra) {
        infoTecnica = [
            ["Especie:", flight.Especie || 'N/A'],
            ["Dosis:", `${flight.Kg_Ha || '0'} kg/ha`],
            ["Presentación:", flight.Presentacion || 'N/A']
        ];
    } else {
        infoTecnica = [
            ["Tipo Pulverización:", flight["Tipo de Pulverización"] || 'N/A'],
            ["Tratamiento:", flight["Tipo de Tratamiento"] || 'N/A'],
            ["Momento Aplic.:", flight["Momento de Aplicación"] || 'N/A'],
            ["Cant. Productos:", flight["Cantidad de Productos"] || 'N/A'],
            ["Prescripción:", flight["Prescripción"] || 'N/A'],
            ["Agua Disp.:", flight["Disponibilidad de Agua"] || 'N/A'],
            ["Corrector:", flight["Provee Corrector"] || 'N/A'],
            ["Cult. Vecinos:", flight["Cultivos Vecinos"] || 'N/A']
        ];
    }

    infoTecnica.forEach(row => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(row[0], margin, y);
        doc.setFont("helvetica", "normal");
        const textVal = doc.splitTextToSize(row[1], 100);
        doc.text(textVal, margin + 45, y);
        y += (textVal.length * 5) + 2;
    });

    // 4. Datos del Piloto
    y += 5;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PILOTO ASIGNADO:", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${pilot.Nombre || ''} ${pilot.Apellido || ''}`, margin, y);
    y += 7;
    doc.text(`Email: ${pilot.email_piloto || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Celular: ${pilot.celular || pilot.Celular || 'N/A'}`, margin, y);

    // 5. Botón a Google Maps (USAMOS EL LINK DIRECTO DEL JSON AQUÍ)
    y += 15;
    if (flight.Google_Maps_Link && y < 270) {
        const mapUrl = flight.Google_Maps_Link;

        doc.setFillColor(37, 99, 235); // Azul Maps
        doc.roundedRect(margin, y, 80, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("IR A LA UBICACIÓN (MAPS)", margin + 12, y + 7.5);
        doc.link(margin, y, 80, 12, { url: mapUrl });
        y += 20;
    }

    // Pie de página
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.text("Por favor, notificar a Vistaguay una vez finalizada la labor.", margin, y);

    // Descargar el archivo
    doc.save(`Orden_${flight.ID || 'Vuelo'}.pdf`);
}