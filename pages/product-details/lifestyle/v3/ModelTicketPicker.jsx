import React, { useState, useRef, useEffect, useContext } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Calendar, CheckCircle, X, Check, Circle, CheckCircle2, Minus, Plus, CalendarDays, ChevronDown } from "lucide-react";
import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import { AppContext } from "../../../_app";
const newColors = {
  primary4: "#3498db",
  primary5: "#2980b9"
};

// Mock functions for demo - replace with actual implementations
// const CurrencyConverter = (currency, amount) => `${currency} ${amount.toFixed(2)}`;
const useNotifyToast = () => ({
  showToast: (config) => console.log('Toast:', config)
});

export default function GlobalTixPackageSelector({
  handleOnPressContinueData = () => {},
  priceCalculator = () => {},
  handleClickBack = () => {},
  attractionTickets = [],
  baseUrl = "",
  authToken = "",
  selectedDateVar = new Date().toISOString().split('T')[0],
  initialSelectedState = null,
}) {

  console.log("Attraction Tickets Data:", initialSelectedState);
  const packageData = attractionTickets?.data || [];
  const SCREEN_WIDTH = window.innerWidth;
    const { userStatus, baseUserId, baseCurrencyValue, baseLocation } = useContext(AppContext);
  // Swiper state
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // State initialization with support for restoring previous state
  const [selectedTickets, setSelectedTickets] = useState(
    initialSelectedState?.selectedTickets || {}
  );
  const [selectedTicketTypes, setSelectedTicketTypes] = useState(
    initialSelectedState?.selectedTicketTypes || {}
  );
  const [ticketQuantities, setTicketQuantities] = useState(
    initialSelectedState?.ticketQuantities || {}
  );
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(
    initialSelectedState?.selectedTimeSlots || {}
  );
  const [selectedDates, setSelectedDates] = useState(
    initialSelectedState?.selectedDates || {}
  );
  const [errors, setErrors] = useState({});
  const [questionAnswers, setQuestionAnswers] = useState(
    initialSelectedState?.questionAnswers || {}
  );
  const [availabilityData, setAvailabilityData] = useState(
    initialSelectedState?.availabilityData || {}
  );
  const [loadingAvailability, setLoadingAvailability] = useState({});
  const [openedModal, setOpenedModal] = useState("");
  const [currentTicketTypeIdForDate, setCurrentTicketTypeIdForDate] = useState(null);
  const [currentQuestionForDate, setCurrentQuestionForDate] = useState(null);
  const [dateType, setDateType] = useState(false);

  // Effect to restore availability data when component mounts with initial state
  useEffect(() => {
    if (initialSelectedState?.selectedTicketTypes) {
      Object.values(initialSelectedState.selectedTicketTypes).forEach(
        async (ticketType) => {
          const parentTicket = packageData.find(
            (t) => t.id === ticketType.ticketId
          );
          if (
            isDateRequired(parentTicket) &&
            !availabilityData[ticketType.id]
          ) {
            await fetchAvailability(ticketType.id);
          }
        }
      );
    }
  }, [initialSelectedState]);

  const handleBack = () => {
    handleClickBack();
  };

  // Navigation functions
  const goToNextTicket = () => {
    if (currentTicketIndex < packageData.length - 1) {
      const nextIndex = currentTicketIndex + 1;
      setCurrentTicketIndex(nextIndex);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          left: nextIndex * SCREEN_WIDTH,
          behavior: 'smooth'
        });
      }
    }
  };

  const goToPreviousTicket = () => {
    if (currentTicketIndex > 0) {
      const prevIndex = currentTicketIndex - 1;
      setCurrentTicketIndex(prevIndex);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          left: prevIndex * SCREEN_WIDTH,
          behavior: 'smooth'
        });
      }
    }
  };

  const goToTicketIndex = (index) => {
    setCurrentTicketIndex(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        left: index * SCREEN_WIDTH,
        behavior: 'smooth'
      });
    }
  };

  // Handle scroll end to update current index
  const handleScrollEnd = (event) => {
    const scrollLeft = event.target.scrollLeft;
    const index = Math.round(scrollLeft / SCREEN_WIDTH);
    setCurrentTicketIndex(index);
  };

  // Function to get current component state
  const getCurrentState = () => {
    return {
      selectedTickets,
      selectedTicketTypes,
      ticketQuantities,
      selectedTimeSlots,
      selectedDates,
      questionAnswers,
      availabilityData,
    };
  };

  const fetchAvailability = async (ticketTypeId) => {
    console.log(`globaltix/product/tickets/${ticketTypeId}/availability`);
    try {
      setLoadingAvailability((prev) => ({ ...prev, [ticketTypeId]: true }));
      // Mock API call - replace with actual axios call
      const mockResponse = {
        data: {
          success: true,
          dates: [
            { date: selectedDateVar, timeslots: ["09:00", "14:00", "18:00"] }
          ]
        }
      };
      
      if (mockResponse.data.success) {
        setAvailabilityData((prev) => ({
          ...prev,
          [ticketTypeId]: mockResponse.data,
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching availability for ticket type ${ticketTypeId}:`,
        error
      );
      setAvailabilityData((prev) => ({
        ...prev,
        [ticketTypeId]: { dates: [], data: [] },
      }));
    } finally {
      setLoadingAvailability((prev) => ({ ...prev, [ticketTypeId]: false }));
    }
  };

  const { showToast } = useNotifyToast();

  const handleOnPressContinue = () => {
    // console.log("Selected Tickets:", selectedTickets);
    if (Object.keys(selectedTicketTypes).length > 0) {
      const newErrors = {};
      let hasErrors = false;

      Object.values(selectedTicketTypes).forEach((ticketType) => {
        const parentTicket = packageData.find(
          (t) => t.id === ticketType.ticketId
        );

        if (
          !selectedTimeSlots[ticketType.id] &&
          parentTicket?.timeSlot?.length > 0
        ) {
          newErrors[ticketType.id] =
            "Please select a time slot for this ticket";
          hasErrors = true;
        }

        if (isDateRequired(parentTicket) && !selectedDates[ticketType.id]) {
          newErrors[ticketType.id] = newErrors[ticketType.id]
            ? newErrors[ticketType.id] + " and select a date"
            : "Please select a date for this ticket";
          hasErrors = true;
        }

        if (parentTicket?.isQuestions && parentTicket?.questions) {
          parentTicket.questions.forEach((question) => {
            const questionKey = `${ticketType.id}_${question.id}`;
            if (!question.optional && !questionAnswers[questionKey]) {
              newErrors[
                `question_${questionKey}`
              ] = `Please answer: ${question.question}`;
              hasErrors = true;
            }
          });
        }
      });

      if (hasErrors) {
        showToast({
          type: "error",
          text1: "Please Complete All Fields",
          text2:
            "Please review all tickets and complete the required fields before proceeding.",
        });
        setErrors(newErrors);
        return;
      }

      // Create the final array in the required format
      const finalData = {
        product_id: packageData[0]?.productId || packageData[0]?.id,
        tickets: Object.values(selectedTicketTypes).map((ticketType) => {
          const parentTicket = packageData.find(
            (t) => t.id === ticketType.ticketId
          );
          const quantity = ticketQuantities[ticketType.id] || 1;
          const selectedDate = selectedDates[ticketType.id];
          const selectedTimeSlot = selectedTimeSlots[ticketType.id];

          const ticketData = {
            id: ticketType.id,
            quantity: quantity,
            type: parentTicket?.ticketTypeName || "fixed-date",
          };

          if (selectedDate) {
            ticketData.visitDate = selectedDate;
          }

          if (selectedDate && selectedTimeSlot) {
            const eventDateTime = `${selectedDate}T${selectedTimeSlot}:00`;
            ticketData.eventTime = eventDateTime;
          }

          if (parentTicket?.isQuestions && parentTicket?.questions) {
            ticketData.isQuestions = true;
            ticketData.questions = [];

            parentTicket.questions.forEach((question) => {
              const questionKey = `${ticketType.id}_${question.id}`;
              const answer = questionAnswers[questionKey];

              if (answer) {
                ticketData.questions.push({
                  id: question.id,
                  answer: answer,
                });
              }
            });
          }

          return ticketData;
        }),
      };

      console.log(finalData, "Ticket Data value issssssssss");

      const dataSet = {
        currency:
          Object.values(selectedTicketTypes)[0]?.currency ||
          packageData[0]?.currency ||
          "SGD",
        totalAmount: calculateTotalPrice(),
      };

      const currentComponentState = getCurrentState();

      handleOnPressContinueData(
        finalData,
        getTotalTicketCount(),
        dataSet,
        currentComponentState
      );

      priceCalculator({
        currency: Object.values(selectedTicketTypes)[0]?.currency || dataToRender[0]?.currency ||"SGD",
        totalAmount: calculateTotalPrice(),
      });
    }
  };

  const toggleTicketSelection = (ticket) => {
    const updatedSelectedTickets = { ...selectedTickets };
    const updatedSelectedTicketTypes = { ...selectedTicketTypes };

    if (updatedSelectedTickets[ticket.id]) {
      delete updatedSelectedTickets[ticket.id];
      ticket.ticketType?.forEach((ticketType) => {
        delete updatedSelectedTicketTypes[ticketType.id];
        delete ticketQuantities[ticketType.id];
        if (ticket.isQuestions && ticket.questions) {
          ticket.questions.forEach((question) => {
            const questionKey = `${ticketType.id}_${question.id}`;
            setQuestionAnswers((prev) => {
              const updated = { ...prev };
              delete updated[questionKey];
              return updated;
            });
          });
        }
        if (errors[ticketType.id]) {
          const updatedErrors = { ...errors };
          delete updatedErrors[ticketType.id];
          setErrors(updatedErrors);
        }
      });
    } else {
      updatedSelectedTickets[ticket.id] = ticket;
    }

    setSelectedTickets(updatedSelectedTickets);
    setSelectedTicketTypes(updatedSelectedTicketTypes);
  };

  const toggleTicketTypeSelection = async (ticketType, parentTicket) => {
    if (!selectedTickets[parentTicket.id]) {
      const updatedSelectedTickets = { ...selectedTickets };
      updatedSelectedTickets[parentTicket.id] = parentTicket;
      setSelectedTickets(updatedSelectedTickets);
    }

    const updatedSelectedTicketTypes = { ...selectedTicketTypes };

    if (updatedSelectedTicketTypes[ticketType.id]) {
      delete updatedSelectedTicketTypes[ticketType.id];

      setTicketQuantities((prev) => {
        const updated = { ...prev };
        delete updated[ticketType.id];
        return updated;
      });

      setSelectedTimeSlots((prev) => {
        const updated = { ...prev };
        delete updated[ticketType.id];
        return updated;
      });

      setSelectedDates((prev) => {
        const updated = { ...prev };
        delete updated[ticketType.id];
        return updated;
      });

      if (parentTicket.isQuestions && parentTicket.questions) {
        parentTicket.questions.forEach((question) => {
          const questionKey = `${ticketType.id}_${question.id}`;
          setQuestionAnswers((prev) => {
            const updated = { ...prev };
            delete updated[questionKey];
            return updated;
          });
        });
      }

      if (errors[ticketType.id]) {
        const updatedErrors = { ...errors };
        delete updatedErrors[ticketType.id];
        setErrors(updatedErrors);
      }

      if (parentTicket.isQuestions && parentTicket.questions) {
        parentTicket.questions.forEach((question) => {
          const questionKey = `${ticketType.id}_${question.id}`;
          const errorKey = `question_${questionKey}`;
          if (errors[errorKey]) {
            const updatedErrors = { ...errors };
            delete updatedErrors[errorKey];
            setErrors(updatedErrors);
          }
        });
      }
    } else {
      updatedSelectedTicketTypes[ticketType.id] = {
        ...ticketType,
        ticketId: parentTicket.id,
      };

      if (!ticketQuantities[ticketType.id]) {
        const minQty = ticketType.minPurchaseQty || 1;
        setTicketQuantities((prev) => ({ ...prev, [ticketType.id]: minQty }));
      }

      if (isDateRequired(parentTicket)) {
        await fetchAvailability(ticketType.id);
      }
    }

    setSelectedTicketTypes(updatedSelectedTicketTypes);
  };

  const selectTimeSlot = (ticketTypeId, timeSlot) => {
    setSelectedTimeSlots((prev) => ({ ...prev, [ticketTypeId]: timeSlot }));
    if (errors[ticketTypeId]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[ticketTypeId];
      setErrors(updatedErrors);
    }
  };

  const openDatePicker = (ticketTypeId, questionId = null, typeDate) => {
    setCurrentTicketTypeIdForDate(ticketTypeId);
    setCurrentQuestionForDate(questionId);
    setOpenedModal("date");
    if (typeDate == "DATE_OF_BIRTH") {
      setDateType("birth_date");
    } else {
      setDateType("else");
    }
  };

  const submitDate = (selectedDate) => {
    if (currentQuestionForDate) {
      const questionKey = `${currentTicketTypeIdForDate}_${currentQuestionForDate}`;
      setQuestionAnswers((prev) => ({ ...prev, [questionKey]: selectedDate }));
      if (errors[`question_${questionKey}`]) {
        const updatedErrors = { ...errors };
        delete updatedErrors[`question_${questionKey}`];
        setErrors(updatedErrors);
      }
    } else {
      if (currentTicketTypeIdForDate) {
        setSelectedDates((prev) => ({
          ...prev,
          [currentTicketTypeIdForDate]: selectedDate,
        }));
        setSelectedTimeSlots((prev) => ({
          ...prev,
          [currentTicketTypeIdForDate]: null,
        }));
        if (errors[currentTicketTypeIdForDate]) {
          const updatedErrors = { ...errors };
          delete updatedErrors[currentTicketTypeIdForDate];
          setErrors(updatedErrors);
        }
      }
    }
    setOpenedModal("");
    setCurrentTicketTypeIdForDate(null);
    setCurrentQuestionForDate(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const increaseQuantity = (ticketTypeId) => {
    const currentQty = ticketQuantities[ticketTypeId] || 1;
    const ticketType = selectedTicketTypes[ticketTypeId];
    const maxLimit = ticketType?.maxPurchaseQty || 10;
    if (currentQty < maxLimit) {
      setTicketQuantities((prev) => ({
        ...prev,
        [ticketTypeId]: currentQty + 1,
      }));
    }
  };

  const decreaseQuantity = (ticketTypeId) => {
    const currentQty = ticketQuantities[ticketTypeId] || 1;
    const ticketType = selectedTicketTypes[ticketTypeId];
    const minLimit = ticketType?.minPurchaseQty || 1;
    if (currentQty > minLimit) {
      setTicketQuantities((prev) => ({
        ...prev,
        [ticketTypeId]: currentQty - 1,
      }));
    }
  };

  const calculateTotalPrice = () => {
    let total = 0;
    Object.entries(selectedTicketTypes).forEach(
      ([ticketTypeId, ticketType]) => {
        const price = ticketType.selling_price;
        const quantity = ticketQuantities[ticketTypeId] || 1;
        total += price * quantity;
      }
    );
    return total;
  };

  const getTotalTicketCount = () => {
    let count = 0;
    Object.keys(selectedTicketTypes).forEach((ticketTypeId) => {
      count += ticketQuantities[ticketTypeId] || 1;
    });
    return count;
  };

  const isDateRequired = (ticket) => {
    return (
      ticket?.visitDate?.required ||
      ticket?.ticketTypeName === "fixed-date" ||
      ticket?.ticketTypeName === "timeslot"
    );
  };

  const getAvailableDates = (ticketTypeId) => {
    const availability = availabilityData[ticketTypeId];
    var dateArray = [];
    availability?.dates?.map((res) => {
      dateArray.push(res?.date);
    });
    return dateArray || [];
  };

  const getAvailableTimeSlots = (ticketTypeId, selectedDate) => {
    if (!selectedDate) return [];
    const availability = availabilityData[ticketTypeId];
    if (!availability?.dates) return [];
    const dateObj = availability.dates.find((d) => d.date === selectedDate);
    return dateObj?.timeslots || [];
  };

  const handleQuestionAnswer = (ticketTypeId, questionId, answer) => {
    const questionKey = `${ticketTypeId}_${questionId}`;
    setQuestionAnswers((prev) => ({ ...prev, [questionKey]: answer }));
    if (errors[`question_${questionKey}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`question_${questionKey}`];
      setErrors(updatedErrors);
    }
  };

  // Render functions
  const renderProgressIndicator = () => (
    <div style={{
      backgroundColor: "#fff",
      padding: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #f0f0f0"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#2c3e50",
          marginRight: "8px"
        }}>
          {currentTicketIndex + 1} of {packageData.length}
        </span>
        <span style={{ fontSize: "11px", color: "#7f8c8d" }}>
          Ticket Options
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {packageData.map((_, index) => (
          <button
            key={index}
            style={{
              width: index === currentTicketIndex ? "8px" : "6px",
              height: index === currentTicketIndex ? "8px" : "6px",
              borderRadius: "50%",
              backgroundColor: selectedTickets[packageData[index]?.id] 
                ? "#27ae60" 
                : index === currentTicketIndex 
                  ? newColors.primary5 
                  : "#e1e8ed",
              border: "none",
              margin: "0 2px",
              cursor: "pointer"
            }}
            onClick={() => goToTicketIndex(index)}
          />
        ))}
      </div>
    </div>
  );

  const renderQuestions = (ticketTypeId, parentTicket, isSelected) => {
    if (
      !isSelected ||
      !parentTicket.isQuestions ||
      !parentTicket.questions ||
      parentTicket.questions.length === 0
    ) {
      return null;
    }

    return (
      <div style={{
        padding: "12px",
        borderTop: "1px solid #f0f0f0",
        marginTop: "8px"
      }}>
        <div style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#2c3e50",
          marginBottom: "10px"
        }}>
          Additional Information Required:
        </div>
        {parentTicket.questions.map((question) => {
          const questionKey = `${ticketTypeId}_${question.id}`;
          const currentAnswer = questionAnswers[questionKey] || "";
          const hasError = errors[`question_${questionKey}`];

          return (
            <div key={question.id} style={{ marginBottom: "12px" }}>
              <div style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#2c3e50",
                marginBottom: "6px",
                lineHeight: "16px"
              }}>
                {question.question}
                {!question.optional && (
                  <span style={{ color: "#e74c3c" }}> *</span>
                )}
              </div>

              {question.type === "FREETEXT" && (
                <input
                  type="text"
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    border: hasError ? "1px solid #e74c3c" : "1px solid #e1e8ed",
                    fontSize: "12px",
                    color: "#2c3e50",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                  value={currentAnswer}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuestionAnswer(ticketTypeId, question.id, e.target.value);
                  }}
                  placeholder={`Enter ${question.question.toLowerCase()}`}
                />
              )}

              {question.type === "OPTION" && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {question.optionList?.map((option) => (
                    <button
                      key={option.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: currentAnswer === option.key ? "#f0f9ff" : "#fff",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        border: currentAnswer === option.key ? `1px solid ${newColors.primary4}` : "1px solid #e1e8ed",
                        marginBottom: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: currentAnswer === option.key ? newColors.primary5 : "#2c3e50"
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuestionAnswer(
                          ticketTypeId,
                          question.id,
                          option.key
                        );
                      }}
                    >
                      {currentAnswer === option.key ? (
                        <CheckCircle2 size={16} color={newColors.primary5} />
                      ) : (
                        <Circle size={16} color="#7f8c8d" />
                      )}
                      <span style={{ marginLeft: "8px", flex: 1, lineHeight: "16px" }}>
                        {option.value}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {question.type === "DATE" && (
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: currentAnswer ? "#f0f9ff" : "#fff",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    border: hasError 
                      ? "1px solid #e74c3c" 
                      : currentAnswer 
                        ? `1px solid ${newColors.primary4}` 
                        : "1px solid #e1e8ed",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "12px",
                    color: currentAnswer ? newColors.primary5 : "#2c3e50"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDatePicker(
                      ticketTypeId,
                      question.id,
                      question?.questionCode
                    );
                  }}
                >
                  <CalendarDays size={16} color={currentAnswer ? newColors.primary5 : "#7f8c8d"} />
                  <span style={{ flex: 1, marginLeft: "8px", textAlign: "left" }}>
                    {currentAnswer
                      ? formatDate(currentAnswer)
                      : `Select ${question.question.toLowerCase()}`}
                  </span>
                  <ChevronDown size={16} color={currentAnswer ? newColors.primary5 : "#7f8c8d"} />
                </button>
              )}

              {hasError && (
                <div style={{
                  color: "#e74c3c",
                  fontSize: "12px",
                  marginTop: "6px",
                  fontWeight: "500"
                }}>
                  {hasError}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDateSelector = (ticketTypeId, isSelected) => {
    const availableDates = getAvailableDates(ticketTypeId);
    const selectedDate = selectedDates[ticketTypeId];
    const isLoading = loadingAvailability[ticketTypeId];

    if (isLoading) {
      return (
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "12px",
          justifyContent: "center"
        }}>
          <div style={{
            width: "16px",
            height: "16px",
            border: "2px solid #f3f3f3",
            borderTop: "2px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <span style={{
            marginLeft: "8px",
            fontSize: "12px",
            color: "#7f8c8d"
          }}>
            Loading available dates...
          </span>
        </div>
      );
    }

    if (availableDates.length === 0) {
      return (
        <div style={{ padding: "12px" }}>
          <div style={{
            fontSize: "12px",
            color: "#e74c3c",
            textAlign: "center",
            fontWeight: "500"
          }}>
            No dates available
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: "12px 12px 10px" }}>
        <div style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#2c3e50",
          marginBottom: "8px"
        }}>
          Select Date
          {isSelected && !selectedDate && (
            <span style={{ color: "#e74c3c", fontWeight: "normal", fontSize: "12px" }}>
              {" "}(Required)
            </span>
          )}
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: selectedDate ? "#f0f9ff" : "#fff",
            borderRadius: "6px",
            padding: "8px 12px",
            border: selectedDate ? `1px solid ${newColors.primary4}` : "1px solid #e1e8ed",
            cursor: "pointer",
            width: "100%",
            fontSize: "12px",
            color: selectedDate ? newColors.primary5 : "#2c3e50"
          }}
                            onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDatePicker(ticketTypeId);
                  }}
        >
          <CalendarDays size={16} color={selectedDate ? newColors.primary5 : "#7f8c8d"} />
          <span style={{ flex: 1, marginLeft: "8px", textAlign: "left" }}>
            {selectedDate ? formatDate(selectedDate) : "Select a date"}
          </span>
          <ChevronDown size={16} color={selectedDate ? newColors.primary5 : "#7f8c8d"} />
        </button>
        {errors[ticketTypeId] && errors[ticketTypeId].includes("date") && (
          <div style={{
            color: "#e74c3c",
            fontSize: "12px",
            marginTop: "6px",
            fontWeight: "500"
          }}>
            Please select a date
          </div>
        )}
      </div>
    );
  };

  const renderTimeSlotSelector = (ticketTypeId, parentTicket, isSelected) => {
    const selectedDate = selectedDates[ticketTypeId];
    const availableTimeSlots = getAvailableTimeSlots(ticketTypeId, selectedDate);
    const selectedTimeSlot = selectedTimeSlots[ticketTypeId];

    if (!selectedDate || availableTimeSlots.length === 0) {
      return null;
    }

    return (
      <div style={{ padding: "12px 12px 10px" }}>
        <div style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#2c3e50",
          marginBottom: "8px"
        }}>
          Select Time Slot
          {isSelected && !selectedTimeSlot && (
            <span style={{ color: "#e74c3c", fontWeight: "normal", fontSize: "12px" }}>
              {" "}(Required)
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {availableTimeSlots.map((slot, index) => (
            <button
              key={`slot-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: selectedTimeSlot === slot ? newColors.primary5 : "#e1e8ed",
                borderRadius: "12px",
                padding: "4px 10px",
                marginRight: "6px",
                marginBottom: "4px",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "500",
                color: selectedTimeSlot === slot ? "#fff" : "#2c3e50"
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectTimeSlot(ticketTypeId, slot);
              }}
            >
              {selectedTimeSlot === slot ? (
                <CheckCircle2 size={12} color="#fff" />
              ) : (
                <Circle size={12} color="#2c3e50" />
              )}
              <span style={{ marginLeft: "4px" }}>
                {slot}
              </span>
            </button>
          ))}
        </div>
        {errors[ticketTypeId] && errors[ticketTypeId].includes("time slot") && (
          <div style={{
            color: "#e74c3c",
            fontSize: "12px",
            marginTop: "6px",
            fontWeight: "500"
          }}>
            Please select a time slot
          </div>
        )}
      </div>
    );
  };

  const renderTicketCard = (ticket, index) => {
    const isTicketSelected = selectedTickets[ticket.id] !== undefined;

    return (
      <div key={ticket.id} style={{
        width: `${SCREEN_WIDTH}px`,
        minHeight: "100%",
        backgroundColor: "#fff"
      }}>
        <div style={{
          height: "100%",
          overflowY: "auto"
        }}>
          {/* Ticket Header */}
          <div style={{
            borderTop: isTicketSelected ? `3px solid ${newColors.primary4}` : "none"
          }}>
            <button
              style={{
                padding: "16px",
                backgroundColor: "#fff",
                border: "none",
                width: "100%",
                cursor: "pointer"
              }}
              onClick={() => toggleTicketSelection(ticket)}
            >
              <div style={{
                display: "flex",
                alignItems: "flex-start"
              }}>
                <div style={{
                  marginRight: "12px",
                  paddingTop: "1px"
                }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    border: `2px solid ${newColors.primary4}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isTicketSelected ? newColors.primary4 : "transparent"
                  }}>
                    {isTicketSelected && (
                      <Check size={18} color="#fff" />
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#2c3e50",
                    marginBottom: "6px",
                    lineHeight: "22px"
                  }}>
                    {ticket.name}
                  </div>
                  {ticket.description && (
                    <div style={{
                      fontSize: "14px",
                      color: "#7f8c8d",
                      marginBottom: "8px",
                      lineHeight: "18px"
                    }}>
                      {ticket.description.split("\n")[0]}
                    </div>
                  )}

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "4px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center"
                    }}>
                      {ticket.isCancellable ? (
                        <CheckCircle size={12} color="green" />
                      ) : (
                        <X size={12} color="red" />
                      )}
                      <span style={{
                        fontSize: "10px",
                        marginLeft: "3px",
                        fontWeight: "500",
                        color: ticket.isCancellable ? "green" : "red"
                      }}>
                        {ticket.isCancellable ? "Cancellable" : "Non-cancellable"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Inclusions */}
          {isTicketSelected &&
            ticket.inclusions &&
            ticket.inclusions.length > 0 && (
              <div style={{
                paddingLeft: "16px",
                paddingRight: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid #f5f5f5"
              }}>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#2c3e50",
                  marginBottom: "8px"
                }}>
                  Inclusions:
                </div>
                {ticket.inclusions.map((inclusion, idx) => (
                  <div key={`inclusion-${idx}`} style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "3px"
                  }}>
                    <CheckCircle size={12} color={newColors.primary4} />
                    <span style={{
                      fontSize: "12px",
                      color: "#7f8c8d",
                      marginLeft: "6px",
                      flex: 1,
                      lineHeight: "16px"
                    }}>
                      {inclusion}
                    </span>
                  </div>
                ))}
              </div>
            )}

          {/* Ticket Types */}
          {isTicketSelected && (
            <div style={{ padding: "16px" }}>
              <div style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#2c3e50",
                marginBottom: "12px",
                width: "40%",
      
              }}>
                Select Ticket Types:
              </div>

              {ticket.ticketType?.map((ticketType) => {
                const isTypeSelected = selectedTicketTypes[ticketType.id] !== undefined;
                const currentQuantity = ticketQuantities[ticketType.id] || 1;

                return (
                  <div key={ticketType.id} style={{
                    marginBottom: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                    overflow: "hidden",
                    border: "1px solid #e9ecef",
                       width: "33%",
                                 marginLeft:"5%"
                // backgroundColor: "#000",
                  }}>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        padding: "12px",
                        backgroundColor: isTypeSelected ? "#f0f9ff" : "transparent",
                        border: isTypeSelected ? `1px solid ${newColors.primary4}` : "none",
                        width: "100%",
                        cursor: "pointer"
                      }}
                      onClick={() => toggleTicketTypeSelection(ticketType, ticket)}
                    >
                      <div style={{
                        marginRight: "12px",
                        paddingTop: "1px"
                      }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "3px",
                          border: `2px solid ${newColors.primary4}`,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: isTypeSelected ? newColors.primary4 : "transparent"
                        }}>
                          {isTypeSelected && (
                            <Check size={14} color="#fff" />
                          )}
                        </div>
                      </div>

                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "4px"
                        }}>
                          <div style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#2c3e50",
                            flex: 1,
                            marginRight: "8px",
                            lineHeight: "18px"
                          }}>
                            {ticketType.name}
                          </div>
                          <div style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: newColors.primary5
                          }}>
                            {/* {CurrencyConverter(
                              ticket.currency,
                              ticketType.selling_price ||
                                ticketType.nettPrice ||
                                ticketType.originalPrice ||
                                0
                            )} */}
                          {  CurrencyConverter( ticket.currency,
                              ticketType.selling_price ||
                                ticketType.nettPrice ||
                                ticketType.originalPrice ||
                                0, baseCurrencyValue)}
                          </div>
                        </div>

                        {ticketType.ageFrom !== null &&
                          ticketType.ageFrom !== undefined &&
                          ticketType.ageTo !== null &&
                          ticketType.ageTo !== undefined && (
                            <div style={{
                              fontSize: "11px",
                              color: "#7f8c8d",
                              marginBottom: "2px"
                            }}>
                              Age: {ticketType.ageFrom} - {ticketType.ageTo} years
                            </div>
                          )}

                        {(ticketType.minPurchaseQty || ticketType.maxPurchaseQty) && (
                          <div style={{
                            fontSize: "10px",
                            color: "#95a5a6"
                          }}>
                            {ticketType.minPurchaseQty && `Min: ${ticketType.minPurchaseQty}`}
                            {ticketType.minPurchaseQty && ticketType.maxPurchaseQty && " | "}
                            {ticketType.maxPurchaseQty && `Max: ${ticketType.maxPurchaseQty}`}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Date Selection */}
                    {isTypeSelected &&
                      isDateRequired(ticket) &&
                      renderDateSelector(ticketType.id, isTypeSelected)}

                    {/* Time Slot Selection */}
                    {isTypeSelected &&
                      ticket.isCapacity &&
                      renderTimeSlotSelector(ticketType.id, ticket, isTypeSelected)}

                    {/* Questions */}
                    {renderQuestions(ticketType.id, ticket, isTypeSelected)}

                    {/* Quantity Selector */}
                    {isTypeSelected && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderTop: "1px solid #e9ecef"
                      }}>
                        <div style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#2c3e50"
                        }}>
                          Quantity:
                        </div>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          padding: "4px",
                          border: "1px solid #e1e8ed",
                          minWidth: "100px"
                        }}>
                          <button
                            type="button"
                            style={{
                              width: "28px",
                              height: "28px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: "6px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #e1e8ed",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: newColors.primary4
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              decreaseQuantity(ticketType.id);
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#2c3e50",
                            margin: "0 12px",
                            minWidth: "20px",
                            textAlign: "center"
                          }}>
                            {currentQuantity}
                          </span>
                          <button
                            type="button"
                            style={{
                              width: "28px",
                              height: "28px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: "6px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #e1e8ed",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: newColors.primary4
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              increaseQuantity(ticketType.id);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Demo data for testing - replace with actual prop data
  const demoData = packageData.length > 0 ? packageData : [
    {
      id: "1",
      name: "Universal Studios Singapore",
      description: "Experience the ultimate movie theme park with thrilling rides and attractions.",
      currency: "SGD",
      isCancellable: true,
      inclusions: ["1-Day admission", "Access to all rides", "Free WiFi"],
      ticketType: [
        {
          id: "adult1",
          name: "Adult Ticket",
          selling_price: 81,
          ageFrom: 13,
          ageTo: 59,
          minPurchaseQty: 1,
          maxPurchaseQty: 10
        },
        {
          id: "child1",
          name: "Child Ticket",
          selling_price: 61,
          ageFrom: 4,
          ageTo: 12,
          minPurchaseQty: 1,
          maxPurchaseQty: 10
        }
      ]
    },
    {
      id: "2",
      name: "S.E.A. Aquarium",
      description: "Discover the wonders of the underwater world at one of the world's largest aquariums.",
      currency: "SGD",
      isCancellable: false,
      inclusions: ["1-Day admission", "Access to all exhibits"],
      ticketType: [
        {
          id: "adult2",
          name: "Adult Ticket",
          selling_price: 41,
          ageFrom: 13,
          ageTo: 59,
          minPurchaseQty: 1,
          maxPurchaseQty: 8
        }
      ]
    }
  ];

  const dataToRender = demoData;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#f5f8ff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #f0f0f0"
      }}>
        {/* <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "16px",
            backgroundColor: "#f8f9fa",
            border: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer"
          }}
          onClick={handleBack}
        >
          <ArrowLeft size={24} color="#2c3e50" />
        </button> */}
        <h1 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#2c3e50",
          margin: 0
        }}>
          Select Tickets
        </h1>
        <div style={{ width: "32px" }} />
      </div>

      {/* Progress Indicator */}
      {renderProgressIndicator()}

      {/* Ticket Cards Swiper */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Navigation Arrows */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          padding: "0 8px",
          zIndex: 10,
          pointerEvents: "none",
          transform: "translateY(-50%)"
        }}>
          <button
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "18px",
              backgroundColor: currentTicketIndex === 0 ? "rgba(240, 240, 240, 0.8)" : "rgba(255, 255, 255, 0.9)",
              border: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
              cursor: currentTicketIndex === 0 ? "not-allowed" : "pointer",
              pointerEvents: "auto"
            }}
            onClick={goToPreviousTicket}
            disabled={currentTicketIndex === 0}
          >
            <ChevronLeft size={20} color={currentTicketIndex === 0 ? "#bdc3c7" : "#2c3e50"} />
          </button>

          <button
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "18px",
              backgroundColor: currentTicketIndex === dataToRender.length - 1 ? "rgba(240, 240, 240, 0.8)" : "rgba(255, 255, 255, 0.9)",
              border: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
              cursor: currentTicketIndex === dataToRender.length - 1 ? "not-allowed" : "pointer",
              pointerEvents: "auto"
            }}
            onClick={goToNextTicket}
            disabled={currentTicketIndex === dataToRender.length - 1}
          >
            <ChevronRight size={20} color={currentTicketIndex === dataToRender.length - 1 ? "#bdc3c7" : "#2c3e50"} />
          </button>
        </div>

        <div
          ref={scrollViewRef}
          style={{
            display: "flex",
            overflowX: "hidden",
            scrollSnapType: "x mandatory",
            height: "100%",
            scrollBehavior: "smooth"
          }}
          onScroll={handleScrollEnd}
        >
          {dataToRender.map((ticket, index) => (
            <div
              key={ticket.id}
              style={{
                scrollSnapAlign: "start",
                flex: "0 0 auto"
              }}
            >
              {renderTicketCard(ticket, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Container */}
      <div style={{
        backgroundColor: "#fff",
        borderTop: "1px solid #f0f0f0",
        padding: "12px 16px"
      }}>
        {Object.keys(selectedTicketTypes).length > 0 && (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px"
            }}>
              <span style={{
                fontSize: "16px",
                color: "#2c3e50",
                fontWeight: "600"
              }}>
                Tickets Selected:
              </span>
              <span style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#2c3e50"
              }}>
                {getTotalTicketCount()}
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px"
            }}>
              <span style={{
                fontSize: "16px",
                color: "#2c3e50",
                fontWeight: "600"
              }}>
                Total Amount:
              </span>
              <span style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: newColors.primary5
              }}>
                {/* {CurrencyConverter(
                  Object.values(selectedTicketTypes)[0]?.currency ||
                    dataToRender[0]?.currency ||
                    "SGD",
                  calculateTotalPrice()
                )} */}
                {CurrencyConverter( Object.values(selectedTicketTypes)[0]?.currency ||
                    dataToRender[0]?.currency ||
                    "SGD",
                  calculateTotalPrice(), baseCurrencyValue)}
              </span>
            </div>
          </div>
        )}

        <button
          style={{
            backgroundColor: Object.keys(selectedTicketTypes).length === 0 ? "#bdc3c7" : newColors.primary5,
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "16px",
            boxShadow: Object.keys(selectedTicketTypes).length === 0 ? "none" : `0 4px 8px rgba(41, 128, 185, 0.3)`,
            border: "none",
            cursor: Object.keys(selectedTicketTypes).length === 0 ? "not-allowed" : "pointer",
            width: "100%"
          }}
          disabled={Object.keys(selectedTicketTypes).length === 0}
          onClick={handleOnPressContinue}
        >
          <span style={{
            color: "#fff",
            fontSize: "17px",
            fontWeight: "bold",
            marginRight: "8px"
          }}>
            Continue
          </span>
          <ArrowRight size={20} color="#fff" />
        </button>
      </div>

      {/* Simple Date Picker Modal (Basic Implementation) */}
      {openedModal === "date" && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            maxWidth: "90%",
            width: "300px"
          }}>
            <h3 style={{
              margin: "0 0 16px 0",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              Select Date
            </h3>
            <input
              type="date"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e1e8ed",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "16px"
              }}
              onChange={(e) => {
                if (e.target.value) {
                  submitDate(e.target.value);
                }
              }}
            />
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px"
            }}>
              <button
                style={{
                  padding: "8px 16px",
                  border: "1px solid #e1e8ed",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setOpenedModal("");
                  setCurrentTicketTypeIdForDate(null);
                  setCurrentQuestionForDate(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// import React, { useState, useEffect, useContext } from "react";
// import { Check, CheckCircle, X, Plus, Minus, ArrowLeft, ArrowRight, Circle } from "lucide-react";
// import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
// import { AppContext } from "../../../_app";

// const TicketPicker = ({ handleOnPressContinueData, handleTicketPicker, attractionTickets }) => {
//   // Sample attraction tickets data based on the provided format
//   console.log("TicketPicker component mounted", attractionTickets);  
//   // State management
//     const { userStatus, baseCurrencyValue, baseLocation, baseUserId } =
//       useContext(AppContext);
//   const [selectedPackages, setSelectedPackages] = useState({});
//   const [ticketQuantities, setTicketQuantities] = useState({});
//   const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
//   const [errors, setErrors] = useState({});

//   const packageData = attractionTickets.data || [];


//   const handleOnPressContinue = () => {
//     if (Object.keys(selectedPackages).length > 0) {
//       const newErrors = {};
//       let hasErrors = false;

//       Object.values(selectedPackages).forEach(pkg => {
//         if (pkg.isCapacity && !selectedTimeSlots[pkg.id] && pkg?.timeSlot?.length > 0) {
//           newErrors[pkg.id] = "Please select a time slot for this ticket";
//           hasErrors = true;
//         }
//       });

//       if (hasErrors) {
//         setErrors(newErrors);
//         return;
//       }

//       const selectedPackagesArray = Object.values(selectedPackages).map(pkg => ({
//         ...pkg,
//         selectedQuantity: ticketQuantities[pkg.id] || 1,
//         selectedTimeSlot: selectedTimeSlots[pkg.id] || null
//       }));

//       if (handleOnPressContinueData) handleOnPressContinueData(selectedPackagesArray);
//     }
//   };

//   const togglePackageSelection = (tourPackage) => {
//     const updatedSelectedPackages = { ...selectedPackages };

//     if (updatedSelectedPackages[tourPackage.id]) {
//       delete updatedSelectedPackages[tourPackage.id];

//       if (errors[tourPackage.id]) {
//         const updatedErrors = { ...errors };
//         delete updatedErrors[tourPackage.id];
//         setErrors(updatedErrors);
//       }
//     } else {
//       updatedSelectedPackages[tourPackage.id] = tourPackage;

//       if (!ticketQuantities[tourPackage.id]) {
//         setTicketQuantities(prev => ({
//           ...prev,
//           [tourPackage.id]: 1
//         }));
//       }
//     }

//     setSelectedPackages(updatedSelectedPackages);
//   };

//   const selectTimeSlot = (packageId, timeSlot) => {
//     setSelectedTimeSlots(prev => ({
//       ...prev,
//       [packageId]: timeSlot
//     }));

//     if (errors[packageId]) {
//       const updatedErrors = { ...errors };
//       delete updatedErrors[packageId];
//       setErrors(updatedErrors);
//     }
//   };

//   const increaseQuantity = (packageId) => {
//     const currentQty = ticketQuantities[packageId] || 1;
//     const maxLimit = 10;

//     if (currentQty < maxLimit) {
//       setTicketQuantities(prev => ({
//         ...prev,
//         [packageId]: currentQty + 1
//       }));
//     }
//   };

//   const decreaseQuantity = (packageId) => {
//     const currentQty = ticketQuantities[packageId] || 1;

//     if (currentQty > 1) {
//       setTicketQuantities(prev => ({
//         ...prev,
//         [packageId]: currentQty - 1
//       }));
//     }
//   };

// //   const CurrencyConverter = (currency, amount) => {
// //     if (currency === "SGD") {
// //       return `$${amount.toFixed(2)}`;
// //     }
// //     return `${currency} ${amount.toFixed(2)}`;
// //   };

//   const calculateTotalPrice = () => {
//     let total = 0;

//     Object.entries(selectedPackages).forEach(([packageId, packageData]) => {
//       const ticketType = packageData.ticketType[0] || {};
//       const price = ticketType.recommendedSellingPrice || ticketType.originalPrice || 0;
//       const quantity = ticketQuantities[packageId] || 1;

//       total += price * quantity;
//     });

//     return total;
//   };

//   const getTotalTicketCount = () => {
//     let count = 0;
//     Object.keys(selectedPackages).forEach(packageId => {
//       count += ticketQuantities[packageId] || 1;
//     });
//     return count;
//   };

//   const formatDescription = (description) => {
//     if (!description) return '';
    
//     // Split by newlines and filter out empty lines
//     const lines = description.split('\n').filter(line => line.trim() !== '');
    
//     // Take just the first line or first few words for a preview
//     if (lines.length > 0) {
//       if (lines[0].length > 80) {
//         return lines[0].substring(0, 80) + '...';
//       }
//       return lines[0];
//     }
//     return '';
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.content}>
//         {packageData.map((tourPackage) => {
//             console.log("Tour Package", tourPackage);
//           const ticketType = tourPackage.ticketType[0] || {};
//           const isSelected = selectedPackages[tourPackage.id] !== undefined;
//           const currentQuantity = ticketQuantities[tourPackage.id] || 1;
//           const originalPrice = ticketType.originalPrice;
//           const sellingPrice = ticketType.recommendedSellingPrice;
//           const hasDiscount = originalPrice > sellingPrice && sellingPrice > 0;

//           return (
//             <div
//               key={tourPackage.id}
//               style={{
//                 ...styles.packageCard,
//                 ...(isSelected ? styles.selectedPackageCard : {})
//               }}
//             >
//               {/* Package Header */}
//               <div 
//                 style={styles.packageHeader}
//                 onClick={() => togglePackageSelection(tourPackage)}
//               >
//                 <div style={styles.packageHeaderContent}>
//                   <div style={{
//                     ...styles.checkboxCircle,
//                     ...(isSelected ? styles.selectedCheckboxCircle : {})
//                   }}>
//                     {isSelected && <Check size={16} color="#fff" />}
//                   </div>
                  
//                   <div style={styles.packageTitleContainer}>
//                     <h2 style={styles.packageTitle}>{tourPackage.name}</h2>
//                     {tourPackage.description && (
//                       <p style={styles.packageDescription}>
//                         {formatDescription(tourPackage.description)}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Package Details - Only visible when selected */}
//               {isSelected && (
//                 <div style={styles.packageDetails}>
//                   {/* Inclusions */}
//                   {tourPackage.inclusions && tourPackage.inclusions.length > 0 && (
//                     <div style={styles.section}>
//                       <h3 style={styles.sectionTitle}>Inclusions:</h3>
//                       <div style={styles.inclusionsList}>
//                         {tourPackage.inclusions.map((inclusion, index) => (
//                           <div key={`inclusion-${index}`} style={styles.inclusionItem}>
//                             <CheckCircle size={16} color="#22c55e" />
//                             <span style={styles.inclusionText}>{inclusion}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Time Slots - If applicable */}
//                   {tourPackage.isCapacity && tourPackage.timeSlot && tourPackage.timeSlot.length > 0 && (
//                     <div style={styles.section}>
//                       <h3 style={styles.sectionTitle}>
//                         Select a Time Slot
//                         {!selectedTimeSlots[tourPackage.id] && (
//                           <span style={styles.requiredText}>(Required)</span>
//                         )}
//                       </h3>
//                       <div style={styles.timeSlotContainer}>
//                         {tourPackage.timeSlot.map((slot, index) => {
//                           const isSlotSelected = selectedTimeSlots[tourPackage.id] === slot;
//                           return (
//                             <button
//                               key={`slot-${index}`}
//                               style={{
//                                 ...styles.timeSlotButton,
//                                 ...(isSlotSelected ? styles.selectedTimeSlotButton : {})
//                               }}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 selectTimeSlot(tourPackage.id, slot);
//                               }}
//                             >
//                               {isSlotSelected ? (
//                                 <CheckCircle size={16} color="#fff" style={styles.timeSlotIcon} />
//                               ) : (
//                                 <Circle size={16} color="#555" style={styles.timeSlotIcon} />
//                               )}
//                               {slot}
//                             </button>
//                           );
//                         })}
//                       </div>
//                       {errors[tourPackage.id] && (
//                         <p style={styles.errorText}>{errors[tourPackage.id]}</p>
//                       )}
//                     </div>
//                   )}

//                   <div style={styles.packageFooter}>
//                     {/* Left column: Price & Info */}
//                     <div style={styles.packageInfo}>
//                       {/* Cancellation Status */}
//                       <div style={styles.cancellationStatus}>
//                         {tourPackage.isCancellable ? (
//                           <>
//                             <CheckCircle size={16} color="#22c55e" />
//                             <span style={styles.cancellableText}>Cancellable</span>
//                           </>
//                         ) : (
//                           <>
//                             <X size={16} color="#ed4242" />
//                             <span style={styles.nonCancellableText}>Non-cancellable</span>
//                           </>
//                         )}
//                       </div>

//                       {/* Price Display */}
//                       <div style={styles.priceDisplay}>
//                         <span style={styles.currentPrice}>
//                           {/* {CurrencyConverter(tourPackage.currency, ticketType.recommendedSellingPrice || ticketType.originalPrice || 0)} */}
//                           {CurrencyConverter(
//                  tourPackage.currency,
//                  ticketType.recommendedSellingPrice || ticketType.originalPrice || 0,
//                 baseCurrencyValue
//               )}
//                         </span>
//                         {hasDiscount && (
//                           <span style={styles.originalPrice}>
//                                {CurrencyConverter(
//                  tourPackage.currency,
//                  ticketType.originalPrice || 0,
//                 baseCurrencyValue
//               )}
//                             {/* {CurrencyConverter(tourPackage.currency, ticketType.originalPrice || 0)} */}
//                           </span>
//                         )}
//                       </div>

//                       {/* Ticket Type & Age Range */}
//                       <div style={styles.ticketMeta}>
//                         <span style={styles.ticketType}>
//                           {ticketType.name || 'Standard'}
//                         </span>
//                         {ticketType.ageFrom && ticketType.ageTo && (
//                           <span style={styles.ageRange}>
//                             Age: {ticketType.ageFrom}-{ticketType.ageTo} years
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* Right column: Quantity Selector */}
//                     <div style={styles.quantitySelector}>
//                       <button
//                         style={styles.quantityButton}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           decreaseQuantity(tourPackage.id);
//                         }}
//                       >
//                         <Minus size={18} color="#555" />
//                       </button>
                      
//                       <div style={styles.quantityValue}>
//                         {currentQuantity}
//                       </div>
                      
//                       <button
//                         style={styles.quantityButton}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           increaseQuantity(tourPackage.id);
//                         }}
//                       >
//                         <Plus size={18} color="#555" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
        
//         {/* Order Summary and Continue Button */}
//         <div style={styles.orderSummaryContainer}>
//           {Object.keys(selectedPackages).length > 0 ? (
//             <div style={styles.orderSummary}>
//               <div style={styles.summaryRow}>
//                 <span style={styles.summaryLabel}>Tickets Selected:</span>
//                 <span style={styles.summaryValue}>{getTotalTicketCount()}</span>
//               </div>
//               <div style={styles.summaryRow}>
//                 <span style={styles.summaryLabelTotal}>Total Amount:</span>
//                 <span style={styles.summaryValueTotal}>
//                   {/* {CurrencyConverter(
//                     Object.values(selectedPackages)[0]?.currency || 'SGD',
//                     calculateTotalPrice()
//                   )} */}
//                     {CurrencyConverter(
//                  Object.values(selectedPackages)[0]?.currency || 'SGD',
//                  calculateTotalPrice(),
//                 baseCurrencyValue
//               )}
//                 </span>
//               </div>
//             </div>
//           ) : (
//             <div style={{ height: '12px' }} />
//           )}

//           <button
//             style={{
//               ...styles.continueButton,
//               ...(Object.keys(selectedPackages).length === 0 ? styles.disabledButton : {})
//             }}
//             disabled={Object.keys(selectedPackages).length === 0}
//             onClick={handleOnPressContinue}
//           >
//             <span style={styles.continueButtonText}>Continue</span>
//             <ArrowRight size={18} color={Object.keys(selectedPackages).length === 0 ? "#999" : "#fff"} style={{ marginLeft: '8px' }} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Internal styles object
// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column',
//     height: '100%',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
//     backgroundColor: '#f5f7fa',
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '16px 20px',
//     backgroundColor: '#ffffff',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
//     position: 'sticky',
//     top: 0,
//     zIndex: 10
//   },
//   headerTitle: {
//     fontSize: '20px',
//     fontWeight: 700,
//     margin: 0,
//     color: '#333333'
//   },
//   backButton: {
//     width: '36px',
//     height: '36px',
//     borderRadius: '50%',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9',
//     border: 'none',
//     cursor: 'pointer'
//   },
//   content: {
//     flex: 1,
//     overflow: 'auto',
//     padding: '16px',
//     paddingBottom: '20px' // Reduced padding since we have the button inside
//   },
//   packageCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: '12px',
//     marginBottom: '16px',
//     boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//     border: '1px solid #e5e7eb',
//     overflow: 'hidden',
//     transition: 'all 0.2s ease'
//   },
//   selectedPackageCard: {
//     borderColor: '#3b82f6',
//     boxShadow: '0 1px 3px rgba(59,130,246,0.3)'
//   },
//   packageHeader: {
//     padding: '16px',
//     cursor: 'pointer',
//     borderBottom: '1px solid transparent'
//   },
//   packageHeaderContent: {
//     display: 'flex',
//     alignItems: 'flex-start'
//   },
//   checkboxCircle: {
//     width: '24px',
//     height: '24px',
//     borderRadius: '50%',
//     border: '2px solid #d1d5db',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: '12px',
//     marginTop: '2px'
//   },
//   selectedCheckboxCircle: {
//     backgroundColor: '#3b82f6',
//     borderColor: '#3b82f6'
//   },
//   packageTitleContainer: {
//     flex: 1
//   },
//   packageTitle: {
//     fontSize: '18px',
//     fontWeight: 700,
//     margin: 0,
//     marginBottom: '6px',
//     color: '#1f2937'
//   },
//   packageDescription: {
//     fontSize: '14px',
//     color: '#6b7280',
//     margin: 0,
//     lineHeight: 1.5
//   },
//   packageDetails: {
//     padding: '16px',
//     backgroundColor: '#f9fafb',
//     borderTop: '1px solid #e5e7eb'
//   },
//   section: {
//     marginBottom: '16px'
//   },
//   sectionTitle: {
//     fontSize: '15px',
//     fontWeight: 600,
//     color: '#374151',
//     marginTop: 0,
//     marginBottom: '10px'
//   },
//   requiredText: {
//     color: '#ed4242',
//     fontWeight: 'normal',
//     fontSize: '13px',
//     marginLeft: '6px'
//   },
//   inclusionsList: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '8px'
//   },
//   inclusionItem: {
//     display: 'flex',
//     alignItems: 'center'
//   },
//   inclusionText: {
//     marginLeft: '8px',
//     fontSize: '14px',
//     color: '#4b5563'
//   },
//   timeSlotContainer: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     gap: '8px'
//   },
//   timeSlotButton: {
//     display: 'flex',
//     alignItems: 'center',
//     padding: '8px 12px',
//     backgroundColor: '#ffffff',
//     border: '1px solid #d1d5db',
//     borderRadius: '20px',
//     fontSize: '14px',
//     color: '#374151',
//     cursor: 'pointer'
//   },
//   selectedTimeSlotButton: {
//     backgroundColor: '#3b82f6',
//     borderColor: '#3b82f6',
//     color: '#ffffff'
//   },
//   timeSlotIcon: {
//     marginRight: '6px'
//   },
//   errorText: {
//     fontSize: '12px',
//     color: '#ed4242',
//     margin: '8px 0 0 0'
//   },
//   packageFooter: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: '16px',
//     flexWrap: 'wrap'
//   },
//   packageInfo: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '8px'
//   },
//   cancellationStatus: {
//     display: 'flex',
//     alignItems: 'center'
//   },
//   cancellableText: {
//     fontSize: '13px',
//     color: '#22c55e',
//     fontWeight: 500,
//     marginLeft: '6px'
//   },
//   nonCancellableText: {
//     fontSize: '13px',
//     color: '#ed4242',
//     fontWeight: 500,
//     marginLeft: '6px'
//   },
//   priceDisplay: {
//     display: 'flex',
//     alignItems: 'baseline',
//     gap: '8px'
//   },
//   currentPrice: {
//     fontSize: '20px',
//     fontWeight: 700,
//     color: '#1f2937'
//   },
//   originalPrice: {
//     fontSize: '14px',
//     color: '#9ca3af',
//     textDecoration: 'line-through'
//   },
//   ticketMeta: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     gap: '8px',
//     alignItems: 'center'
//   },
//   ticketType: {
//     padding: '4px 8px',
//     backgroundColor: '#f3f4f6',
//     fontSize: '12px',
//     fontWeight: 500,
//     color: '#4b5563',
//     borderRadius: '4px'
//   },
//   ageRange: {
//     fontSize: '12px',
//     color: '#6b7280'
//   },
//   quantitySelector: {
//     display: 'flex',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     border: '1px solid #e5e7eb',
//     borderRadius: '8px',
//     overflow: 'hidden',
//     marginTop: '12px',
//     alignSelf: 'flex-start'
//   },
//   quantityButton: {
//     width: '36px',
//     height: '36px',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     border: 'none',
//     cursor: 'pointer'
//   },
//   quantityValue: {
//     width: '36px',
//     fontSize: '16px',
//     fontWeight: 600,
//     textAlign: 'center',
//     color: '#1f2937'
//   },
//   orderSummaryContainer: {
//     backgroundColor: '#ffffff',
//     padding: '16px',
//     marginTop: '24px',
//     borderRadius: '12px',
//     boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//     border: '1px solid #e5e7eb'
//   },
//   orderSummary: {
//     marginBottom: '16px'
//   },
//   summaryRow: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '8px'
//   },
//   summaryLabel: {
//     fontSize: '14px',
//     color: '#6b7280'
//   },
//   summaryValue: {
//     fontSize: '14px',
//     color: '#374151',
//     fontWeight: 500
//   },
//   summaryLabelTotal: {
//     fontSize: '16px',
//     color: '#374151',
//     fontWeight: 600
//   },
//   summaryValueTotal: {
//     fontSize: '20px',
//     color: '#3b82f6',
//     fontWeight: 700
//   },
//   continueButton: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//     padding: '14px',
//     backgroundColor: '#3b82f6',
//     color: '#ffffff',
//     border: 'none',
//     borderRadius: '8px',
//     fontSize: '16px',
//     fontWeight: 600,
//     cursor: 'pointer'
//   },
//   disabledButton: {
//     backgroundColor: '#d1d5db',
//     cursor: 'not-allowed'
//   },
//   continueButtonText: {
//     fontSize: '16px',
//     fontWeight: 600,
//     color: '#ffffff'
//   }
// };

// export default TicketPicker;





// // import React, { useState, useEffect } from "react";
// // import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
// // import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
// // import getDiscountProductBaseByPrice from "../../../../pages/product-details/common/GetDiscountProductBaseByPrice";
// // import {getGlobalTixProductTickets} from "../../../../AxiosCalls/LifestyleServices/globaltixService";
// // import { ArrowLeft, Check, CheckCircle, X, Plus, Minus, RadioButtonChecked, Circle, ArrowRight } from 'lucide-react';


// // export default function TicketPicker({ handleOnPressContinueData, handleTicketPicker, attractionTickets }) {

    
// //     console.log("TicketPicker component mounted", attractionTickets.data);   
// //     // Use the provided tour packages data
// //     const packageData = attractionTickets.data || [];
  
// //     // State to track selected packages, quantities, and time slots
// //     const [selectedPackages, setSelectedPackages] = useState({});
// //     const [ticketQuantities, setTicketQuantities] = useState({});
// //     const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
// //     const [errors, setErrors] = useState({});
  
// //     const handleBack = () => {
// //       handleClickBack();
// //     };
  
// //     const handleOnPressContinue = () => {
// //       // Only proceed if at least one package is selected
// //       if (Object.keys(selectedPackages).length > 0) {
// //         // Check if all selected packages with isCapacity=true have time slots selected
// //         const newErrors = {};
// //         let hasErrors = false;
  
// //         Object.values(selectedPackages).forEach(pkg => {
// //           if (pkg.isCapacity && !selectedTimeSlots[pkg.id] && pkg?.timeSlot?.length > 0) {
// //             newErrors[pkg.id] = "Please select a time slot for this ticket";
// //             hasErrors = true;
// //           }
// //         });
  
// //         // If there are errors, update the errors state and don't proceed
// //         if (hasErrors) {
// //           setErrors(newErrors);
// //           return;
// //         }
  
// //         const selectedPackagesArray = Object.values(selectedPackages).map(pkg => ({
// //           ...pkg,
// //           selectedQuantity: ticketQuantities[pkg.id] || 1,
// //           selectedTimeSlot: selectedTimeSlots[pkg.id] || null
// //         }));
  
// //         handleOnPressContinueData(selectedPackagesArray);
// //       }
// //     };
  
// //     const togglePackageSelection = (tourPackage) => {
// //       // Create a copy of the current selected packages
// //       const updatedSelectedPackages = { ...selectedPackages };
  
// //       if (updatedSelectedPackages[tourPackage.id]) {
// //         // If already selected, deselect it by removing from the object
// //         delete updatedSelectedPackages[tourPackage.id];
  
// //         // Also clear any error for this package
// //         if (errors[tourPackage.id]) {
// //           const updatedErrors = { ...errors };
// //           delete updatedErrors[tourPackage.id];
// //           setErrors(updatedErrors);
// //         }
// //       } else {
// //         // If not selected, add it to the selected packages
// //         updatedSelectedPackages[tourPackage.id] = tourPackage;
  
// //         // Initialize quantity if this is a new selection
// //         if (!ticketQuantities[tourPackage.id]) {
// //           setTicketQuantities(prev => ({
// //             ...prev,
// //             [tourPackage.id]: 1
// //           }));
// //         }
// //       }
  
// //       // Update the selected packages state
// //       setSelectedPackages(updatedSelectedPackages);
// //     };
  
// //     const selectTimeSlot = (packageId, timeSlot) => {
// //       setSelectedTimeSlots(prev => ({
// //         ...prev,
// //         [packageId]: timeSlot
// //       }));
  
// //       // Clear error for this package if exists
// //       if (errors[packageId]) {
// //         const updatedErrors = { ...errors };
// //         delete updatedErrors[packageId];
// //         setErrors(updatedErrors);
// //       }
// //     };
  
// //     const increaseQuantity = (packageId) => {
// //       const currentQty = ticketQuantities[packageId] || 1;
// //       const maxLimit = 10; // Set a reasonable maximum limit
  
// //       if (currentQty < maxLimit) {
// //         setTicketQuantities(prev => ({
// //           ...prev,
// //           [packageId]: currentQty + 1
// //         }));
// //       }
// //     };
  
// //     const decreaseQuantity = (packageId) => {
// //       const currentQty = ticketQuantities[packageId] || 1;
  
// //       if (currentQty > 1) {
// //         setTicketQuantities(prev => ({
// //           ...prev,
// //           [packageId]: currentQty - 1
// //         }));
// //       }
// //     };
  
// //     const calculateTotalPrice = () => {
// //       let total = 0;
  
// //       // Calculate total from all selected packages
// //       Object.entries(selectedPackages).forEach(([packageId, packageData]) => {
// //         const ticketType = packageData.ticketType[0] || {};
// //         const price = ticketType.recommendedSellingPrice || ticketType.originalPrice || 0;
// //         const quantity = ticketQuantities[packageId] || 1;
  
// //         total += price * quantity;
// //       });
  
// //       return total;
// //     };
  
// //     // Count total number of selected tickets
// //     const getTotalTicketCount = () => {
// //       let count = 0;
// //       Object.keys(selectedPackages).forEach(packageId => {
// //         count += ticketQuantities[packageId] || 1;
// //       });
// //       return count;
// //     };
  
// //     return (
// //       <div className="h-full bg-blue-50 p-4 flex flex-col">
// //         <div className="flex items-center justify-between mb-5">
// //           <button 
// //             className="w-10 h-10 rounded-full bg-white flex justify-center items-center shadow"
// //             onClick={handleBack}
// //           >
// //             <ArrowLeft size={24} color="#2c3e50" />
// //           </button>
// //           <h1 className="text-xl font-bold text-gray-800">Select Tour Packages</h1>
// //           <div className="w-10" />
// //         </div>
  
// //         <div className="flex-1 overflow-auto">
// //           {packageData.map((tourPackage) => {
// //             // Get the first ticket type (assuming there's always at least one)
// //             const ticketType = tourPackage.ticketType[0] || {};
// //             const isSelected = selectedPackages[tourPackage.id] !== undefined;
// //             const currentQuantity = ticketQuantities[tourPackage.id] || 1;
  
// //             return (
// //               <div
// //                 key={tourPackage.id}
// //                 className={`flex items-center bg-white rounded-3xl p-4 mb-3 shadow ${isSelected ? 'border-2 border-blue-600' : ''}`}
// //                 onClick={() => togglePackageSelection(tourPackage)}
// //                 style={{ cursor: 'pointer' }}
// //               >
// //                 <div className="mr-3">
// //                   <div className={`w-6 h-6 rounded border-2 border-blue-600 flex justify-center items-center ${isSelected ? 'bg-blue-600' : ''}`}>
// //                     {isSelected && <Check size={18} color="#fff" />}
// //                   </div>
// //                 </div>
  
// //                 <div className="flex-1">
// //                   <h2 className="text-lg font-bold text-gray-800">{tourPackage.name}</h2>
// //                   {tourPackage.description && (
// //                     <p className="text-sm text-gray-500 mt-1 line-clamp-2">
// //                       {tourPackage.description.split('\n')[0]}
// //                     </p>
// //                   )}
  
// //                   {/* Display inclusions if available */}
// //                   {tourPackage.inclusions && tourPackage.inclusions.length > 0 && (
// //                     <div className="mt-2">
// //                       <h3 className="text-sm font-semibold text-gray-800 mb-1">Inclusions:</h3>
// //                       {tourPackage.inclusions.map((inclusion, index) => (
// //                         <div key={`inclusion-${index}`} className="flex items-center mb-0.5">
// //                           <CheckCircle size={14} className="text-blue-600" />
// //                           <span className="text-xs text-gray-500 ml-1">{inclusion}</span>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}
  
// //                   {/* Display time slots if available and isCapacity is true */}
// //                   {tourPackage.isCapacity && tourPackage.timeSlot && tourPackage.timeSlot.length > 0 && (
// //                     <div className="mt-2">
// //                       <h3 className="text-sm font-semibold text-gray-800">
// //                         Select a Time Slot
// //                         {isSelected && !selectedTimeSlots[tourPackage.id] && (
// //                           <span className="text-red-500 font-normal text-xs"> (Required)</span>
// //                         )}
// //                       </h3>
// //                       <div className="flex flex-wrap">
// //                         {tourPackage.timeSlot.map((slot, index) => (
// //                           <div
// //                             key={`slot-${index}`}
// //                             className={`flex items-center 
// //                               ${isSelected && selectedTimeSlots[tourPackage.id] === slot ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} 
// //                               rounded px-3 py-2 mr-2 mb-1.5`}
// //                             onClick={(e) => {
// //                               e.stopPropagation(); // Stop propagation to prevent package toggle
// //                               isSelected && selectTimeSlot(tourPackage.id, slot);
// //                             }}
// //                             style={{ cursor: isSelected ? 'pointer' : 'default' }}
// //                           >
// //                             {isSelected && selectedTimeSlots[tourPackage.id] === slot ? (
// //                               <RadioButtonChecked size={14} className="text-white" />
// //                             ) : (
// //                               <Circle size={14} className="text-gray-800" />
// //                             )}
// //                             <span className={`text-sm ml-1 ${isSelected && selectedTimeSlots[tourPackage.id] === slot ? 'text-white' : 'text-gray-800'}`}>
// //                               {slot}
// //                             </span>
// //                           </div>
// //                         ))}
// //                       </div>
// //                       {isSelected && errors[tourPackage.id] && (
// //                         <p className="text-xs text-red-500 mt-1">{errors[tourPackage.id]}</p>
// //                       )}
// //                     </div>
// //                   )}
  
// //                   {/* Display cancellation status */}
// //                   <div className="flex items-center mt-2">
// //                     {tourPackage.isCancellable ? (
// //                       <CheckCircle size={14} className="text-green-500" />
// //                     ) : (
// //                       <X size={14} className="text-red-500" />
// //                     )}
// //                     <span className={`text-xs ml-1 ${tourPackage.isCancellable ? 'text-green-500' : 'text-red-500'}`}>
// //                       {tourPackage.isCancellable ? "Cancellable" : "Non-cancellable"}
// //                     </span>
// //                   </div>
  
// //                   <div className="flex items-center flex-wrap mt-2">
// //                     <span className="text-base font-bold text-blue-700 mr-2">
// //                       {CurrencyConverter(
// //                         tourPackage.currency,
// //                         ticketType.recommendedSellingPrice || ticketType.originalPrice
// //                       )}
// //                     </span>
// //                     <span className="text-sm text-gray-800 bg-gray-200 px-2 py-0.5 rounded">
// //                       {ticketType.name || ''}
// //                     </span>
// //                   </div>
                  
// //                   {ticketType.ageFrom && ticketType.ageTo && (
// //                     <p className="text-xs text-gray-500 mt-1">
// //                       Age: {ticketType.ageFrom} - {ticketType.ageTo} years
// //                     </p>
// //                   )}
  
// //                   {isSelected && (
// //                     <div className="flex items-center mt-3 bg-gray-100 rounded-lg w-28 justify-between p-1">
// //                       <button
// //                         className="w-8 h-8 flex justify-center items-center rounded-full bg-white shadow"
// //                         onClick={(e) => {
// //                           e.stopPropagation(); // Stop propagation to prevent package toggle
// //                           decreaseQuantity(tourPackage.id);
// //                         }}
// //                       >
// //                         <Minus size={18} className="text-blue-600" />
// //                       </button>
  
// //                       <span className="text-base font-bold text-gray-800">{currentQuantity}</span>
  
// //                       <button
// //                         className="w-8 h-8 flex justify-center items-center rounded-full bg-white shadow"
// //                         onClick={(e) => {
// //                           e.stopPropagation(); // Stop propagation to prevent package toggle
// //                           increaseQuantity(tourPackage.id);
// //                         }}
// //                       >
// //                         <Plus size={18} className="text-blue-600" />
// //                       </button>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
  
// //         <div className="rounded-xl p-4 mt-3">
// //           {Object.keys(selectedPackages).length > 0 && (
// //             <div>
// //               <div className="flex justify-between items-center mb-2">
// //                 <span className="text-base font-bold text-gray-800">Tickets Selected:</span>
// //                 <span className="text-base font-bold text-gray-800">{getTotalTicketCount()}</span>
// //               </div>
// //               <div className="flex justify-between items-center mb-2">
// //                 <span className="text-base font-bold text-gray-800">Total Amount:</span>
// //                 <span className="text-lg font-bold text-blue-700">
// //                   {CurrencyConverter(
// //                     Object.values(selectedPackages)[0]?.currency || 'SGD',
// //                     calculateTotalPrice()
// //                   )}
// //                 </span>
// //               </div>
// //             </div>
// //           )}
  
// //           <button
// //             className={`w-full ${Object.keys(selectedPackages).length === 0 ? 'bg-gray-400' : 'bg-blue-700'} 
// //               rounded-lg p-3.5 flex justify-center items-center mt-3`}
// //             disabled={Object.keys(selectedPackages).length === 0}
// //             onClick={handleOnPressContinue}
// //           >
// //             <span className="text-white text-base font-bold mr-1">Select Options</span>
// //             <ArrowRight size={20} className="text-white ml-1" />
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }


// // const TicketPicker = ({
// //   id, handleTicketPicker
// // }) => {

// //     const [ticketData, setTicketData] = useState([]);


// //   useEffect(() => {
// //     console.log("TicketPicker component mounted", id);
// //     handleTicketPickerClick(id);
// //   }, []);

// //   const handleTicketPickerClick  = async (ticket) => {
// //     const result = await getGlobalTixProductTickets(ticket);
// //     console.log("TicketPicker result", result);
// //   }

// //   return (
// //     <Container className="mt-4 lifestyle-packages">
 
// //     </Container>
// //   );
// // };

// // export default TicketPicker;


