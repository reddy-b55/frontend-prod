// ItemCard.jsx
import React, { useContext } from "react";
import styles from "./ItemCard.module.css";
import { Col, Row } from "react-bootstrap";
import { AppContext } from "../../../_app";
import { useRouter } from "next/router";
import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import getDiscountProductBaseByPrice from "../../../product-details/common/GetDiscountProductBaseByPrice";

const ItemCard = ({
  O_id = "",
  image = "https://play-lh.googleusercontent.com/qoEowqafsAPLEHj5pj-Tfgoj3XuehDt2cEBBe9vvRwyfaaMv3S2SzggQnbAmHx3eB6no=w240-h480-rw",
  title = "Not Specified",
  date = "Not Available",
  price = "Not Available",
  qty = "Not Available",
  main_category_id = "Not Available",
  currency = "USD",
  discount = []
}) => {

  const { baseCurrency, baseCurrencyValue } = useContext(AppContext);
  // console.log("price issssss", discount , "product name",title);
  const router = useRouter();

  const handleMoreInfo = () => {
    router.push(
      `order-history/${O_id}?main_category_id=${main_category_id}`
    );
  };

  return (
    <div className={styles.nightDiverCard}>
      <div className={styles.row}>
        <div className={styles.imageCol}>
          <div className={styles.imageContainer}>
            <img src={image} className={styles.img} alt={title} />
          </div>
        </div>

        <div className={styles.contentCol}>
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <div className={styles.cardText}>
              <strong>Qty:</strong>&nbsp;&nbsp;{qty ? qty : "Not Available"}
              <br />
              <strong>Date:</strong>&nbsp;&nbsp; {date ? date : "Not Available"}
              <br />
             {
  discount?.discount_type === "precentage" ? (
    <div>
      <>
         <strong >Price:</strong>&nbsp;&nbsp;  <strong style={{textDecoration: "line-through" }}>{getDiscountProductBaseByPrice(price, discount, "currency")["actual"]}</strong>
      <strong>&nbsp;&nbsp; {getDiscountProductBaseByPrice(price, discount, "currency")["discountedAmount"]}</strong>
      </>
   
    </div>
  ) : (
    <div>
      <strong>Price:</strong>&nbsp;&nbsp; {CurrencyConverter(currency, price, baseCurrencyValue)}
    </div>
  )
}
              {/* <strong>Price:</strong>&nbsp;&nbsp; {CurrencyConverter(currency, price, baseCurrencyValue)}
              <strong>Price:</strong>&nbsp;&nbsp; {CurrencyConverter(currency, price, baseCurrencyValue)} */}
              {/* {price ? price : "Not Available"} */}
            </div>
          </div>
        </div>

        <div className={styles.buttonCol}>
          {
            main_category_id === "6"?(null):(
              <button onClick={
                () => handleMoreInfo()
              } className={styles.moreInfoButton}>More Info</button>
            )
          }
        
        </div>
      </div>
      <div className={styles.mobileGrd}>
        <Row>
          <Col sm={3}>
            <div className={styles.mobileImageContainer}>
              <img src={image} className={styles.mobileImg} alt={title} />
            </div>
          </Col>
          <Col sm={9}>
            <div className={styles.mobileCardBody}>
              <h3 className={styles.mobileCardTitle}>{title}</h3>
              <div className={styles.mobileCardText}>
                <strong>Qty:</strong> Adults-1, Children-0
                <br />
                <strong>Date:</strong> {date}
                <br />
                <strong>Price:</strong> {price}
              </div>
              <button
                onClick={() => handleMoreInfo()}
                className={styles.mobileMoreInfoButton}
              >
                More Info
              </button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ItemCard;
