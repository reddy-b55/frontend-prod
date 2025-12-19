'use client'; 

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

const HTML_contentContainer = ({ text }) => {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    // Sanitize content only on the client side
    setSanitizedContent(DOMPurify.sanitize(text));
  }, [text]);

  return (
    <p
      className="text-muted mb-4"
      style={{
        fontSize: "15px",
        textAlign: "justify",
        fontFamily: "sans-serif",
        lineHeight: "1.6",
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HTML_contentContainer;