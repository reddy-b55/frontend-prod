import { useEffect, useState } from "react";
import { getOrdinalSuffix } from "../../../../GlobalFunctions/OthersGlobalfunctions";
import ToastMessage from "../../../Notification/ToastMessage";
import axios from "axios";

// Default room limits as fallback
const DEFAULT_ROOM_LIMITS = {
  single: {
    maxAdults: 1,
    maxCWB: 1,
    maxCNB: 1,
    maxPax: 2,
  },
  double: {
    maxAdults: 2,
    maxCWB: 2,
    maxCNB: 2,
    maxPax: 3,
  },
  triple: {
    maxAdults: 3,
    maxCWB: 2,
    maxCNB: 2,
    maxPax: 4,
  },
  quad: {
    maxAdults: 4,
    maxCWB: 3,
    maxCNB: 3,
    maxPax: 5,
  },
};

// Function to convert API data format to internal format
const convertApiDataToRoomLimits = (apiData) => {
  if (!apiData || Object.keys(apiData).length === 0) {
    return DEFAULT_ROOM_LIMITS;
  }

  const convertedLimits = {};

  // Convert each room type from API format to internal format
  Object.keys(apiData).forEach((roomType) => {
    const roomTypeKey = roomType.toLowerCase(); // Convert "Single" to "single"
    convertedLimits[roomTypeKey] = {
      maxAdults: apiData[roomType].maxAdults,
      maxCWB: apiData[roomType].maxCWB,
      maxCNB: apiData[roomType].maxCNB,
      maxPax: apiData[roomType].maxPax,
    };
  });

  // Ensure all required room types exist, use defaults for missing ones
  ["single", "double", "triple", "quad"].forEach((roomType) => {
    if (!convertedLimits[roomType]) {
      convertedLimits[roomType] = DEFAULT_ROOM_LIMITS[roomType];
    }
  });

  return convertedLimits;
};

// Updated automateRoomAllocation function with proper room priority order
const automateRoomAllocation = (
  adultCount,
  childCount,
  singleRoomCount,
  doubleRoomCount,
  tripleRoomCount,
  quadRoomCount,
  roomLimits
) => {
  // Initialize room allocation array
  let allocationArray = [];

  // Create empty room objects based on available counts in PRIORITY ORDER
  const createEmptyRooms = () => {
    let rooms = [];

    // Create single rooms FIRST (Priority 1)
    for (let i = 0; i < singleRoomCount; i++) {
      rooms.push({
        roomType: "single",
        index: i + 1,
        adultCount: 0,
        childCount_CNB: 0,
        childCount_CWB: 0,
        priority: 1, // Add priority for sorting
      });
    }

    // Create double rooms SECOND (Priority 2)
    for (let i = 0; i < doubleRoomCount; i++) {
      rooms.push({
        roomType: "double",
        index: i + 1,
        adultCount: 0,
        childCount_CNB: 0,
        childCount_CWB: 0,
        priority: 2,
      });
    }

    // Create triple rooms THIRD (Priority 3)
    for (let i = 0; i < tripleRoomCount; i++) {
      rooms.push({
        roomType: "triple",
        index: i + 1,
        adultCount: 0,
        childCount_CNB: 0,
        childCount_CWB: 0,
        priority: 3,
      });
    }

    // Create quad rooms LAST (Priority 4)
    for (let i = 0; i < quadRoomCount; i++) {
      rooms.push({
        roomType: "quad",
        index: i + 1,
        adultCount: 0,
        childCount_CNB: 0,
        childCount_CWB: 0,
        priority: 4,
      });
    }

    return rooms;
  };

  // Start with empty rooms
  allocationArray = createEmptyRooms();

  // Sort rooms by priority: Single (1) → Double (2) → Triple (3) → Quad (4)
  allocationArray.sort((a, b) => {
    // First sort by priority (ascending - single rooms first)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // If same priority (same room type), sort by index
    return a.index - b.index;
  });

  console.log(
    "Room allocation order:",
    allocationArray.map((r) => `${r.roomType}-${r.index}`)
  );

  // Allocate adults first (priority over children)
  let remainingAdults = adultCount;

  for (let room of allocationArray) {
    if (remainingAdults <= 0) break;

    const maxAdultsForRoom = roomLimits[room.roomType].maxAdults;
    const adultsToAllocate = Math.min(remainingAdults, maxAdultsForRoom);

    room.adultCount = adultsToAllocate;
    remainingAdults -= adultsToAllocate;

    console.log(
      `Allocated ${adultsToAllocate} adults to ${room.roomType} room ${room.index}. Remaining adults: ${remainingAdults}`
    );
  }

  // Now allocate children with bed (CWB) first
  let remainingChildren = childCount;
  let remainingCWB = childCount; // Initially all children need beds

  for (let room of allocationArray) {
    if (remainingCWB <= 0) break;

    const roomType = room.roomType;
    const maxCWB = roomLimits[roomType].maxCWB;
    const currentOccupancy =
      room.adultCount + room.childCount_CWB + room.childCount_CNB;
    const maxPax = roomLimits[roomType].maxPax;
    const availableSpace = maxPax - currentOccupancy;

    // Calculate how many CWB we can allocate to this room
    const cwbToAllocate = Math.min(remainingCWB, maxCWB, availableSpace);

    if (cwbToAllocate > 0) {
      room.childCount_CWB = cwbToAllocate;
      remainingCWB -= cwbToAllocate;
      remainingChildren -= cwbToAllocate;

      console.log(
        `Allocated ${cwbToAllocate} children (CWB) to ${room.roomType} room ${room.index}. Remaining CWB: ${remainingCWB}`
      );
    }
  }

  // Allocate remaining children as CNB (Children No Bed)
  if (remainingChildren > 0) {
    for (let room of allocationArray) {
      if (remainingChildren <= 0) break;

      const roomType = room.roomType;
      const maxCNB = roomLimits[roomType].maxCNB;
      const currentOccupancy =
        room.adultCount + room.childCount_CWB + room.childCount_CNB;
      const maxPax = roomLimits[roomType].maxPax;
      const availableSpace = maxPax - currentOccupancy;

      // Calculate how many CNB we can allocate to this room
      const cnbToAllocate = Math.min(remainingChildren, maxCNB, availableSpace);

      if (cnbToAllocate > 0) {
        room.childCount_CNB = cnbToAllocate;
        remainingChildren -= cnbToAllocate;

        console.log(
          `Allocated ${cnbToAllocate} children (CNB) to ${room.roomType} room ${room.index}. Remaining children: ${remainingChildren}`
        );
      }
    }
  }

  // Reindex rooms by type
  const reindexRooms = (rooms) => {
    const typeIndices = {
      single: 1,
      double: 1,
      triple: 1,
      quad: 1,
    };

    return rooms.map((room) => {
      const newRoom = { ...room };
      newRoom.index = typeIndices[room.roomType]++;
      // Remove priority property as it's no longer needed
      delete newRoom.priority;
      return newRoom;
    });
  };

  // Keep ALL rooms (including empty ones) to show the user the full room selection
  const finalAllocationArray = reindexRooms(allocationArray);

  console.log("Final allocation:", finalAllocationArray);
  console.log(
    "Remaining adults:",
    remainingAdults,
    "Remaining children:",
    remainingChildren
  );

  // Return the original room counts
  const roomCounts = {
    single: singleRoomCount,
    double: doubleRoomCount,
    triple: tripleRoomCount,
    quad: quadRoomCount,
  };

  // Prepare and return the response
  return {
    newAllocationArray: finalAllocationArray,
    response: {
      single: roomCounts.single,
      double: roomCounts.double,
      triple: roomCounts.triple,
      quad: roomCounts.quad,
    },
    status:
      remainingAdults <= 0 && remainingChildren <= 0 ? "success" : "incomplete",
    unallocated: {
      adults: Math.max(0, remainingAdults),
      children: Math.max(0, remainingChildren),
    },
  };
};

// Main component
const HotelRoomAllocation = ({
  adultcount = 0,
  childcount = 0,
  allocationData,
  handleSubmmitRoomAllocation,
  roomAllocationData,
  dataPost = {},
}) => {
  const [hotelRoomAllocationCondition, setHotelRoomAllocationCondition] =
    useState({});
  const [currentRoomLimits, setCurrentRoomLimits] =
    useState(DEFAULT_ROOM_LIMITS);
  console.log(
    "HotelRoomAllocation dataPost:",
    adultcount,
    childcount,
    allocationData,
    roomAllocationData
  );

  useEffect(() => {
    if (dataPost?.provider === "hotelAhs") {
      console.log(dataPost, 'posttttt')
      const getRoomAllocationConditions = async () => {
        let data = {
          customer_request: {
            CheckInDate: dataPost?.checkInd || "2025-10-01",
            HotelID: dataPost?.pId,
          },
        };

        try {
          const response = await axios.post(
            "get_room_allocation_data_hotels",
            data
          );
          console.log("room allocation data is", response);

          if (response.data.status === 200 && response?.data?.occupancy) {
            const apiRoomLimits = response.data.occupancy;
            setHotelRoomAllocationCondition(apiRoomLimits);

            // Convert API data to internal format and set as current room limits
            const convertedLimits = convertApiDataToRoomLimits(apiRoomLimits);
            setCurrentRoomLimits(convertedLimits);
          } else {
            setHotelRoomAllocationCondition({});
            setCurrentRoomLimits(DEFAULT_ROOM_LIMITS);
          }
        } catch (error) {
          setHotelRoomAllocationCondition({});
          setCurrentRoomLimits(DEFAULT_ROOM_LIMITS);
        }
      };

      getRoomAllocationConditions();
    } else {
      setCurrentRoomLimits(DEFAULT_ROOM_LIMITS);
    }
  }, [dataPost]);

  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  const [single, setSingle] = useState(1);
  const [double, setDouble] = useState(0);
  const [triple, setTriple] = useState(0);
  const [quad, setQuad] = useState(0);

  const [roomAllocationArray, setRoomAllocationArray] = useState([]);
  const [autoAllocationMessage, setAutoAllocationMessage] = useState("");
  const [hasAutoAllocated, setHasAutoAllocated] = useState(false);

  // Track allocated counts
  const [allocateAdultCount, setAllocateAdultCount] = useState(0);
  const [allocateChildCount, setAllocateChildCount] = useState(0);

  useEffect(() => {
    setAdultCount(adultcount);
    setChildCount(childcount);

    // Reset auto allocation flag when new data comes in
    setHasAutoAllocated(false);
    setAutoAllocationMessage("");

    // Handle the case where roomAllocationData and allocationData may not match
    if (roomAllocationData && roomAllocationData.length > 0) {
      // Count actual room types in roomAllocationData
      const roomCounts = {
        single: 0,
        double: 0,
        triple: 0,
        quad: 0,
      };

      // Count rooms by type in the roomAllocationData
      roomAllocationData.forEach((room) => {
        if (room.roomType in roomCounts) {
          roomCounts[room.roomType]++;
        }
      });

      // Update room counts based on what's actually in roomAllocationData
      setSingle(roomCounts.single);
      setDouble(roomCounts.double);
      setTriple(roomCounts.triple);
      setQuad(roomCounts.quad);

      setRoomAllocationArray(roomAllocationData);

      // Calculate already allocated counts
      let totalAdults = 0;
      let totalChildren = 0;

      roomAllocationData.forEach((room) => {
        totalAdults += Number(room.adultCount) || 0;
        totalChildren +=
          (Number(room.childCount_CWB) || 0) +
          (Number(room.childCount_CNB) || 0);
      });

      setAllocateAdultCount(totalAdults);
      setAllocateChildCount(totalChildren);

      // Mark as auto allocated if there are already allocations
      if (totalAdults > 0 || totalChildren > 0) {
        setHasAutoAllocated(true);
      }
    } else {
      // No roomAllocationData, so use allocationData
      setSingle(Number(allocationData.Single));
      setDouble(Number(allocationData.Double));
      setTriple(Number(allocationData.Triple));
      setQuad(Number(allocationData.Quad));

      initializeRoomAllocation(
        Number(allocationData.Single),
        Number(allocationData.Double),
        Number(allocationData.Triple),
        Number(allocationData.Quad)
      );
    }
  }, [adultcount, childcount, allocationData, roomAllocationData]);

  const reset = () => {
    initializeRoomAllocation(single, double, triple, quad);
    setAllocateAdultCount(0);
    setAllocateChildCount(0);
    setAutoAllocationMessage("");
    setHasAutoAllocated(false);
  };

  const initializeRoomAllocation = (value1, value2, value3, value4) => {
    const dataset = {
      single: value1,
      double: value2,
      triple: value3,
      quad: value4,
    };

    let object = Object.entries(dataset).flatMap(([roomType, count]) =>
      Array.from({ length: count }, (_, index) => ({
        roomType,
        index: index + 1,
        adultCount: 0,
        childCount_CNB: 0,
        childCount_CWB: 0,
      }))
    );

    setRoomAllocationArray(object);
  };

  // Enhanced useEffect with proper remaining guest calculation
  useEffect(() => {
    // Only run auto allocation once when component initializes and hasn't been auto allocated yet
    if (!hasAutoAllocated && roomAllocationArray.length > 0 && adultcount > 0) {
      const timer = setTimeout(() => {
        // Count number of rooms of each type in the current array
        const roomAllocationCounts = {
          single: 0,
          double: 0,
          triple: 0,
          quad: 0,
        };

        roomAllocationArray.forEach((room) => {
          if (room.roomType in roomAllocationCounts) {
            roomAllocationCounts[room.roomType]++;
          }
        });

        // Use the higher count - either from state or what's in the room allocation array
        const actualSingle = Math.max(single, roomAllocationCounts.single);
        const actualDouble = Math.max(double, roomAllocationCounts.double);
        const actualTriple = Math.max(triple, roomAllocationCounts.triple);
        const actualQuad = Math.max(quad, roomAllocationCounts.quad);

        // Always try auto allocation first to see what can be allocated
        const allocationResult = automateRoomAllocation(
          adultcount,
          childcount,
          actualSingle,
          actualDouble,
          actualTriple,
          actualQuad,
          currentRoomLimits
        );

        var maxTotalCapacity = 0;

        if (actualSingle > 0) {
          const singleMaxPax = currentRoomLimits?.single?.maxPax || 2;
          maxTotalCapacity += actualSingle * singleMaxPax;
        }
        if (actualDouble > 0) {
          const doubleMaxPax = currentRoomLimits?.double?.maxPax || 2;
          maxTotalCapacity += actualDouble * doubleMaxPax;
        }
        if (actualTriple > 0) {
          const tripleMaxPax = currentRoomLimits?.triple?.maxPax || 3;
          maxTotalCapacity += actualTriple * tripleMaxPax;
        }
        if (actualQuad > 0) {
          const quadMaxPax = currentRoomLimits?.quad?.maxPax || 3;
          maxTotalCapacity += actualQuad * quadMaxPax;
        }

        console.log(
          maxTotalCapacity,
          "Custom Current Room Limitssxsxsxsxsxsxsxxzxzx"
        );

        // Set the allocation result regardless of success or failure
        if (
          allocationResult.newAllocationArray &&
          allocationResult.newAllocationArray.length > 0
        ) {
          setRoomAllocationArray(allocationResult.newAllocationArray);

          // Calculate what was actually allocated
          let totalAdults = 0;
          let totalChildren = 0;

          allocationResult.newAllocationArray.forEach((room) => {
            totalAdults += Number(room.adultCount) || 0;
            totalChildren +=
              (Number(room.childCount_CWB) || 0) +
              (Number(room.childCount_CNB) || 0);
          });

          setAllocateAdultCount(totalAdults);
          setAllocateChildCount(totalChildren);
        }

        if (allocationResult.status === "success") {
          // Auto allocation was successful - no error message
          setAutoAllocationMessage("");

          const dataset = {
            single: actualSingle,
            double: actualDouble,
            triple: actualTriple,
            quad: actualQuad,
          };

          handleSubmmitRoomAllocation(
            {
              roomAllocationArray: allocationResult.newAllocationArray,
              dataset: dataset,
            },
            "auto"
          );
        } else {
          // Auto allocation incomplete - show remaining guests message
          const remainingAdults = allocationResult.unallocated.adults;
          const remainingChildren = allocationResult.unallocated.children;

          let errorMessage =
            // "Can't allocate rooms automatically. Could not allocate all guests. ";
            "Can't allocate rooms automatically. ";

          if (adultCount + childCount > maxTotalCapacity) {
            errorMessage += `Too many guests to allocate. You have ${
              adultCount + childCount
            } guests but the maximum capacity is ${maxTotalCapacity} with the selected rooms.`;
          } else {
            if (remainingAdults > 0 && remainingChildren > 0) {
              errorMessage += `Remaining: ${remainingAdults} adult${
                remainingAdults > 1 ? "s" : ""
              } and ${remainingChildren} child${
                remainingChildren > 1 ? "ren" : ""
              }.`;
            } else if (remainingAdults > 0) {
              errorMessage += `Remaining: ${remainingAdults} adult${
                remainingAdults > 1 ? "s" : ""
              } and 0 children.`;
            } else if (remainingChildren > 0) {
              errorMessage += `Remaining: 0 adults and ${remainingChildren} child${
                remainingChildren > 1 ? "ren" : ""
              }.`;
            }
          }

          setAutoAllocationMessage(errorMessage);
        }

        // Mark as auto allocated (whether successful or not)
        setHasAutoAllocated(true);
      }, 2000); // 2 seconds

      return () => clearTimeout(timer);
    }
  }, [
    roomAllocationArray,
    hasAutoAllocated,
    adultcount,
    childcount,
    single,
    double,
    triple,
    quad,
    currentRoomLimits,
  ]);

  // Enhanced autoAllocate function to handle partial allocations better
  const autoAllocate = () => {
    // Count number of rooms of each type in the current array
    const roomAllocationCounts = {
      single: 0,
      double: 0,
      triple: 0,
      quad: 0,
    };

    roomAllocationArray.forEach((room) => {
      if (room.roomType in roomAllocationCounts) {
        roomAllocationCounts[room.roomType]++;
      }
    });

    // Use the higher count - either from state or what's in the room allocation array
    const actualSingle = Math.max(single, roomAllocationCounts.single);
    const actualDouble = Math.max(double, roomAllocationCounts.double);
    const actualTriple = Math.max(triple, roomAllocationCounts.triple);
    const actualQuad = Math.max(quad, roomAllocationCounts.quad);

    // Use current room limits for auto allocation
    let response = automateRoomAllocation(
      adultCount,
      childCount,
      actualSingle,
      actualDouble,
      actualTriple,
      actualQuad,
      currentRoomLimits
    );

    console.log("Auto allocation response:", response);

    setRoomAllocationArray(response.newAllocationArray);

    // Keep track of the actual room counts
    setSingle(actualSingle);
    setDouble(actualDouble);
    setTriple(actualTriple);
    setQuad(actualQuad);

    // Calculate totals for tracking
    let totalAdults = 0;
    let totalChildren = 0;

    response.newAllocationArray.forEach((room) => {
      totalAdults += Number(room.adultCount) || 0;
      totalChildren +=
        (Number(room.childCount_CWB) || 0) + (Number(room.childCount_CNB) || 0);
    });

    setAllocateAdultCount(totalAdults);
    setAllocateChildCount(totalChildren);

    // Check if allocation was incomplete and show appropriate message
    if (response.status === "incomplete") {
      const remainingAdults = response.unallocated.adults;
      const remainingChildren = response.unallocated.children;

      let message = "Auto allocation completed with remaining guests. ";

      if (remainingAdults > 0 && remainingChildren > 0) {
        message += `Remaining: ${remainingAdults} adult${
          remainingAdults > 1 ? "s" : ""
        } and ${remainingChildren} child${remainingChildren > 1 ? "ren" : ""}.`;
      } else if (remainingAdults > 0) {
        message += `Remaining: ${remainingAdults} adult${
          remainingAdults > 1 ? "s" : ""
        }.`;
      } else if (remainingChildren > 0) {
        message += `Remaining: ${remainingChildren} child${
          remainingChildren > 1 ? "ren" : ""
        }.`;
      }

      setAutoAllocationMessage(message);
    } else {
      setAutoAllocationMessage("");
    }

    const dataset = {
      single: actualSingle,
      double: actualDouble,
      triple: actualTriple,
      quad: actualQuad,
    };

    handleSubmmitRoomAllocation(
      {
        roomAllocationArray: response.newAllocationArray,
        dataset: dataset,
      },
      "auto"
    );

    // Mark as auto allocated
    setHasAutoAllocated(true);
  };

  const decrease = (value, data, roomIndex) => {
    let existingArr = [...roomAllocationArray];

    if (value === "adult") {
      if (existingArr[roomIndex].adultCount > 0) {
        existingArr[roomIndex] = {
          ...existingArr[roomIndex],
          adultCount: Number(existingArr[roomIndex].adultCount) - 1,
        };

        setAllocateAdultCount((prev) => prev - 1);
      }
    } else {
      if (value === "childCWB" && existingArr[roomIndex].childCount_CWB > 0) {
        existingArr[roomIndex] = {
          ...existingArr[roomIndex],
          childCount_CWB: Number(existingArr[roomIndex].childCount_CWB) - 1,
        };

        setAllocateChildCount((prev) => prev - 1);
      } else if (
        value === "childCNB" &&
        existingArr[roomIndex].childCount_CNB > 0
      ) {
        existingArr[roomIndex] = {
          ...existingArr[roomIndex],
          childCount_CNB: Number(existingArr[roomIndex].childCount_CNB) - 1,
        };

        setAllocateChildCount((prev) => prev - 1);
      }
    }

    setRoomAllocationArray(existingArr);
  };

  const increase = (value, data, roomIndex) => {
    let existingArr = [...roomAllocationArray];

    // Create a test copy to check if we'd exceed room limits
    const testRoom = { ...existingArr[roomIndex] };
    if (value === "adult") {
      testRoom.adultCount = Number(testRoom.adultCount) + 1;

      // Only proceed if we wouldn't exceed room limits and total allocated adults
      if (!getRoomCondiionStatus(testRoom) && allocateAdultCount < adultCount) {
        existingArr[roomIndex] = testRoom;
        setAllocateAdultCount((prev) => prev + 1);
      }
    } else if (value === "childCWB") {
      testRoom.childCount_CWB = Number(testRoom.childCount_CWB) + 1;

      // Only proceed if we wouldn't exceed room limits and total allocated children
      if (!getRoomCondiionStatus(testRoom) && allocateChildCount < childCount) {
        existingArr[roomIndex] = testRoom;
        setAllocateChildCount((prev) => prev + 1);
      }
    } else if (value === "childCNB") {
      testRoom.childCount_CNB = Number(testRoom.childCount_CNB) + 1;

      // Only proceed if we wouldn't exceed room limits and total allocated children
      if (!getRoomCondiionStatus(testRoom) && allocateChildCount < childCount) {
        existingArr[roomIndex] = testRoom;
        setAllocateChildCount((prev) => prev + 1);
      }
    }

    setRoomAllocationArray(existingArr);
  };

  const getRoomCondiionStatus = (room) => {
    // Use current room limits (either from API or default)
    const roomLimits = {};

    // Convert current room limits to the format expected by this function
    Object.keys(currentRoomLimits).forEach((roomType) => {
      const capitalizedType =
        roomType.charAt(0).toUpperCase() + roomType.slice(1);
      roomLimits[capitalizedType] = {
        name: capitalizedType,
        maxAdults: currentRoomLimits[roomType].maxAdults,
        maxCWB: currentRoomLimits[roomType].maxCWB,
        maxCNB: currentRoomLimits[roomType].maxCNB,
        maxPax: currentRoomLimits[roomType].maxPax,
      };
    });

    // Capitalize first letter to match the keys in roomLimits
    const roomTypeKey =
      room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1);

    // Get room limits for the specified room type
    const limits = roomLimits[roomTypeKey];

    if (!limits) {
      return false; // Invalid room type
    }

    // Convert all counts to numbers
    const adultCount = Number(room.adultCount) || 0;
    const cwbCount = Number(room.childCount_CWB) || 0;
    const cnbCount = Number(room.childCount_CNB) || 0;
    const totalPax = adultCount + cwbCount + cnbCount;

    // Check for room limit validations
    if (adultCount > limits.maxAdults) {
      return true; // Exceeds maximum adults
    }

    if (cwbCount > limits.maxCWB) {
      return true; // Exceeds maximum children with bed
    }

    if (cnbCount > limits.maxCNB) {
      return true; // Exceeds maximum children no bed
    }

    if (totalPax > limits.maxPax) {
      return true; // Exceeds maximum total occupants
    }

    return false;
  };

  const submit = () => {
    // Check if all guests are assigned
    const totalAssignedAdults = allocateAdultCount;
    const totalAssignedChildren = allocateChildCount;

    const unassignedAdults = adultCount - totalAssignedAdults;
    const unassignedChildren = childCount - totalAssignedChildren;
    const totalUnassigned = unassignedAdults + unassignedChildren;

    if (totalUnassigned > 0) {
      let message = "Please assign all guests to rooms. ";

      if (unassignedAdults > 0 && unassignedChildren > 0) {
        message += `${unassignedAdults} adult${
          unassignedAdults > 1 ? "s" : ""
        } and ${unassignedChildren} child${
          unassignedChildren > 1 ? "ren" : ""
        } are not assigned.`;
      } else if (unassignedAdults > 0) {
        message += `${unassignedAdults} adult${
          unassignedAdults > 1 ? "s" : ""
        } ${unassignedAdults > 1 ? "are" : "is"} not assigned.`;
      } else if (unassignedChildren > 0) {
        message += `${unassignedChildren} child${
          unassignedChildren > 1 ? "ren" : ""
        } ${unassignedChildren > 1 ? "are" : "is"} not assigned.`;
      }

      ToastMessage({
        status: "warning",
        message: message,
      });
      return; // Prevent submission
    }

    // All guests are assigned, proceed with submission
    const dataset = {
      single,
      double,
      triple,
      quad,
    };

    handleSubmmitRoomAllocation(
      {
        roomAllocationArray: roomAllocationArray,
        dataset: dataset,
      },
      "submit"
    );
  };

  return (
    <div
      style={{
        position: "relative",
        height: "calc(100vh - 200px)",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <div>
        <div>
          {autoAllocationMessage && (
            <h5
              className="text-center mb-3 text-danger"
              style={{ fontSize: "12px" }}
            >
              {autoAllocationMessage}
            </h5>
          )}
        </div>
        {roomAllocationArray.map((room, roomIndex) => (
          <div
            key={roomIndex}
            lg="12"
            sm="12"
            md="12"
            className="d-flex flex-wrap justify-content-center border mb-4 py-4 col-10 mx-auto"
          >
            <h5 className="m-0 p-0 col-12 mb-3">
              {getOrdinalSuffix(room.index)} {room.roomType} Room
              {getRoomCondiionStatus(room) ? (
                <span className="text-danger ml-1">reached</span>
              ) : (
                ""
              )}
            </h5>

            <div className="col-4 d-flex flex-column align-items-center">
              <h6 className="m-0 p-0">Adult</h6>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-solid btn-sm"
                  disabled={room.adultCount <= 0}
                  onClick={() => decrease("adult", room, roomIndex)}
                >
                  -
                </button>
                <p className="m-0 p-0 px-3">{room.adultCount}</p>
                <button
                  className="btn btn-solid btn-sm"
                  disabled={
                    getRoomCondiionStatus(room) ||
                    allocateAdultCount >= adultCount
                  }
                  onClick={() => increase("adult", room, roomIndex)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="col-4 d-flex flex-column align-items-center">
              <h6 className="m-0 p-0">Child</h6>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-solid btn-sm"
                  disabled={room.childCount_CWB <= 0}
                  onClick={() => decrease("childCWB", room, roomIndex)}
                >
                  -
                </button>
                <p className="m-0 p-0 px-3">{room.childCount_CWB}</p>
                <button
                  className="btn btn-solid btn-sm"
                  disabled={
                    getRoomCondiionStatus(room) ||
                    allocateChildCount >= childCount
                  }
                  onClick={() => increase("childCWB", room, roomIndex)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "sticky",
          bottom: "0",
          backgroundColor: "#fff",
          paddingTop: "2px",
        }}
      >
        <div className="d-flex m-2 d-flex gap-2 justify-content-center col-12 mt-5">
          <button className="btn btn-solid btn-sm border" onClick={submit}>
            Submit
          </button>
        </div>

        <div className="col-12 text-center mt-3">
          <p>
            Adults: {allocateAdultCount}/{adultCount} allocated | Children:{" "}
            {allocateChildCount}/{childCount} allocated
          </p>
          <small className="text-muted"></small>
        </div>
      </div>
    </div>
  );
};

export default HotelRoomAllocation;
// import { useEffect, useState } from "react";
// import { getOrdinalSuffix } from "../../../../GlobalFunctions/OthersGlobalfunctions";
// import ToastMessage from "../../../Notification/ToastMessage";
// import axios from "axios";

// // Default room limits as fallback
// const DEFAULT_ROOM_LIMITS = {
//     single: {
//         maxAdults: 1,
//         maxCWB: 1,
//         maxCNB: 1,
//         maxPax: 2,
//     },
//     double: {
//         maxAdults: 2,
//         maxCWB: 2,
//         maxCNB: 2,
//         maxPax: 3,
//     },
//     triple: {
//         maxAdults: 3,
//         maxCWB: 2,
//         maxCNB: 2,
//         maxPax: 4,
//     },
//     quad: {
//         maxAdults: 4,
//         maxCWB: 3,
//         maxCNB: 3,
//         maxPax: 5,
//     },
// };

// // Function to convert API data format to internal format
// const convertApiDataToRoomLimits = (apiData) => {
//     if (!apiData || Object.keys(apiData).length === 0) {
//         return DEFAULT_ROOM_LIMITS;
//     }

//     const convertedLimits = {};

//     // Convert each room type from API format to internal format
//     Object.keys(apiData).forEach(roomType => {
//         const roomTypeKey = roomType.toLowerCase(); // Convert "Single" to "single"
//         convertedLimits[roomTypeKey] = {
//             maxAdults: apiData[roomType].maxAdults,
//             maxCWB: apiData[roomType].maxCWB,
//             maxCNB: apiData[roomType].maxCNB,
//             maxPax: apiData[roomType].maxPax,
//         };
//     });

//     // Ensure all required room types exist, use defaults for missing ones
//     ['single', 'double', 'triple', 'quad'].forEach(roomType => {
//         if (!convertedLimits[roomType]) {
//             convertedLimits[roomType] = DEFAULT_ROOM_LIMITS[roomType];
//         }
//     });

//     return convertedLimits;
// };

// // Updated automateRoomAllocation function that accepts room limits as parameter
// // Updated automateRoomAllocation function with proper room priority order
// const automateRoomAllocation = (adultCount, childCount, singleRoomCount, doubleRoomCount, tripleRoomCount, quadRoomCount, roomLimits) => {
//     // Initialize room allocation array
//     let allocationArray = [];

//     // Create empty room objects based on available counts in PRIORITY ORDER
//     const createEmptyRooms = () => {
//         let rooms = [];

//         // Create single rooms FIRST (Priority 1)
//         for (let i = 0; i < singleRoomCount; i++) {
//             rooms.push({
//                 roomType: "single",
//                 index: i + 1,
//                 adultCount: 0,
//                 childCount_CNB: 0,
//                 childCount_CWB: 0,
//                 priority: 1 // Add priority for sorting
//             });
//         }

//         // Create double rooms SECOND (Priority 2)
//         for (let i = 0; i < doubleRoomCount; i++) {
//             rooms.push({
//                 roomType: "double",
//                 index: i + 1,
//                 adultCount: 0,
//                 childCount_CNB: 0,
//                 childCount_CWB: 0,
//                 priority: 2
//             });
//         }

//         // Create triple rooms THIRD (Priority 3)
//         for (let i = 0; i < tripleRoomCount; i++) {
//             rooms.push({
//                 roomType: "triple",
//                 index: i + 1,
//                 adultCount: 0,
//                 childCount_CNB: 0,
//                 childCount_CWB: 0,
//                 priority: 3
//             });
//         }

//         // Create quad rooms LAST (Priority 4)
//         for (let i = 0; i < quadRoomCount; i++) {
//             rooms.push({
//                 roomType: "quad",
//                 index: i + 1,
//                 adultCount: 0,
//                 childCount_CNB: 0,
//                 childCount_CWB: 0,
//                 priority: 4
//             });
//         }

//         return rooms;
//     };

//     // Start with empty rooms
//     allocationArray = createEmptyRooms();

//     // Sort rooms by priority: Single (1) → Double (2) → Triple (3) → Quad (4)
//     allocationArray.sort((a, b) => {
//         // First sort by priority (ascending - single rooms first)
//         if (a.priority !== b.priority) {
//             return a.priority - b.priority;
//         }
//         // If same priority (same room type), sort by index
//         return a.index - b.index;
//     });

//     console.log("Room allocation order:", allocationArray.map(r => `${r.roomType}-${r.index}`));

//     // Allocate adults first (priority over children)
//     let remainingAdults = adultCount;

//     for (let room of allocationArray) {
//         if (remainingAdults <= 0) break;

//         const maxAdultsForRoom = roomLimits[room.roomType].maxAdults;
//         const adultsToAllocate = Math.min(remainingAdults, maxAdultsForRoom);

//         room.adultCount = adultsToAllocate;
//         remainingAdults -= adultsToAllocate;

//         console.log(`Allocated ${adultsToAllocate} adults to ${room.roomType} room ${room.index}. Remaining adults: ${remainingAdults}`);
//     }

//     // Now allocate children with bed (CWB) first
//     let remainingChildren = childCount;
//     let remainingCWB = childCount; // Initially all children need beds

//     for (let room of allocationArray) {
//         if (remainingCWB <= 0) break;

//         const roomType = room.roomType;
//         const maxCWB = roomLimits[roomType].maxCWB;
//         const currentOccupancy = room.adultCount + room.childCount_CWB + room.childCount_CNB;
//         const maxPax = roomLimits[roomType].maxPax;
//         const availableSpace = maxPax - currentOccupancy;

//         // Calculate how many CWB we can allocate to this room
//         const cwbToAllocate = Math.min(
//             remainingCWB,
//             maxCWB,
//             availableSpace
//         );

//         if (cwbToAllocate > 0) {
//             room.childCount_CWB = cwbToAllocate;
//             remainingCWB -= cwbToAllocate;
//             remainingChildren -= cwbToAllocate;

//             console.log(`Allocated ${cwbToAllocate} children (CWB) to ${room.roomType} room ${room.index}. Remaining CWB: ${remainingCWB}`);
//         }
//     }

//     // Allocate remaining children as CNB (Children No Bed)
//     if (remainingChildren > 0) {
//         for (let room of allocationArray) {
//             if (remainingChildren <= 0) break;

//             const roomType = room.roomType;
//             const maxCNB = roomLimits[roomType].maxCNB;
//             const currentOccupancy = room.adultCount + room.childCount_CWB + room.childCount_CNB;
//             const maxPax = roomLimits[roomType].maxPax;
//             const availableSpace = maxPax - currentOccupancy;

//             // Calculate how many CNB we can allocate to this room
//             const cnbToAllocate = Math.min(
//                 remainingChildren,
//                 maxCNB,
//                 availableSpace
//             );

//             if (cnbToAllocate > 0) {
//                 room.childCount_CNB = cnbToAllocate;
//                 remainingChildren -= cnbToAllocate;

//                 console.log(`Allocated ${cnbToAllocate} children (CNB) to ${room.roomType} room ${room.index}. Remaining children: ${remainingChildren}`);
//             }
//         }
//     }

//     // Reindex rooms by type
//     const reindexRooms = (rooms) => {
//         const typeIndices = {
//             single: 1,
//             double: 1,
//             triple: 1,
//             quad: 1,
//         };

//         return rooms.map(room => {
//             const newRoom = { ...room };
//             newRoom.index = typeIndices[room.roomType]++;
//             // Remove priority property as it's no longer needed
//             delete newRoom.priority;
//             return newRoom;
//         });
//     };

//     // Keep ALL rooms (including empty ones) to show the user the full room selection
//     // This ensures quad rooms appear even if empty
//     const finalAllocationArray = reindexRooms(allocationArray);

//     console.log("Final allocation:", finalAllocationArray);

//     // Return the original room counts
//     const roomCounts = {
//         single: singleRoomCount,
//         double: doubleRoomCount,
//         triple: tripleRoomCount,
//         quad: quadRoomCount,
//     };

//     // Prepare and return the response
//     return {
//         newAllocationArray: finalAllocationArray,
//         response: {
//             single: roomCounts.single,
//             double: roomCounts.double,
//             triple: roomCounts.triple,
//             quad: roomCounts.quad,
//         },
//         status: remainingAdults <= 0 && remainingChildren <= 0 ? 'success' : 'incomplete',
//         unallocated: {
//             adults: remainingAdults,
//             children: remainingChildren,
//         }
//     };
// };
// // Updated function to check if rooms can accommodate guests
// const canAccommodateGuests = (adultCount, childCount, singleRoomCount, doubleRoomCount, tripleRoomCount, quadRoomCount, roomLimits) => {
//     // Calculate total capacity using dynamic room limits
//     const totalMaxAdults = (singleRoomCount * roomLimits.single.maxAdults) +
//         (doubleRoomCount * roomLimits.double.maxAdults) +
//         (tripleRoomCount * roomLimits.triple.maxAdults) +
//         (quadRoomCount * roomLimits.quad.maxAdults);

//     const totalMaxPax = (singleRoomCount * roomLimits.single.maxPax) +
//         (doubleRoomCount * roomLimits.double.maxPax) +
//         (tripleRoomCount * roomLimits.triple.maxPax) +
//         (quadRoomCount * roomLimits.quad.maxPax);

//     // Check if we can accommodate all adults and total guests
//     return totalMaxAdults >= adultCount && totalMaxPax >= (adultCount + childCount);
// };

// // Main component
// const HotelRoomAllocation = ({ adultcount = 0, childcount = 0, allocationData, handleSubmmitRoomAllocation, roomAllocationData, dataPost = {} }) => {
//     const [hotelRoomAllocationCondition, setHotelRoomAllocationCondition] = useState({});
//     const [currentRoomLimits, setCurrentRoomLimits] = useState(DEFAULT_ROOM_LIMITS);
//     console.log("HotelRoomAllocation dataPost:", adultcount, adultcount, allocationData, roomAllocationData);
//     useEffect(() => {
//         if(dataPost?.provider === "hotelAhs"){
//                  const getRoomAllocationConditions = async () => {
//             let data = {
//                 "customer_request": {
//                     "CheckInDate": dataPost?.CheckInDate || "2025-10-01",
//                     "HotelID": dataPost?.pId,
//                 }
//             }

//             try {
//                 const response = await axios.post("get_room_allocation_data_hotels", data);
//                 console.log("room allocation data is", response);

//                 if (response.data.status === 200 && response?.data?.occupancy) {
//                     const apiRoomLimits = response.data.occupancy;
//                     setHotelRoomAllocationCondition(apiRoomLimits);

//                     // Convert API data to internal format and set as current room limits
//                     const convertedLimits = convertApiDataToRoomLimits(apiRoomLimits);
//                     setCurrentRoomLimits(convertedLimits);
//                     // console.log("Using API room limits:", convertedLimits);
//                 } else {
//                     setHotelRoomAllocationCondition({});
//                     setCurrentRoomLimits(DEFAULT_ROOM_LIMITS);
//                 }
//             } catch (error) {
//                 setHotelRoomAllocationCondition({});
//                 setCurrentRoomLimits(DEFAULT_ROOM_LIMITS);
//             }
//         }

//         getRoomAllocationConditions();
//         }else{
//         setCurrentRoomLimits(DEFAULT_ROOM_LIMITS);
//         }

//     }, [dataPost]);

//     const [adultCount, setAdultCount] = useState(1);
//     const [childCount, setChildCount] = useState(0);

//     const [single, setSingle] = useState(1);
//     const [double, setDouble] = useState(0);
//     const [triple, setTriple] = useState(0);
//     const [quad, setQuad] = useState(0);

//     const [roomAllocationArray, setRoomAllocationArray] = useState([]);
//     const [autoAllocationMessage, setAutoAllocationMessage] = useState('');
//     const [hasAutoAllocated, setHasAutoAllocated] = useState(false);

//     // Track allocated counts
//     const [allocateAdultCount, setAllocateAdultCount] = useState(0);
//     const [allocateChildCount, setAllocateChildCount] = useState(0);

//     useEffect(() => {
//         setAdultCount(adultcount);
//         setChildCount(childcount);

//         // Reset auto allocation flag when new data comes in
//         setHasAutoAllocated(false);
//         setAutoAllocationMessage('');

//         // Handle the case where roomAllocationData and allocationData may not match
//         if (roomAllocationData && roomAllocationData.length > 0) {
//             // Count actual room types in roomAllocationData
//             const roomCounts = {
//                 single: 0,
//                 double: 0,
//                 triple: 0,
//                 quad: 0
//             };

//             // Count rooms by type in the roomAllocationData
//             roomAllocationData.forEach(room => {
//                 if (room.roomType in roomCounts) {
//                     roomCounts[room.roomType]++;
//                 }
//             });

//             // Update room counts based on what's actually in roomAllocationData
//             setSingle(roomCounts.single);
//             setDouble(roomCounts.double);
//             setTriple(roomCounts.triple);
//             setQuad(roomCounts.quad);

//             setRoomAllocationArray(roomAllocationData);

//             // Calculate already allocated counts
//             let totalAdults = 0;
//             let totalChildren = 0;

//             roomAllocationData.forEach(room => {
//                 totalAdults += Number(room.adultCount) || 0;
//                 totalChildren += (Number(room.childCount_CWB) || 0) + (Number(room.childCount_CNB) || 0);
//             });

//             setAllocateAdultCount(totalAdults);
//             setAllocateChildCount(totalChildren);

//             // Mark as auto allocated if there are already allocations
//             if (totalAdults > 0 || totalChildren > 0) {
//                 setHasAutoAllocated(true);
//             }
//         } else {
//             // No roomAllocationData, so use allocationData
//             setSingle(Number(allocationData.Single));
//             setDouble(Number(allocationData.Double));
//             setTriple(Number(allocationData.Triple));
//             setQuad(Number(allocationData.Quad));

//             initializeRoomAllocation(
//                 Number(allocationData.Single),
//                 Number(allocationData.Double),
//                 Number(allocationData.Triple),
//                 Number(allocationData.Quad)
//             );
//         }
//     }, [adultcount, childcount, allocationData, roomAllocationData]);

//     const reset = () => {
//         initializeRoomAllocation(single, double, triple, quad);
//         setAllocateAdultCount(0);
//         setAllocateChildCount(0);
//         setAutoAllocationMessage('');
//         setHasAutoAllocated(false);
//     };

//     const initializeRoomAllocation = (value1, value2, value3, value4) => {
//         const dataset = {
//             single: value1,
//             double: value2,
//             triple: value3,
//             quad: value4
//         };

//         let object = Object.entries(dataset).flatMap(([roomType, count]) =>
//             Array.from({ length: count }, (_, index) => ({
//                 roomType,
//                 index: index + 1,
//                 adultCount: 0,
//                 childCount_CNB: 0,
//                 childCount_CWB: 0
//             }))
//         );

//         setRoomAllocationArray(object);
//     };

//     // useEffect(() => {
//     //     // Only run auto allocation once when component initializes and hasn't been auto allocated yet
//     //     if (!hasAutoAllocated && roomAllocationArray.length > 0 && adultcount > 0) {
//     //         const timer = setTimeout(() => {
//     //             // Count number of rooms of each type in the current array
//     //             const roomAllocationCounts = {
//     //                 single: 0,
//     //                 double: 0,
//     //                 triple: 0,
//     //                 quad: 0
//     //             };

//     //             roomAllocationArray.forEach(room => {
//     //                 if (room.roomType in roomAllocationCounts) {
//     //                     roomAllocationCounts[room.roomType]++;
//     //                 }
//     //             });

//     //             // Use the higher count - either from state or what's in the room allocation array
//     //             const actualSingle = Math.max(single, roomAllocationCounts.single);
//     //             const actualDouble = Math.max(double, roomAllocationCounts.double);
//     //             const actualTriple = Math.max(triple, roomAllocationCounts.triple);
//     //             const actualQuad = Math.max(quad, roomAllocationCounts.quad);

//     //             // Check if rooms can accommodate guests using current room limits
//     //             const canAccommodate = canAccommodateGuests(
//     //                 adultcount,
//     //                 childcount,
//     //                 actualSingle,
//     //                 actualDouble,
//     //                 actualTriple,
//     //                 actualQuad,
//     //                 currentRoomLimits
//     //             );

//     //             if (canAccommodate) {
//     //                 // Proceed with auto allocation
//     //                 autoAllocate();
//     //                 setAutoAllocationMessage('');
//     //             } else {
//     //                 // Show error message
//     //                 const totalGuests = adultcount + childcount;
//     //                 setAutoAllocationMessage(`Can't allocate rooms automatically. Too many guests to allocate. You have ${totalGuests} guests.`);
//     //             }

//     //             // Mark as auto allocated (whether successful or not)
//     //             setHasAutoAllocated(true);
//     //         }, 2000); // 2 seconds

//     //         return () => clearTimeout(timer);
//     //     }
//     // }, [roomAllocationArray, hasAutoAllocated, adultcount, childcount, single, double, triple, quad, currentRoomLimits]);
//     // Replace the existing useEffect that handles auto allocation with this enhanced version:

// useEffect(() => {
//     // Only run auto allocation once when component initializes and hasn't been auto allocated yet
//     if (!hasAutoAllocated && roomAllocationArray.length > 0 && adultcount > 0) {
//         const timer = setTimeout(() => {
//             // Count number of rooms of each type in the current array
//             const roomAllocationCounts = {
//                 single: 0,
//                 double: 0,
//                 triple: 0,
//                 quad: 0
//             };

//             roomAllocationArray.forEach(room => {
//                 if (room.roomType in roomAllocationCounts) {
//                     roomAllocationCounts[room.roomType]++;
//                 }
//             });

//             // Use the higher count - either from state or what's in the room allocation array
//             const actualSingle = Math.max(single, roomAllocationCounts.single);
//             const actualDouble = Math.max(double, roomAllocationCounts.double);
//             const actualTriple = Math.max(triple, roomAllocationCounts.triple);
//             const actualQuad = Math.max(quad, roomAllocationCounts.quad);

//             // Check if rooms can accommodate guests using current room limits
//             const canAccommodate = canAccommodateGuests(
//                 adultcount,
//                 childcount,
//                 actualSingle,
//                 actualDouble,
//                 actualTriple,
//                 actualQuad,
//                 currentRoomLimits
//             );

//             if (canAccommodate) {
//                 // Proceed with auto allocation
//                 autoAllocate();
//                 setAutoAllocationMessage('');
//             } else {
//                 // Calculate total capacity for the error message
//                 const totalMaxAdults = (actualSingle * currentRoomLimits.single.maxAdults) +
//                     (actualDouble * currentRoomLimits.double.maxAdults) +
//                     (actualTriple * currentRoomLimits.triple.maxAdults) +
//                     (actualQuad * currentRoomLimits.quad.maxAdults);

//                 const totalMaxPax = (actualSingle * currentRoomLimits.single.maxPax) +
//                     (actualDouble * currentRoomLimits.double.maxPax) +
//                     (actualTriple * currentRoomLimits.triple.maxPax) +
//                     (actualQuad * currentRoomLimits.quad.maxPax);

//                 const totalGuests = adultcount + childcount;

//                 // Create room breakdown for better understanding
//                 const roomBreakdown = [];
//                 if (actualSingle > 0) roomBreakdown.push(`${actualSingle} Single room${actualSingle > 1 ? 's' : ''}`);
//                 if (actualDouble > 0) roomBreakdown.push(`${actualDouble} Double room${actualDouble > 1 ? 's' : ''}`);
//                 if (actualTriple > 0) roomBreakdown.push(`${actualTriple} Triple room${actualTriple > 1 ? 's' : ''}`);
//                 if (actualQuad > 0) roomBreakdown.push(`${actualQuad} Quad room${actualQuad > 1 ? 's' : ''}`);

//                 const roomText = roomBreakdown.length > 0 ? roomBreakdown.join(', ') : 'No rooms selected';

//                 // Enhanced error message with capacity details
//                 let errorMessage = `Can't allocate rooms automatically. Too many guests to allocate. `;
//                 errorMessage += `You have ${totalGuests} guests `;
//                 errorMessage += `but the maximum capacity is ${totalMaxPax} with selected rooms`;
//                 // errorMessage += `(${totalMaxAdults} adults max). `;

//                 // if (totalMaxAdults < adultcount) {
//                 //     errorMessage += `You need ${adultcount - totalMaxAdults} more adult capacity.`;
//                 // } else {
//                 //     errorMessage += `You need ${totalGuests - totalMaxPax} less guests or more rooms.`;
//                 // }

//                 setAutoAllocationMessage(errorMessage);
//             }

//             // Mark as auto allocated (whether successful or not)
//             setHasAutoAllocated(true);
//         }, 2000); // 2 seconds

//         return () => clearTimeout(timer);
//     }
// }, [roomAllocationArray, hasAutoAllocated, adultcount, childcount, single, double, triple, quad, currentRoomLimits]);

//     const autoAllocate = () => {
//         // Count number of rooms of each type in the current array
//         const roomAllocationCounts = {
//             single: 0,
//             double: 0,
//             triple: 0,
//             quad: 0
//         };

//         roomAllocationArray.forEach(room => {
//             if (room.roomType in roomAllocationCounts) {
//                 roomAllocationCounts[room.roomType]++;
//             }
//         });

//         // Use the higher count - either from state or what's in the room allocation array
//         const actualSingle = Math.max(single, roomAllocationCounts.single);
//         const actualDouble = Math.max(double, roomAllocationCounts.double);
//         const actualTriple = Math.max(triple, roomAllocationCounts.triple);
//         const actualQuad = Math.max(quad, roomAllocationCounts.quad);

//         // Use current room limits for auto allocation
//         let response = automateRoomAllocation(
//             adultCount,
//             childCount,
//             actualSingle,
//             actualDouble,
//             actualTriple,
//             actualQuad,
//             currentRoomLimits
//         );
//         console.log("Auto allocation response:", response);
//         setRoomAllocationArray(response.newAllocationArray);

//         // Keep track of the actual room counts
//         setSingle(actualSingle);
//         setDouble(actualDouble);
//         setTriple(actualTriple);
//         setQuad(actualQuad);

//         // Calculate totals for tracking
//         let totalAdults = 0;
//         let totalChildren = 0;

//         response.newAllocationArray.forEach(room => {
//             totalAdults += Number(room.adultCount) || 0;
//             totalChildren += (Number(room.childCount_CWB) || 0) + (Number(room.childCount_CNB) || 0);
//         });

//         setAllocateAdultCount(totalAdults);
//         setAllocateChildCount(totalChildren);

//         const dataset = {
//             single: actualSingle,
//             double: actualDouble,
//             triple: actualTriple,
//             quad: actualQuad
//         };

//         handleSubmmitRoomAllocation({
//             "roomAllocationArray": response.newAllocationArray,
//             "dataset": dataset
//         }, "auto");

//         // Mark as auto allocated
//         setHasAutoAllocated(true);
//     };

//     const decrease = (value, data, roomIndex) => {
//         let existingArr = [...roomAllocationArray];

//         if (value === 'adult') {
//             if (existingArr[roomIndex].adultCount > 0) {
//                 existingArr[roomIndex] = {
//                     ...existingArr[roomIndex],
//                     adultCount: Number(existingArr[roomIndex].adultCount) - 1
//                 };

//                 setAllocateAdultCount(prev => prev - 1);
//             }
//         } else {
//             if (value === "childCWB" && existingArr[roomIndex].childCount_CWB > 0) {
//                 existingArr[roomIndex] = {
//                     ...existingArr[roomIndex],
//                     childCount_CWB: Number(existingArr[roomIndex].childCount_CWB) - 1
//                 };

//                 setAllocateChildCount(prev => prev - 1);
//             } else if (value === "childCNB" && existingArr[roomIndex].childCount_CNB > 0) {
//                 existingArr[roomIndex] = {
//                     ...existingArr[roomIndex],
//                     childCount_CNB: Number(existingArr[roomIndex].childCount_CNB) - 1
//                 };

//                 setAllocateChildCount(prev => prev - 1);
//             }
//         }

//         setRoomAllocationArray(existingArr);
//     };

//     const increase = (value, data, roomIndex) => {
//         let existingArr = [...roomAllocationArray];

//         // Create a test copy to check if we'd exceed room limits
//         const testRoom = { ...existingArr[roomIndex] };
//         if (value === 'adult') {
//             testRoom.adultCount = Number(testRoom.adultCount) + 1;

//             // Only proceed if we wouldn't exceed room limits and total allocated adults
//             if (!getRoomCondiionStatus(testRoom) && allocateAdultCount < adultCount) {
//                 existingArr[roomIndex] = testRoom;
//                 setAllocateAdultCount(prev => prev + 1);
//             }
//         } else if (value === "childCWB") {
//             testRoom.childCount_CWB = Number(testRoom.childCount_CWB) + 1;

//             // Only proceed if we wouldn't exceed room limits and total allocated children
//             if (!getRoomCondiionStatus(testRoom) && allocateChildCount < childCount) {
//                 existingArr[roomIndex] = testRoom;
//                 setAllocateChildCount(prev => prev + 1);
//             }
//         } else if (value === "childCNB") {
//             testRoom.childCount_CNB = Number(testRoom.childCount_CNB) + 1;

//             // Only proceed if we wouldn't exceed room limits and total allocated children
//             if (!getRoomCondiionStatus(testRoom) && allocateChildCount < childCount) {
//                 existingArr[roomIndex] = testRoom;
//                 setAllocateChildCount(prev => prev + 1);
//             }
//         }

//         setRoomAllocationArray(existingArr);
//     };

//     const getRoomCondiionStatus = (room) => {
//         // Use current room limits (either from API or default)
//         const roomLimits = {};

//         // Convert current room limits to the format expected by this function
//         Object.keys(currentRoomLimits).forEach(roomType => {
//             const capitalizedType = roomType.charAt(0).toUpperCase() + roomType.slice(1);
//             roomLimits[capitalizedType] = {
//                 name: capitalizedType,
//                 maxAdults: currentRoomLimits[roomType].maxAdults,
//                 maxCWB: currentRoomLimits[roomType].maxCWB,
//                 maxCNB: currentRoomLimits[roomType].maxCNB,
//                 maxPax: currentRoomLimits[roomType].maxPax,
//             };
//         });

//         // Capitalize first letter to match the keys in roomLimits
//         const roomTypeKey = room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1);

//         // Get room limits for the specified room type
//         const limits = roomLimits[roomTypeKey];

//         if (!limits) {
//             return false; // Invalid room type
//         }

//         // Convert all counts to numbers
//         const adultCount = Number(room.adultCount) || 0;
//         const cwbCount = Number(room.childCount_CWB) || 0;
//         const cnbCount = Number(room.childCount_CNB) || 0;
//         const totalPax = adultCount + cwbCount + cnbCount;

//         // Check for room limit validations
//         if (adultCount > limits.maxAdults) {
//             return true; // Exceeds maximum adults
//         }

//         if (cwbCount > limits.maxCWB) {
//             return true; // Exceeds maximum children with bed
//         }

//         if (cnbCount > limits.maxCNB) {
//             return true; // Exceeds maximum children no bed
//         }

//         if (totalPax > limits.maxPax) {
//             return true; // Exceeds maximum total occupants
//         }

//         return false;
//     };

//     const submit = () => {
//         // Check if all guests are assigned
//         const totalAssignedAdults = allocateAdultCount;
//         const totalAssignedChildren = allocateChildCount;

//         const unassignedAdults = adultCount - totalAssignedAdults;
//         const unassignedChildren = childCount - totalAssignedChildren;
//         const totalUnassigned = unassignedAdults + unassignedChildren;

//         if (totalUnassigned > 0) {
//             let message = "Please assign all guests to rooms. ";

//             if (unassignedAdults > 0 && unassignedChildren > 0) {
//                 message += `${unassignedAdults} adult${unassignedAdults > 1 ? 's' : ''} and ${unassignedChildren} child${unassignedChildren > 1 ? 'ren' : ''} are not assigned.`;
//             } else if (unassignedAdults > 0) {
//                 message += `${unassignedAdults} adult${unassignedAdults > 1 ? 's' : ''} ${unassignedAdults > 1 ? 'are' : 'is'} not assigned.`;
//             } else if (unassignedChildren > 0) {
//                 message += `${unassignedChildren} child${unassignedChildren > 1 ? 'ren' : ''} ${unassignedChildren > 1 ? 'are' : 'is'} not assigned.`;
//             }

//             ToastMessage({
//                 status: "warning",
//                 message: message,
//             });
//             return; // Prevent submission
//         }

//         // All guests are assigned, proceed with submission
//         const dataset = {
//             single,
//             double,
//             triple,
//             quad
//         };

//         handleSubmmitRoomAllocation({
//             "roomAllocationArray": roomAllocationArray,
//             "dataset": dataset
//         }, "submit");
//     };

//     return (
//         <div  style={{
//                 position: "relative",
//                 height: "calc(100vh - 200px)",
//                 overflowX: "hidden",
//                 overflowY: "auto",
//             }}>
//             <div>
//                 <div>
//                     {autoAllocationMessage && (
//                         <h5 className="text-center mb-3 text-danger" style={{fontSize:"12px"}}>{autoAllocationMessage}</h5>
//                     )}
//                 </div>
//                 {roomAllocationArray.map((room, roomIndex) => (
//                     <div key={roomIndex} lg="12" sm="12" md="12" className="d-flex flex-wrap justify-content-center border mb-4 py-4 col-10 mx-auto">
//                         <h5 className='m-0 p-0 col-12 mb-3'>
//                             {getOrdinalSuffix(room.index)} {room.roomType} Room
//                             {getRoomCondiionStatus(room) ?
//                                 <span className="text-danger ml-1">reached</span> :
//                                 ''}
//                         </h5>

//                         <div className="col-4 d-flex flex-column align-items-center">
//                             <h6 className="m-0 p-0">Adult</h6>
//                             <div className="d-flex align-items-center">
//                                 <button
//                                     className="btn btn-solid btn-sm"
//                                     disabled={room.adultCount <= 0}
//                                     onClick={() => decrease('adult', room, roomIndex)}>
//                                     -
//                                 </button>
//                                 <p className="m-0 p-0 px-3">{room.adultCount}</p>
//                                 <button
//                                     className="btn btn-solid btn-sm"
//                                     disabled={getRoomCondiionStatus(room) || allocateAdultCount >= adultCount}
//                                     onClick={() => increase('adult', room, roomIndex)}>
//                                     +
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="col-4 d-flex flex-column align-items-center">
//                             <h6 className="m-0 p-0">Child</h6>
//                             <div className="d-flex align-items-center">
//                                 <button
//                                     className="btn btn-solid btn-sm"
//                                     disabled={room.childCount_CWB <= 0}
//                                     onClick={() => decrease('childCWB', room, roomIndex)}>
//                                     -
//                                 </button>
//                                 <p className="m-0 p-0 px-3">{room.childCount_CWB}</p>
//                                 <button
//                                     className="btn btn-solid btn-sm"
//                                     disabled={getRoomCondiionStatus(room) || allocateChildCount >= childCount}
//                                     onClick={() => increase('childCWB', room, roomIndex)}>
//                                     +
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <div style={{ position: "sticky", bottom: "0", backgroundColor: "#fff", paddingTop:"2px" }}>
//                 <div className="d-flex m-2 d-flex gap-2 justify-content-center col-12 mt-5">
//                 <button className="btn btn-solid btn-sm border" onClick={submit}>Submit</button>
//             </div>

//             <div className="col-12 text-center mt-3">
//                 <p>
//                     Adults: {allocateAdultCount}/{adultCount} allocated |
//                     Children: {allocateChildCount}/{childCount} allocated
//                 </p>
//                 <small className="text-muted">
//                 </small>
//             </div>
//             </div>

//         </div>
//     );
// };

// export default HotelRoomAllocation;
