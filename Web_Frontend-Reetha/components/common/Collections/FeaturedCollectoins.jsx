import React, { useState } from "react";
import { Container, Row } from "reactstrap";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import ProductItems from "../product-box/ProductBox";

const FeaturedCollectoins = ({ fluid, designClass, hotelSearchDataSet, featuredProductsData }) => {

  const [activeTab, setActiveTab] = useState("lifestyle");

  return (
    <section className={designClass}>

      <Container fluid={fluid}>
        <Tabs className="theme-tab">

          <TabList className="tabs tab-title mt-3">
            {
              featuredProductsData?.lifestyle?.lifestyleData?.length !== 0 &&
              <Tab className={activeTab == "lifestyle" ? "active" : ""} onClick={() => setActiveTab("lifestyle")}>LIFESTYLE</Tab>
            }
            {
              featuredProductsData?.education?.educationData?.length !== 0 &&
              <Tab className={activeTab == "education" ? "active" : ""} onClick={() => setActiveTab("education")}>EDUCATION</Tab>
            }
            {
              featuredProductsData?.hotels?.hotelData?.length !== 0 &&
              <Tab className={activeTab == "hotels" ? "active" : ""} onClick={() => setActiveTab("hotels")}>HOTELS</Tab>
            }
            {
              featuredProductsData?.essential?.essentialData?.length !== 0 &&
              <Tab className={activeTab == "essential" ? "active" : ""} onClick={() => setActiveTab("essential")}>ESSENTIAL</Tab>
            }
            {
              featuredProductsData?.nonEssential?.nonessentialData?.length !== 0 &&
              <Tab className={activeTab == "nonessential" ? "active" : ""} onClick={() => setActiveTab("nonessential")}>NON ESSENTIAL</Tab>
            }
          </TabList>

          {
            featuredProductsData?.lifestyle?.lifestyleData?.length !== 0 &&

            <TabPanel>
              <Row className="no-slider">
                {
                  featuredProductsData?.lifestyle?.lifestyleData?.slice(0, 8)?.map((product, key) => (
                    <ProductItems product={product} key={key} productImage={product.image} productstype={activeTab} title={product.lifestyle_name} productcurrency={product.currency} adultRate={product.adult_rate} childRate={product.child_rate} packageRate={product.package_rate} description={product.lifestyle_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass='cart-info cart-wrap' backImage={true} />
                  ))
                }
              </Row>
            </TabPanel>
          }

          {
            featuredProductsData?.education?.educationData?.length !== 0 &&

            <TabPanel>
              <Row className="no-slider">{

                featuredProductsData?.education?.educationData?.slice(0, 10).map((product, key) => (
                  <ProductItems product={product} key={key} productImage={product.image_path.split(',')[0]} productstype={activeTab} title={product.course_name} productcurrency={product.currency} adultRate={product.adult_course_fee} childRate={product.child_course_fee} description={product.course_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass='cart-info cart-wrap' backImage={true} />
                ))
              }
              </Row>
            </TabPanel>
          }

          {
            featuredProductsData?.hotels?.hotelData?.length !== 0 &&

            <TabPanel>
              <Row className="no-slider">
                {
                  featuredProductsData?.hotels?.hotelData?.slice(0, 10).map((product, key) => (
                    <ProductItems product={product} hotelSearchCustomerData={hotelSearchDataSet} hotelAddress={product.HotelAddress} provider={product.provider} hotelCode={product.HotelCode} key={key} productImage={product.HotelPicture} productstype={activeTab} title={product.HotelName} productcurrency={product?.Currency} mrp={product?.TotalRate} description={product.HotelDescription} rating={product?.HotelCategory} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass='cart-info cart-wrap' backImage={true} />
                  ))
                }
              </Row>
            </TabPanel>
          }

          {
            featuredProductsData?.essential?.essentialData?.length !== 0 &&
            <TabPanel>
              <Row className="no-slider">
                {
                  featuredProductsData?.essential?.essentialData?.slice(0, 10).map((product, key) => (
                    <ProductItems product={product} key={key} productImage={product.product_images.split(',')[0]} productstype={activeTab} title={product.listing_title} productcurrency={product.currency} mrp={product.mrp} description={product.listing_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass='cart-info cart-wrap' backImage={true} />
                  ))
                }
              </Row>
            </TabPanel>
          }

          {
            featuredProductsData?.nonEssential?.nonessentialData?.length !== 0 &&
            <TabPanel>
              <Row className="no-slider">
                {
                  featuredProductsData?.nonEssential?.nonessentialData?.slice(0, 10).map((product, key) => (
                    <ProductItems product={product} key={key} productImage={product.product_images.split(',')[0]} productstype={activeTab} title={product.listing_title} productcurrency={product.currency} mrp={product.mrp} description={product.listing_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass='cart-info cart-wrap' backImage={true} />
                  ))
                }
              </Row>
            </TabPanel>
          }

        </Tabs>
      </Container>

    </section>
  );
};

export default FeaturedCollectoins;