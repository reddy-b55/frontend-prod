import React, { useContext } from 'react';
import styles from  './home.module.css';
import CurrencyConverter from '../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import { AppContext } from '../../pages/_app';
import { generateSlug } from '../../GlobalFunctions/OthersGlobalfunctions';
import Cookies from 'js-cookie';
import getDiscountProductBaseByPrice from '../../pages/product-details/common/GetDiscountProductBaseByPrice';
import RepeatIcon from '@mui/icons-material/Repeat';

const BestSellerProducts = ({ categories, activeBestSellerCategory, setActiveBestSellerCategory, bestSellerProducts, productData }) => {

  console.log("bestSellerProducts component", bestSellerProducts);

    const { baseCurrencyValue } = useContext(AppContext);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Filter categories that have products - temporarily show only lifestyle
    const availableCategories = React.useMemo(() => {
      return categories.filter(category => {
        // Temporarily only show lifestyle category
        if (category.key !== 'lifestyle') {
          return false;
        }
        const categoryData = productData?.[category.key];
        const dataKey = category.data;
        const products = categoryData?.[dataKey];
        return products && products.length > 0;
      });
    }, [categories, productData]);

    // Ensure active category is available, switch to first available if not
    React.useEffect(() => {
      if (availableCategories.length > 0) {
        const isActiveAvailable = availableCategories.some(cat => cat.key === activeBestSellerCategory);
        if (!isActiveAvailable) {
          setActiveBestSellerCategory(availableCategories[0].key);
        }
      }
    }, [availableCategories, activeBestSellerCategory, setActiveBestSellerCategory]);

    const handleQuickView = (product) => {
      setSelectedProduct(product);
      setShowQuickView(true);
    };

    const closeQuickView = () => {
      setShowQuickView(false);
      setSelectedProduct(null);
    };

    // Handle body scroll lock
    React.useEffect(() => {
      if (showQuickView) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
      
      // Cleanup on unmount
      return () => {
        document.body.classList.remove('modal-open');
      };
    }, [showQuickView]);
    console.log("Base Currency in BestSellerProducts:", bestSellerProducts);

     const clickProductDetail = (selectProduct) => {
      const openInNewWindow = (pathname, query = {}) => {
        const queryString = new URLSearchParams(query).toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;
        window.open(url, '_blank');
      };
    
      if (selectProduct.productstype === 'lifestyle') {
        var productProvider = selectProduct?.provider
        // console.log(product?.provider, "Product data value is")
    
        if (productProvider === "globaltix") {
          // console.log({
          //     pID: product.lifestyle_id,
          //     viewStatus: 'checkavalibility'
          //   }, "Product data value is")
          openInNewWindow(
            `/product-details/lifestyle/v3/${generateSlug(selectProduct.name)}`,
            {
              pID: selectProduct.product.lifestyle_id,
              viewStatus: 'checkavalibility',
              productImage: selectProduct.image,
            }
          );
        } else if (productProvider === "zetexa") {

        //   manageZetexaData(selectProduct);
          // return
          openInNewWindow(
            `/product-details/lifestyle/v5/${generateSlug(selectProduct.name)}`,
            {
              pID: selectProduct.id,
              viewStatus: 'checkavalibility'
            }
          );
        } else if (productProvider === "cebu") {
          console.log(product, "Product data value is")
          openInNewWindow(
            `/product-details/lifestyle/v4/${generateSlug(selectProduct.name)}`,
            {
              pID: selectProduct.image.product.lifestyle_id,
              viewStatus: 'checkavalibility',
              productImage: selectProduct.image,
            }
    
          );
        } else if (productProvider != "bridgify") {
          console.log(productProvider, "Product data value is")
          openInNewWindow(
            `/product-details/lifestyle/${generateSlug(selectProduct.name)}`,
            {
              pID: selectProduct.product.lifestyle_id,
              viewStatus: 'checkavalibility'
            }
          );
        } else {
          console.log(product, "Product data value is")
          openInNewWindow(
            `/product-details/lifestyle/v2/${generateSlug(selectProduct.name)}`,
            {
              pID: selectProduct.product?.lifestyle_id
    
            }
          );
        }
    
      } else if (selectProduct.productstype === 'essential') {
        openInNewWindow(
          `/product-details/essential/${generateSlug(selectProduct.name)}`,
          {
            pID: selectProduct.product.id
          }
        );
      } else if (selectProduct.productstype === 'nonEssential') {
        openInNewWindow(
          `/product-details/nonessential/${generateSlug(selectProduct.name)}`,
          {
            pID: selectProduct.product.id
          }
        );
      } else if (selectProduct.productstype === 'education') {
        openInNewWindow(
          `/product-details/education/${generateSlug(selectProduct.name)}`,
          {
            pID: selectProduct.product.education_id
          }
        );
      } else if (selectProduct.productstype === 'hotels') {
        // console.log(selectProduct.product?.HotelCode, selectProduct.product.provider, selectProduct.product?.bookByDays, "Product data value is")
        Cookies.set('productData', JSON.stringify(selectProduct.product), { expires: 1 });
        openInNewWindow(
          `/product-details/hotels/${generateSlug(selectProduct.name)}`,
          {
            pID: selectProduct.product?.HotelCode,
            provider: selectProduct.product.provider,
            bookbydays: selectProduct.product?.bookByDays,
            // product: JSON.stringify(product),
    
            // adultCount: hotelSearchCustomerData?.NoOfAdults,
            // childCount: hotelSearchCustomerData?.NoOfChild,
            // checkIn: hotelSearchCustomerData?.CheckInDate,
            // checkOut: hotelSearchCustomerData?.CheckOutDate
          }
        );
      } else if (selectProduct.productstype === 'transport') {
    
        // console.log("product pass obj",  {
        //   cart: JSON.stringify(cart),
        //   slug: generateSlug(title),
        //   selectedVehicle: JSON.stringify(vehicle)
        // })
        openInNewWindow(
          `/product-details/transport/${generateSlug(title)}`,
          {
            cart: JSON.stringify(cart),
            slug: generateSlug(title),
            selectedVehicle: JSON.stringify(vehicle)
          }
        );
      }
    }

    function removeHtmlTags(str) {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "");
}

  return (
    <>
      {availableCategories.length > 0 && (
        <section className={styles.bestsellers}>
          <div className={styles.container3}>
            <div className={styles.sectionHeader}>
              <div style={{width:'100%',justifyContent:'space-between'}} className={styles.categoryTabs}>
                <div>
                  <span className={styles.sectionTitle2}>Best Seller Products</span> 
                </div>
                {/* Temporarily hide filter tabs when only lifestyle is available */}
                {availableCategories.length > 1 && (
                  <div className={styles.filterTabPanel}>
                    {availableCategories.map((category) => (
                      <button
                        key={category.key}
                        className={`${styles.tab} ${activeBestSellerCategory === category.key ? styles.active : ''}`}
                        onClick={() => setActiveBestSellerCategory(category.key)}
                      >
                       {category.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
        <div className={styles.bestsellersGrid}>
          {bestSellerProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              {product.product?.discount && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  zIndex: 2
                }}>
                  {product?.discount?.discount_tag_line || 'Deal of the day'}
                </div>
              )}
              <div className={styles.productImage_smaller}>
                <img src={product.image} alt={product.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
              <div className={styles.productInfo}>
                <div className={styles.productPrice}>
                 
                  {product.product?.discount ? (
                    <>
                    <span className={styles.currentPrice}>
                      {CurrencyConverter(product.currency, getDiscountProductBaseByPrice(product?.price, product.product?.discount, baseCurrencyValue)["discountedAmount"], baseCurrencyValue)}
                    </span>
                    <span className={styles.originalPrice}>
                        {CurrencyConverter(product.currency, product?.price, baseCurrencyValue)}
                      </span>
                      
                    </>
                  ) : (
                    <span className={styles.currentPrice}>
                     { CurrencyConverter(product.currency,product?.price, baseCurrencyValue) }
                    </span>
                  )}
                </div>
                <h3 className={styles.productName}>
                 {product.name.length > 30 ? product.name.slice(0, 27) + '...' : product.name}
                </h3>
              </div>
              <div className={styles.productActions}>
                <button onClick={() => {clickProductDetail(product)}} className={styles.addToCartBtn}>Add to Cart</button>
                <button onClick={() => handleQuickView(product)} className={styles.quickViewBtn}><RepeatIcon fontSize='small' /> Quick View</button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick View Modal */}
        {showQuickView && selectedProduct && (
          <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
              document.body.classList.remove('modal-open');
              closeQuickView();
            }}
          >
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={closeQuickView}>×</button>
              <div className={styles.modalGrid}>
                <div className={styles.modalImageContainer}>
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className={styles.modalImage}
                  />
                </div>
                <div className={styles.modalDetails}>
                  <h2 className={styles.modalTitle}>{selectedProduct.name}</h2>
                  {/* <div className={styles.modalDescription} 
                    dangerouslySetInnerHTML={{ 
                      __html: selectedProduct.product?.lifestyle_description ||  selectedProduct.product?.HotelDescription || selectedProduct.product?.course_description || selectedProduct.product?.listing_description 
                    }} 
                  /> */}
                   <div className={styles.modalDescription}
                  >
                    <a style={{fontSize: '13px', lineHeight: '1.3'}}>
                      {/* {removeHtmlTags(selectedProduct.product?.lifestyle_description ||  selectedProduct.product?.HotelDescription || selectedProduct.product?.course_description || selectedProduct.product?.listing_description).length > 300 ? styles.modalDescriptionShort : ''} */}
                      {removeHtmlTags(selectedProduct.product?.lifestyle_description ||  selectedProduct.product?.HotelDescription || selectedProduct.product?.course_description || selectedProduct.product?.listing_description)}
                    </a> 
               
                  </div>
                  <div className={styles.modalPrice}>
                    {selectedProduct.product?.discount ? (
                      <>
                        <span className={styles.currentPrice}>
                          {CurrencyConverter(selectedProduct.currency, selectedProduct?.price, baseCurrencyValue)}
                        </span>
                        <span className={styles.originalPrice}>
                          {/* {CurrencyConverter(selectedProduct.currency, getDiscountProductBaseByPrice(selectedProduct?.price, selectedProduct.product?.discount, baseCurrencyValue)["discountedAmount"], baseCurrencyValue)} */}
                        </span>
                      </>
                    ) : (
                      <span className={styles.currentPrice}>
                        {CurrencyConverter(selectedProduct.currency, selectedProduct?.price, baseCurrencyValue)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </section>
      )}
    </>
  );
};

export default BestSellerProducts;