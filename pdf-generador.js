// pdf-generador.js

const loadBrandImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar el logo'));
    img.src = url;
});

async function generatePDF(flight, pilot) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    const isSiembra = flight.Especie ? true : false;
    const titleStr = isSiembra ? "ORDEN DE TRABAJO - SIEMBRA" : "ORDEN DE TRABAJO - PULVERIZACIÓN";
    const brandColor = [16, 185, 129]; // Verde Vistaguay

    // --- FUNCIONES AUXILIARES ---
    function formatPdfDate(dateStr) {
        if (!dateStr) return 'N/A';
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    }

    function checkPageAdd(increment) {
        if (y + increment > 275) {
            doc.addPage();
            y = 20;
        }
    }

    // --- ENCABEZADO Y LOGO ---
    try {
        const logoImg = await loadBrandImage('images/logo-horizontal-verdeynegro.png');
        const desiredWidth = 45;
        const aspectRatio = logoImg.height / logoImg.width;
        const calculatedHeight = desiredWidth * aspectRatio;
        doc.addImage(logoImg, 'PNG', margin, y - (calculatedHeight / 2) - 4, desiredWidth, calculatedHeight);
    } catch (e) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.text("VISTAGUAY", margin, y);
    }

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(titleStr, 120, y - 2);

    y += 10;
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);

    // --- 1. DESCRIPCIÓN INICIAL ---
    y += 10;
    doc.setFillColor(240, 253, 244); // Fondo verde muy clarito
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.roundedRect(margin, y, 170, 16, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(0, 0, 0);
    doc.text("Recuerde comunicarse con la otra parte para ultimar detalles como entrega de", margin + 5, y + 6);
    doc.text("insumos, entrada al lote, ubicación de obstáculos, etc.", margin + 5, y + 11);

    // --- 2. DATOS DEL CONTRATO ---
    y += 30;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("DATOS DEL CONTRATO", margin, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Formateamos los números para que se vean prolijos
    const precioHa = pilot.precio_ha ? parseFloat(pilot.precio_ha).toLocaleString('es-AR') : '0';
    const valContrato = pilot.total_oferta ? parseFloat(pilot.total_oferta).toLocaleString('es-AR') : '0';

    const infoContrato = [
        ["Ubicación del lote:", flight.Localidad_Texto || 'N/A'],
        ["Fecha deseada:", formatPdfDate(flight.Fecha_Aplicacion) || 'N/A'],
        ["Hectáreas totales:", `${flight.Hectareas || flight["Hectáreas"] || '0'} Ha`],
        ["Precio por hectárea:", `$${precioHa}`],
        ["Valor total de contrato:", `$${valContrato} + impuestos`]
    ];

    infoContrato.forEach(row => {
        checkPageAdd(10);
        doc.setFont("helvetica", "bold");
        doc.text(row[0], margin, y);
        doc.setFont("helvetica", "normal");
        const textVal = doc.splitTextToSize(row[1], 110);
        doc.text(textVal, margin + 45, y);
        y += (textVal.length * 6);
    });

    // --- 3. DATOS DE LA OPERACIÓN ---
    y += 5;
    checkPageAdd(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("DATOS DE LA OPERACIÓN", margin, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let infoOperacion = [
        ["Cultivo objetivo:", flight.Cultivo || 'N/A'],
        ["Obstáculos detectados:", flight.Obstaculos || 'Ninguno']
    ];

    if (isSiembra) {
        infoOperacion.push(
            ["Especie:", flight.Especie || 'N/A'],
            ["Dosis:", `${flight.Kg_Ha || '0'} kg/ha`],
            ["Presentación:", flight.Presentacion || flight.Presentación || 'N/A']
        );
    } else {
        infoOperacion.push(
            ["Tipo Pulverización:", flight["Tipo de Pulverización"] || 'N/A'],
            ["Tratamiento:", flight["Tipo de Tratamiento"] || 'N/A'],
            ["Momento Aplic.:", flight["Momento de Aplicación"] || 'N/A'],
            ["Cant. Productos:", flight["Cantidad de Productos"] || 'N/A'],
            ["Agua Disponible:", flight["Disponibilidad de Agua"] || 'N/A'],
            ["Provee Corrector:", flight["Provee Corrector"] || 'N/A'],
            ["Cultivos Vecinos:", flight["Cultivos Vecinos"] || 'Ninguno']
        );
    }

    infoOperacion.forEach(row => {
        checkPageAdd(10);
        doc.setFont("helvetica", "bold");
        doc.text(row[0], margin, y);
        doc.setFont("helvetica", "normal");
        const textVal = doc.splitTextToSize(row[1], 100);
        doc.text(textVal, margin + 45, y);
        y += (textVal.length * 6);
    });

    // Botón de Google Maps dentro de Operación
    checkPageAdd(25);
    y += 2;
    if (flight.Google_Maps_Link) {
        doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.roundedRect(margin, y, 80, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("VER UBICACIÓN (MAPS)", margin + 18, y + 7.5);
        doc.link(margin, y, 80, 12, { url: flight.Google_Maps_Link });
        y += 18;
    }

    // --- 4. DATOS DE CONTACTO ---
    y += 5;
    checkPageAdd(40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text("DATOS DE CONTACTO", margin, y);

    y += 8;
    doc.setFontSize(10);

    // Productor
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Productor", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${flight.Empresa || 'N/A'}`, margin + 5, y); y += 5;
    doc.text(`Contacto: ${flight.Contacto || 'N/A'}`, margin + 5, y); y += 8;

    // Piloto
    doc.setFont("helvetica", "bold");
    doc.text("Piloto", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const pilotName = `${pilot.Nombre || ''} ${pilot.Apellido || ''}`.trim() || 'N/A';
    doc.text(`Nombre: ${pilotName}`, margin + 5, y); y += 5;
    doc.text(`Celular: ${pilot.celular || pilot.Celular || 'N/A'}`, margin + 5, y); y += 8;

    // Vistaguay
    doc.setFont("helvetica", "bold");
    doc.text("Vistaguay", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`Teléfono: 3516 88-7507`, margin + 5, y); y += 5;
    doc.text(`Email: Soporte@vistaguay.com`, margin + 5, y);

    // Guardar
    doc.save(`Orden_Vuelo_${flight.ID}.pdf`);
}