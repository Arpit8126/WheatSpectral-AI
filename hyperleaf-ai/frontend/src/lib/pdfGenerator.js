import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId, fileName = 'report.pdf') => {
    const input = document.getElementById(elementId);
    if (!input) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    try {
        const canvas = await html2canvas(input, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#030712' // Dark background matching app
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
