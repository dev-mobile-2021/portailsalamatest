import React from 'react';

interface InfoDisplayProps {
  label: string;
  labelStyle?: React.CSSProperties;
  value: string | number;
width?: string | number ;
  isEnabled?: boolean;
  placeholder?: string;
  type?: string;
  inputStyle?: React.CSSProperties;
  onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
}

const InfoDisplay: React.FC<InfoDisplayProps> = ({ label, value, inputStyle, isEnabled, width, onChange, type, labelStyle,placeholder }) => {
  return (
    <div>
      <label className="form-label fw-bold" style={{ ...labelStyle }}>
        {label}
      </label>
      <input
        type={type || "text"}
        className="form-control"
        placeholder={placeholder || ''}
        style={{ width: width || '200%', border: 'none', ...inputStyle }}
        value={value}
        disabled={!isEnabled}
        onChange={(e) => onChange && onChange(e)}
      />
    </div>
  );
};

export default InfoDisplay;