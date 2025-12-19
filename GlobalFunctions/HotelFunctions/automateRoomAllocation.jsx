const addMoreRooms = (value1, value2, value3, value4, adultCount, childCount) => {

    try {

        const totalRoomCapacity = Number(value1) + Number(value2 * 2) + Number(value3 * 3) + Number(value4 * 4);
        const totalNeededCapacity = Number(adultCount) + Number(childCount);

        let extraCapacityNeeded = Number(totalNeededCapacity) - Number(totalRoomCapacity);

        let newSingles = value1;
        let newDoubles = value2;
        let newTriples = value3;
        let newQuads = value4;

        if (extraCapacityNeeded < 0) {
            while (extraCapacityNeeded < 0) {
                if (newQuads > 0 && extraCapacityNeeded <= -4) {
                    newQuads -= 1;
                    extraCapacityNeeded += 4;
                } else if (newTriples > 0 && extraCapacityNeeded <= -3) {
                    newTriples -= 1;
                    extraCapacityNeeded += 3;
                } else if (newDoubles > 0 && extraCapacityNeeded <= -2) {
                    newDoubles -= 1;
                    extraCapacityNeeded += 2;
                } else if (newSingles > 0 && extraCapacityNeeded <= -1) {
                    newSingles -= 1;
                    extraCapacityNeeded += 1;
                } else {
                    break;
                }
            }
        }

        if (extraCapacityNeeded > 0) {
            while (extraCapacityNeeded > 0) {
                if (extraCapacityNeeded === 1) {
                    newSingles += 1;
                    extraCapacityNeeded -= 1;
                } else if (extraCapacityNeeded === 2) {
                    newDoubles += 1;
                    extraCapacityNeeded -= 2;
                } else if (extraCapacityNeeded === 3) {
                    newTriples += 1;
                    extraCapacityNeeded -= 3;
                } else {
                    newTriples += 1;
                    extraCapacityNeeded -= 4;
                }
            }
        }

        const dataset = {
            single: newSingles,
            double: newDoubles,
            triple: newTriples,
            quad: newQuads
        };

        return dataset;

    } catch (error) {
        // console.error(error);
    }

};

const automateRoomAllocation = (adultCount, childCount, single, double, triple, quad) => {
    
    // console.log("adultCount", adultCount, "childCount", childCount, "single", single, "double", double, "triple", triple, "quad", quad, "Quad Adult Data ");
    try {
        let remainingAdults = Number(adultCount);
        let remainingChildren = Number(childCount);
        let response = addMoreRooms(single, double, triple, quad, adultCount, childCount);
        let object = Object.entries(response).flatMap(([roomType, count]) =>
            Array.from({ length: count }, (_, index) => ({
                roomType,
                index: index + 1,
                adultCount: 0,
                childCount_CNB: 0,
                childCount_CWB: 0
            }))
        );
        let newAllocationArray = [...object];
        object.forEach((room) => {
            if (room.roomType === "single") {
                if (remainingAdults > 0) {
                    room.adultCount = 1;
                    remainingAdults -= 1;
                }
            } else if (room.roomType === "double") {
                if (remainingAdults >= 2) {
                    room.adultCount = 2;
                    remainingAdults -= 2;
                } else if (remainingAdults === 1) {
                    room.adultCount = 1;
                    remainingAdults -= 1;
                    if (remainingChildren > 0) {
                        room.childCount_CWB = 1;
                        remainingChildren -= 1;
                    }
                } else if (remainingChildren >= 2) {
                    room.childCount_CWB = 2;
                    remainingChildren -= 2;
                } else if (remainingChildren === 1) {
                    room.childCount_CWB = 1;
                    remainingChildren -= 1;
                }
            } else if (room.roomType === "triple") {
                if (remainingAdults >= 3) {
                    room.adultCount = 3;
                    remainingAdults -= 3;
                } else if (remainingAdults === 2) {
                    room.adultCount = 2;
                    remainingAdults -= 2;
                    if (remainingChildren > 0) {
                        room.childCount_CWB = 1;
                        remainingChildren -= 1;
                    }
                } else if (remainingAdults === 1) {
                    room.adultCount = 1;
                    remainingAdults -= 1;
                    if (remainingChildren >= 2) {
                        room.childCount_CWB = 2;
                        remainingChildren -= 2;
                    } else if (remainingChildren === 1) {
                        room.childCount_CWB = 1;
                        remainingChildren -= 1;
                    }
                } else if (remainingChildren >= 3) {
                    room.childCount_CWB = 3;
                    remainingChildren -= 3;
                } else if (remainingChildren > 0) {
                    room.childCount_CWB = Math.min(remainingChildren, 2);
                    remainingChildren -= Math.min(remainingChildren, 2);
                }
            } else if (room.roomType === "quad") { // New condition for quad rooms
                if (remainingAdults >= 4) {
                    room.adultCount = 4;
                    remainingAdults -= 4;
                } else if (remainingAdults === 3) {
                    room.adultCount = 3;
                    remainingAdults -= 3;
                    if (remainingChildren > 0) {
                        room.childCount_CWB = 1;
                        remainingChildren -= 1;
                    }
                } else if (remainingAdults === 2) {
                    room.adultCount = 2;
                    remainingAdults -= 2;
                    if (remainingChildren >= 2) {
                        room.childCount_CWB = 2;
                        remainingChildren -= 2;
                    } else if (remainingChildren === 1) {
                        room.childCount_CWB = 1;
                        remainingChildren -= 1;
                    }
                } else if (remainingAdults === 1) {
                    room.adultCount = 1;
                    remainingAdults -= 1;
                    if (remainingChildren >= 3) {
                        room.childCount_CWB = 3;
                        remainingChildren -= 3;
                    } else if (remainingChildren > 0) {
                        room.childCount_CWB = Math.min(remainingChildren, 2);
                        remainingChildren -= Math.min(remainingChildren, 2);
                    }
                } else if (remainingChildren >= 4) {
                    room.childCount_CWB = 4;
                    remainingChildren -= 4;
                } else if (remainingChildren > 0) {
                    room.childCount_CWB = Math.min(remainingChildren, 3);
                    remainingChildren -= Math.min(remainingChildren, 3);
                }
            }
        });

        object.forEach((room) => {
            if (remainingChildren > 0 && room.roomType === "double" && room.childCount_CNB < 2) {
                const allocation = Math.min(2 - room.childCount_CNB, remainingChildren);
                room.childCount_CNB += allocation;
                remainingChildren -= allocation;
            }
            if (remainingChildren > 0 && room.roomType === "triple" && room.childCount_CNB < 3) {
                const allocation = Math.min(3 - room.childCount_CNB, remainingChildren);
                room.childCount_CNB += allocation;
                remainingChildren -= allocation;
            }
            if (remainingChildren > 0 && room.roomType === "quad" && room.childCount_CNB < 4) { // New condition for quad rooms
                const allocation = Math.min(4 - room.childCount_CNB, remainingChildren);
                room.childCount_CNB += allocation;
                remainingChildren -= allocation;
            }
        });

        newAllocationArray = object.filter((room) => {
            const totalOccupants = room.adultCount + room.childCount_CWB + room.childCount_CNB;
            return totalOccupants > 0; // Keep rooms with occupants
        });
        return { "newAllocationArray":newAllocationArray, 'response': response };

    } catch (error) {
        // console.error(error);
    }
};


export default automateRoomAllocation;