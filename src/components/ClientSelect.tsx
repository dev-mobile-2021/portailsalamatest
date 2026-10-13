import {  useEffect } from "react";
import Select, { type SingleValue, type StylesConfig } from "react-select";
import useClients from "../hooks/useClients";

type ClientOption = { value: number; label: string };

export interface ClientSelectProps {
  value: number | null;

  onChange: (clientId: number | null) => void;
  label?: string;
  isDisabled?: boolean;
  user_id: number | null;
  placeholder?: string;
  onLoadError?: (message: string) => void;
  styles?: StylesConfig<ClientOption, false>;
}

const defaultStyles: StylesConfig<ClientOption, false> = {
  control: (base, state) => ({
    ...base,
    width: "100%",
    minWidth: "250px",
    backgroundColor: "#F6F6F6",
    border: "none",
    borderRadius: "0.375rem",
    boxShadow: "none",
    minHeight: "32px",
    height: "32px",
    outline: state.isFocused ? "none" : undefined,
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: "0.5rem",
    paddingTop: "0",
    paddingBottom: "0",
    height: "32px",
    flexWrap: "nowrap",
    overflow: "hidden",
  }),
  input: (base) => ({
    ...base,
    margin: "0",
    padding: "0",
    width: "0",
    minWidth: "2px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9CA3AF",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontSize: "0.875rem",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: "32px",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "4px",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: "4px",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
    fontSize: "0.875rem",
  }),
};

export default function ClientSelect({
  value,
  onChange,
  label = "Client",
  isDisabled,
  placeholder,
  onLoadError,
    user_id,
  styles,
}: Readonly<ClientSelectProps>) {
  const { clients, loading, error } = useClients(user_id);

  useEffect(() => {
    if (error && onLoadError) onLoadError(error);
  }, [error, onLoadError]);

  const options: ClientOption[] = clients.map((c) => ({
    value: c.id,
    label: c.COMPTE_0
      ? `${c.designation} (${c.COMPTE_0})`
      : c.designation,
  }));

  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div style={{ width: "100%" }}>
      <label className="form-label fw-bold" style={{ color: "#CBCBCB" }}>
        {label}
      </label>
      <Select
        placeholder={
          placeholder ??
          (loading ? "Chargement des clients..." : "Rechercher un client...")
        }
        isDisabled={Boolean(isDisabled) || loading}
        options={options}
        value={selectedOption}
        onChange={(selected: SingleValue<ClientOption>) => {
          onChange(selected?.value ?? null);
        }}
        isClearable
        isSearchable
        noOptionsMessage={() => (loading ? "Chargement..." : "Aucun client trouvé")}
        styles={styles ? { ...defaultStyles, ...styles } : defaultStyles}
      />
    </div>
  );
}
