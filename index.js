const express = require('express');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.get('/converter', async (req, res) => {
    // Executa o Puppeteer e gera o PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://othon.bubbleapps.io/version-test/certificado_usuario/Lorem%20ipsum...", { waitUntil: "networkidle2" });
    const pdfPath = path.join(__dirname, 'pagina.pdf');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        landscape: true,
        printBackground: true,
        scale: 1.215,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });
    await browser.close();

    // Lê o arquivo PDF gerado
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Envia o arquivo PDF para o webhook
    fetch('https://al.ciparoni.com/webhook/97c7ed65-b424-4600-bca1-dbf3563b04e2', {
        method: 'POST',
        body: pdfBuffer,
        headers: { 'Content-Type': 'application/pdf' },
    })
    .then(response => response.text())
    .then(result => {
        console.log('Webhook response:', result);
        res.send('PDF convertido e enviado com sucesso.');
    })
    .catch(error => {
        console.error('Erro ao enviar o PDF:', error);
        res.status(500).send('Erro ao converter ou enviar o PDF.');
    })
    .finally(() => fs.unlinkSync(pdfPath)); // Remove o arquivo PDF após o envio
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
