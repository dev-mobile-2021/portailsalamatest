import React from 'react';

interface SelectDisplayProps {
  label: string;
  optionname?: string;
  options: { value: string | number; label: string }[];
  selectedValue: string | number;
  onChange: (value: string | number) => void;
  style?: React.CSSProperties;
}

const SelectDisplay: React.FC<SelectDisplayProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  style,
  optionname
}) => {
  return (
    <div>
    <label className="form-label fw-bold" style={{ color: "black" }}>
      {label}
    </label>
      <select
        className="form-select"
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%' , backgroundColor:'#1FB05B26', ...style }}
      >
        <option value=""> Sélectionner {optionname || 'une option'} </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option> 
        ))}
      </select>
    </div>
  );
};

export default SelectDisplay;