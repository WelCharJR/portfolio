import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Select({ label, value, placeholder, options, onSelect, render, optionKey }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <label
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--text-faint)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          display: "block",
          marginBottom: 7,
        }}
      >
        {label}
      </label>
      <button type="button" className="field-btn focus-ring" onClick={() => setOpen((o) => !o)}>
        <span style={{ color: value ? "var(--text)" : "var(--text-faint)" }}>
          {value ? render(value) : placeholder}
        </span>
        <ChevronDown
          size={16}
          color="var(--text-faint)"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "var(--panel-raised)",
            border: "1px solid var(--line)",
            borderRadius: 5,
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          {options.map((opt) => (
            <div
              key={optionKey ? optionKey(opt) : opt}
              className="option-row"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={{ padding: "12px 14px", fontSize: 14 }}
            >
              {render(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
