/**
 * Creates price range filters with guaranteed products in each range
 * @param {number} minPrice - Minimum price in the dataset
 * @param {number} maxPrice - Maximum price in the dataset
 * @param {Array} products - Array of products with price property
 * @param {number} [desiredRanges=6] - Target number of price ranges
 * @returns {Array} Array of price range objects
 */
const createDynamicPriceSteps = (minPrice, maxPrice, products, desiredRanges = 6) => {
    // If no products provided, fall back to the original method
    if (!products || !products.length) {
        return createStaticPriceSteps(minPrice, maxPrice, desiredRanges);
    }

    // Extract and sort prices
    const productPrices = products.map(p => typeof p === 'object' ? p.price : p)
        .filter(price => !isNaN(price) && price >= minPrice && price <= maxPrice)
        .sort((a, b) => a - b);
    
    if (productPrices.length === 0) {
        return createStaticPriceSteps(minPrice, maxPrice, desiredRanges);
    }

    // Make sure we don't create more ranges than desired
    const clusterSize = Math.ceil(productPrices.length / desiredRanges);
    
    // Create ranges based on product distribution
    const ranges = [];
    for (let i = 0; i < productPrices.length; i += clusterSize) {
        const clusterPrices = productPrices.slice(i, Math.min(i + clusterSize, productPrices.length));
        
        if (clusterPrices.length > 0) {
            const start = i === 0 ? Math.floor(minPrice / 100) * 100 : Math.floor(clusterPrices[0] / 100) * 100;
            const end = Math.ceil(clusterPrices[clusterPrices.length - 1] / 100) * 100;
            
            // Avoid duplicates or overlapping ranges
            if (ranges.length === 0 || ranges[ranges.length - 1].end < start) {
                ranges.push({
                    start,
                    end
                });
            } else {
                // Merge with previous range if there's overlap
                ranges[ranges.length - 1].end = end;
            }
        }
    }
    
    // Ensure we have at least one range
    if (ranges.length === 0) {
        return createStaticPriceSteps(minPrice, maxPrice, desiredRanges);
    }
    
    return ranges;
};

/**
 * Falls back to create static price ranges when product data is not available
 */
const createStaticPriceSteps = (minPrice, maxPrice, desiredButtons = 6) => {
    const totalRange = maxPrice - minPrice;
    let step = roundToNearest(totalRange / desiredButtons, 100);
    
    if (step < 100) step = 100; // Minimum step size
    
    const ranges = [];
    let currentStart = Math.floor(minPrice / step) * step;
    let currentEnd = currentStart + step;
    
    while (currentEnd < maxPrice) {
        ranges.push({
            start: Math.round(currentStart),
            end: Math.round(currentEnd)
        });
        currentStart = currentEnd;
        currentEnd += step;
    }
    
    // Add the final range
    if (currentStart < maxPrice) {
        ranges.push({ 
            start: currentStart, 
            end: roundToNearest(maxPrice, 100) 
        });
    }
    
    return ranges;
};

/**
 * Utility function to round to nearest value
 */
const roundToNearest = (num, roundTo) => {
    return Math.ceil(num / roundTo) * roundTo;
};

export default createDynamicPriceSteps;