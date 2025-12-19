import React, { useEffect, useState } from "react";

import { getBlogs } from "../../../AxiosCalls/GlobalAxiosServices/globalServices";

import CommonLayout from "../../../components/shop/common-layout";

import Blog_Card from "./Blog_Card";
import Banner_blogs from "./Banner_blogs";
import Head from "next/head";

function Blog_Main_Page() {

  const [filter, setFilter] = useState(0);
  const [blogData, setBlogData] = useState([]);

  const fetchBlogs = async () => {
    try {
      const result = await getBlogs({ filterOption: filter });
      if (result.data) {
        setBlogData(result.data);
      } else {
        setBlogData([]);
      }
    } catch (error) {
      setBlogData([]);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {

    const sortData = () => {
      const sortedData = [...blogData];
      if (filter.toString() === "0") {
        return sortedData.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
      } else if (filter.toString() === "1") {
        return sortedData.sort((a, b) => b.click_count - a.click_count);
      }
      return sortedData;
    };

    const filtered = sortData();
    setBlogData(filtered);

  }, [filter]);


  return (
    <>

      <Head>
        <title>Aahaas - Travel guide</title>
      </Head>

      <CommonLayout parent="Home" title="Travel guide">

        <section className="p-3 pb-5 mb-5">

          <Banner_blogs />

          <div className="col-12 container-fluid">

            <div className="d-flex align-items-center justify-content-start mb-3 gap-3 blog-container-filter-options border-bottom pb-2 px-0 pt-3">
              <span onClick={() => setFilter(0)} className={` ${filter === 0 ? 'text-primary' : 'text-secondary'}`}>Time Updated</span>
              <span onClick={() => setFilter(1)} className={` ${filter === 1 ? 'text-primary' : 'text-secondary'}`}>Popularity</span>
            </div>

            <div style={{ marginTop: "1rem" }}>
              {
                (blogData && blogData.length > 0) ?
                  <div className="d-flex flex-wrap justify-content-start align-items-center row-gap-4 m-0 p-0">
                    {
                      blogData.map((card, key) => (
                        <div className={`col-${(key === 0 || key === 1) ? 2 : key % 3 === 1 ? 4 : 2}`}>
                          <Blog_Card card={card} />
                        </div>
                      ))
                    }
                  </div>
                  :
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Oops!! No Blogs Available...</div>
              }
            </div>

          </div>

        </section>

      </CommonLayout>

    </>

  );
}

export default Blog_Main_Page;
