import React from "react";
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

const Breadcrubs = ({ title, parent, subTitle, openSubFilter, openSearchFilter, showMenuIcon = true, showSearchIcon = true, subTitleParentLink }) => {
  return (
    <div className="breadcrumb-section py-1">
      <div className="container d-flex align-items-center px-lg-4">
        <div className={`${showMenuIcon ? 'd-block' : 'd-none'} d-lg-none me-3 mt-1 my-auto`} onClick={openSubFilter}>
          <MenuIcon sx={{ fontSize: 22, marginBottom: '10px' }} />
        </div>
        {/* <h5 className="d-none d-lg-block d-md-block bread-crubs-tittle" style={{ fontSize: 14, fontWeight: '500', textTransform: 'uppercase' }}>{title}</h5> */}
        <h5 className="ms-auto bread-crubs-tittle" style={{ fontSize: 14, fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>{parent}</h5>
        {/* <h5 className="home-breadcrump bread-crubs-tittle" style={{ fontSize: 14, fontWeight: '500', textTransform: 'uppercase', cursor: subTitleParentLink ? 'pointer' : 'default' }} onClick={() => window.location.href = subTitleParentLink === "" ? null : subTitleParentLink}>{title}</h5> */}
        <h5
  className="home-breadcrump bread-crubs-tittle"
  style={{
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    cursor: subTitleParentLink ? 'pointer' : 'default'
  }}
  onClick={() => {
    if (subTitleParentLink) {
      window.location.href = subTitleParentLink;
    }
  }}
>
  {title}
</h5>

        {subTitle && <h5 className="home-breadcrump bread-crubs-tittle" style={{ fontSize: 14, fontWeight: '500', textTransform: 'uppercase' }}>{subTitle}</h5>}
        <div className={`${showSearchIcon ? 'd-block' : 'd-none'} d-lg-none me-0 mx-3 my-auto`} onClick={openSearchFilter}>
          <SearchIcon sx={{ fontSize: 20, marginBottom: '9px' }} />
        </div>
      </div>
    </div>
  );
};

export default Breadcrubs;
