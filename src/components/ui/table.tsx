// import React from 'react';

// const TableauReutilisable = ({
//   headers,
//   data,
//   renderCell,
//   totalRow = null,
//   containerStyle = {},
//   headerStyle = {},
//   rowStyle = {},
//   totalRowStyle = {}
// }) => {
//   const defaultStyles = {
//     container: {
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
//     },
//     tableContainer: {
//       backgroundColor: "white",
//       overflow: "hidden",
//       marginTop: "1rem",
//       marginBottom: "1rem",
//     },
//     header: {
//       display: "grid",
//       backgroundColor: "#1FB05B",
//       padding: "15px 20px",
//       color: "white",
//       fontSize: "13px",
//       borderRadius: "8px",
//     },
//     headerCell: {
//       display: "flex",
//       alignItems: "center",
//     },
//     itemsContainer: {
//       padding: "10px 0px",
//     },
//     itemRow: {
//       display: "grid",
//       padding: "5px 20px",
//       backgroundColor: "white",
//       border: "1px solid #e0e0e0",
//       borderRadius: "8px",
//       marginBottom: "10px",
//       alignItems: "center",
//       fontSize: "10px",
//       transition: "all 0.2s",
//     },
//     totalRow: {
//       display: "grid",
//       backgroundColor: "#1FB05B26",
//       borderRadius: "8px",
//       padding: "10px 20px",
//       alignItems: "center",
//       border: "1px solid rgba(31, 176, 91, 0.3)",
//     }
//   };

//   // Générer la grille CSS basée sur le nombre de colonnes
//   const gridColumns = `repeat(${headers.length}, 1fr)`;

//   const mergedStyles = {
//     container: { ...defaultStyles.container, ...containerStyle },
//     tableContainer: { ...defaultStyles.tableContainer },
//     header: { 
//       ...defaultStyles.header, 
//       gridTemplateColumns: gridColumns,
//       ...headerStyle 
//     },
//     itemRow: { 
//       ...defaultStyles.itemRow, 
//       gridTemplateColumns: gridColumns,
//       ...rowStyle 
//     },
//     totalRow: {
//       ...defaultStyles.totalRow,
//       gridTemplateColumns: gridColumns,
//       ...totalRowStyle
//     }
//   };

//   return (
//     <div style={mergedStyles.container}>
//       <div style={mergedStyles.tableContainer}>
//         {/* Header */}
//         <div style={mergedStyles.header}>
//           {headers.map((header, index) => (
//             <div key={index} style={defaultStyles.headerCell}>
//               {header}
//             </div>
//           ))}
//         </div>

//         {/* Items Container */}
//         <div style={defaultStyles.itemsContainer}>
//           {data.map((item, rowIndex) => (
//             <div key={rowIndex} style={mergedStyles.itemRow}>
//               {headers.map((header, colIndex) => (
//                 <div key={colIndex}>
//                   {renderCell ? renderCell(item, colIndex, header, rowIndex) : item[colIndex]}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>

//         {/* Total Row (optionnel) */}
//         {totalRow && (
//           <div style={mergedStyles.totalRow}>
//             {headers.map((header, index) => (
//               <div key={index}>
//                 {totalRow[index] || ''}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TableauReutilisable;