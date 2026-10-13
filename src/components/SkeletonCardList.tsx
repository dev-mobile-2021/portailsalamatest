import React from "react";

interface SkeletonCardListProps {
  count?: number;
}

const SkeletonCard: React.FC = () => {
  return (
    <div 
      className="card h-100 border-0 shadow-sm"
      style={{ 
        background: "#f8f9fa",
        borderRadius: "12px",
        overflow: "hidden"
      }}
    >
      {/* Header skeleton */}
      <div 
        className="card-header border-0"
        style={{ 
          background: "linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          height: "60px"
        }}
      />
      
      <div className="card-body">
        {/* Titre skeleton */}
        <div 
          className="mb-3"
          style={{
            height: "20px",
            width: "80%",
            background: "linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "4px"
          }}
        />
        
        {/* Référence skeleton */}
        <div 
          className="mb-2"
          style={{
            height: "14px",
            width: "60%",
            background: "linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "4px"
          }}
        />
        
        {/* Date skeleton */}
        <div 
          className="mb-2"
          style={{
            height: "14px",
            width: "50%",
            background: "linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "4px"
          }}
        />
        
        {/* Description skeleton */}
        <div 
          className="mt-3"
          style={{
            height: "12px",
            width: "90%",
            background: "linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "4px"
          }}
        />
      </div>
      
      {/* Footer skeleton */}
      <div 
        className="card-footer border-0 bg-transparent"
        style={{ padding: "12px 16px" }}
      >
        <div 
          style={{
            height: "32px",
            width: "100%",
            background: "linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "6px"
          }}
        />
      </div>
      
      {/* Keyframes pour l'animation shimmer */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
};

const SkeletonCardList: React.FC<SkeletonCardListProps> = ({ count = 4 }) => {
  return (
    <div className="container bg-white rounded-3 p-4">
      <div className="row g-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="col-lg-3 col-md-6 col-sm-12">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonCardList;
