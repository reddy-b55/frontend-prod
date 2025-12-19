import { useRouter } from "next/router";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../pages/_app";
import ModalBase from "../Modals/ModalBase";
import { ArrowLeft, CheckCircle, Sparkles, Edit3 } from "lucide-react";
import axios from "axios";
import ToastMessage from "../../Notification/ToastMessage";
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// Advanced Filter Component (inline styles version)
const AdvanceFilterPage = ({ onFilterResult, originalPrompt, globalSearch, isFilterActive, onModifyClick }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  console.log(originalPrompt, "Oriigiiiiii");

  useEffect(() => {
    if (originalPrompt) {
      setTimeout(() => {
        setPrompt(originalPrompt);
      }, 100);
    }
  }, [originalPrompt]);

  console.log(result, "Result data");

  // Mock context data - replace with your actual context
  const mainUserData = { id: 1 };

  const [questionExamples, setQuestionExamples] = useState([
    "Find romantic restaurants in Paris under $100 with outdoor seating",
    "Show me family-friendly activities in Tokyo with parking",
    "I need luxury hotels with spa services near the beach"
  ]);

  const fetchExamples = async () => {
    try {
      await axios
            .get(`personalization/get-questions-related-to-me/${mainUserData?.id}`)
            .then((response) => {
              if (response?.data?.success == true) {
                setQuestionExamples(response?.data?.array);
              }
            });
    } catch (error) {
      console.error("Failed to fetch examples:", error);
    }
  };

  useEffect(() => {
    fetchExamples();
  }, [mainUserData?.id]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setLoading(true);
    try {
       const response = await axios.post("personalization/advance-filter-chat", {
              prompt: prompt.trim(),
            });

            console.log(response.data, "Response from API");

            if (response.data.success) {
                    const filterData = response.data.data;
                    setResult(filterData);
                    
                     console.log(response.data, "Response from API1233333");
                    // Pass both the result and the original prompt to parent component
                    if (onFilterResult) {
                      onFilterResult(filterData, prompt.trim());
                    }
             
                    // Auto close modal after successful filter application
                    // setTimeout(() => {
                    //   handleClose();
                    // }, 1000);
                  } else {
                    // Alert.alert(
                    //   "Error",
                    //   response.data.message || "Failed to process request"
                    // );
                  }
    } catch (error) {
      console.error("API Error:", error);

      const mockResult = {
        location: prompt.includes("Paris")
          ? "Paris"
          : prompt.includes("Tokyo")
          ? "Tokyo"
          : "Any",
        priceRange: prompt.includes("budget")
          ? "0-50"
          : prompt.includes("luxury")
          ? "200+"
          : prompt.includes("under $100")
          ? "0-100"
          : "Any",
        category: prompt.includes("romantic")
          ? "Romantic"
          : prompt.includes("family")
          ? "Family-friendly"
          : prompt.includes("activities")
          ? "Activities"
          : "Any",
        features: extractFeatures(prompt),
        generatedAt: new Date().toISOString(),
      };

      setResult(mockResult);

      if (onFilterResult) {
        onFilterResult(mockResult, prompt.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  const extractFeatures = (text) => {
    const features = [];
    const keywords = {
      "outdoor seating": /outdoor|terrace|patio/i,
      spa: /spa|wellness/i,
      "beach access": /beach|ocean|seaside/i,
      "kids friendly": /kids|children|family/i,
      wifi: /wifi|internet/i,
      parking: /parking|valet/i,
    };

    Object.entries(keywords).forEach(([feature, regex]) => {
      if (regex.test(text)) {
        features.push(feature);
      }
    });

    return features;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      {/* Scrollable Content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '10px' }}>
        {/* Active Filter Header - Shows when filter is active */}
        {isFilterActive && originalPrompt && (
          <div style={{
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '16px 20px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    backgroundColor: '#ed4242',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    Active
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: '#64748B',
                    fontWeight: '500'
                  }}>
                    Applied Filter
                  </span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#1E293B',
                  fontWeight: '500',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  "{originalPrompt}"
                </p>
              </div>
              
              {/* Modify Button inside modal */}
              {/* <button
                onClick={onModifyClick}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #6366F1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#6366F1',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#6366F1';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6366F1';
                }}
              >
                <Edit3 size={14} />
                Modify
              </button> */}
            </div>
          </div>
        )}

        {/* Prompt Input Section */}
        <div style={{ padding: '20px', paddingTop: isFilterActive ? '0' : '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '16px' 
          }}>
           {globalSearch ? null : 'What are you looking for?' }
          </label>
          
          <div style={{ marginBottom: '24px' }}>
            <textarea
              style={{
                width: '100%',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                padding: '20px',
                fontSize: '16px',
                color: '#1F2937',
                backgroundColor: '#FFFFFF',
                minHeight: '150px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              placeholder="e.g., I want to find romantic restaurants in Paris for dinner with outdoor seating under $100..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#6366F1'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Example prompts */}
          <div style={{ marginTop: '10px' }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#6B7280', 
              marginBottom: '12px' 
            }}>
              ✨ Try these examples:
            </p>
            {questionExamples.map((example, index) => (
              <button
                key={index}
                style={{
                  width: '100%',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  borderLeft: '3px solid #6366F1',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setPrompt(example)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              >
                <p style={{ 
                  fontSize: '14px', 
                  color: '#4B5563', 
                  fontStyle: 'italic', 
                  margin: 0 
                }}>
                  "{example}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {result && (
          <div style={{
            margin: '0 20px 20px',
            backgroundColor: '#F0FDF4',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #BBF7D0',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '8px' 
            }}>
              <CheckCircle size={24} color="#059669" style={{ marginRight: '8px' }} />
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#059669', 
                margin: 0 
              }}>
                Filter Applied!
              </h3>
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: '#065F46', 
              lineHeight: '20px', 
              margin: 0 
            }}>
              Your custom filter has been created and applied to your search results.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Submit Button */}
      <div style={{ 
        position: 'sticky', 
        bottom: 0, 
        backgroundColor: '#FFFFFF', 
        padding: '15px 20px 20px', 
        borderTop: '1px solid #E5E7EB',
      }}>
        <button
          style={{
            width: '100%',
            backgroundColor: loading ? '#9CA3AF' : '#ed4242',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#FFFFFF',
            fontSize: '18px',
            fontWeight: '600',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={handleSubmit}
          disabled={loading}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#d63031';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 12px rgba(237, 66, 66, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#ed4242';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(237, 66, 66, 0.3)';
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                borderTop: '2px solid #FFFFFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Analyzing...</span>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>{isFilterActive ? 'Update Filter' : 'Search product'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const LifestyleChatbot = ({ handleUserFilterData, globalSearch = false, clearTrigger }) => {
  const router = useRouter();
  const [goingUp, setGoingUp] = useState(false);
  const { userStatus } = useContext(AppContext);
  const [showAdvanceFiltering, setShowAdvanceFiltering] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    setLastPrompt("");
    setIsFilterActive(false);
  }, [clearTrigger]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setGoingUp(currentScrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (globalSearch) {
      handleFloatingButtonClick();
    }
  }, [globalSearch]);

  const handleFloatingButtonClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowAdvanceFiltering(true);
  };

  const handleFilterResult = (filterData, originalPrompt) => {
    handleUserFilterData(filterData, originalPrompt);
    setLastPrompt(originalPrompt);
    setIsFilterActive(true);
    setShowAdvanceFiltering(false);
  };

  // Clear the current filter
  const handleClearFilter = () => {
    setLastPrompt("");
    setIsFilterActive(false);
    handleUserFilterData(null, ""); // Clear filter in parent
  };

  return (
    <>
      {/* Floating AI Filter Button with Active Badge */}
      {!globalSearch && (
        <div style={{
          position: "fixed",
          right: "18px",
          bottom: goingUp ? "140px" : "80px",
          zIndex: 1050,
          transition: "all 0.3s ease",
        }}>
          {/* Active Badge */}
          {isFilterActive && (
            <div style={{
              position: "absolute",
              top: "-8px",
              right: "-5px",
              backgroundColor: "#63509aff",
              color: "white",
              borderRadius: "10px",
              padding: "2px 8px",
              fontSize: "10px",
              fontWeight: "bold",
              zIndex: 1051,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap"
            }}>
              Active
            </div>
          )}
          
          {/* AI Filter Button */}
          <div
            onClick={handleFloatingButtonClick}
            style={{
              width: "55px",
              height: "55px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative"
            }}
          >
            <img
              src="/assets/images/Icons/advance_search.jpeg"
              alt="AI Filter"
              style={{
                width: "90%",
                height: "90%",
                borderRadius: "50%",
                objectFit: "cover",
                border: isFilterActive ? "2px solid #42ed97ff" : "none",
              }}
            />
          </div>
        </div>
      )}

      {/* Modal */}
      <ModalBase
        isOpen={showAdvanceFiltering}
        title={globalSearch ? "Discover Amazing Experiences" : ""}
        toggle={() => setShowAdvanceFiltering(false)}
        size="lg"
        extraMargin={false}
      >
        <AdvanceFilterPage
          onFilterResult={handleFilterResult}
          originalPrompt={lastPrompt}
          globalSearch={globalSearch}
          isFilterActive={isFilterActive}
          onModifyClick={handleClearFilter}
        />
      </ModalBase>
    </>
  );
};

export default LifestyleChatbot;