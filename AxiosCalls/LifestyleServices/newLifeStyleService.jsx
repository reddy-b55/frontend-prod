

import axios from 'axios';

export const getLifestyleProducts = async (params = {}) => {
  try {

    console.log(params, "Query Params data isssssss123123XXXXXX",`/lifestyles/${params?.provider}`)

    const response = await axios.get(`/lifestyles/${params?.provider}`, {
      params: params
    });

    console.log(response, "21211221211212")

    return response.data;
  } catch (error) {
    console.error('Error fetching Bridgify products:', error);
    throw error;
  }
};

export const fetchInitialPage = async ({
  provider,
  getProviderParams,
  updateProviderStatus,
  addData
}) => {
  try {
    const params = getProviderParams(provider);

    const initialResult = await getLifestyleProducts({
      ...params,
      page: 1,
      pageSize: 50,
    });

    console.log(initialResult, "Initial Result Data isssssssssssssss")

    if (initialResult.status !== 200) {
      updateProviderStatus((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          loaded: true,
          error: `Failed to fetch ${provider} products`,
        },
      }));
      return null;
    }

    const totalCount = initialResult?.totalCount || 0;
    const calculatedTotalPages = initialResult?.maxPage


    console.log(calculatedTotalPages, "Calculated Total Pages areeee")

    // Store the provider data in the provider status
    updateProviderStatus((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        data: initialResult.data || [],
        totalPages: calculatedTotalPages,
        loaded: calculatedTotalPages <= 1,
      },
    }));

    // Add data to the combined dataset
    if (initialResult.data && initialResult.data.length > 0) {
      addData(initialResult.data);
    }

    return {
      totalPages: calculatedTotalPages,
      initialData: initialResult.data || [],
    };
  } catch (err) {
    console.error(`Error fetching initial ${provider} data:`, err);
    updateProviderStatus((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        loaded: true,
        error: err?.message || `An error occurred loading ${provider}`,
      },
    }));
    return null;
  }
};

export const fetchRemainingPages = async ({
  provider,
  totalPages,
  getProviderParams,
  updateProviderStatus,
  addData
}) => {
  if (totalPages <= 1) return;

  try {
    const params = getProviderParams(provider);
    const pagePromises = [];

    for (let page = 2; page <= totalPages; page++) { // Changed from 1 to 2 (since page 1 is fetched initially)
      pagePromises.push(
        getLifestyleProducts({
          ...params,
          page: page,
          pageSize: 50,
        })
      );
    }

    const results = await Promise.all(pagePromises);

    const additionalData = results
      .filter((result) => result.status === 200 && result.data)
      .flatMap((result) => result.data || []);

    // Update provider status with the additional data
    updateProviderStatus((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        data: [...(prev[provider]?.data || []), ...additionalData],
        loaded: true,
      },
    }));

    // Add new data to the combined dataset, ensuring no duplicates
    if (additionalData.length > 0) {
      // Get the existing product IDs to avoid duplicates
      const existingIds = new Set();

      // Create a function to track and filter duplicates
      const addNonDuplicateData = (newItems) => {
        const uniqueItems = newItems.filter(item => {
          // Assuming each product has a unique ID - adjust property name if needed
          const id = item.id || item.productId || item.sku || JSON.stringify(item);
          if (existingIds.has(id)) {
            return false; // Skip duplicate
          }
          existingIds.add(id);
          return true;
        });

        addData(uniqueItems);
      };

      addNonDuplicateData(additionalData);
    }
  } catch (err) {
    console.error(`Error loading additional ${provider} pages:`, err);
    updateProviderStatus((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        loaded: true,
      },
    }));
  }
};

export const fetchLifestyleData = async ({
  providers,
  getProviderParams,
  updateLoadingProgress,
  updateLoadingPhase,
  updateProviderStatus,
  addData
}) => {
  try {
    console.log("Fetching lifestyle data for providers:", getProviderParams);
    // Create a Set to track product IDs across all providers
    const allProductIds = new Set();

    // Wrap addData to prevent duplicates across providers
    const addUniqueData = (newItems) => {
      const uniqueItems = newItems.filter(item => {
        // Assuming each product has a unique ID - adjust property name if needed
        const id = item.id || item.productId || item.sku || JSON.stringify(item);
        if (allProductIds.has(id)) {
          return false; // Skip duplicate
        }
        allProductIds.add(id);
        return true;
      });

      addData(uniqueItems);
    };

    // Fetch initial pages for all providers in parallel
    const initialPromises = providers.map((provider) =>
      fetchInitialPage({
        provider,
        getProviderParams,
        updateProviderStatus,
        addData: addUniqueData // Use the wrapped function
      })
    );

    const initialResults = await Promise.all(initialPromises);

    const providerInitialResults = {};
    providers.forEach((provider, index) => {
      providerInitialResults[provider] = initialResults[index];
    });

    updateLoadingProgress(40);
    updateLoadingPhase(2);

    const parallelFetches = [];

    // Fetch remaining pages for each provider in parallel
    providers.forEach((provider) => {
      const initialResult = providerInitialResults[provider];
      if (initialResult && initialResult.totalPages > 1) {
        parallelFetches.push(
          fetchRemainingPages({
            provider,
            totalPages: initialResult.totalPages,
            getProviderParams,
            updateProviderStatus,
            addData: addUniqueData // Use the wrapped function
          })
        );
      }
    });

    updateLoadingProgress(60);
    updateLoadingPhase(3);

    if (parallelFetches.length > 0) {
      await Promise.all(parallelFetches);
    }

    return { success: true };
  } catch (err) {
    console.error("Error in fetchLifestyleData:", err);
    return {
      success: false,
      error: err?.message || "An error occurred while fetching lifestyle data"
    };
  }
};