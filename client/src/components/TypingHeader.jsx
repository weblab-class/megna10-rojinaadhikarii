// import React, { useState, useEffect } from "react";

// const TypingHeader = ({ text, className }) => {
//   const [displayedText, setDisplayedText] = useState("");
//   const [index, setIndex] = useState(0);

//   useEffect(() => {
//     setDisplayedText("");
//     setIndex(0);
//   }, [text]);

//   useEffect(() => {
//     if (index < text.length) {
//       const timeout = setTimeout(() => {
//         setDisplayedText((prev) => prev + text.charAt(index));
//         setIndex(index + 1);
//       }, 70);
//       return () => clearTimeout(timeout);
//     }
//   }, [index, text]);

//   return (
//     <h1 className={className}>
//       {displayedText}
//       {index < text.length && <span className="cursor">|</span>}
//     </h1>
//   );
// };

// export default TypingHeader;
