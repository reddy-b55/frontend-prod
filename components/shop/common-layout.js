import React, { useState } from "react";
import HeaderOne from "../common/header-one";
import Breadcrubs from "../common/widgets/breadcrubs";
import MasterFooter from "../../pages/layouts/MasterFooter";
import NewMasterFooter from "../../pages/layouts/NewMasterFooter";
import LocationModal from "../common/LocationModal";
import { Poppins } from "next/font/google";

import { Montserrat } from "next/font/google";

import { Raleway } from "next/font/google";
import EnhancedShoesHeader from "../common/header-two";

const poppins = Montserrat({
  weight: ["400", "500","600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const CommonLayout = ({
  children,
  title,
  parent,
  subTitle,
  openSubFilter,
  openSearchFilter,
  showMenuIcon = true,
  showSearchIcon = true,
  showBreadcrubs = true,
  location = true,
  catIcon = true,
  subTitleParentLink= "",
  onSearch

}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  return (
    <div className={poppins.className}>
      {/* <HeaderOne
        topClass="top-header"
        logoName="logo.png"
        locationView={location}
        onLocationClick={openLocationModal}
      /> */}
      <div 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          width: '100%'
        }}
        className="sticky-header-wrapper"
      >
        <div style={{ position: 'sticky !important' }}>
          <EnhancedShoesHeader
            onLocationClick={openLocationModal}
            catIcon={catIcon}
            location={location}
            onSearch={onSearch}
          />
        </div>
      </div>
      {/* {showBreadcrubs && (
        <Breadcrubs
          title={title}
          parent={parent}
          subTitle={subTitle}
          openSubFilter={openSubFilter}
          openSearchFilter={openSearchFilter}
          showMenuIcon={showMenuIcon}
          showSearchIcon={showSearchIcon}
          subTitleParentLink={subTitleParentLink}
        />
      )} */}
      <>{children}</>
      {/* <MasterFooter
        footerClass={`footer-light`}
        belowSection={
          "section-b-space light-layout py-4 py-lg-5 py-md-5 px-3 mt-4 "
        }
        logoName={"logo.png"}
      /> */}
      <NewMasterFooter />


      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
      />
      
      {/* Sticky Header CSS Override */}
      <style jsx global>{`
        .sticky-header-wrapper .header {
          position: static !important;
          z-index: inherit !important;
        }
        
        .sticky-header-wrapper {
          position: sticky !important;
          top: 0 !important;
          z-index: 999 !important;
        }
      `}</style>
    </div>
  );
};

export default CommonLayout;
