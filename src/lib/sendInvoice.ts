import pdf from "html-pdf";
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
        date: string;
    };
}) => {
    const html = generateInvoiceHtml(data);
    const pdfPath = path.join("/tmp", `invoice-${uuid()}.pdf`);

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
        pdf.create(html).toBuffer((err, buffer) => {
            if (err) return reject(err);
            resolve(buffer);
        });
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
};

export const generateInvoiceHtml = (data: {
    customerName: string;
    invoiceId: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    date: string;
}) => {
    const { customerName, invoiceId, items, totalAmount, date } = data;

    const itemsHtml = items
        .map(
            (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₦${item.price.toLocaleString()}</td>
          <td>₦${(item.quantity * item.price).toLocaleString()}</td>
        </tr>
      `
        )
        .join("");

    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Invoice - ${invoiceId}</h2>
      <p>Date: ${date}</p>
      <p>Billed To: <strong>${customerName}</strong></p>
      <table border="1" cellspacing="0" cellpadding="10" style="width: 100%; margin-top: 20px;">
        <thead>
          <tr>
            <th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <h3 style="text-align: right;">Total: ₦${totalAmount.toLocaleString()}</h3>
    </div>
  `;
};
