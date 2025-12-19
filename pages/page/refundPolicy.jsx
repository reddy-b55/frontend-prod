import React from 'react';
import CommonLayout from "../../components/shop/common-layout";

const RefundPolicy = () => {
  return (
    <>
    <CommonLayout parent="Home" title="Refund Policy">
      <div className="container mx-auto border m-5 p-5 rounded-3">
        <h6 className="text-center border-bottom pb-4 mb-4" style={{ fontSize: '22px' }}>
          Refund Policy
        </h6>
        <p className="col-11 text-center mx-auto mb-3" style={{ fontSize: 12, lineHeight: '20px' }}>
          At Aahaas, we strive to provide seamless and personalized travel experiences. However, we understand that plans may change, and refunds may be necessary. Our refund policy ensures a fair and transparent process for all users.
        </p>

        <div className="col-11 mx-auto">
          <h6 style={{ fontSize: 14 }}>1. General Refund Guidelines</h6>
        
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Refunds are subject to the terms and conditions of each service provider (hotels, airlines, tour operators, etc.).</li>
            <li>Refund requests must be submitted through the Aahaas app or by contacting customer support at support@aahaas.com.</li>
            <li>Processing times may vary depending on the service provider, but we aim to complete all refunds within 7-14 business days after approval.</li>
          </ul>
          <br></br>
          <h6 style={{ fontSize: 14 }}>2. Refund Eligibility by Service Category</h6>
          
          <h6 style={{ fontSize: 13 }}>a) Flights</h6>
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Refunds are subject to airline policies.</li>
            <li>Non-refundable tickets cannot be refunded but may be eligible for credit based on airline rules.</li>
            <li>Cancellation fees may apply as per airline policies.</li>
          </ul>

          <h6 style={{ fontSize: 13 }}>b) Hotels & Accommodations</h6>
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Refunds depend on the cancellation policy of the hotel or accommodation provider.</li>
            <li>Bookings canceled within the free cancellation period are eligible for a full refund.</li>
            <li>No-shows or last-minute cancellations may not be eligible for a refund.</li>
          </ul>

          <h6 style={{ fontSize: 13 }}>c) Experiences & Activities</h6>
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Fully refundable if canceled within the cancellation policy mentioned in the product.</li>
            <li>No refunds for cancellations made less than 48 hours before the experience.</li>
          </ul>

          <h6 style={{ fontSize: 13 }}>d) Essential & Non-Essential Purchases</h6>
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Refunds are available for unused and unopened products within 7 days of purchase.</li>
            <li>Damaged or incorrect items can be exchanged or refunded upon verification.</li>
          </ul>

          <h6 style={{ fontSize: 13 }}>e) Educational Services</h6>
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Refunds for workshops, courses, and classes are subject to the cancellation policy of the provider.</li>
            <li>If a session is canceled by the provider, a full refund or reschedule will be offered.</li>
          </ul>

          <br></br>
          <h6 style={{ fontSize: 14 }}>3. Non-Refundable Items</h6>
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Gift cards, vouchers, and promotional purchases.</li>
            <li>Last-minute bookings (where cancellation is not allowed by the provider).</li>
            <li>Partially used services (e.g., half-used tour packages).</li>
          </ul>

          <br></br>
          <h6 style={{ fontSize: 14 }}>4. Refund Processing</h6>
          <ul style={{ fontSize: 12, lineHeight: '20px' }}>
            <li>Refunds will be issued to the original payment method. Most refunds will be processed within 48 hours, and if there are exceptions, customers will be informed.</li>
            <li>In cases where the provider issues travel credits instead of refunds, these will be credited to the user's Aahaas account.</li>
            <li>Refund status can be tracked within the Aahaas app.</li>
          </ul>

          <br></br>
          <h6 style={{ fontSize: 14 }}>5. Contact Us</h6>
          <p style={{ fontSize: 12, lineHeight: '20px' }}>
            For any refund-related queries, reach out to our customer support team at:
            <br />
            <strong>Email:</strong> info@aahaas.com
            <br />
            <strong>Telephone Number:</strong> +95 11 235 2400
          </p>

          <p className="text-center" style={{ fontSize: 12, lineHeight: '20px', fontWeight: 'bold' }}>
            We are committed to ensuring a smooth and hassle-free refund process. Thank you for choosing Aahaas for your travel needs!
          </p>
        </div>
      </div>
    </CommonLayout>
    </>
  );
};

export default RefundPolicy;