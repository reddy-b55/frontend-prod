import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import getDiscountProductBaseByPrice from '../../../pages/product-details/common/GetDiscountProductBaseByPrice';

const LifestylesPricing = (props) => {

    const [packageData, setPackageData] = useState([]);

    const handleOnPressSelectPackage = (packageData) => {
        props.handlePackageRate(packageData);
    };
    // console.log("Package Data", props);

    // Define a common theme for consistent styling
    const theme = {
        cardBackground: '#FFFFFF', // white background
        cardTextColor: '#000000', // black text color
        cardTitleFontSize: 19,
        cardTitleFontWeight: '700',
        cardTextFontSize: 16,
        cardTextFontWeight: '500',
        cardBorderRadius: '0',
        errorBackground: '#ffb3b3',
        nonPackageBackground: '#F2F2F2',
        descriptionFontSize: 14,
        buttonClass: 'btn btn-sm btn-solid',
        LineWeight: '20px'
    };

    const packageRate = {
        fontSize: "18px",
        color: "#222222",
        fontWeight: "700",
        marginBottom: '0px'
    }

    const getAvailableDiscountByPackageId = (packageId) => {
        var discountMetaValueSet = null;
        const dis = props?.discounts
        if (props?.discountClaimed == false) {
            // console.log("discountMetaValueSet wwww", props?.discountClaimed, dis);
            if (dis?.length > 0) {
                const filteredDiscounts = dis.filter(
                    (data) => data?.origin_package_rate_id == packageId
                );

                discountMetaValueSet =
                    filteredDiscounts.length > 0 ? filteredDiscounts?.[0] : null;
            }
        }
        // console.log("discountMetaValueSetttttt is", discountMetaValueSet);
        return discountMetaValueSet;
    };

    useEffect(() => {
        // console.log("Package Data issssss", props.packageData);
        setPackageData(props.packageData);
    }, [props.packageData]);

    return (
        <>
            {props.packageError === true ?
                <div>
                    <p className="p-4 rounded-2" style={{ backgroundColor: theme.errorBackground, fontSize: theme.descriptionFontSize, lineHeight: theme.LineWeight, color: 'white' }}>
                        Based on your pax count, we can't offer a suitable package. Please adjust your passenger count and try again for alternatives.
                    </p>
                    {packageData.map((value, index) => (
                        <div className='non_package_main p-3 my-2 rounded-3 mb-2' style={{ backgroundColor: theme.nonPackageBackground }} key={index}>
                            <p style={{ fontSize: theme.cardTitleFontSize, fontWeight: theme.cardTitleFontWeight, textTransform: 'capitalize' }}>{value.package_name + " - " + value.package_type} <span className="text-muted" style={{ fontSize: 10 }}> {" "}(package type)</span></p>
                            <p className="non_package_main_desc">
                                {value.max_adult_occupancy === 0 ? 'Adults are Not Allowed for this package' : value.max_child_occupancy === 0 ? 'Children are Not Allowed for this package' : null}
                            </p>
                            <div>
                                <p>Minimum adult occupancy: {value.min_adult_occupancy}</p>
                                <p>Maximum adult occupancy: {value.max_adult_occupancy}</p>
                            </div>
                            <div>
                                <p>Minimum child occupancy: {value.min_child_occupancy}</p>
                                <p>Maximum child occupancy: {value.max_child_occupancy}</p>
                                <p>Total occupancy: {value.total_occupancy}</p>
                            </div>
                        </div>
                    ))}
                </div>
                :
                <Container className="mt-4">
                    <Row className='lifestyle-packages scrollBarDefault-design'>
                        {packageData.map((data, index) => (

                            <Col md="12" key={index} className="mb-4">
                                <Card style={{ backgroundColor: theme.cardBackground, borderRadius: theme.cardBorderRadius }}>
                                    <CardBody>

                                        <h5 className='m-0 p-0 mb-0' style={{ textAlign: 'left' }}>{data.package_name + " - " + data.package_type}</h5>
                                        <h6 className='m-0 p-0 mb-4' style={{ lineHeight: '20px' }}>{data.description}</h6>

                                        {
                                            data.rate_type === "Package" ? (
                                                <>
                                                    {/* <h4 style={packageRate}>{CurrencyConverter(data.currency, data.package_rate, props.currency)}</h4> */}
                                                    {/* <h4 style={packageRate}>{CurrencyConverter(data.currency, data.package_rate, props.currency)}</h4> */}
                                                    <span className="text-muted" style={{ fontSize: "10px" }}>Package rate</span>
                                                    {getAvailableDiscountByPackageId(data?.package_id)?.discount_type == "value" || getAvailableDiscountByPackageId(data?.package_id)?.discount_type == "precentage" ? (
                                                        <><h3 className="m-0 p-0">
                                                            {CurrencyConverter(data.currency, data?.rate_type == "Package" ?
                                                                getDiscountProductBaseByPrice(data?.package_rate, getAvailableDiscountByPackageId(data?.package_id), props.currency)["discountedAmount"]
                                                                : getDiscountProductBaseByPrice(
                                                                    data?.child_rate +
                                                                    data?.adult_rate,
                                                                    getAvailableDiscountByPackageId(data?.package_id),
                                                                    props.currency
                                                                )["discountedAmount"],
                                                                props.currency
                                                            )}</h3>
                                                            <h6 style={{ textDecoration: "line-through" }} className="m-0 p-0">
                                                                {CurrencyConverter(data?.currency, data?.rate_type == "Package" ?
                                                                    getDiscountProductBaseByPrice(data.package_rate, getAvailableDiscountByPackageId(), props.currency)["actual"]
                                                                    : getDiscountProductBaseByPrice(
                                                                        data?.child_rate +
                                                                        data?.adult_rate,
                                                                        getAvailableDiscountByPackageId(data?.package_id),
                                                                        props.currency
                                                                    )["actual"],
                                                                    props.currency
                                                                )}</h6></>
                                                    ) : (
                                                        <h4 style={packageRate}>{CurrencyConverter(data.currency, data.package_rate, props.currency)}</h4>
                                                    )}

                                                    {/* <h4 style={packageRate} className='mt-2'>{CurrencyConverter(data.currency, data.per_person_rate, props.currency)}</h4>
                                                    <span className="text-muted" style={{ fontSize: "10px" }}>Per Person Rate</span> */}
                                                </>
                                            ) : (
                                                <>
                                                    {
                                                        data.adult_rate > 0 && (
                                                            <>
                                                                {/* <h4 style={packageRate}> {CurrencyConverter(data.currency, data.adult_rate, props.currency)}</h4> */}

                                                                {getAvailableDiscountByPackageId(data?.package_id)?.discount_type == "value" || getAvailableDiscountByPackageId(data?.package_id)?.discount_type == "precentage" ? (
                                                                    <><h3 className="m-0 p-0">
                                                                        {CurrencyConverter(data.currency, data?.rate_type == "Package" ?
                                                                            getDiscountProductBaseByPrice(data?.package_rate, getAvailableDiscountByPackageId(data?.package_id), props.currency)["discountedAmount"]
                                                                            : getDiscountProductBaseByPrice(
                                                                                data?.child_rate +
                                                                                data?.adult_rate,
                                                                                getAvailableDiscountByPackageId(data?.package_id),
                                                                                props.currency
                                                                            )["discountedAmount"],
                                                                            props.currency
                                                                        )}</h3>
                                                                        <h6 style={{ textDecoration: "line-through" }} className="m-0 p-0">
                                                                            {CurrencyConverter(data?.currency, data?.rate_type == "Package" ?
                                                                                getDiscountProductBaseByPrice(data.package_rate, getAvailableDiscountByPackageId(), props.currency)["actual"]
                                                                                : getDiscountProductBaseByPrice(
                                                                                    data?.child_rate +
                                                                                    data?.adult_rate,
                                                                                    getAvailableDiscountByPackageId(data?.package_id),
                                                                                    props.currency
                                                                                )["actual"],
                                                                                props.currency
                                                                            )}</h6></>
                                                                ) : (
                                                                   <h4 style={packageRate}> {CurrencyConverter(data.currency, data.adult_rate, props.currency)}</h4>
                                                                )}

                                                                <span className="text-muted mb-2" style={{ fontSize: "10px" }}>{`Price for ${props.adultCount} ${props.adultCount === 1 ? 'Adult' : 'Adults'}`}</span>
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        data.child_rate > 0 && (
                                                            <>
                                                                <h4 style={packageRate}>{CurrencyConverter(data.currency, data.child_rate, props.currency)}</h4>
                                                                <span className="text-muted" style={{ fontSize: "10px" }}>{`Price for ${props.childCount > 0 ? ` ${props.childCount} ${props.childCount === 1 ? 'Child' : 'Children'}` : ''}`}</span>
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )
                                        }
                                        <Col className='d-flex flex-column align-items-end'>
                                            <Button className={theme.buttonClass} onClick={() => handleOnPressSelectPackage(data)}>
                                                {(props.packageStatus && props.packageData[0].package_id === data.package_id) ? 'Selected' : "Select Package"}
                                            </Button>
                                        </Col>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            }
        </>
    );
};

export default LifestylesPricing;
