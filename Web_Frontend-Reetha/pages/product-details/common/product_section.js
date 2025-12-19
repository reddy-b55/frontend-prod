import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { getLifesyleproducts } from "../../../AxiosCalls/LifestyleServices/lifestyleServices";
import { getAllEducationProducts } from "../../../AxiosCalls/EducationServices/educationServices";
import { getProductDetailsEssentialNonEssential } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";
import ProductItem from "../../../components/common/product-box/ProductBox";

const ProductSection = ({ category, category1, category2, category3, latitude, longitude, productid }) => {

  const [loading, setLoading] = useState(true);
  const [productDataList, setProductData] = useState([]);

  useEffect(() => {
    if (category1 == 1 || category1 == 2) {
      getProductDetailsEssentialNonEssential(category1, category2, 0, 0, 6, 0, []).then(response => {
        if (response != "(Internal Server Error)" || response !== "Something went wrong !") {
          setProductData(response?.discount_data)
          if (response?.discount_data.length > 0) {
            setLoading(false)
          }
        }
      })
    } else if (category1 == 3) {
      getLifesyleproducts(category1, 0, 0, latitude, longitude, 5, 6, 0, []).then(response => {
        if (response != "(Internal Server Error)" || response !== "Something went wrong !") {
          setProductData(response)
          if (response.length > 0) {
            setLoading(false)
          }
        }
      })
    } else if (category1 == 5) {
      getAllEducationProducts(category1, 0, 0, 0, 6, 0, []).then(response => {
        if (response != '(Internal Server Error)' || response !== "Something went wrong !") {
          setProductData(response?.educationListings)
          if (response?.educationListings.length > 0) {
            setLoading(false)
          }
        }
      })
    } else if (category == 4) {
      getLifesyleproducts(0, 0, 0, latitude, longitude, 5, 6, 0, []).then(response => {
        if (response != "(Internal Server Error)" || response !== "Something went wrong !") {
          setProductData(response)
          if (response?.length > 0) {
            setLoading(false)
          }
        }
      })
    }

  }, [productid, category1, category2, category3])

  return (
    !loading &&
    <section className="section-b-space ratio_asos mt-5">
      <Container>
        <Col className="product-related w-100">
          <h3 className="mb-3 pb-1">Related Products</h3>
        </Col>
        <Row className="search-product">
          <div className="d-lg-flex">
            {
              loading ?
                <>loading...</> :
                productDataList &&
                productDataList.map((product, index) => (
                  category1 === "1" ?
                    <ProductItem key={index} product={product} productImage={product.product_images.split(',')[0]} productstype={'essential'} title={product.listing_title} productcurrency={product.currency} mrp={product.mrp} description={product.listing_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} related={true} />
                    : category1 === "2" ?
                      <ProductItem key={index} product={product} productImage={product.product_images.split(',')[0]} productstype={'nonessential'} title={product.listing_title} productcurrency={product.currency} mrp={product.mrp} description={product.listing_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} related={true} />
                      : category1 === "3" ?
                        <ProductItem key={index} product={product} productImage={product.image} productstype={'lifestyle'} title={product.lifestyle_name} productcurrency={product.currency} adultRate={product.adult_rate} childRate={product.child_rate} description={product.lifestyle_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} related={true} />
                        : category1 === "4" ?
                          <ProductItem key={index} product={product} productImage={product.image} productstype={'lifestyle'} title={product.lifestyle_name} productcurrency={product.currency} adultRate={product.adult_rate} childRate={product.child_rate} description={product.lifestyle_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} related={true} />
                          : category1 === "5" ?
                            <ProductItem key={index} product={product} productImage={product.image_path.split(',')[0]} productstype={'education'} title={product.course_name} productcurrency={product.currency} adultRate={product.adult_course_fee} childRate={product.child_course_fee} description={product.course_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} related={true} />
                            : null
                ))
            }
          </div>
        </Row>
      </Container>
    </section>
  );

};

export default ProductSection;
