'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

const HTML_CardSummeryContainer = ({ text }) => {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    const cleanHTML = DOMPurify.sanitize(text);
    const truncatedContent = truncateHTML(cleanHTML, 400);
    setSanitizedContent(truncatedContent);
  }, [text]);

  const truncateHTML = (html, maxLength) => {
    // Create a temporary div
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Function to recursively traverse and truncate text nodes
    const truncateNode = (node, remainingChars) => {
      if (remainingChars <= 0) {
        return 0;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.length > remainingChars) {
          node.textContent = node.textContent.slice(0, remainingChars) + '...';
          return 0;
        }
        return remainingChars - node.textContent.length;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        let currentRemaining = remainingChars;
        const childNodes = Array.from(node.childNodes);

        for (const childNode of childNodes) {
          currentRemaining = truncateNode(childNode, currentRemaining);
          if (currentRemaining <= 0) {
            // Remove remaining siblings
            let nextSibling = childNode.nextSibling;
            while (nextSibling) {
              const toRemove = nextSibling;
              nextSibling = nextSibling.nextSibling;
              node.removeChild(toRemove);
            }
            break;
          }
        }
        return currentRemaining;
      }

      return remainingChars;
    };

    const totalChars = tempDiv.textContent.length;

    if (totalChars <= maxLength) {
      return `<div style="min-height: 150px">${html}</div>`;
    }

    truncateNode(tempDiv, maxLength);
    return tempDiv.innerHTML;
  };

  return (
    <p
      className="text-muted mb-4"
      style={{
        fontSize: "15px",
        textAlign: "justify",
        fontFamily: "sans-serif",
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HTML_CardSummeryContainer;