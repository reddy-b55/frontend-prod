// import React from 'react';
 
// const TnC_container = ({ content }) => {
//   const formatContent = (content) => {
//     if (!content) return '';
   
//     // First clean up the content
//     let cleanContent = content
//       // Remove extra asterisks
//       .replace(/\*/g, '')
//       // Fix the specific issue with number 2 by ensuring it starts on a new line
//       .replace(/(\. )(\d+ Health)/, '.\n$2')
//       // Ensure all section numbers are properly formatted
//       .replace(/(\d+)(?=[A-Za-z])/, '$1.')
//       // Clean up extra spaces around bullet points
//       .replace(/•\s*/g, '• ');
   
//     // Split into sections by numbered items
//     const sections = cleanContent.split(/(?=\d+\.?\s+[A-Za-z])/);
   
//     return sections.map((section, index) => {
//       if (!section.trim()) return null;
     
//       // Split the section into title and content
//       const matches = section.match(/(\d+\.?\s+[^:]+:)?([\s\S]+)/);
//       if (!matches) return null;
     
//       const [, title = '', content = ''] = matches;
     
//       // Split content into bullet points
//       const bulletPoints = content
//         .split('•')
//         .map(point => point.trim())
//         .filter(point => point.length > 0);
     
//       return (
//         <div key={index} className="mb-4">
//           {title && (
//             <div className="font-medium mb-2">
//               {/* Ensure section numbers have a period */}
//               {title.trim().replace(/(\d+)(?=\s)/, '$1.')}
//             </div>
//           )}
//           {bulletPoints.length > 0 && (
//             <ul className="list-none pl-4 space-y-2">
//               {bulletPoints.map((point, idx) => (
//                 <li key={idx} className="flex">
//                   <span className="mr-2">•</span>
//                   <span>{point}</span>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       );
//     });
//   };
 
//   return (
//     <div className="w-full">
//       <h5 className="font-semibold capitalize mt-5 mb-4">
//         {/* Terms and Conditions */}
//       </h5>
//       <div className="text-sm leading-relaxed">
//         {formatContent(content)}
//       </div>
//     </div>
//   );
// };
 
// export default TnC_container;



import React from 'react';

const TnC_container = ({ content }) => {
 const formatContent = (content) => {
  if (!content) return '';

  // Clean unwanted bullet + newline patterns
  let cleanContent = content
    .replace(/\n+/g, ' ') // remove multiple line breaks
    .replace(/•\s*\d*/g, '•') // remove bullets followed by numbers like •1 or •4
    .replace(/\s{2,}/g, ' ') // remove extra spaces
    .trim();

  // Split by bullet points
  const bulletPoints = cleanContent
    .split('•')
    .map(point => point.trim())
    .filter(point => point.length > 0);

  // Render each clean bullet point
  return (
    <ul className="list-disc pl-6 space-y-2">
      {bulletPoints.map((point, idx) => (
        <li key={idx} className="text-gray-700 leading-relaxed">
          {point}
        </li>
      ))}
    </ul>
  );
};


  return (
    <div className="w-full">
      <h5 className="font-semibold capitalize  mb-4">
        {/* Terms and Conditions */}
      </h5>
      <div className="text-sm leading-relaxed">
        {formatContent(content)}
      </div>
    </div>
  );
};

export default TnC_container;