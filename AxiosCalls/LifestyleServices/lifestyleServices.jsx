import axios from "axios";

const getLifesyleproducts = async (mainId, category1, category2, latitude, longtitude, distance, currentOffset, vendorID, dataSorterKeys) => {
    let result = []
    const valueDataSet = {
        sortArray: dataSorterKeys?.toString() === 'default' ? '' : dataSorterKeys?.toString()
    }
    await axios.post(`/get-all-life-styles/3/${mainId}/${category1}/${category2}/${latitude},${longtitude}/${distance}/${currentOffset}/${vendorID}`, valueDataSet).then((response) => {
        if (response.status === 200) {
            result = response.data.lifeStylesData
            console.log(result, "Lifestyle Products Data");
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const loadNearByLifestyles = async (latitude, longitude) => {
  let result = []

  console.log(latitude,longitude, "Latitude isssssss");
 
  console.log(
    `related_products/lifestyles/0`,
    {
      latitude: latitude,
      longitude: longitude,
    },
    "sadnsajbdjbkasdjbkasbjkdadjbjkbksad"
  );
 
  await axios
    .get(`related_products/lifestyles/0`, {
      params: {
        latitude: latitude,
        longitude: longitude,
      },
    })
 
    .then((res) => {
      if (res.data.status == 200) {
        result = res.data.lifeStylesData;
 
      } else {
        result = 'Something went wrong !'
      }
    })
    .catch((error) => {
      result = '(Internal Server Error)'
    });
 
  return result;
};

const getLifestyleproductDetails = async (id) => {
    let result = []
    await axios.get(`/get-all-life-styles-by-id/${id}`).then((response) => {
        if (response.status === 200) {
            result = response.data
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const checkAvalibilityandRates = async (dataSet) => {
    let result = [];
    await axios.post('get-lifestyle-rates', dataSet).then((response) => {
        if (response.status === 200) {
            result = response.data
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getFeaturedLifestyleProducts = async (dataSet) => {
  
    let result = []
    await axios.get(`/main_page/lifestyles/10`,{
        params: dataSet,
    }).then((response) => {
      console.log(response, "DataSet in lifestyle22222222222", dataSet);
        if (response.data?.lifeStylesData) {
            result = response.data?.lifeStylesData;
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

export { getLifesyleproducts, getLifestyleproductDetails, checkAvalibilityandRates, loadNearByLifestyles,getFeaturedLifestyleProducts };