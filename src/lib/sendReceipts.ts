import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import path from "path";
import { notificationTransporter } from "./mailer";

export const sendReceiptMail = async ({
    to,
    subject,
    data,
}: {
    to: string;
    subject: string;
    data: {
        customerName: string;
        receiptId: string;
        amountPaid: number;
        paymentMethod: string;
        date: string;
    };
}) => {
    const html = generateReceiptHtml(data);
    const pdfPath = path.join(process.cwd(), "tmp", `receipt-${uuid()}.pdf`);

    // Create PDF using Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await writeFile(pdfPath, pdfBuffer);

        const mailOptions = {
            from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
            to,
            subject,
            html: `<p>Hi ${data.customerName},<br/> Please find your receipt attached.</p>`,
            attachments: [
                {
                    filename: "receipt.pdf",
                    path: pdfPath,
                    contentType: "application/pdf",
                },
            ],
        };

        await notificationTransporter.sendMail(mailOptions);
    } finally {
        await browser.close();
    }
};

export const generateReceiptHtml = (data: {
    customerName: string;
    receiptId: string;
    amountPaid: number;
    paymentMethod: string;
    date: string;
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Receipt ${data.receiptId}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f9f9f9;
            }
            .receipt-container {
                background-color: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 600px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .receipt-id {
                color: #666;
                font-size: 14px;
                margin-top: 5px;
            }
            .receipt-details {
                margin: 30px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .label {
                font-weight: bold;
                color: #333;
            }
            .value {
                color: #666;
            }
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: ${data.paymentMethod.toLowerCase() === 'debit' ? '#fd7e14' : '#28a745'};
                text-align: center;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .thank-you {
                color: #007bff;
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h1>PAYMENT RECEIPT</h1>
                <div class="receipt-id">Receipt #${data.receiptId}</div>
            </div>
            
            <div class="receipt-details">
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${data.date}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Received From:</span>
                    <span class="value">${data.customerName}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Payment Method:</span>
                    <span class="value">${data.paymentMethod}</span>
                </div>
            </div>

            <div class="amount">
                Amount Paid: $${data.amountPaid.toLocaleString()}
            </div>

            <div class="footer">
                <div class="thank-you">Thank you for your payment!</div>
                <p>This is an automatically generated receipt.</p>
                <p>Harewa - Your trusted partner</p>
            </div>
        </div>
    </body>
    </html>
    `;
};