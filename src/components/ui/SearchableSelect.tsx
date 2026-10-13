import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  disabled = false,
  style = {},
  onFocus,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        ...style
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          background: disabled ? "#f9fafb" : "white",
          color: "#1e293b",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s ease",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = "#1FB05B";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#d1d5db";
        }}
      >
        <span style={{ textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          {selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                padding: "0 4px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <FaTimes size={12} />
            </button>
          )}
          <FaChevronDown
            size={10}
            color="#6b7280"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }}
          />
        </div>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Search Input */}
          <div style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.75rem",
                outline: "none"
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
            />
          </div>

          {/* Options */}
          <div style={{ overflowY: "auto", maxHeight: "250px" }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    background: String(value) === String(option.value) ? "#e8f9f0" : "white",
                    border: "none",
                    borderBottom: "1px solid #f3f4f6",
                    color: String(value) === String(option.value) ? "#1FB05B" : "#374151",
                    fontSize: "0.8rem",
                    fontWeight: String(value) === String(option.value) ? 600 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = String(value) === String(option.value) ? "#e8f9f0" : "white";
                  }}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div style={{ padding: "12px", textAlign: "center", color: "#9ca3af", fontSize: "0.75rem" }}>
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
