import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import visaimage from '../../public/assets/images/newImages/visamaster.png'
import { AppContext } from '../_app';

const Footer = () => {

  const {
      baseCurrency,
      triggers,
      setTriggers,
      baseLocation,
      userStatus,
      userId,
      baseUserId,
    } = useContext(AppContext);
  const router = useRouter();

  const handleProfile = () => {
    router.push({
      pathname: '/page/account/profile',
      query: { page: 'myProfile-page' }
    })
  }

  const handleTravelbuddy = () => {
    router.push({
      pathname: '/page/account/profile',
      query: { page: 'travel-buddies' }
    })
  }

  const handleChats = () => {
    router.push('/page/account/chats')
  }

  return (
    <>
      <style jsx>{`
        @media (max-width: 1200px) {
          .newsletter-container {
            max-width: 95% !important;
            gap: 15px !important;
          }
          .main-footer {
            grid-template-columns: 1fr 1fr 180px 180px !important;
            gap: 30px !important;
          }
          .newsletter-input {
            width: 280px !important;
          }
        }
        
        @media (max-width: 1024px) {
          .newsletter-container {
            flex-direction: column !important;
            gap: 20px !important;
            align-items: flex-start !important;
          }
          .newsletter-section {
            height: auto !important;
            padding: 30px 20px !important;
          }
          .main-footer {
            grid-template-columns: 1fr 1fr 1fr 1fr !important;
            gap: 30px !important;
          }
          .footer-section {
            min-width: auto !important;
          }
          .newsletter-input {
            width: 100% !important;
            max-width: 300px !important;
          }
          .social-links {
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          .info-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .my-account-section {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid #b9b9b9ff !important;
            padding-top: 30px !important;
          }
        }
        
        @media (max-width: 768px) {
          .footer-main {
            padding: 0px 0 30px !important;
          }
          .newsletter-section {
            padding: 20px 15px !important;
            margin-bottom: 30px !important;
          }
          .newsletter-container {
            padding: 0 15px !important;
            margin-top: 15px !important;
          }
          .main-footer {
            max-width: 95% !important;
            padding: 0 15px !important;
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .footer-section {
            min-width: auto !important;
          }
          .newsletter-input {
            width: 100% !important;
          }
          .input-button-group {
            flex-direction: column !important;
            width: 100% !important;
          }
          .newsletter-button {
            width: 100% !important;
            margin-top: 10px !important;
          }
          .logo-section {
            text-align: center !important;
          }
          .my-account-section {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid #b9b9b9ff !important;
            padding-top: 30px !important;
          }
        }
        
        @media (max-width: 480px) {
          .newsletter-title {
            font-size: 16px !important;
          }
          .phone-number {
            font-size: 18px !important;
          }
          .logo-img {
            width: 150px !important;
          }
          .social-links {
            justify-content: center !important;
          }
          .footer-address {
            text-align: center !important;
          }
        }
      `}</style>
      
      <footer className="footer-main" style={{
        backgroundColor: '#f8f9fa',
        padding: '0px 0 40px',
        borderTop: '1px solid #e9ecef'
      }}>
        {/* Newsletter Section */}
        <div className="newsletter-section" style={{
          backgroundColor: '#ffffff',
          padding: '20px 20px',
          marginBottom: '40px',
          borderTop: '1px solid #e9ecef',
          borderBottom: '1px solid #e9ecef',
          height: '120px',
        }}>
          <div className="newsletter-container" style={{
            maxWidth: '90%',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ffffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}>
                {/* <svg width="20" height="16" viewBox="0 0 24 20" fill="none">
                  <path d="M2 4L12 12L22 4V2H2V4Z" fill="#6c757d"/>
                  <path d="M2 6V18H22V6L12 14L2 6Z" fill="#6c757d"/>
                </svg> */}
              </div>
              <div>
                <h3 className="newsletter-title" style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {/* Sign up for Newsletter */}
                </h3>
                <p style={{
                  margin: '0',
                  fontSize: '15px',
                  color: '#6c757d'
                }}>
       
                </p>
              </div>
            </div>
            <div className="input-button-group" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0px',
              backgroundColor: '#bb1a1aff'
            }}>
              {/* <input
                type="email"
                placeholder="Email Address"
                className="newsletter-input"
                style={{
                  padding: '12px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '350px',
                  outline: 'none'
                }}
              /> */}
              {/* <button className="newsletter-button" style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Subscribe
              </button> */}
            </div>
            <div className="social-links" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}>
            <a  href="https://www.facebook.com/aahaas2020?mibextid=LQQJ4d" style={{
                color: '#6c757d',
                textDecoration: 'none',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ fontSize: '12px' }}></span>
                Facebook
              </a>
              <a href="https://www.instagram.com/aahaas_app?igsh=bm92OXloem5jMzcy" style={{
                color: '#6c757d',
                textDecoration: 'none',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ fontSize: '12px' }}></span>
              Instagram
              </a>
              <a  href="https://www.tiktok.com/@aahaastiktok?_t=ZS-8zPoa03uNcH&_r=1" style={{
                color: '#6c757d',
                textDecoration: 'none',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ fontSize: '12px' }}></span>
               TikTok
              </a>
              <a href="https://www.linkedin.com/company/aahaas/" style={{
                color: '#6c757d',
                textDecoration: 'none',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ fontSize: '12px' }}></span>
                LinkedIn
              </a>
          </div>
        </div>
      </div>

        {/* Main Footer Content */}
        <div className="main-footer" style={{
          maxWidth: '88%',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: userStatus.userLoggesIn ? '1fr 1fr 200px 200px 200px' : '1fr 1fr 200px 200px',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* Left Section - Logo & Contact */}
          <div className="footer-section logo-section" style={{ minWidth: '300px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '30px'
            }}>
             
               <img
              src={`/assets/images/icon/logo.png`}
              alt="logo"
              className="logo-img"
              style={{ width: '180px', height: 'auto' }}
            />
              
            </div>

            <div style={{ marginBottom: '25px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <span style={{
                  fontSize: '16px',
                  color: '#6c757d'
                }}>📞</span>
                <div>
                  <p style={{
                    margin: '0',
                    fontSize: '15px',
                    color: '#6c757d',
                    fontWeight: '500'
                  }}>
                    GOT QUESTION? CALL US 24/7!
                  </p>
                  <p className="phone-number" style={{
                    margin: '0',
                    fontSize: '22px',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                 +94 11 235 2400
                  </p>
                </div>
              </div>
              
              <address className="footer-address" style={{
                fontStyle: 'normal',
                fontSize: '15px',
                color: '#6c757d',
                lineHeight: '1.5',
                marginBottom: '10px'
              }}>
                One Galle Face Tower, 2208, 1A Centre Road,
                Colombo 2,Sri Lanka
              </address>
              
              {/* <a href="#" style={{
                color: '#17a2b8',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📍 Find is on map
              </a> */}
            </div>
          </div>

          {/* Second Section - Duplicate of Logo & Contact */}
          <div className="footer-section" style={{ minWidth: '300px' }}>
         <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px'
            }}>
           
              <p style={{
                margin: '0',
                fontSize: '15px',
                color: '#6c757d',
                fontWeight: '500',
                lineHeight: '1.3'
              }}>
              ARE YOU REALLY TRAVELING WITH THE RIGHT BUDDY ?
              </p>
            </div>

          <div style={{ marginBottom: '25px' }}>
            
            <address style={{
              fontStyle: 'normal',
              fontSize: '15px',
              color: '#6c757d',
              lineHeight: '1.5',
              marginBottom: '10px'
            }}>
             Every journey becomes a canvas painted with the hues of your soul. With Aahaas, traverse the globe in ways only your heart can envision – with unparalleled tools each moment crafted by your desires, each destination a testament to your individuality. Irreplaceable, unforgettable, uniquely yours.
            </address>
          </div>
        </div>

          {/* Payments Section - Separate Column */}
          <div className="footer-section" style={{ minWidth: '300px' }}>
            <h4 style={{
              margin: '0 0 20px 0',
              fontSize: '15px',
              fontWeight: '500',
              color: '#6c757d',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
                 lineHeight: '1.3'
            }}>
              {/* WE USING SAFE PAYMENTS */}
              WE ENSURE SAFE AND <br></br> SECURE PAYMENTS
            </h4>
            <div>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '15px'
              }}>
                {/* {['MC', 'VISA'].map((card, index) => (
                  <div key={index} style={{
                    width: '40px',
                    height: '26px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#6c757d'
                  }}>
                    VISA
                  </div>
                ))} */}
                 {/* <div style={{
             width: '70px',
                    height: '36px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6c757d'
                  }}>
                 <div style={{
                    width: '60px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#6c757d',
                    backgroundImage: 'url(https://gateway.aahaas.com/apay.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}>
                  </div>
                  </div>
                */}
                    <div style={{
                  width: '80px',
                    height: '36px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6c757d'
                  }}>
                  <div style={{
                    width: '60px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img 
                      src={visaimage.src} 
                      alt="Visa/Mastercard"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  </div>
                    <div style={{
                    width: '70px',
                    height: '36px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6c757d'
                  }}>
                     <div style={{
                    width: '60px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#6c757d',
                    backgroundImage: 'url(https://gateway.aahaas.com/apay.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}>
                  </div>
                    
                    
                  </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
              </div>
            </div>
          </div>

          {/* Center Section - Categories */}
          <div className="info-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '20px',
          }}>
          <div>
            <h4 style={{
              margin: '0 0 20px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
             INFORMATION
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: '0',
              margin: '0',
              display: 'block' // Explicitly force block display
            }}>
            <li style={{ 
                  marginBottom: '8px',
                  display: 'block', // Force each li to be block
                  width: '100%'     // Take full width
                }}>
                  <a href="/page/AboutUs" style={{
                    color: '#6c757d',
                    textDecoration: 'none',
                    fontSize: '15px',
                    lineHeight: '1.4',
                    display: 'block' // Make links block to stack vertically
                  }}>
                   About Us
                  </a>
                </li>
                  <li  style={{ 
                  marginBottom: '8px',
                  display: 'block', // Force each li to be block
                  width: '100%'     // Take full width
                }}>
                  <a href="/page/helpcenter" style={{
                    color: '#6c757d',
                    textDecoration: 'none',
                    fontSize: '15px',
                    lineHeight: '1.4',
                    display: 'block' // Make links block to stack vertically
                  }}>
                   FAQ
                  </a>
                </li>
                  <li  style={{ 
                  marginBottom: '8px',
                  display: 'block', // Force each li to be block
                  width: '100%'     // Take full width
                }}>
                  <a href="/page/privacypolicy" style={{
                    color: '#6c757d',
                    textDecoration: 'none',
                    fontSize: '15px',
                    lineHeight: '1.4',
                    display: 'block' // Make links block to stack vertically
                  }}>
                  Privacy policy
                  </a>
                </li>
                  <li style={{ 
                  marginBottom: '8px',
                  display: 'block', // Force each li to be block
                  width: '100%'     // Take full width
                }}>
                  <a href="/page/termsAndConditions" style={{
                    color: '#6c757d',
                    textDecoration: 'none',
                    fontSize: '15px',
                    lineHeight: '1.4',
                    display: 'block', // Make links block to stack vertically
                    whiteSpace: 'nowrap' // Prevent line wrapping
                  }}>
                Terms And Conditions
                  </a>
                </li>
            </ul>
          </div>
          </div>

          {/* Right Section - Customer Care or Additional Links */}
          {
            userStatus.userLoggesIn && (
              // Show MY ACCOUNT section for logged in users only
              <div className="footer-section my-account-section" style={{borderLeft: '1px solid #b9b9b9ff', paddingLeft: '40px', minWidth: '180px'}}>
                <h4 style={{
                  margin: '0 0 20px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#333',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap' // Prevent header from wrapping
                }}>
                 MY ACCOUNT
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0',
                  display: 'block' // Explicitly force block display
                }}>
                  <li style={{ 
                    marginBottom: '8px',
                    display: 'block', // Force each li to be block
                    width: '100%'     // Take full width
                  }}>
                    <a href="#" onClick={handleProfile} style={{
                      color: '#6c757d',
                      textDecoration: 'none',
                      fontSize: '15px',
                      lineHeight: '1.4',
                      display: 'block', // Make links block to stack vertically
                      cursor: 'pointer'
                    }}>
                      Profile
                    </a>
                  </li>
                  <li style={{ 
                    marginBottom: '8px',
                    display: 'block', // Force each li to be block
                    width: '100%'     // Take full width
                  }}>
                    <a href="#" onClick={handleTravelbuddy} style={{
                      color: '#6c757d',
                      textDecoration: 'none',
                      fontSize: '15px',
                      lineHeight: '1.4',
                      display: 'block', // Make links block to stack vertically
                      cursor: 'pointer',
                      whiteSpace: 'nowrap' // Prevent line wrapping
                    }}>
                      My Travel Buddies
                    </a>
                  </li>
                  <li style={{ 
                    marginBottom: '8px',
                    display: 'block', // Force each li to be block
                    width: '100%'     // Take full width
                  }}>
                    <a href="#" onClick={handleChats} style={{
                      color: '#6c757d',
                      textDecoration: 'none',
                      fontSize: '15px',
                      lineHeight: '1.4',
                      display: 'block', // Make links block to stack vertically
                      cursor: 'pointer'
                    }}>
                      Chats
                    </a>
                  </li>
                </ul>
              </div>
            )
          }
       
        </div>
      </footer>
    </>
  );
};

export default Footer;