import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

/**
 * Generates a PDF document with the given data
 * @param {Object} data - The data to include in the PDF
 * @returns {Buffer} The generated PDF file as a Buffer
 */
export const generatePDF = async (data) => {
    try {
        // Cria um novo documento PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]); // Tamanho da página (largura x altura)

        // Define o conteúdo do PDF
        const fontSize = 14;
        const margin = 50;

        let yOffset = page.getHeight() - margin;

        // Adiciona o título
        page.drawText('Relatório de Desempenho do Aluno', {
            x: margin,
            y: yOffset,
            size: 20,
            color: rgb(0, 0, 0),
        });
        yOffset -= 30;

        // Adiciona os dados
        const fields = [
            { label: 'ID do Usuário:', value: data.userId },
            { label: 'Total de Simulados:', value: data.totalSimulatedExams },
            { label: 'Média de Pontuação:', value: data.averageScore },
            { label: 'Data do Último Exame:', value: data.lastExamDate },
        ];

        fields.forEach(({ label, value }) => {
            page.drawText(`${label} ${value}`, {
                x: margin,
                y: yOffset,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
            yOffset -= 20;
        });

        // Salva o PDF como um Buffer
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Erro ao gerar PDF:', error.message);
        throw new Error('Erro ao gerar arquivo PDF');
    }
};