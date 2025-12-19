import axios from "axios";
import { getAllEducationProducts } from "../EducationServices/educationServices";
import {
  getProductDetailsEssentialNonEssential,
  getRelatedProductDetailsEssNonEss,
} from "../EssentialNonEssentialServices/EssentialNonEssentialServices";
import { getLifesyleproducts } from "../LifestyleServices/lifestyleServices";
import MegaMenu from "../../GlobalFunctions/MegaMenu";

const getCategoriesSubCategories = async () => {
  let result = [];
  await axios.get(`/fetch-all-categories`).then((res) => {
    if (res.data.status === 200) {
      result = MegaMenu(
        res.data.categories,
        res.data.subCategories,
        res.data.subSubCategory,
        res.data.subSubSubCategory
      );
    } else {
      result = "Something went wrong !";
    }
  }).catch((error) => {
    result = "(Internal Server Error)";
  });
  return result;
};

const getCurrencyValues = async (value) => {
  let result = [];
  await axios.get(`/get_currency/${value}`).then((res) => {
    if (res.data.status === 200) {
      result = res.data;
    } else {
      result = "Something went wrong !";
    }
  }).catch((error) => {
    result = "(Internal Server Error)";
  });
  return result;
};

const GetSingleImage = (data) => {
  return (
    <>
      <img className=" mr-2" src={axios.defaults.data+`Airlines/` + data.carrier.marketing + ".png"} alt={data.carrier.marketing}></img>
      <label className='mt-3'>{data.carrier.marketing} {data.carrier.marketingFlightNumber}</label>
    </>
  )
}

const GetImage = (data) => {
  const imgArray = new Array();
  data?.forEach(schedule => {
    const index = imgArray.indexOf(schedule.carrier.marketing);
    if (index === -1) {
      imgArray.push(schedule.carrier.marketing);
    }
  });
  return (
    imgArray.map((image, index) =>
      <img className="mr-2 m-0 p-0" src={axios.defaults.data+`Airlines/` + image + '.png'} key={index} style={{ width: '40px', height: '40px' }}></img>
    )
  )
}

const getImageMulticity = (data) => {
  const imgArray = new Array();
  data?.forEach((dataset) => {
    const index = imgArray.indexOf(dataset.carrier.maketing);
    imgArray.push(dataset?.carrier?.marketing);
  });
  const imgArrUnique = [...new Set(imgArray)];
  return imgArrUnique.map((image, index) => (
    <img
      className="mr-2"
      key={index}
      alt="Airlines image"
      src={"/Airlines/" + image + ".png"}
    ></img>
  ));
};

const handleMainSearchUpdated = async (searchKey, id) => {
  let result = [];

  const dataSet = {
    dataKeys: searchKey,
  };

  await axios.post(`/fetch_products_by_keyword/${id}`, dataSet).then((response) => {
    if (response.status === 200 && response.data.status === 200) {
      result = response.data;
    } else {
      result = "Something went wrong !";
    }
  }).catch((err) => {
    result = "(Internal Server Error)";
  });

  return result;
};

const handleUserMainSearch = async (searchKey) => {
  let result = [];
  await axios.get(`/mainDataSearch/${searchKey}`).then((res) => {
    if (res.status === 200) {
      result = res.data;
    } else {
      result = "Something went wrong !";
    }
  }).catch((err) => {
    result = "(Internal Server Error)";
  });
  return result;
};

const handleVoiceSearch = async (id, searchKey) => {
  let result = [];
  await axios.post(`fetch_voice_keywords_by_voice/${1}`, searchKey).then((result) => {
    if (result.status === 200) {
      result = result.data;
    } else {
      result = "Something went wrong !";
    }
  }).catch((err) => {
    result = "(Internal Server Error)";
  });
  return result;
};

const getMoreProductBySupplier = async (
  id,
  category,
  category2,
  category3,
  brand
) => {
  let result = [];
  if (category === "lifestyle" || category === "education") {
    await axios.get(`/get_vendor_by_id/${id}`)
      .then(async (res) => {
        if (res.status) {
          const vendorData = res.data.vendorData;
          const educationProducts = await getAllEducationProducts(
            5,
            0,
            0,
            0,
            20,
            vendorData.id
          );
          const essentialProducts =
            await getProductDetailsEssentialNonEssential(
              1,
              0,
              0,
              0,
              10,
              vendorData.id
            );
          const nonEssentialProducts =
            await getProductDetailsEssentialNonEssential(
              2,
              0,
              0,
              0,
              10,
              vendorData.id
            );
          const lifestyleProducts = await getLifesyleproducts(
            0,
            0,
            0,
            6.9271,
            79.8612,
            80,
            20,
            vendorData.id
          );
          result = {
            vendorData: vendorData,
            educationProducts: educationProducts,
            essentialProducts: essentialProducts,
            nonEssentialProducts: nonEssentialProducts,
            lifestyleProducts: lifestyleProducts,
          };
        } else {
          result = "Something went wrong !";
        }
      }).catch(() => {
        result = "(Internal Server Error)";
      });
  } else if (category === "essentialNonEssentials") {
    const essentialProducts = await getRelatedProductDetailsEssNonEss(
      1,
      0,
      0,
      0,
      10
    );
    const nonEssentialProducts = await getRelatedProductDetailsEssNonEss(
      2,
      0,
      0,
      0,
      10
    );
    result = {
      essentialProducts: essentialProducts.data,
      nonEssentialProducts: nonEssentialProducts.data,
    };
  }
  return result;
};

const getSuppliedDetails = async (id) => {
  let result = [];
  await axios.get(`/get_vendor_by_id/${id}`)
    .then(async (res) => {
      if (res.status === 200 && res.data.status === 200) {
        result = res.data.vendorData;
      } else {
        result = "Something went wrong !";
      }
    }).catch(() => {
      result = "(Internal Server Error)";
    });
  return result;
};

const getBlogs = async ({ filterOption = 0 }) => {
  let result = [];
  await axios.get(`/getBlogs/${filterOption}`)
    .then(async (res) => {
      result = res.data;
    }).catch(() => {
      result = "(Internal Server Error)";
    });
  return result;
};

const getBlogById = async (id) => {
  let result = [];
  await axios.get(`/readBlog/${id}`)
    .then(async (res) => {
      result = res.data;
    }).catch(() => {
      result = [];
    });
  return result;
};

export {
  getCategoriesSubCategories,
  getCurrencyValues,
  GetSingleImage,
  GetImage,
  getImageMulticity,
  handleMainSearchUpdated,
  handleUserMainSearch,
  handleVoiceSearch,
  getMoreProductBySupplier,
  getSuppliedDetails,
  getBlogs,
  getBlogById
};
