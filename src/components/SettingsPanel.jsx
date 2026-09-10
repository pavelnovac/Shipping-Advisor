import { useState } from "react";

export default function SettingsPanel({ settings, errors, onChange }) {
  const [open, setOpen] = useState(false);

  function update(field, value) {
    onChange({ ...settings, [field]: value });
  }

  return (
    <section className="panel">
      <button type="button" className="collapse-toggle" onClick={() => setOpen((value) => !value)}>
        <h2 className="panel-title" style={{ margin: 0 }}>
          Calculation settings
        </h2>
        <span>{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="collapse-body">
          <label className="field">
            <span>1 EUR = MDL</span>
            <input
              type="number"
              min="0"
              step="any"
              value={settings.eurToMdl}
              onChange={(event) => update("eurToMdl", event.target.value)}
            />
            {errors.eurToMdl && <div className="error">{errors.eurToMdl}</div>}
          </label>
          <p className="placeholder" style={{ marginTop: 0 }}>
            Used to convert Nova Post’s €3 EU customs fee per unique HS code.
            Extra Nova fees apply only when the sender is a juridical person.
          </p>

          <Toggle
            label="Include Nova Post declared-value commission"
            checked={settings.includeDeclaredValueFee}
            onChange={(checked) => update("includeDeclaredValueFee", checked)}
          />
          <Toggle
            label="Include Nova Post customs/HS fee"
            checked={settings.includeHsFee}
            onChange={(checked) => update("includeHsFee", checked)}
          />
          <Toggle
            label="Include Nova Post US 15% invoice surcharge"
            checked={settings.includeUsaSurcharge}
            onChange={(checked) => update("includeUsaSurcharge", checked)}
          />
        </div>
      )}
    </section>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className={`switch-button ${checked ? "on" : ""}`}
        role="switch"
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
