import pdf from "html-pdf";
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
    const pdfPath = path.join("/tmp", `receipt-${uuid()}.pdf`);

    // Custom promisified toBuffer
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
};

export const generateReceiptHtml = (data: {
    customerName: string;
    receiptId: string;
    amountPaid: number;
    paymentMethod: string;
    date: string;
}) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Payment Receipt - ${data.receiptId}</h2>
      <p>Date: ${data.date}</p>
      <p>Received from: <strong>${data.customerName}</strong></p>
      <p>Amount Paid: <strong>₦${data.amountPaid}</strong></p>
      <p>Payment Method: <strong>${data.paymentMethod}</strong></p>
      <p>Thank you for your payment!</p>
    </div>
  `;
};
