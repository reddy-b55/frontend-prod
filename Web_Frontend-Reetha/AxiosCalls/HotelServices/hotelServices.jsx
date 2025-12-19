import axios from "axios";


const getHotelsbyLatllon = async (lat, lng, radius) => {
    let result = [];
    const dataSet = {
        latitude: lat,
        longitude: lng,
        radius: radius
    }
    await axios.post('get_hotels_by_latlon', dataSet, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then(res => {
        if (res.status === 200) {
            result = res.data.data
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getHotelDataUpdated = async (data, userId) => {
    try {
        console.log("Searching hotel data for user:",data);

        const customerId = userId ?? 624;

        const searchParams = {
            ...data,
            Country: data.City,
            offset: 0,
            length: 100,
        };

        const initialResult = await loadHotelsData(searchParams, customerId);

        const totalHotels = initialResult?.totalHotels || 0;
        const allHotels = [...(initialResult?.hoteldataset || [])];

        const totalPageCount = Math.ceil(totalHotels / 100);


        console.log(`Total hotels found: ${totalHotels}`);

        if (totalPageCount > 1) {
            const requests = [];
        
            for (let i = 2; i < totalPageCount; i++) {
                const paginatedOffset = i;
                // console.log(`Requesting offset: ${paginatedOffset}`);
        
                requests.push(
                    loadHotelsData({ ...searchParams, offset: paginatedOffset }, customerId)
                );
            }
        
            const responses = await Promise.all(requests);
        
            responses.forEach((res) => {
                if (res?.hoteldataset?.length) {
                    allHotels.push(...res.hoteldataset);
                }
            });
        }

        // console.log(`✅ Total hotels fetched: ${allHotels.length}`);
        return allHotels;
    } catch (error) {
        // console.error("❌ Error loading hotel data:", error);
        return [];
    }
};

// const getHotelDataUpdated = async (data,userId) => {
//     console.log("search hotel data", userId)
//     let result = [];
//     let customerId = 624;
//     if(userId !== undefined && userId !== null && userId !== ""){
//         customerId = userId;
//     }

//     const search = { 
//         ...data,
//         Country: data.City, 
//     };
//     // console.log("search hotel data", search)
   
//     let aahaasHotels = [];
//     let tboHotels = [];

//     await axios.post(`/searchTBOAahaasHotels/0/${customerId}`, search, {
//         xsrfHeaderName: "X-XSRF-TOKEN",
//         withCredentials: true
//     }).then((res) => {
//         console.log("hotel Result", res)
//         if (res.data.status === 200) {
//             aahaasHotels = res.data.hoteldataset
//         } else {
//             aahaasHotels = []
//         }
//     }).catch((err) => {
//         console.log(err)
//         aahaasHotels = []
//     });

//     // await axios.post('/tbov2/hotels/search', data, {
//     //     xsrfHeaderName: "X-XSRF-TOKEN",
//     //     withCredentials: true
//     // }).then((res) => {
//     //     if (res.data.status === 200) {
//     //         tboHotels = res.data.hoteldataset;
//     //     } else {
//     //         tboHotels = []
//     //     }
//     // }).catch((err) => {
//     //     tboHotels = []
//     // });

//     result = [...aahaasHotels, ...tboHotels];

//     return aahaasHotels;

// }





const loadHotelsData = async(search, customerId) =>{
    // console.log("loadHotelsData chamod", search, customerId)
    let aahaasHotels = [];

    await axios.post(`/searchTBOAahaasHotels/0/${customerId}`, search, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then((res) => {
        console.log("hotel Result", res)
        if (res.data.status === 200) {
            aahaasHotels = res.data
        } else {
            aahaasHotels = []
        }
    }).catch((err) => {
        console.log(err)
        aahaasHotels = []
    });


    return aahaasHotels;


}

const loadHotelRatesById = async (id, request) => {
    // console.log("loadHotelRatesById", id, request)
    let result = [];
    var provider = request?.customer_request?.Provider;

    if(provider === "hotelTbo"){
        await axios.post(`/tbov2/hotels/${id}/search`, request, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.status === 200) {
        //   console.log("Hotel data set is123456", res.data);
          result = res.data;
        } else {
          //console.log(res)
          result = res.data;
          //
        }
      });

    }  else if (provider == "ratehawk") {
 
        await axios
          .post(`/ratehawk/hotels/${id}/search`, request, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true,
          })
          .then((res) => {
            if (res.data.status === 200) {
                console.log("Hotel data set is123456", res.data);
                result = res.data;
            } else {
              //console.log(res)
              result = res.data;
            }
          });
      } else if (provider == "hotelTboH") {
 
        await axios
          .post(`/tboh/hotels/${id}/search`, request, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true,
          })
          .then((res) => {
            if (res.data.status === 200) {
                console.log("Hotel data set is123456", res.data);
                result = res.data;
            } else {
              //console.log(res)
              result = res.data;
            }
          });
      } if (provider == "ratehawk") {
 
        await axios
          .post(`/ratehawk/hotels/${id}/search`, request, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true,
          })
          .then((res) => {
            if (res.data.status === 200) {
                console.log("Hotel data set is123456", res.data);
                result = res.data;
            } else {
              //console.log(res)
              result = res.data;
            }
          });
      }else {
        console.log("call loadHotelRatesById", id, request)
        await axios.post(`/get_hotel_rates/${id}`, request, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true
        }).then((res) => {
            if (res.status === 200) {
                result = res.data
                // console.log("Hotel data set is123456", res.data);
            } else if (res.status === 200 && res.data.status === 401) {
                result = 'No of Room avalible'
            } else {
                result = 'Something went wrong !'
            }
        }).catch((err) => {
            console.log("erorr", err)
            result = '(Internal Server Error)'
        })
      
    }
    return result;

   
}

const loadHotelDetailsById = async (id, provider, status, request) => {
    console.log("call hoteldetailsByid",id, provider, status, request )

    console.log("request hotel", `/get_hotel_details/${id}/${provider}/${status}`, request)

    var hotelDetails = [];
    await axios.post(`/get_hotel_details/${id}/${provider}/${status}`, request, {
    // await axios.post(`/get_hotel_details/1085785/hotelTbo/details`, {CheckInDate:"12/03/2025",NoOfNights:1,NoOfRooms:1,NoOfAdults:1,NoOfChild:0,City:"Dubai",Country:"Dubai - United Arab Emirates",StarRate:0,RoomRequest:[{indexValue:0,roomType:"Single",NoOfAdults:1,NoOfChild:0,ChildAge:[]}],CheckOutDate:"13/03/2025",cityId:"",userId:0}, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then(res => {
        if (res.status === 200) {
            hotelDetails = res.data;
        } else if (res.status === 401) {
            hotelDetails = 'No of Room mismatched with Room Guest details.'
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        hotelDetails = '(Internal Server Error)'
    });
    return hotelDetails;
}

const loadHotelDataWithOutAahaas = async (id, provider, locationData) => {
    var hotelDetails = [];
    // const data = {
    //     data: {

    //     }
    // }
    // console.log("call hoteldetailsByid",locationData)

    await axios.get(`/hotels/${id}/${provider}`, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then(res => {
        console.log("hotelDetails aahaas", res)
        if (res.status === 200) {
            hotelDetails = res.data.data;
            
            // Parse specific JSON string fields
            const fieldsToParseAsJSON = ['Attractions', 'HotelFacilities', 'Images'];
            
            fieldsToParseAsJSON.forEach(field => {
                if (hotelDetails[field] && typeof hotelDetails[field] === 'string') {
                    try {
                        hotelDetails[field] = JSON.parse(hotelDetails[field]);
                    } catch (error) {
                        console.error(`Error parsing ${field}:`, error);
                    }
                }
            });
            
        } else if (res.status === 401) {
            hotelDetails = 'No of Room mismatched with Room Guest details.'
        } else {
            hotelDetails = 'Something went wrong !'  // Fixed: was using undefined 'result' variable
        }
    }).catch((err) => {
        console.log("Error fetching hotel details:", err);
        hotelDetails = '(Internal Server Error)'
    });
    
    return hotelDetails;
}


const getHotelPreBookingDetails = async (id) => {
    let result = []
    await axios.post(`/get-hotels-prebooking-data-byid/${id}`).then((response) => {
        if (response.status === 200 && response.data.status === 200) {
            result = response.data.response;
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    });
    return result;
}


const getHotelDetailsTBO = async (id) => {
    let result = [];
    await axios.get(`/get-hotelbyid_hoteltbo-api/${id}`).then(res => {
        if (res.status === 200) {
            result = res
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    });
    return result;
}

const getHotelDetailsAahaas = async (id) => {
    let result = [];
    await axios.get(`/get-hotel-byid/${id}`).then(res => {
        if (res.status === 200) {
            result = res
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    });
    return result;
}

export { loadHotelDataWithOutAahaas, getHotelDataUpdated, loadHotelDetailsById, loadHotelRatesById, getHotelPreBookingDetails, getHotelsbyLatllon, getHotelDetailsTBO, getHotelDetailsAahaas, loadHotelsData };