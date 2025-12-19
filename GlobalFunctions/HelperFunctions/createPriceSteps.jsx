// const roundToNearest = (num, roundTo) => {
//     return Math.ceil(num / roundTo) * roundTo;
// };

// const createPriceSteps = (minPrice, maxPrice) => {

//     const desiredButtons = 6;
//     const totalRange = maxPrice - minPrice;

//     let step = roundToNearest(totalRange / desiredButtons, 100);

//     // console.log(minPrice,maxPrice,"Min Price Value is")

//     const ranges = [];
//     let currentStart = Math.floor(minPrice / step) * step;
//     let currentEnd = currentStart + step;

//     while (currentEnd < maxPrice) {
//         ranges.push({
//             start: Math.round(currentStart),
//             end: Math.round(currentEnd)
//         });
//         currentStart = currentEnd;
//         currentEnd += step;
//     }

//     ranges.push({ start: currentStart, end: roundToNearest(maxPrice, 100) });

//     // console.log(ranges,"Range Value data isssss123123123123123")

//     return ranges;

// };

// export default createPriceSteps;


const roundToNearest = (num, roundTo) => {
    return Math.ceil(num / roundTo) * roundTo;
};

const createPriceSteps = (minPrice, maxPrice) => {
    // console.log("Creating price steps for range:", minPrice, "to", maxPrice);
    const desiredButtons = 6;
    const totalRange = maxPrice - minPrice;

    // If range is too small, return single range
    if (totalRange <= 0) {
        return [{ start: minPrice, end: maxPrice }];
    }

    // Use smaller rounding for small ranges
    let roundTo = 1;
    if (totalRange >= 100000) {
        roundTo = 10000;
    } else if (totalRange >= 10000) {
        roundTo = 1000;
    } else if (totalRange >= 1000) {
        roundTo = 100;
    } else if (totalRange >= 100) {
        roundTo = 10;
    } else if (totalRange >= 10) {
        roundTo = 1;
    } else {
        roundTo = 0.1;
    }

    const step = totalRange / desiredButtons;
    const ranges = [];
    for (let i = 0; i < desiredButtons; i++) {
        let start = minPrice + (step * i);
        let end = i === desiredButtons - 1 ? maxPrice : minPrice + (step * (i + 1));
        // Avoid rounding to same value for small ranges
        start = Math.round(start / roundTo) * roundTo;
        end = Math.round(end / roundTo) * roundTo;
        // For decimals, fix floating point artifacts
        start = Number(start.toFixed(2));
        end = Number(end.toFixed(2));
        ranges.push({ start, end });
    }
    return ranges;
};

export default createPriceSteps;

// const roundToNearest = (num, roundTo) => {
//     return Math.ceil(num / roundTo) * roundTo;
// };

// const createPriceSteps = (minPrice, maxPrice) => {
//     const desiredButtons = 6;
//     const totalRange = maxPrice - minPrice;

//     // If range is too small, return single range
//     if (totalRange <= 0) {
//         return [{ start: Math.round(minPrice), end: Math.round(maxPrice) }];
//     }

//     const step = totalRange / desiredButtons;
    
//     // Determine appropriate rounding based on price magnitude
//     let roundTo = 1;
//     if (totalRange >= 100000) {
//         roundTo = 10000; // For very large ranges (like LKR)
//     } else if (totalRange >= 10000) {
//         roundTo = 1000;  // For medium ranges
//     } else if (totalRange >= 1000) {
//         roundTo = 100;   // For smaller ranges (like USD)
//     } else {
//         roundTo = 10;    // For very small ranges
//     }

//     const ranges = [];
    
//     // Create exactly desiredButtons number of ranges
//     for (let i = 0; i < desiredButtons; i++) {
//         const start = minPrice + (step * i);
//         const end = i === desiredButtons - 1 ? maxPrice : minPrice + (step * (i + 1));
        
//         ranges.push({
//             start: Math.round(start / roundTo) * roundTo,
//             end: Math.round(end / roundTo) * roundTo
//         });
//     }

//     // console.log(ranges,"Range Value data isssss123123123123123")

//     return ranges;
// };

// export default createPriceSteps;





