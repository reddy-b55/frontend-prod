import React, { useState, useRef } from 'react';
import GetDescription from '../../../GlobalFunctions/Others/GetDescription.';

const ProductTabSub = ({ title, content, subContent, maxLength = 150, description = false }) => {

    const contentRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
        if (contentRef.current) {
            contentRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const contentLength = content?.length || 0;
    const displayText = isExpanded || contentLength <= maxLength ? content : `${content.slice(0, maxLength)}...`;

    return (
        <>
            <h5 style={{ fontWeight: '600', textTransform: 'capitalize', marginTop: '20px' }}>{title}</h5>
            {
                subContent &&
                <h6 className="m-0 p-0 mt-3 mb-1" style={{ fontWeight: '600', textTransform: 'uppercase' }}>Product name : {subContent}</h6>
            }
            <p style={{ fontSize: 14, lineHeight: "20px", fontWeight: '400' }} className="m-0 p-0">{description ? GetDescription(displayText) : displayText}
                {contentLength > maxLength && (
                    <span onClick={toggleReadMore} style={{ cursor: 'pointer', color: 'blue', fontSize: 12, marginLeft: ' 10px' }}>
                        {isExpanded ? 'View less' : 'View more'}
                    </span>
                )}
            </p>
        </>
    )
}

export default ProductTabSub;