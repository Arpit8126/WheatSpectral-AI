import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementIds, fileName = 'report.pdf') => {
    // Ensure elementIds is an array
    const ids = Array.isArray(elementIds) ? elementIds : [elementIds];

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    for (let i = 0; i < ids.length; i++) {
        const elementId = ids[i];
        const input = document.getElementById(elementId);

        if (!input) {
            console.warn(`Element with id ${elementId} not found, skipping.`);
            continue;
        }

        try {
            const canvas = await html2canvas(input, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#030712' // Dark background matching app
            });

            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add new page if not the first page
            if (i > 0) {
                pdf.addPage();
            }

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        } catch (error) {
            console.error(`Error processing element ${elementId}:`, error);
        }
    }

    pdf.save(fileName);
};
