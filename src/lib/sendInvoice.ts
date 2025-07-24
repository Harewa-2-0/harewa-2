import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import path from "path";
import { notificationTransporter } from "./mailer";

export const sendInvoiceMail = async ({
  to,
  subject,
  data,
}: {
  to: string;
  subject: string;
  data: {
    customerName: string;
    invoiceId: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    dueDate: string;
    date: string;
    paymentMethod: string;
    payUrl?: string | null;
  };
}) => {
  const html = generateInvoiceHtml(data);
  const pdfPath = path.join(process.cwd(), "tmp", `invoice-${uuid()}.pdf`);

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
      html: `<p>Hi ${data.customerName},<br/>Please find your invoice attached.</p>`,
      attachments: [
        {
          filename: "invoice.pdf",
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

export const generateInvoiceHtml = (data: {
  customerName: string;
  invoiceId: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  dueDate: string;
  date: string;
  paymentMethod: string;
  payUrl?: string | null;
}) => {
  const { customerName, invoiceId, items, totalAmount, date, dueDate, paymentMethod } = data;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₦${item.price.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₦${(item.quantity * item.price).toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceId}</title>
      <style>
       .receipt-id {
                color: #666;
                font-size: 14px;
                margin-top: 5px;
            }
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background-color: #f5f5f5; padding: 12px; border: 1px solid #ddd; text-align: left; }
        .table td { padding: 10px; border: 1px solid #ddd; }
        .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
      <h1>PAYMENT INVOICE</h1>
       <div class="receipt-id">Receipt #${invoiceId}</div>
       
      </div>
      
      <div class="invoice-details">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Billed To:</strong> ${customerName}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod} </p>
      </div>
${data.payUrl ? `
            <div style="text-align: center; margin: 20px 0;">
                <a href="${data.payUrl}" class="pay-button">Pay Now</a>
            </div>
            ` : ''}
      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total">
        <p>Total Amount: ₦${totalAmount.toLocaleString()}</p>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Harewa - Your trusted partner</p>
      </div>
    </body>
    </html>
  `;
};