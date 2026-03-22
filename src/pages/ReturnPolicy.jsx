import React from "react";
import styles from "./ReturnPolicy.module.css";

const ReturnPolicy = () => {
  return (
    <div className={styles.container}>
      {/* Breadcrumb (optional) */}
      <p className={styles.breadcrumb}>
        HOME &gt; RETURN REFUND AND CANCELLATION
      </p>

      <h1 className={styles.pageTitle}>Return, Exchange, and Refund Policy</h1>

      {/* Refund & Exchange */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Refund and Exchange</h2>

        <ul className={styles.list}>
          <li>
            We offer a hassle-free return and exchange policy for 7 days from
            the date of delivery. To be eligible for a return or exchange,
            product(s) must be in their original condition with all tags intact.
          </li>
          <li>
            For a smooth return and instant exchange process, please note that
            all product(s) must pass our quality inspection during the reverse
            pickup.
          </li>
          <li>
            Exchanges are subject to stock availability and can be initiated
            only once per product.
          </li>
          <li>
            We strongly recommend recording a video while opening/unpacking your
            order, ensuring all stickers/labels are intact. This video will
            serve as proof in case of missing or damaged product(s) or
            parcel(s). Without video proof, it will be difficult for us to
            proceed with returns or refunds.
          </li>
          <li>
            Product(s) purchased during clearance sale, BOGO offers, exclusive
            discounts on products, brand collaboration promotions, or any
            activity/event/campaign with a free product(s) cannot be refunded,
            however can be exchanged.
          </li>
          <li>
            For hygiene reasons, we do not accept returns, refunds, or exchanges
            for Boxers.
          </li>
        </ul>
      </section>

      {/* Reverse Pickup */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reverse Pickup Services</h2>

        <ul className={styles.list}>
          <li>
            We provide a reverse pickup service for your convenience. The
            product(s) must pass quality inspection for instant return or
            exchange process. A reverse shipment is free of cost. Each order
            will have two reverse pickup attempts.
          </li>
          <li>
            <strong>Self-ship in case of non-serviceable areas:</strong> If your
            pincode is non-serviceable for reverse pickup, please self-ship the
            product(s) to our warehouse.
          </li>
        </ul>

        <p className={styles.address}>
          <strong>Address:</strong> Kairoz Folks Pvt Ltd, Khasra No. 3881/2188,
          Rani Ji Bawri, Eklingpura, Jamar Kotda Road, Udaipur – 313001
        </p>

        <p className={styles.text}>
          Share the courier docket for tracking with our team. Ensure the
          product(s) are securely packed with the ORDER ID and registered mobile
          number on the packaging.
        </p>

        <p className={styles.text}>
          <strong>Refund for Self-Shipping:</strong> Refunds will be processed
          within 48 hours of receiving the product(s) at our warehouse in unused
          condition, with all original tags and packaging intact, and after
          passing a quality check. You will receive a full refund plus up to INR
          100 (in lieu of courier charges).
        </p>

        <p className={styles.note}>
          <strong>Note:</strong> We recommend using <strong>Speed Post</strong>{" "}
          for returns, as it is a reliable, government-owned entity with India’s
          largest postal network.
        </p>
      </section>

      {/* Refunds */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Refunds</h2>

        <ul className={styles.list}>
          <li>
            <strong>Prepaid Orders:</strong> For prepaid orders, you can choose
            between receiving a refund via your original payment method or
            wallet. Once the product(s) pass our quality check at the warehouse,
            we will initiate the refund within 24–48 hours. Refunds to your
            payment method will be processed within 7–10 business days,
            depending on your bank’s processing times.
          </li>
          <li>
            <strong>COD Orders:</strong> If the product(s) pass the quality
            check once it reaches our warehouse, the refund will be issued
            instantly in your Kairoz Wallet. Credits are valid for 12 months.
          </li>
        </ul>

        <p className={styles.note}>
          <strong>Note: </strong>Any purchases made using Credits, if and when
          returned, will be refunded as Credits only.
        </p>
      </section>

      {/* Cancellation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cancellations / Modifications</h2>

        <p className={styles.text}>
          Orders can be cancelled or modified (change number, address, product
          style or size) if they have not yet been dispatched from our
          warehouse. Contact us via WhatsApp or email us at
          <strong> support@kairoz.in</strong> to request changes.
        </p>
      </section>

      {/* Defective */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Defective / Damaged Product(s) or Parcel
        </h2>
        <ul>
          <li>
            If you receive a damaged/defective/used/tags missing/wrong
            product(s), please contact our support team within 48 hours with
            photos or open/unpacking video. We will arrange for a new product to
            be sent to you at no additional charge.
          </li>
          <li>
            If you receive a torn/damaged/empty parcel, please do not accept it.
            If you receive any unrelated product(s) or an empty parcel, you are
            requested to raise a query within 48 hours of delivery. We strongly
            recommend recording a video while you open/unpack your order,
            keeping all stickers/labels intact.
          </li>
        </ul>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Terms & Conditions</h2>
        <ul>
          Ensure the provided bank account details are accurate as errors will
          not be the responsibility of Beyoung.
          <li>
            Customers must take utmost care of the product(s) while they are in
            their possession.
          </li>
          <li>Please check the size guide before placing an order.</li>
          <li>
            The colour of products may vary according to the customer's screen
            resolution. For orders placed using the Cash on Delivery (COD)
            payment method, a cash handling charge of INR 100 will be applied
            per order. This charge covers the additional costs associated with
            processing and handling cash payments, There are no additional
            charges for prepaid orders. Customers who choose to pay in advance
            using credit/debit cards, net banking, or any other prepaid method
            will not incur any extra fees.
          </li>
          <li>
            If payment is made through third-party platforms and you have not
            received any updates regarding payment or cashback, please contact
            the respective payment platform. Beyoung is not responsible for such
            scenarios.
          </li>
          <li>
            For prepaid orders, if you receive a delivery confirmation via SMS
            or email but have not received the products, please contact us
            within 48 hours.
          </li>
          <li>
            You can easily track your order status here or access manually in My
            Account Track Your Order section.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shipping Policy</h2>
        <ul>
          <li>We offer free shipping on the orders sitewide.</li>
          <li>
            We process orders within 24-48 hours and ship them from Udaipur,
            Rajasthan.
          </li>
          <li>
            We ship PAN India and our mission is to serve every region of
            Bharat, ensuring accessibility to our products for all
          </li>
          <li>
            Order Delivery Time: In metropolitan areas, orders are delivered
            within 1-4 days after processing. While in the rest of Bharat,
            delivery takes 4-7 days after processing.
          </li>
          <h5 className={styles.BottomLine}>Reach Us Out - We're all ears!</h5>
          <li>
            <strong>Whatsapp Support:</strong>  Click here
          </li>
          <li>
            <strong>Email Support: </strong>kairozworld2025@gmail.com Working
            Hours: 9am - 5pm IST Monday to Saturday.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default ReturnPolicy;
