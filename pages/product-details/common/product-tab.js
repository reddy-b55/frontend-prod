import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";

import defaultImage from "../../../public/assets/images/NavbarImages/defaultImage.png";
import getStar from "../../../components/common/product-box/getStar";
import GetDescription from "../../../GlobalFunctions/Others/GetDescription.";
import ProductTabSub from "./product-tab-sub";
import { AppContext } from "../../_app";
import { getCountryFromLatLng } from "../../../GlobalFunctions/OthersGlobalfunctions";
import TnC_container from "./TnC_container";

const ProductTab = ({
  latitude,
  longitude,
  extraCss,
  showDesc,
  name,
  desc,
  showReviews,
  reviews,
  showProductDetails,
  productDetails,
  showTermsndConditions,
  showndConditions,
  showCancellationpolicy,
  cancellationPolicy,
  showPaymentPolicy,
  paymentPolicy,
  showDeliveryPolicy,
  deliveryPolicy,
  height = "400px",
  type,
  provider = null
}) => {
  const [activeTab, setActiveTab] = useState("1");

  function monthsAgo(date) {
    const now = new Date();
    const pastDate = new Date(date);
    const yearDiff = now.getFullYear() - pastDate.getFullYear();
    const monthDiff = now.getMonth() - pastDate.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  const daysAgo = (dateString) => {
    const createdDate = new Date(dateString);
    const currentDate = new Date();
    const differenceInTime = currentDate - createdDate;
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
    return differenceInDays;
  };

  const decodeHtmlEntities = (str) =>
    str &&
    str.replace(/_x([0-9A-F]{4})_/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );

  const [country, setCountry] = useState("");

  const getCountry = async () => {
    await getCountryFromLatLng(latitude, longitude).then((response) => {
      setCountry(response);
    });
  };

  useEffect(() => {
    getCountry();
  }, [name]);

  return (
    <section className={`tab-product mt-0 mb-5 ${extraCss}`}>
      <Container className="d-none d-sm-block">
        <Row className="product-page-main m-0">
          <Nav tabs className="nav-material">
            {showProductDetails && productDetails && (
              <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                <NavLink
                  style={{ fontSize: "15px" }}
                  className={activeTab === "0" ? "active" : ""}
                  onClick={() => setActiveTab("0")}
                >
                  Product details
                </NavLink>
              </NavItem>
            )}

            {showDesc && desc && (
              <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                <NavLink
                  style={{ fontSize: "15px" }}
                  className={activeTab === "1" ? "active" : ""}
                  onClick={() => setActiveTab("1")}
                >
                  Description
                </NavLink>
              </NavItem>
            )}

            {showReviews && (
              <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                <NavLink
                  style={{ fontSize: "15px" }}
                  className={activeTab === "2" ? "active" : ""}
                  onClick={() => setActiveTab("2")}
                >
                  Reviews
                </NavLink>
              </NavItem>
            )}

            {showTermsndConditions && showndConditions && (
              <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                <NavLink
                  style={{ fontSize: "15px" }}
                  className={activeTab === "3" ? "active" : ""}
                  onClick={() => setActiveTab("3")}
                >
                  terms & conditions
                </NavLink>
              </NavItem>
            )}

            {showCancellationpolicy && cancellationPolicy && (
              <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                <NavLink
                  style={{ fontSize: "15px" }}
                  className={activeTab === "4" ? "active" : ""}
                  onClick={() => setActiveTab("4")}
                >
                  cancellation policy
                </NavLink>
              </NavItem>
            )}

            {showPaymentPolicy && paymentPolicy && (
              <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                <NavLink
                  style={{ fontSize: "15px" }}
                  className={activeTab === "5" ? "active" : ""}
                  onClick={() => setActiveTab("5")}
                >
                  payment policy
                </NavLink>
              </NavItem>
            )}

            {showDeliveryPolicy && deliveryPolicy && (
              <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                <NavLink
                  style={{ fontSize: "15px" }}
                  className={activeTab === "6" ? "active" : ""}
                  onClick={() => setActiveTab("6")}
                >
                  Delivery policy
                </NavLink>
              </NavItem>
            )}
          </Nav>

          <TabContent activeTab={activeTab} className="nav-material">
            <TabPane tabId="0">
              <div
                className="scrollBarDefault-design"
                style={{
                  height: height,
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    width: "90%",
                    lineHeight: "20px",
                    fontWeight: "400",
                  }}
                >
                  {productDetails}
                </p>
              </div>
            </TabPane>

            <TabPane tabId="1">
              <div
                className="scrollBarDefault-design"
                style={{
                  height: height,
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                {type === "lifestyle" ? (
                  <h2
                    className="m-0 p-0 mt-3 mb-3"
                    style={{
                      fontWeight: "600",
                      textTransform: "uppercase",
                      fontSize: "16px",
                    }}
                  >
                    {/* {` ${name} Top Activities to Experience in ${country}`} */}
                  </h2>
                ) : type === "hotel" ? (
                  <h2
                    className="m-0 p-0 mt-3 mb-3"
                    style={{
                      fontWeight: "600",
                      textTransform: "uppercase",
                      fontSize: "16px",
                    }}
                  >
                    {/* {name + " - Hotel in Sri Lanka"} */}
                  </h2>
                ) : type === "education" ? (
                  <>
                    <h2
                      className="m-0 p-0 mt-3 mb-3"
                      style={{
                        fontWeight: "600",
                        textTransform: "uppercase",
                        fontSize: "16px",
                      }}
                    >
                      {/* {name} */}
                    </h2>
                    <h2
                      className="m-0 p-0 mt-3 mb-3"
                      style={{
                        fontWeight: "600",
                        textTransform: "capitalize",
                        fontSize: "14px",
                        color: "#ed4242",
                      }}
                    >
                      Vacation Activities : Best Things to Do in Sri Lanka
                    </h2>
                  </>
                ) : (
                  <h2
                    className="m-0 p-0 mt-3 mb-3"
                    style={{
                      fontWeight: "600",
                      // textTransform: "uppercase",
                      fontSize: "16px",
                    }}
                  >
                    {/* {name} */}
                  </h2>
                )}
                <p
                  style={{
                    fontSize: 14,
                    width: "90%",
                    lineHeight: "20px",
                    fontWeight: "400",
                  }}
                  className="m-0 p-0"
                >
                  {
                    provider === "zetexa" && (
                      <><div style={{ width: '100%', padding: "10px", border: "1px solid #ccc", borderRadius: "5px", marginBottom: "10px" }}>
                        <h5 style={{ fontWeight: "600", color: "red" }}>
                          Cancellation Policy
                        </h5><h6 style={{ fontWeight: "300", color: "black" }}>
                          Once your order is placed. It cannot be cancelled.
                        </h6>
                      </div>
                      </>
                    )

                  }
                  { provider !== 'bridgify' && GetDescription(decodeHtmlEntities(desc))}
                  {
                    provider === 'bridgify' && (
                      <>
                      {GetDescription(decodeHtmlEntities(desc?.full_description))}
                        {
                          desc?.included && desc?.included !== "" && (
                            <>
                              <h5 style={{ paddingTop: "15px", fontWeight: 'bold' }}>Included</h5>
                              {GetDescription(decodeHtmlEntities(desc?.included))}
                            </>
                          )
                        }

                        {
                          desc?.excluded && desc?.excluded !== "" && (
                            <>
                              <h5 style={{ paddingTop: "15px", fontWeight: 'bold' }}>Excluded</h5>
                              {GetDescription(decodeHtmlEntities(desc?.excluded))}
                            </>
                          )
                        }

                      </>
                    )
                  }


                </p>
              </div>
            </TabPane>

            <TabPane tabId="2">
              <div
                className="scrollBarDefault-design"
                style={{
                  height: height,
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                {reviews?.reviews?.length == 0 ? (
                  <p
                    style={{
                      fontSize: 14,
                      width: "90%",
                      lineHeight: "20px",
                      fontWeight: "400",
                    }}
                    className="mb-0 pb-0"
                  >
                    No reviews yet
                  </p>
                ) : (
                  reviews?.reviews?.map((value, key) => (
                    <div key={key} className="my-3 pe-3">
                      <div className="d-flex align-items-start gap-2">
                        <LazyLoadImage
                          className="mt-2"
                          src={defaultImage.src}
                          style={{
                            minHeight: "30px",
                            maxHeight: "30px",
                            minWidth: "30px",
                            maxWidth: "30px",
                          }}
                        />
                        <div className="d-flex flex-column m-0 p-0 mx-2">
                          <div className="d-flex gap-2 align-items-center">
                            <div>
                              {getStar(parseInt(value.rating_on_product))}
                            </div>
                            <p
                              className="m-0 p-0"
                              style={{ fontSize: 14, fontWeight: "600" }}
                            >
                              {value.email.slice(0, 7)} .
                            </p>
                            <p
                              className="m-0 p-0"
                              style={{
                                fontSize: 12,
                                color: "rgb(212 197 197)",
                              }}
                            >
                              {/* {monthsAgo(value.created_at.slice(0, 10))} months
                              ago */}
                              {daysAgo(value.created_at.slice(0, 10))} days ago
                            </p>
                          </div>
                          <p
                            className="m-0 p-0"
                            style={{
                              fontSize: 12,
                              width: "90%",
                              lineHeight: "20px",
                            }}
                          >
                            {value.review_remarks}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabPane>

            <TabPane tabId="3">
              <div
                className="scrollBarDefault-design"
                style={{
                  height: height,
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    width: "90%",
                    lineHeight: "20px",
                    fontWeight: "400",
                  }}
                >
                  {/* {showndConditions} */}
                  <TnC_container content={showndConditions} />
                </p>
              </div>
            </TabPane>

            <TabPane tabId="4">
              <div
                className="scrollBarDefault-design"
                style={{
                  height: height,
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    width: "90%",
                    lineHeight: "20px",
                    fontWeight: "400",
                  }}
                >
                  {cancellationPolicy}
                </p>
              </div>
            </TabPane>

            <TabPane tabId="5">
              <div
                className="scrollBarDefault-design"
                style={{
                  height: height,
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    width: "90%",
                    lineHeight: "20px",
                    fontWeight: "400",
                  }}
                >
                  {paymentPolicy}
                </p>
              </div>
            </TabPane>

            <TabPane tabId="6">
              <div
                className="scrollBarDefault-design"
                style={{
                  height: height,
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    width: "90%",
                    lineHeight: "20px",
                    fontWeight: "400",
                  }}
                >
                  {deliveryPolicy}
                </p>
              </div>
            </TabPane>
          </TabContent>
        </Row>
      </Container>

      <div className="d-lg-none d-md-none d-sm-none px-2">
        {showReviews && (
          <>
            <h6
              style={{
                fontWeight: "600",
                textTransform: "capitalize",
                marginTop: "20px",
              }}
            >
              Reviews
            </h6>
            {reviews?.reviews?.length == 0 ? (
              <p
                style={{ fontSize: 14, lineHeight: "20px", fontWeight: "400" }}
                className="mb-0 pb-0"
              >
                No reviews yet
              </p>
            ) : (
              reviews?.reviews?.map((value, key) => (
                <div
                  key={key}
                  className="my-3 pe-3 d-flex flex-column flex-wrap align-items-start gap-2"
                >
                  <div className="d-flex align-items-center m-0 p-0 col-12 gap-2">
                    <LazyLoadImage
                      className="m-0 p-0"
                      alt="review person profile"
                      src={defaultImage.src}
                      style={{
                        minHeight: "20px",
                        maxHeight: "20px",
                        minWidth: "20px",
                        maxWidth: "20px",
                      }}
                    />
                    <p
                      className="m-0 p-0"
                      style={{ fontSize: 14, fontWeight: "600" }}
                    >
                      {value.email}
                    </p>
                  </div>

                  <div className="d-flex align-items-center flex-wrap m-0 p-0 col-12 gap-2">
                    <p
                      className="m-0 p-0"
                      style={{ fontSize: 12, lineHeight: "20px" }}
                    >
                      {value.review_remarks}
                    </p>
                    <p className="m-0 p-0">
                      {getStar(parseInt(value.rating_on_product))}
                    </p>
                  </div>

                  <div className="d-flex align-items-center m-0 p-0 col-12 gap-2">
                    <p
                      className="m-0 p-0"
                      style={{ fontSize: 12, color: "rgb(212 197 197)" }}
                    >
                      {/* {monthsAgo(value.created_at.slice(0, 10))} months ago */}
                      {daysAgo(value.created_at.slice(0, 10))} days ago
                    </p>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {showProductDetails && productDetails && (
          <ProductTabSub
            title={"Product details"}
            content={productDetails}
            subContent={name}
          />
        )}

        {showDesc && desc?.full_description && (
          <ProductTabSub
            title={"Description"}
            description={true}
            content={desc?.full_description}
          />
        )}

        {showTermsndConditions && showndConditions && (
          // <ProductTabSub title={"terms & conditions"} content={showndConditions} TnC={true}/>
          // <ProductTabSub
          //   title="terms & conditions"
          //   content={showndConditions}
          // />
          <TnC_container content={showndConditions} />
        )}

        {showCancellationpolicy && cancellationPolicy && (
          <ProductTabSub
            title={"cancellation policy"}
            content={cancellationPolicy}
          />
        )}

        {showPaymentPolicy && paymentPolicy && (
          <ProductTabSub title={"payment policy"} content={paymentPolicy} />
        )}

        {showDeliveryPolicy && deliveryPolicy && (
          <ProductTabSub title={"Delivery policy"} content={deliveryPolicy} />
        )}
      </div>
    </section>
  );
};

export default ProductTab;