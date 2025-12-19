import React, { useContext, useState } from 'react';
import { 
  ArrowBack, 
  Check, 
  DataUsage, 
  NetworkCell, 
  ArrowForward 
} from '@mui/icons-material';
import { 
  CalendarMonth, 
  Message 
} from '@mui/icons-material';
import { SimCard } from '@mui/icons-material';
import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
// import { CurrencyData } from '../../Context/CurrencyContext';
import { AppContext } from '../../../pages/_app';

export default function PackageSelectorSim({ handleOnPressContinueData, handleClickBack, esimPackages, selectedParams = {} }) {
    // Use the provided eSIM packages data
    console.log("eSIM Packages Data:", selectedParams);
    // const packageData = esimPackages || [];
    const packageData = esimPackages.filter(pkg => 
    pkg.coverage === selectedParams.coverage && 
    pkg.validity === selectedParams.duration && 
    pkg.data === selectedParams.usage
);
   
    // State to track selected package (store the full package object)
    const [selectedPackageData, setSelectedPackageData] = useState(null);
    // const { currencyData, setCurrencyData } = useContext(CurrencyData);
      const { userStatus, baseUserId, baseCurrencyValue, baseLocation } =
        useContext(AppContext);
    
    const handleBack = () => {
        handleClickBack();
    };
 
    const handleOnPressContinue = () => {
        if (selectedPackageData) {
            // Pass the complete package data to the parent component
            handleOnPressContinueData(selectedPackageData);
        }
    };
 
    const togglePackageSelection = (esimPackage) => {
        // If this package is already selected (comparing by ID), keep it selected
        // Otherwise, select this package and deselect others
        setSelectedPackageData(
            selectedPackageData && selectedPackageData.package_id === esimPackage.package_id
                ? selectedPackageData
                : esimPackage
        );
    };

    // Inline styles
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '74vh',
            backgroundColor: '#ffffffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        header: {
            // display: 'flex',
            // alignItems: 'center',
            // justifyContent: 'space-between',
            // padding: '16px 20px',
            // backgroundColor: '#ffffff',
            // borderBottom: '1px solid #e9ecef',
            // boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        backButton: {
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
            color: '#495057'
        },
        title: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#212529',
            margin: 0
        },
        placeholderView: {
            width: '40px',
            height: '40px'
        },
        packagesContainer: {
            flex: 1,
            padding: '16px',
            overflowY: 'auto'
        },
        packageItem: {
            display: 'flex',
            alignItems: 'flex-start',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        },
        selectedPackageItem: {
            borderColor: '#007bff',
            backgroundColor: '#f8f9ff',
            boxShadow: '0 4px 12px rgba(0,123,255,0.15)'
        },
        checkboxContainer: {
            marginRight: '16px',
            marginTop: '4px'
        },
        checkbox: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid #dee2e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        },
        checkboxChecked: {
            backgroundColor: '#007bff',
            borderColor: '#007bff'
        },
        packageInfo: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        networkRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
        },
        networkIcon: {
            color: '#6c757d'
        },
        networkText: {
            fontSize: '14px',
            color: '#6c757d',
            fontWeight: '500'
        },
        statusBadge: {
            backgroundColor: '#28a745',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '12px',
            marginLeft: 'auto'
        },
        statusText: {
            fontSize: '12px',
            fontWeight: '500'
        },
        packageName: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#212529',
            margin: '0 0 8px 0',
            lineHeight: '1.3'
        },
        featureContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '12px'
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        featureIcon: {
            color: '#6c757d'
        },
        featureText: {
            fontSize: '14px',
            color: '#495057',
            fontWeight: '500'
        },
        packagePrice: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#007bff',
            marginTop: '8px'
        },
        summaryContainer: {
            padding: '20px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e9ecef'
        },
        checkoutButton: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px',
            backgroundColor: '#007bff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
        },
        disabledCheckoutButton: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        checkoutButtonText: {
            fontSize: '16px',
            fontWeight: '600'
        },
        checkoutIcon: {
            transition: 'transform 0.2s ease'
        }
    };

    // Add hover effects programmatically
    const handleMouseEnter = (e, isButton = false) => {
        // if (isButton) {
        //     e.target.style.transform = 'translateY(-2px)';
        // } else {
        //     e.target.style.transform = 'translateY(-2px)';
        //     e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        // }
    };

    const handleMouseLeave = (e, isButton = false) => {
        // if (isButton) {
        //     e.target.style.transform = 'translateY(0)';
        // } else {
        //     e.target.style.transform = 'translateY(0)';
        //     e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        // }
    };
 
    return (
        <div style={styles.container}>
      
 
            <div style={styles.packagesContainer}>
                {packageData.map((esimPackage) => (
                    <div
                        key={esimPackage.package_id}
                        style={{
                            ...styles.packageItem,
                            ...(selectedPackageData && selectedPackageData.package_id === esimPackage.package_id 
                                ? styles.selectedPackageItem 
                                : {})
                        }}
                        onClick={() => togglePackageSelection(esimPackage)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div style={styles.checkboxContainer}>
                            <div style={{
                                ...styles.checkbox,
                                ...(selectedPackageData && selectedPackageData.package_id === esimPackage.package_id 
                                    ? styles.checkboxChecked 
                                    : {})
                            }}>
                                {selectedPackageData && selectedPackageData.package_id === esimPackage.package_id && (
                                    <Check sx={{ fontSize: 18, color: '#fff' }} />
                                )}
                            </div>
                        </div>
 
                        <div style={styles.packageInfo}>
                            {/* Network Provider */}
                            <div style={styles.networkRow}>
                                <SimCard sx={{ fontSize: 14, color: '#6c757d' }} />
                                <span style={styles.networkText}>{esimPackage.network}</span>
                                {esimPackage.status && (
                                    <div style={styles.statusBadge}>
                                        <span style={styles.statusText}>Active</span>
                                    </div>
                                )}
                            </div>
                           
                            {/* Package Name */}
                            <h3 style={styles.packageName}>{esimPackage.package_name}</h3>
                           
                            {/* Features */}
                            <div style={styles.featureContainer}>
                                {/* Data */}
                                <div style={styles.featureItem}>
                                    <DataUsage sx={{ fontSize: 14, color: '#6c757d' }} />
                                    <span style={styles.featureText}>{esimPackage.data}</span>
                                </div>
                               
                                {/* Validity */}
                                <div style={styles.featureItem}>
                                    <CalendarMonth sx={{ fontSize: 14, color: '#6c757d' }} />
                                    <span style={styles.featureText}>{esimPackage.validity} Days</span>
                                </div>
                               
                                {/* Coverage */}
                                <div style={styles.featureItem}>
                                    <NetworkCell sx={{ fontSize: 14, color: '#6c757d' }} />
                                    <span style={styles.featureText}>{esimPackage.coverage}</span>
                                </div>
                               
                                {/* SMS */}
                                {esimPackage.sms > 0 && (
                                    <div style={styles.featureItem}>
                                        <Message sx={{ fontSize: 14, color: '#6c757d' }} />
                                        <span style={styles.featureText}>{esimPackage.sms} SMS</span>
                                    </div>
                                )}
                            </div>
                           
                            {/* Price */}
                            <div style={styles.packagePrice}>
                                {/* {CurrencyConverter("USD", esimPackage.price, currencyData)} */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
 
            <div style={styles.summaryContainer}>
                <button
                    style={{
                        ...styles.checkoutButton,
                        ...(!selectedPackageData ? styles.disabledCheckoutButton : {})
                    }}
                    disabled={!selectedPackageData}
                    onClick={handleOnPressContinue}
                    onMouseEnter={(e) => !e.target.disabled && handleMouseEnter(e, true)}
                    onMouseLeave={(e) => !e.target.disabled && handleMouseLeave(e, true)}
                >
                    <span style={styles.checkoutButtonText}>Select Package</span>
                    <ArrowForward sx={{ fontSize: 20 }} />
                </button>
            </div>
        </div>
    );
}