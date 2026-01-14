import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import path from "path";
import { notificationTransporter, wrapEmailHtml } from "./mailer";

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
        const firstName = data.customerName ? data.customerName.trim().split(/\s+/)[0] : 'Customer';
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
            html: wrapEmailHtml(`
                <h1>Payment Receipt</h1>
                <p>Hi ${firstName},</p>
                <p>Thank you for your recent payment. We've attached your official receipt (PDF) to this email for your records.</p>
                
                <div class="success-box">
                    <p style="margin: 0;"><strong>Receipt ID:</strong> #${data.receiptId}</p>
                    <p style="margin: 0;"><strong>Amount Paid:</strong> $${data.amountPaid.toLocaleString()}</p>
                    <p style="margin: 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                </div>
                
                <p>If you have any questions regarding this transaction, please don't hesitate to reach out to our support team.</p>
                
                <div class="divider"></div>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong style="color: #1f2937;">The Harewa Team</strong>
                </p>
            `, subject),
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
                border-bottom: 2px solid #D4AF37;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #D4AF37;
                margin: 0;
                font-size: 28px;
                text-transform: uppercase;
                letter-spacing: 2px;
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
                font-size: 28px;
                font-weight: bold;
                color: #1a1a1a;
                text-align: center;
                padding: 30px;
                background: linear-gradient(135deg, #fffbf0 0%, #fef8e6 100%);
                border: 1px solid #D4AF37;
                border-radius: 12px;
                margin: 30px 0;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #eee;
                color: #6b7280;
                font-size: 14px;
            }
            .thank-you {
                color: #D4AF37;
                font-weight: bold;
                font-size: 20px;
                margin-bottom: 12px;
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