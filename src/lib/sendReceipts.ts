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
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const logoUrl = `${siteUrl}/logoblackBG.png`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Receipt ${data.receiptId}</title>
        <style>
            body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #ffffff;
            }
            .receipt-container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                background-color: #000000;
                padding: 40px 20px;
                text-align: center;
                border-bottom: 5px solid #D4AF37;
            }
            .header img {
                height: 70px;
                width: auto;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                text-transform: uppercase;
                letter-spacing: 4px;
                font-weight: 300;
            }
            .receipt-banner {
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }
            .receipt-id {
                color: #6b7280;
                font-size: 14px;
                font-weight: 600;
            }
            .content {
                padding: 40px;
            }
            .receipt-details {
                margin: 0 0 40px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 16px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            .label {
                font-weight: 600;
                color: #4b5563;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
            }
            .value {
                color: #111827;
                font-weight: 500;
            }
            .amount-box {
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #ffffff;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                margin: 40px 0;
                position: relative;
                overflow: hidden;
            }
            .amount-box::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: #D4AF37;
            }
            .amount-label {
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #9ca3af;
                margin-bottom: 8px;
            }
            .amount-paid {
                font-size: 42px;
                font-weight: 700;
                color: #D4AF37;
            }
            .footer {
                text-align: center;
                padding: 40px;
                background-color: #f9fafb;
                color: #6b7280;
                font-size: 13px;
                border-top: 1px solid #e5e7eb;
            }
            .thank-you {
                color: #111827;
                font-weight: 700;
                font-size: 18px;
                margin-bottom: 8px;
            }
            .contact-info {
                margin-top: 16px;
            }
            .contact-info a {
                color: #D4AF37;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <img src="${logoUrl}" alt="Harewa Logo">
                <h1>Official Receipt</h1>
            </div>
            
            <div class="receipt-banner">
                <div class="receipt-id">RECEIPT NO. #${data.receiptId}</div>
            </div>

            <div class="content">
                <div class="receipt-details">
                    <div class="detail-row">
                        <span class="label">Payment Date</span>
                        <span class="value">${data.date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Customer Name</span>
                        <span class="value">${data.customerName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Payment Method</span>
                        <span class="value">${data.paymentMethod}</span>
                    </div>
                </div>

                <div class="amount-box">
                    <div class="amount-label">Total Amount Paid</div>
                    <div class="amount-paid">$${data.amountPaid.toLocaleString()}</div>
                </div>

                <div class="footer">
                    <div class="thank-you">Thank you for choosing Harewa!</div>
                    <p>Your support helps us continue empowering skilled craftsmen.</p>
                    <div class="contact-info">
                        Questions? Email us at <a href="mailto:admin@harewa.com">admin@harewa.com</a>
                    </div>
                    <p style="margin-top: 24px;">© ${new Date().getFullYear()} Harewa. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};