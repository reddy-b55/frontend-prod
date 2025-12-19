import React, { useEffect, useState } from 'react';

import { getBlogById } from '../../../../AxiosCalls/GlobalAxiosServices/globalServices';
import CommonLayout from '../../../../components/shop/common-layout';

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CreateIcon from "@mui/icons-material/Create";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import DOMPurify from 'dompurify';

import ReadBlogCarousel from './ReadBlogCarousel';
import Head from 'next/head';

export async function getServerSideProps(context) {

  const id = context.query.bID;

  let response = [];
  await getBlogById(id).then((res) => {
    response = res;
  });

  return {
    props: {
      response,
    },
  };

}

function BlogContent(response) {

  const [blogStatus, setBlogStatus] = useState(false);
  const [blogContent, setBlogContent] = useState([]);

  const formatdate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  const calculateReadingTime = (text) => {
    const wordCount = countWords(text);
    const wordsPerMinute = 150;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  }

  const countWords = (s) => {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    s = s.replace(/\n /, "\n");
    return s.split(" ").filter(function (str) {
      return str != "";
    }).length;
  }

  const getSanitizedContent = (text) => {
    return DOMPurify.sanitize(text)
  }

  useEffect(() => {
    if (response.response.data.length !== 0) {
      setBlogStatus(true);
      setBlogContent(response.response.data[0]);
    }
  }, []);

  return (
    <>

      <Head>
        <title>Aahaas - Travel guide</title>
      </Head>
    
      <CommonLayout parent="Home" title="Travel guide" subTitle="Read Blog">

        {
          blogStatus &&
          <header className="container">

            <div className="py-5">

              <h1 className="display-4 text-primary mb-4">{blogContent.title}</h1>

              <div className="d-flex flex-wrap gap-3 text-muted">
                <div className="d-flex align-items-center gap-2">
                  <CreateIcon style={{ fontSize: "15px" }} />
                  <span>Aahaas.com</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CalendarMonthIcon style={{ fontSize: "15px" }} />
                  <span>{formatdate(blogContent.updated_at)}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <MenuBookIcon style={{ fontSize: "15px" }} />
                  <span>{calculateReadingTime(blogContent.text)} min</span>
                </div>
              </div>

            </div>

            <ReadBlogCarousel images={blogContent.images?.split(",") || []} blogData={blogContent} />

            <div className='mb-5 py-5'>
              <p className="lead mb-4 text-muted">{blogContent.content}</p>
              <div className="mb-4" dangerouslySetInnerHTML={{ __html: getSanitizedContent(blogContent.text) }} />
            </div>

          </header>
        }

      </CommonLayout>
      
    </>
  );

}

export default BlogContent