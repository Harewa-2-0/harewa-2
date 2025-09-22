'use client';

export default function OrderPrintFooter() {
  return (
    <div className="print-footer">
      <div className="footer-content">
        <div className="thank-you-section">
          <h4 className="thank-you-title">Thank you for your business!</h4>
          <p className="thank-you-message">
            We appreciate your trust in HAREWA for your fashion needs. 
            If you have any questions about this order, please don't hesitate to contact us.
          </p>
        </div>
        
        <div className="contact-section">
          <h4 className="contact-title">Contact Information</h4>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-label">Email:</span>
              <span className="contact-value">support@harewa.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Website:</span>
              <span className="contact-value">www.harewa.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Phone:</span>
              <span className="contact-value">+234 (0) 123 456 7890</span>
            </div>
          </div>
        </div>
        
        <div className="terms-section">
          <h4 className="terms-title">Terms & Conditions</h4>
          <p className="terms-text">
            This invoice is generated automatically. All prices are in Nigerian Naira (NGN). 
            For any disputes or clarifications, please contact our customer service team within 7 days of order delivery.
          </p>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-note">
            Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
