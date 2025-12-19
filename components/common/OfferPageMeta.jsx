import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { AppContext } from '../../pages/_app';
import { fetchDiscountData } from "../../AxiosCalls/offersService/getOffers";
import OfferPageCard from './OfferPageCard';
import axios from "axios";

const OfferPageMeta = () => {
  const { userId } = useContext(AppContext);
  const [offerData, setOfferData] = useState([]);
  const [filteredOfferData, setFilteredOfferData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVerticalList, setShowVerticalList] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([3]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Add states for subcategories
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Add ref for dropdown
  const dropdownRef = useRef(null);

  // Categories array
  const categories = [
    { id: 1, name: "Essential", icon: "🍽️" },
    { id: 2, name: "Non Essential", icon: "🛍️" },
    { id: 3, name: "Lifestyle", icon: "❤️" },
    { id: 4, name: "Hotels", icon: "🏨" },
    { id: 5, name: "Education", icon: "🎓" },
  ];

  // Fetch subcategories from API (same as Lifestyle component)
  const fetchSubCategories = async () => {
    if (!selectedCategories.includes(3)) { // Only fetch if Lifestyle is selected
      setSubCategories([]);
      setSelectedSubCategory([]);
      return;
    }

    setLoadingSubCategories(true);
    try {
      const response = await axios.get(`/fetch-all-categories`);
      console.log("Fetched subcategories:", response.data);
      
      if (response.data.status === 200) {
        const subCategories = response.data.subCategories || [];
        
        // Filter for Lifestyle category (maincat_id = 3) and map to required format
        const filteredCategories = subCategories
          .filter((category) => category.maincat_id == 3)
          .map((cat, index) => ({
            id: cat.id,
            name: cat.submaincat_type,
            image_url: cat.image_url,
            icon: "🏷️" // Fallback icon
          }));
        
        setSubCategories(filteredCategories);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  // Fetch subcategories when Lifestyle category is selected
  useEffect(() => {
    if (selectedCategories.includes(3)) {
      fetchSubCategories();
    } else {
      setSubCategories([]);
      setSelectedSubCategory([]);
    }
  }, [selectedCategories]);

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleScroll = () => {
      setShowDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

// Add the deduplication function at the top of your component
const deduplicateOffers = (offers) => {
  const uniqueOffers = [];
  const seenProducts = new Set();

  offers.forEach(offer => {
    // Try multiple possible unique identifiers
    const possibleKeys = [
      offer.origin_data?.product_id,
      offer.origin_data?.lifestyle_id,
      offer.origin_data?.listing_id,
      offer.origin_data?.id,
      offer.additional_data?.product_id,
      offer.additional_data?.lifestyle_id,
      offer.additional_data?.listing_id,
      offer.additional_data?.id,
    ];

    // Find the first valid key
    const productKey = possibleKeys.find(key => key && key !== 'null' && key !== 'undefined');

    if (productKey && !seenProducts.has(productKey)) {
      seenProducts.add(productKey);
      uniqueOffers.push(offer);
    } else if (!productKey) {
      // Fallback: use title and category
      const fallbackKey = `${offer.category_id}-${offer.origin_data?.title || offer.additional_data?.title}`;
      if (!seenProducts.has(fallbackKey)) {
        seenProducts.add(fallbackKey);
        uniqueOffers.push(offer);
      }
    }
    // Else: duplicate found, skip it
  });

  console.log(`🔄 Deduplicated: ${offers.length} -> ${uniqueOffers.length} offers`);
  return uniqueOffers;
};

// Update your fetchData function
const fetchData = async () => {
  if (!userId) {
    console.log("❌ cusID is null or undefined:", userId);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const data = await fetchDiscountData(userId);
    console.log("📡 API Response - Raw:", data?.length, "offers");
    
    // Apply deduplication
    const uniqueOffers = deduplicateOffers(data || []);
    
    setOfferData(uniqueOffers);
    setFilteredOfferData(uniqueOffers);
  } catch (error) {
    console.error("💥 Error fetching discount data:", error);
    setOfferData([]);
    setFilteredOfferData([]);
  }
  setLoading(false);
};

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

// FIXED: Update filter logic to use origin_data.main_cat for subcategory matching
useEffect(() => {
  if (offerData.length > 0) {
    const filtered = [...offerData].filter((offer) => {
      // Apply category filter - if no categories selected, show all
      const categoryMatch = selectedCategories.length === 0 
        ? true // Show all categories if none selected
        : selectedCategories.includes(offer.category_id);
      
      // FIXED: Apply subcategory filter using origin_data.main_cat
      const subCategoryMatch = selectedCategories.includes(3) && selectedSubCategory.length > 0
        ? selectedSubCategory.includes(parseInt(offer.origin_data?.main_cat)) // Convert to number for comparison
        : true;
      
      // Apply search filter
      if (searchQuery && searchQuery.trim() !== "") {
        const searchTerm = searchQuery.toLowerCase().trim();
        const originTitle = offer.origin_data?.title?.toLowerCase() || "";
        const additionalTitle = offer.additional_data?.title?.toLowerCase() || "";
        const searchMatch = originTitle.includes(searchTerm) || additionalTitle.includes(searchTerm);
        return categoryMatch && subCategoryMatch && searchMatch;
      }
      
      return categoryMatch && subCategoryMatch;
    });
    
    console.log(`✅ Filtered ${filtered.length} offers from ${offerData.length} total`);
    console.log(`🔍 Selected subcategories: ${selectedSubCategory.join(', ')}`);
    setFilteredOfferData(filtered);
  }
}, [offerData, selectedCategories, selectedSubCategory, searchQuery]);

const applySearchFilter = useCallback((query) => {
  let filtered = [...offerData];

  // Apply category filter - if no categories selected, show all
  if (selectedCategories.length > 0) {
    filtered = filtered.filter((offer) => {
      return selectedCategories.includes(offer.category_id);
    });
  }

  // FIXED: Apply subcategory filter using origin_data.main_cat
  if (selectedCategories.includes(3) && selectedSubCategory.length > 0) {
    filtered = filtered.filter((offer) => {
      return selectedSubCategory.includes(parseInt(offer.origin_data?.main_cat));
    });
  }

  // Apply search filter
  if (query && query.trim() !== "") {
    const searchTerm = query.toLowerCase().trim();
    filtered = filtered.filter((offer) => {
      const originTitle = offer.origin_data?.title?.toLowerCase() || "";
      const additionalTitle = offer.additional_data?.title?.toLowerCase() || "";

      return (
        originTitle.includes(searchTerm) ||
        additionalTitle.includes(searchTerm)
      );
    });
  }

  setFilteredOfferData(filtered);
}, [offerData, selectedCategories, selectedSubCategory]);
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    applySearchFilter(query);
  }, [applySearchFilter]);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(!showDropdown);
  }, [showDropdown]);

  const handleCategoryFilter = (categoryId) => {
    let updatedCategories;
    if (selectedCategories.includes(categoryId)) {
      updatedCategories = selectedCategories.filter((id) => id !== categoryId);
    } else {
      updatedCategories = [...selectedCategories, categoryId];
    }

    setSelectedCategories(updatedCategories);
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  // Handle subcategory selection
  const handleSubCategoryFilter = (subCategoryId) => {
    let updatedSubCategories;
    if (selectedSubCategory.includes(subCategoryId)) {
      updatedSubCategories = selectedSubCategory.filter((id) => id !== subCategoryId);
    } else {
      updatedSubCategories = [...selectedSubCategory, subCategoryId];
    }
    setSelectedSubCategory(updatedSubCategories);
  };

  // Clear all subcategory filters
  const handleClearSubCategoryFilters = () => {
    setSelectedSubCategory([]);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]); // Clear all category filters to show everything
    setSelectedSubCategory([]); // Clear subcategories too
  };

  const handleCreateEvent = () => {
    console.log("testtttt")
    setShowVerticalList(true);
  };

  const handleBackToCarousel = () => {
    setShowVerticalList(false);
  };

  // Horizontal Subcategories Component
  const HorizontalSubcategories = () => {
    if (!selectedCategories.includes(3)) return null; // Only show when Lifestyle is selected

    if (loadingSubCategories) {
      return (
        <div style={{
          width: '100%',
          padding: '12px 20px',
          marginBottom: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: 'white', fontSize: '14px' }}>Loading subcategories...</span>
          </div>
        </div>
      );
    }

    if (subCategories.length === 0) {
      return null; // Don't show anything if no subcategories
    }

    return (
      <div style={{
        width: '100%',
        overflowX: 'auto',
        padding: '12px 20px',
        marginBottom: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          minWidth: 'max-content',
        }}>
          {/* All Categories Button */}
          <button
            onClick={handleClearSubCategoryFilters}
            style={{
              background: selectedSubCategory.length === 0 ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              if (selectedSubCategory.length > 0) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedSubCategory.length > 0) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '14px' }}>🏷️</span>
            All Subcategories
          </button>

          {/* Dynamic Subcategory Chips */}
          {subCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => handleSubCategoryFilter(subCategory.id)}
              style={{
                background: selectedSubCategory.includes(subCategory.id) 
                  ? 'rgba(237, 66, 66, 0.8)' 
                  : 'transparent',
                color: 'white',
                border: selectedSubCategory.includes(subCategory.id)
                  ? '1px solid rgba(237, 66, 66, 0.8)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
              onMouseOver={(e) => {
                if (!selectedSubCategory.includes(subCategory.id)) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!selectedSubCategory.includes(subCategory.id)) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {/* Use image if available, otherwise use icon */}
              {subCategory.image_url ? (
                <img 
                  src={subCategory.image_url} 
                  alt={subCategory.name}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // If image fails to load, show the icon
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ fontSize: '14px' }}>
                  {subCategory.icon}
                </span>
              )}
              {subCategory.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Rest of your existing components (renderOfferCard, renderVerticalOfferCard, etc.)
  const renderOfferCard = (offer, index) => (
    <div key={index} style={{
      width: '80%',
      maxWidth: '300px',
      marginRight: '16px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      borderRadius: '28px',
      overflow: 'hidden',
    }}>
      <OfferPageCard
        offerData={offer}
        themeColors={{
          primary: "#ed4242",
          secondary: "#ffe6e7",
          text: "#333",
        }}
      />
    </div>
  );

  const renderVerticalOfferCard = (offer, index) => (
    <div key={index} style={{
      flex: '1',
      margin: '8px',
      maxWidth: 'calc(33.333% - 16px)',
      minWidth: '300px',
    }}>
      <OfferPageCard
        offerData={offer}
        isTwoColumn={true}
        themeColors={{
          primary: "#ed4242",
          secondary: "#ffe6e7",
          text: "#333",
        }}
      />
    </div>
  );

  const renderFeaturedCard = (offer, index) => (
    <div key={index} style={{
      flex: '1',
      margin: '8px',
      maxWidth: 'calc(33.333% - 16px)',
      minWidth: '300px',
    }}>
      <OfferPageCard
        offerData={offer}
        isTwoColumn={true}
        themeColors={{
          primary: "#ed4242",
          secondary: "#ffe6e7",
          text: "#333",
        }}
      />
    </div>
  );

  const renderPremiumCard = (offer, index) => (
    <div key={index} style={{
      flex: '1',
      margin: '12px',
      maxWidth: 'calc(25% - 24px)',
      minWidth: '250px',
    }}>
      <OfferPageCard
        offerData={offer}
        themeColors={{
          primary: "#ed4242",
          secondary: "#ffe6e7",
          text: "#333",
        }}
      />
    </div>
  );

  // Enhanced Search Bar Component (Memoized)
  const EnhancedSearchBar = useMemo(() => (
    <div style={{
      margin: '0 20px 20px 20px',
      position: 'relative',
    }} ref={dropdownRef}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        borderRadius: '20px',
        padding: '1px 20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        border: '2px solid rgba(255, 255, 255, 0.8)',
      }}>
        {/* Filter Button */}
        <button
          onClick={toggleDropdown}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            padding: '4px',
            marginRight: '8px',
            cursor: 'pointer',
            color: selectedCategories.length > 0 ? '#ffffff' : '#ffffff',
          }}
        >
          <span style={{ fontSize: '20px' }}>🔍</span>
          
          {/* Always show count when categories are selected */}
          {selectedCategories.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: selectedCategories.length === 1 && selectedCategories.includes(3) ? '#476e7c' : '#ed4242',
              borderRadius: '8px',
              width: '16px',
              height: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: selectedCategories.length === 1 && selectedCategories.includes(3) ? '8px' : '10px',
              color: 'white',
              fontWeight: 'bold',
            }}>
              {selectedCategories.length === 1 && selectedCategories.includes(3) ? '1' : selectedCategories.length}
            </div>
          )}
        </button>

        {/* Separator */}
        <div style={{
          width: '1px',
          height: '20px',
          background: 'rgba(255, 255, 255, 0.5)',
          marginRight: '12px',
        }} />

        <input
          type="text"
          placeholder="Search amazing offers..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            flex: 1,
            fontSize: '16px',
            color: '#ffffffff',
            fontWeight: '500',
            border: 'none',
            outline: 'none',
            background: 'transparent',
          }}
        />

        {searchQuery !== "" && (
          <button
            onClick={() => handleSearch("")}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '45%',
          zIndex: 2000,
          marginTop: '8px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
            borderRadius: '8px',
            padding: '12px 16px 8px 16px',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#4a3329',
              marginBottom: '8px',
              textAlign: 'center',
            }}>
              Filter by Categories
            </div>

            {/* Show All Option */}
            <div
              onClick={() => {
                setSelectedCategories([]); // This will show ALL categories
                setTimeout(() => setShowDropdown(false), 100);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: '8px',
                borderBottom: '1px solid rgba(126, 99, 71, 0.1)',
                cursor: 'pointer',
              }}
            >
              <span style={{
                fontSize: '10px',
                fontWeight: '500',
                color: '#4a3329',
                flex: 1,
              }}>
                All Categories
              </span>
              {selectedCategories.length === 0 && (
                <span style={{
                  marginLeft: '8px',
                  color: '#000000',
                  fontSize: '14px',
                }}>
                  ✓
                </span>
              )}
            </div>

            {categories.map((category, index) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: index === categories.length - 1 ? 'none' : '1px solid rgba(126, 99, 71, 0.1)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#4a3329',
                    flex: 1,
                  }}>
                    {category.name}
                  </span>
                  {isSelected && (
                    <span style={{
                      marginLeft: '8px',
                      color: '#000000',
                      fontSize: '14px',
                    }}>
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  ), [searchQuery, selectedCategories, showDropdown, handleSearch, toggleDropdown]);

  // Horizontal Offer List Component
  const HorizontalOfferList = () => (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      paddingTop: '60px',
    }}>
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        paddingBottom: '30vh',
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        gap: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        }
      }}>
        {filteredOfferData.map((offer, index) => renderOfferCard(offer, index))}
      </div>
    </div>
  );

  // No Offers Available Component
  const NoOffersAvailable = ({ onClearFilters, onRetry }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '60px',
        marginBottom: '20px',
        animation: 'bounce 2s infinite',
      }}>
        🎁
      </div>
      <h3 style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '10px',
      }}>
        No Offers Found
      </h3>
      <p style={{
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '16px',
        marginBottom: '30px',
        maxWidth: '300px',
      }}>
        We couldn't find any offers matching your criteria. Try adjusting your filters or check back later.
      </p>
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={onClearFilters}
          style={{
            background: 'linear-gradient(135deg, #ed4242, #d63031)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Clear Filters
        </button>
        <button
          onClick={onRetry}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Bottom Section Component
  const BottomSection = () => (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      minHeight: '30vh',
      background: 'linear-gradient(transparent, rgba(118, 167, 202, 0.28), rgba(85, 145, 150, 0.63))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 30px 40px 30px',
      }}>
        <h2 style={{
          fontSize: '26px',
          fontWeight: '800',
          color: 'white',
          textAlign: 'center',
          lineHeight: '34px',
          letterSpacing: '-0.5px',
          marginBottom: '15px',
          padding: '0 20px',
        }}>
          Enjoy instant discount with Aahaas app.
        </h2>

        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          lineHeight: '24px',
          fontWeight: '400',
          letterSpacing: '0.2px',
          marginBottom: '30px',
          padding: '0 30px',
        }}>
          Aahaas brings you the best offers.
        </p>

        <button
          onClick={handleCreateEvent}
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f8f8f8, #e8e8e8)',
            color: '#4a3329',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '30px',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s ease',
            minWidth: '200px',
            margin: '0 auto',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Explore All Offers
        </button>
      </div>
    </div>
  );

  // Section Header Component
  const SectionHeader = ({ title, subtitle }) => (
    <div style={{
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '0 2rem',
    }}>
      <h2 style={{
        fontSize: '3rem',
        fontWeight: '900',
        background: 'white',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1rem',
        color: 'transparent',
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '400',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {subtitle}
      </p>
    </div>
  );

  // Featured Deals Section
  const FeaturedDealsSection = () => (
    <div style={{
      margin: '4rem 0 2rem 0',
      padding: '0 2rem',
      maxWidth: '1400px',
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <SectionHeader 
        title="Featured Deals" 
        subtitle="Discover our most popular offers with stunning visuals"
      />
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        {filteredOfferData.slice(0, 6).map((offer, index) => renderFeaturedCard(offer, index))}
      </div>
    </div>
  );

  // More Amazing Offers Section
  const MoreOffersSection = () => (
    filteredOfferData.length > 6 && (
      <div style={{
        margin: '4rem 0 2rem 0',
        padding: '0 2rem',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <SectionHeader 
          title="More Amazing Offers" 
          subtitle="Don't miss these limited-time deals"
        />
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '2rem',
        }}>
          {filteredOfferData.slice(6, 12).map((offer, index) => renderVerticalOfferCard(offer, index + 6))}
        </div>
      </div>
    )
  );

  // Premium Experiences Section
  const PremiumSection = () => (
    filteredOfferData.length > 12 && (
      <div style={{
        margin: '4rem 0 2rem 0',
        padding: '0 2rem',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <SectionHeader 
          title="Premium Experiences" 
          subtitle="Exclusive luxury offers just for you"
        />
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '2rem',
        }}>
          {filteredOfferData.slice(12, 16).map((offer, index) => renderPremiumCard(offer, index + 12))}
        </div>
      </div>
    )
  );

return (
    <>
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .floating-particle {
          animation: float 20s ease-in-out infinite;
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        input::-webkit-input-placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        input::-moz-placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        input:-ms-input-placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        /* Horizontal scrollbar styling */
        .horizontal-scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        
        .horizontal-scroll-container::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .horizontal-scroll-container::-webkit-scrollbar-track {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #121d2f, #172a31, #2e343e)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating particles background */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="floating-particle"
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.1)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '25vh',
          background: 'linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04), transparent)',
          pointerEvents: 'none',
        }} />

        {loading ? (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              padding: '30px',
              borderRadius: '20px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px auto',
              }} />
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '16px',
                fontWeight: '500',
                margin: 0,
              }}>
                Loading amazing offers...
              </p>
            </div>
          </div>
        ) : (
          <>
            {showVerticalList ? (
              <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #2e343e, #172a31, #2e343e)',
                minHeight: '100vh',
              }}>
                {/* Animated Particles Background */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}>
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        width: '3px',
                        height: '3px',
                        borderRadius: '1.5px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>

                <div style={{
                  padding: '20px',
                  paddingBottom: '20px',
                  position: 'relative',
                }}>
                  <button
                    onClick={handleBackToCarousel}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      zIndex: 10,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      fontSize: '14px',
                    }}
                  >
                    ✕
                  </button>

                  {/* CONDITION: Only show this header when there are offers */}
                  {filteredOfferData.length > 0 && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '-10px',
                    }}>
                      <h1 style={{
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: '800',
                        marginBottom: '10px',
                        letterSpacing: '-0.8px',
                      }}>
                        All Offers
                      </h1>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}>
                        <span style={{ fontSize: '16px' }}>🏷️</span>
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '15px',
                          fontWeight: '500',
                        }}>
                          {filteredOfferData.length} offers available
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONDITION: Only show search bar when there are offers */}
                {filteredOfferData.length > 0 && EnhancedSearchBar}

                {/* Add Horizontal Subcategories here - BELOW SEARCH BAR */}
                {/* CONDITION: Only show subcategories when there are offers AND Lifestyle is selected */}
                {filteredOfferData.length > 0 && <HorizontalSubcategories />}

                <div style={{
                  flex: 1,
                  padding: '0 10px',
                }}>
                  {filteredOfferData.length > 0 ? (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      justifyContent: 'center',
                      paddingBottom: '40px',
                    }}>
                      {filteredOfferData.map((offer, index) => renderVerticalOfferCard(offer, index))}
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '40vh',
                      padding: '20px',
                    }}>
                      <NoOffersAvailable
                        onClearFilters={handleClearAllFilters}
                        onRetry={onRefresh}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : filteredOfferData.length > 0 ? (
              <div style={{
                position: 'relative',
                minHeight: '100vh',
                 background: 'linear-gradient(transparent, rgba(118, 167, 202, 0.28), rgba(85, 145, 150, 0.63))',
                paddingTop: '2rem',
              }}>
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  paddingBottom: '35vh',
                }}>
                  <FeaturedDealsSection />
                  <MoreOffersSection />
                  <PremiumSection />
                  <BottomSection />
                </div>
              </div>
            ) : (
              <>
                {/* CONDITION: Only show this section when there are NO offers AND we're not in vertical list mode */}
                {/* Removed the header and search bar from here */}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '100vh', // Make it full screen
                  padding: '20px',
                }}>
                  <NoOffersAvailable
                    onClearFilters={handleClearAllFilters}
                    onRetry={onRefresh}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default OfferPageMeta;