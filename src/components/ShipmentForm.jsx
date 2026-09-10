import CountrySelect from "./CountrySelect.jsx";
import { calculateVolumetricWeightKg, billableWeightNova } from "../utils/volumetric.js";
import { formatKg, parseNumber, toKg } from "../utils/format.js";

export default function ShipmentForm({
  form,
  errors,
  onChange,
  onSubmit,
  onReset,
}) {
  const weight = parseNumber(form.weight);
  const actualKg = weight != null ? toKg(weight, form.weightUnit) : null;
  const volumetricKg = calculateVolumetricWeightKg(
    parseNumber(form.length),
    parseNumber(form.width),
    parseNumber(form.height),
  );
  const billableKg =
    actualKg != null && volumetricKg != null
      ? billableWeightNova(actualKg, volumetricKg)
      : null;

  function update(field, value) {
    onChange({ ...form, [field]: value });
  }

  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 className="panel-title">Shipment</h2>

      <div className="section-label">Sender</div>
      <div className="radio-row">
        <label className={form.senderType === "physical" ? "active" : ""}>
          <input
            type="radio"
            name="senderType"
            checked={form.senderType !== "juridical"}
            onChange={() => update("senderType", "physical")}
          />
          Physical person
        </label>
        <label className={form.senderType === "juridical" ? "active" : ""}>
          <input
            type="radio"
            name="senderType"
            checked={form.senderType === "juridical"}
            onChange={() => update("senderType", "juridical")}
          />
          Juridical person
        </label>
      </div>

      <div className="section-label">Destination</div>
      <CountrySelect
        value={form.countryCode}
        onChange={(code) => update("countryCode", code)}
        error={errors.countryCode}
      />

      <div className="section-label">Weight</div>
      <div className="weight-row">
        <label className="field">
          <span>Actual parcel weight</span>
          <input
            type="number"
            min="0"
            step="any"
            value={form.weight}
            onChange={(event) => update("weight", event.target.value)}
          />
          {errors.weight && <div className="error">{errors.weight}</div>}
        </label>
        <div className="field">
          <span>Unit</span>
          <div className="segmented">
            <button
              type="button"
              className={form.weightUnit === "g" ? "active" : ""}
              onClick={() => update("weightUnit", "g")}
            >
              g
            </button>
            <button
              type="button"
              className={form.weightUnit === "kg" ? "active" : ""}
              onClick={() => update("weightUnit", "kg")}
            >
              kg
            </button>
          </div>
        </div>
      </div>

      <div className="section-label">Dimensions</div>
      <div className="grid-3">
        <label className="field">
          <span>Length, cm</span>
          <input
            type="number"
            min="0"
            step="any"
            value={form.length}
            onChange={(event) => update("length", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Width, cm</span>
          <input
            type="number"
            min="0"
            step="any"
            value={form.width}
            onChange={(event) => update("width", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Height, cm</span>
          <input
            type="number"
            min="0"
            step="any"
            value={form.height}
            onChange={(event) => update("height", event.target.value)}
          />
        </label>
      </div>
      {errors.dimensions && <div className="error">{errors.dimensions}</div>}

      <div className="live-metrics">
        <div className="metric">
          <span>Actual weight</span>
          <b>{formatKg(actualKg)}</b>
        </div>
        <div className="metric">
          <span>Volumetric weight</span>
          <b>{formatKg(volumetricKg)}</b>
        </div>
        <div className="metric">
          <span>Nova billable</span>
          <b>{formatKg(billableKg)}</b>
        </div>
      </div>

      <div className="section-label">Declared / invoice value</div>
      <div className="weight-row">
        <label className="field">
          <span>Invoice / declared value</span>
          <input
            type="number"
            min="0"
            step="any"
            value={form.invoiceValue}
            onChange={(event) => update("invoiceValue", event.target.value)}
          />
          {errors.invoiceValue && <div className="error">{errors.invoiceValue}</div>}
        </label>
        <div className="field">
          <span>Currency</span>
          <div className="segmented">
            <button
              type="button"
              className={form.invoiceCurrency === "MDL" ? "active" : ""}
              onClick={() => update("invoiceCurrency", "MDL")}
            >
              MDL
            </button>
            <button
              type="button"
              className={form.invoiceCurrency === "EUR" ? "active" : ""}
              onClick={() => update("invoiceCurrency", "EUR")}
            >
              EUR
            </button>
          </div>
        </div>
      </div>

      {form.senderType === "juridical" && (
        <label className="field">
          <span>Number of unique HS codes</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.uniqueHSCodes}
            onChange={(event) => update("uniqueHSCodes", event.target.value)}
          />
          {errors.uniqueHSCodes && <div className="error">{errors.uniqueHSCodes}</div>}
        </label>
      )}

      <div className="section-label">Shipment type</div>
      <div className="radio-row">
        <label className={form.shipmentType === "parcel" ? "active" : ""}>
          <input
            type="radio"
            name="shipmentType"
            checked={form.shipmentType === "parcel"}
            onChange={() => update("shipmentType", "parcel")}
          />
          Parcel
        </label>
        <label className={form.shipmentType === "documents" ? "active" : ""}>
          <input
            type="radio"
            name="shipmentType"
            checked={form.shipmentType === "documents"}
            onChange={() => update("shipmentType", "documents")}
          />
          Documents
        </label>
      </div>

      <div className="actions">
        <button className="btn" type="submit">
          Calculate shipping cost
        </button>
        <button className="btn secondary" type="button" onClick={onReset}>
          Reset form
        </button>
      </div>
    </form>
  );
}
