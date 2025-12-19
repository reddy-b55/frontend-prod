import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";

import { AppContext } from '../../../_app';
import CommonLayout from '../../../../components/shop/common-layout';

import ProfilePage from './myProfile-page';
import SavedAddressPage from './saved-address-page';
import MyCarts from './my-carts';
import TravelBuddies from './travel-buddies';

const Profile = () => {

    const router = useRouter();

    const { userStatus } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState(null);

    const handleMobileView = () => {
        setActiveTab("2")
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    const handleGoBack = () => {
        setActiveTab("1")
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    const handleActiveTab = (value) => {
        if (value === "1") {
            router.replace({
                pathname: '/page/account/profile',
                query: { page: 'myProfile-page' }
            });
        } else if (value === "2") {
            router.replace({
                pathname: '/page/account/profile',
                query: { page: 'saved-address-page' }
            });
        } else if (value === "3") {
            router.replace({
                pathname: '/page/account/profile',
                query: { page: 'my-carts' }
            });
        } else if (value === "4") {
            router.replace({
                pathname: '/page/account/profile',
                query: { page: 'travel-buddies' }
            });
        }
    }

    useEffect(() => {
        if (router.query.page === 'saved-address-page') {
            setActiveTab("2");
        } else if (router.query.page === 'myProfile-page') {
            setActiveTab("1");
        } else if (router.query.page === 'my-carts') {
            setActiveTab("3");
        } else if (router.query.page === 'travel-buddies') {
            setActiveTab("4");
        }
    }, [router.query.page]);

    return (
        <>
            <Head>
                <title>Aahaas - Profile</title>
            </Head>
            <CommonLayout parent="home" title="profile" showMenuIcon={false} showSearchIcon={false}>
                <section className="tab-product m-0">
                    <Container>
                        <Row>
                            {
                                userStatus.userLoggesIn ?
                                    <Col sm="12" lg="12" md="12">
                                        <Row className="product-page-main m-0 p-0">
                                            <Nav tabs className="nav-material d-none d-lg-flex d-md-flex justify-content-start mt-md-3">
                                                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                                                    <NavLink className={activeTab === "1" ? "active" : ""} style={{ fontSize: '15px' }} onClick={() => handleActiveTab("1")}>Profile Details</NavLink>
                                                </NavItem>
                                                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                                                    <NavLink className={activeTab === "2" ? "active" : ""} style={{ fontSize: '15px' }} onClick={() => handleActiveTab("2")}>Saved Addresses</NavLink>
                                                </NavItem>
                                                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                                                    <NavLink className={activeTab === "3" ? "active" : ""} style={{ fontSize: '15px' }} onClick={() => handleActiveTab("3")}>My carts</NavLink>
                                                </NavItem>
                                                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                                                    <NavLink className={activeTab === "4" ? "active" : ""} style={{ fontSize: '15px' }} onClick={() => handleActiveTab("4")}>My travel buddies</NavLink>
                                                </NavItem>
                                            </Nav>
                                            <TabContent activeTab={activeTab} className="nav-material">
                                                <TabPane tabId="1">
                                                    <ProfilePage handleMobileView={handleMobileView} activeTab={activeTab}/>
                                                </TabPane>
                                                <TabPane tabId="2">
                                                    <SavedAddressPage handleGoBack={handleGoBack} productView={false} activeTab={activeTab}/>
                                                </TabPane>
                                                <TabPane tabId="3">
                                                    <MyCarts handleGoBack={handleGoBack} productView={false} activeTab={activeTab}/>
                                                </TabPane>
                                                <TabPane tabId="4">
                                                    <TravelBuddies handleGoBack={handleGoBack} productView={false} activeTab={activeTab}/>
                                                </TabPane>
                                            </TabContent>
                                        </Row>
                                    </Col> :
                                    <div className='d-flex flex-column align-items-center justify-content-center p-5 my-5'>
                                        <h2>Oops! something went wrong..</h2>
                                        <h5>To continue, please log in to your account. This helps us provide a personalized experience and keep your information secure.</h5>
                                        <Link href='/page/account/login-auth/' className='btn btn-solid btn-sm mt-4'>Login / Register</Link>
                                    </div>
                            }
                        </Row>
                    </Container>
                </section>
            </CommonLayout>
        </>
    )
}

export default Profile;