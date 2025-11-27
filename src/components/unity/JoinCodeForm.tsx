"use client";
import React from "react";

export type JoinCodeFormProps = {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
};

export const JoinCodeForm: React.FC<JoinCodeFormProps> = ({ value, onChange, onSubmit, disabled, className }) => {
  return (
    <div className={className}>
      <label htmlFor="joinCode">Join Code</label>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input
          id="joinCode"
          type="text"
          placeholder="ABCDEF"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          maxLength={12}
          disabled={disabled}
          style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button onClick={onSubmit} disabled={disabled} style={{ padding: "8px 12px" }}>
          Connect
        </button>
      </div>
    </div>
  );
};

export default JoinCodeForm;