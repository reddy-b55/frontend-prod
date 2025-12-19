import Link from "next/link";
import React, { useContext } from "react";
import { Container, Row, Col, Media } from "reactstrap";
import { useRouter } from "next/router";
import { AppContext } from "../_app";
import qrCode from '../../public/assets/images/qr/logoNew.png'
import Image from "next/image";
import facebook from '../../public/assets/images/footerIcons/facebook-logo.png';
import instagram from '../../public/assets/images/footerIcons/instagram.png';
import linkedin from '../../public/assets/images/footerIcons/linkedin.png';
import tiktok from '../../public/assets/images/footerIcons/tik-tok.png';

export async function getServerSideProps() {
  return {
    props: {
      footerContent_int: footerContent,
    },
  };
}

const MasterFooter = ({ logoName, layoutClass, footerClass, belowSection, CopyRightFluid, footerContent, footerContent_int }) => {

  const { userStatus } = useContext(AppContext);

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

  const handleAboutUs = () => {
    router.replace('/know-more');
  };

  const footerContent_data = {
    title: 'Are you really holidaying on your holiday?',
    paragraph: 'Every journey becomes a canvas painted with the hues of your soul. With Aahaas, traverse the globe in ways only your heart can envision – with unparalleled tools each moment crafted by your desires, each destination a testament to your individuality. Irreplaceable, unforgettable, uniquely yours.',
    note: 'Uniquely Yours !',
    officeAddress: 'One Galle Face Tower, 2208, 1A Centre Road, Colombo 2, Sri Lanka',
    // officeAddress2: 'Colombo 2, Sri Lanka',
    contactNo: 'Call Us: +94 11 235 2400',
    mailAddress: 'info@aahaas.com'
  }

  return (
    <footer className={footerClass} style={{ borderTop: "2px solid #ed4242", backgroundColor: "#f9f9f9" }}>

      <section className={belowSection}>
        <Container>
          <Row className="footer-theme partition-f mb-lg-2" style={{ fontSize: '17px' }}>



            <Col className={userStatus.userLoggesIn ? 'col-lg-4 col-md-12 col-sm-4 sub-title mt-md-3 mt-3 mt-lg-0' : 'sub-title mt-md-3 mt-3 mt-lg-0 col-lg-3 col-md-12 col-sm-4'} style={{ maxWidth: '100%', fontSize: '16px', paddingRight: 80 }}>
              <div className="footer-contant">
                <div className="footer-logo" >
                  <img src={`/assets/images/icon/logo.png`} alt="aahaas footer logo" style={{ width: '145px', height: 'auto', marginBottom: '15px' }} />
                </div>
                <div>
                  <p className="mx-2" style={{ fontWeight: '700', fontSize: 15 }}>{footerContent?.title || footerContent_data?.title}</p>
                  <p className="mx-2" style={{ lineHeight: '2', fontSize: '13px', fontWeight: '400', color: '#495057' }}>{footerContent?.paragraph || footerContent_data?.paragraph}</p>
                  <p className="mx-2 mt-3" style={{ lineHeight: '2', fontSize: '13px', fontWeight: '600', color: '#495057' }}>{footerContent?.note || footerContent_data?.note}</p>
                  {/* <p className="mx-2 mt-3" style={{ lineHeight: '2', fontSize: '11px', fontWeight: '400', color: '#495057' }}>v 1.0.235</p> */}
                </div>
              </div>
            </Col>


            {
              userStatus.userLoggesIn &&
              <Col className="col-lg-2 col-md-4 mt-md-3 mt-3 mt-lg-0 col-sm-4 sub-title px-3">
                <p className="m-0 p-0" style={{ fontSize: 15, color: 'black', fontWeight: '500', textAlign: 'start' }}>MY ACCOUNT</p>
                <hr className="my-1 p-0" style={{ color: "rgb(0,78,100)", fontWeight: "bolder" }} />
                <div className="footer-contant ">
                  <ul>
                    <li><button style={{ all: 'unset', fontSize: 12, fontWeight: '400', lineHeight: '20px' }} onClick={handleProfile}>Profile</button></li>
                    <li><button style={{ all: 'unset', fontSize: 12, fontWeight: '400', lineHeight: '20px' }} onClick={handleTravelbuddy}>My travel buddies</button></li>
                    <li><button style={{ all: 'unset', fontSize: 12, fontWeight: '400', lineHeight: '20px' }} onClick={handleChats}>Chats</button></li>
                  </ul>
                </div>
              </Col>
            }

            <Col className={userStatus.userLoggesIn ? 'col-lg-2 col-md-4 col-sm-4 sub-title px-3 mt-md-3 mt-3 mt-lg-0' : 'sub-title px-3 mt-md-3 mt-3 mt-lg-0 col-lg-3  col-md-6 col-sm-4'}>
              <p className="m-0 p-0" style={{ fontSize: 15, color: 'black', fontWeight: '500', textAlign: 'start' }}>INFORMATION</p>
              <hr className="my-1 p-0" style={{ color: "rgb(0,78,100)", fontWeight: "bolder" }} />
              <div className="footer-contant ">
                <ul>
                  <li><Link style={{ fontSize: 13, fontWeight: '400', lineHeight: '20px' }} href="/page/AboutUs">About Us</Link></li>
                  <li><Link style={{ fontSize: 13, fontWeight: '400', lineHeight: '20px' }} href="/page/helpcenter">FAQ</Link></li>
                  <li><Link style={{ fontSize: 13, fontWeight: '400', lineHeight: '20px' }} href="/page/privacypolicy">Privacy policy</Link></li>
                  <li><Link style={{ fontSize: 13, fontWeight: '400', lineHeight: '20px' }} href="/page/termsAndConditions">Terms And Conditions</Link></li>
                </ul>
              </div>
            </Col>

            <Col className={userStatus.userLoggesIn ? 'col-lg-2 col-md-4 col-sm-4 sub-title px-3 mt-md-3 mt-3 mt-lg-0 mb-3' : 'sub-title px-3 mt-md-3 mt-3 mt-lg-0 col-lg-3 col-md-6 col-sm-4 mb-3'}>
              <p className="m-0 p-0" style={{ fontSize: 15, color: 'black', fontWeight: '500', textAlign: 'start' }}>GET IN TOUCH</p>
              <hr className="my-1 p-0" style={{ color: "rgb(0,78,100)", fontWeight: "bolder" }} />
              <div className="footer-contant ">
                <ul className="contact-list">
                  <li style={{ fontSize: 14, lineHeight: '20px' }} className="d-flex align-items-start" >
                    <div>

                      <p className="m-0 p-0" style={{ lineHeight: '25px', fontSize: 12, fontWeight: '400', }}><i style={{ marginTop: '-2px', fontSize: '14px', color: 'rgb(0, 78, 100)' }} className="fa fa-map-marker"></i>{footerContent_data?.officeAddress}</p>
                      <p className="m-0 p-0" style={{ lineHeight: '25px', fontSize: 12, fontWeight: '400', }}><i style={{ marginTop: '-2px', fontSize: '14px', color: 'rgb(0, 78, 100)' }} className="fa fa-map-marker"></i>{footerContent_data?.officeAddress2}</p>
                    </div>
                  </li>
                  <li style={{ fontSize: 14, lineHeight: '20px' }} className="d-flex align-items-start" >
                    <p className="m-0 p-0" style={{ lineHeight: '25px', fontSize: 12, fontWeight: '400', }}><i style={{ marginTop: '-4px', fontSize: '14px', color: 'rgb(0, 78, 100)' }} className="fa fa-phone"></i>{footerContent?.contactNo || footerContent_data?.contactNo}</p>
                  </li>
                  <li style={{ fontSize: 14, lineHeight: '20px' }} className="d-flex align-items-start" >
                    <p className="m-0 p-0" style={{ lineHeight: '25px', fontSize: 12, fontWeight: '400', }}><i style={{ marginTop: '-5px', fontSize: '14px', color: 'rgb(0, 78, 100)' }} className="fa fa-envelope"></i>Email Us: <a style={{ textTransform: "lowercase" }} href="mailto:info@aahaas.com?subject=Hello&body=This%20is%20a%20test%20email.">{footerContent?.mailAddress || footerContent_data.mailAddress}</a></p>
                  </li>
                </ul>
              </div>

              <div className="footer-contant " style={{ marginTop: '60px' }}>
                {/* <div className="app-store-icons d-flex justify-content-center align-items-center mb-3 flex-wrap gap-3">
                  <Col>
                    <Row>
                      <div>
                        <a
                          href="https://play.google.com/store/apps/details?id=com.aahaastech.aahaas"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-store-link"
                          style={{ textDecoration: 'none' }}
                        >
                          <img
                            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                            alt="Get it on Google Play"
                            style={{
                              height: '65px',
                              width: 'auto',
                              transition: 'transform 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        </a>
                      </div>
                    </Row>

                    <Row>

                      <div style={{ marginLeft: '10px', marginBottom: '40px' }}>
                        <a
                          href="https://apps.apple.com/lk/app/aahaas-lifestyle-travel-app/id6450589764"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-store-link"
                          style={{ textDecoration: 'none' }}
                        >
                          <img
                            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                            alt="Download on the App Store"
                            style={{
                              height: '49px',
                              width: 'auto',
                              transition: 'transform 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        </a>
                      </div>
                    </Row>
                  </Col>
                  <Col>
                    <div style={{}}>
                      <a
                        href="https://apps.apple.com/lk/app/aahaas-lifestyle-travel-app/id6450589764"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-store-link"
                        style={{ textDecoration: 'none' }}
                      >
                        <Image
                          src={qrCode}
                          alt="QR Code for App Download"
                          style={{
                            height: '108px',
                            width: 'auto',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </a>
                      <p className="m-0 p-0 text-left w-100 mb-2" style={{ lineHeight: '25px', fontSize: 12, fontWeight: '400' }}>
                        Scan and download
                      </p>
                    </div>

                  </Col>
                </div> */}
              </div>
            </Col>

            <Col className={userStatus.userLoggesIn ? 'col-lg-2 col-md-4 col-sm-4 sub-title px-3 mt-md-3 mt-3 mt-lg-0' : 'sub-title px-3 mt-md-3 mt-3 mt-lg-0 col-lg-3  col-md-6 col-sm-4'}>
              <p className="m-0 p-0" style={{ fontSize: 15, color: 'black', fontWeight: '500', textAlign: 'start' }}>SCAN & DOWNLOAD</p>
              <hr className="my-1 p-0" style={{ color: "rgb(0,78,100)", fontWeight: "bolder" }} />
              <div className="footer-contant ">
                <div className="app-store-icons d-flex justify-content-center align-items-center mb-3 flex-wrap gap-3">
                  <Col>
                    <Row>
                      <div style={{ marginTop: '15px' }}>
                        <a
                          href="https://play.google.com/store/apps/details?id=com.aahaastech.aahaas"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-store-link"
                          style={{ textDecoration: 'none' }}
                        >
                          <img
                            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                            alt="Get it on Google Play"
                            style={{
                              height: '42px',
                              width: 'auto',
                              transition: 'transform 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        </a>
                      </div>
                    </Row>

                    <Row>

                      <div style={{ marginLeft: '7px', marginBottom: '40px' }}>
                        <a
                          href="https://apps.apple.com/lk/app/aahaas-lifestyle-travel-app/id6450589764"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-store-link"
                          style={{ textDecoration: 'none' }}
                        >
                          <img
                            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                            alt="Download on the App Store"
                            style={{
                              height: '32px',
                              width: 'auto',
                              transition: 'transform 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        </a>
                      </div>
                    </Row>
                  </Col>
                  <Col>
                    <div style={{ marginBottom: '20px' }}>
                      <a
                        // href="https://apps.apple.com/lk/app/aahaas-lifestyle-travel-app/id6450589764"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-store-link"
                        style={{ textDecoration: 'none' }}
                      >
                        <Image
                          src={qrCode}
                          alt="QR Code for App Download"
                          style={{
                            height: '70px',
                            width: 'auto',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer',
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </a>
                      <p className="m-0 p-0 text-left w-100 mb-2" style={{ lineHeight: '25px', fontSize: 12, fontWeight: '400' }}>
                      </p>
                    </div>

                  </Col>
                </div>
              </div>
            </Col>

            <hr className="mt-1" />

            {/* Updated footer end section with app store icons */}
            <div
              className="footer-end"
              style={{
                marginTop: '2rem',
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                justifyContent: window.innerWidth < 768 ? 'center' : 'space-between',
                alignItems: 'center',
                gap: window.innerWidth < 768 ? '16px' : '0'
              }}
            >
              {/* Copyright Section */}
              <p style={{ fontSize: 16, margin: 0 }}>
                <i className="fa fa-copyright" style={{ color: '#ed4242', fontWeight: 'bold' }}></i> 2025 Aahaas
              </p>

              {/* Social Media Icons */}
              <div style={{ display: 'flex', gap: '8px', marginRight: '2%' }}>
                <button
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <a
                    href="https://www.facebook.com/aahaas2020?mibextid=LQQJ4d"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                    <Image src={facebook} alt="Facebook Logo" style={{ width: '20px', height: '20px' }} />
                  </a>
                </button>
                <button
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <a
                    href="https://www.instagram.com/aahaas_app?igsh=bm92OXloem5jMzcy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                     <Image src={instagram} alt="Facebook Logo" style={{ width: '20px', height: '20px' }} />
                  </a>
                 
                </button>
                <button
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <a
                    href="https://www.linkedin.com/company/aahaas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                  <Image src={linkedin} alt="Facebook Logo" style={{ width: '20px', height: '20px' }} />

                  </a>
                </button>
                <button
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <a
                    href="https://www.tiktok.com/@aahaastiktok?_t=ZS-8zPoa03uNcH&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                  <Image src={tiktok} alt="Facebook Logo" style={{ width: '20px', height: '20px' }} />

                  </a>
                </button>
              </div>
            </div>

          </Row>
        </Container>
      </section>

    </footer>
  );
};

export default MasterFooter;