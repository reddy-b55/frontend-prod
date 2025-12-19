import React from "react";
import { useRouter } from 'next/router';
import Card from "react-bootstrap/Card";
import ExploreIcon from "@mui/icons-material/Explore";
import DateRangeIcon from '@mui/icons-material/DateRange';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import GetImage from "./GetImage";

import { generateSlug } from '../../../GlobalFunctions/OthersGlobalfunctions'

function Blog_Card({ card }) {

  const router = useRouter();

  function formatUpdatedAt(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
  }

  const handleReadMore = (card) => {
    router.push(`/page/blogs/readBlog/${generateSlug(card.title)}?bID=${card.id}`);
  };

  return (
    <Card className="blog-content-container border-0">

      <GetImage productImage={card.images} />

      <div className="blog-date-views">
        <p className="m-0 p-0"><DateRangeIcon sx={{ fontSize: 14 }} />{formatUpdatedAt(card.updated_at)}</p>
        <p className="m-0 p-0"><RemoveRedEyeIcon sx={{ fontSize: 14 }} />{(card.click_count)}</p>
      </div>

      <p className="ellipsis-2-lines cart-title p-0">{card.title}</p>

      <div className="d-flex align-items-center justify-content-start gap-1" style={{ cursor: 'pointer' }} onClick={() => handleReadMore(card)}>
        <ExploreIcon sx={{ fontSize: 18 }} />
        <p className="text-primary m-0 p-0">Explore More</p>
      </div>

    </Card>
  );
}

export default Blog_Card;