import { useState } from "react";
import { getCountry } from "../data/countries.js";
import { formatDateTime, formatMDL } from "../utils/format.js";

export default function HistoryPanel({ items, onOpen, onDuplicate, onDelete, onClear }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="panel">
      <button type="button" className="collapse-toggle" onClick={() => setOpen((value) => !value)}>
        <h2 className="panel-title" style={{ margin: 0 }}>
          Recent calculations
        </h2>
        <span>{open ? "Hide" : `${items.length}`}</span>
      </button>
      {open && (
        <div className="collapse-body">
          {items.length === 0 && <p className="placeholder">No saved calculations yet.</p>}
          {items.map((item) => {
            const country = getCountry(item.country);
            const recommended =
              item.recommendedCarrier === "nova"
                ? "Nova Post"
                : item.recommendedCarrier === "ems"
                  ? "EMS"
                  : "Equal / n/a";
            return (
              <div className="history-item" key={item.id}>
                <div>
                  <p>
                    {country?.name ?? item.country} · {item.weight} {item.weightUnit}
                  </p>
                  <small>
                    {formatDateTime(item.createdAt)} · {recommended}
                    {item.savings > 0 ? ` · save ${formatMDL(item.savings, { compact: true })}` : ""}
                  </small>
                </div>
                <div className="history-actions">
                  <button type="button" className="linkish" onClick={() => onOpen(item)}>
                    Open
                  </button>
                  <button type="button" className="linkish" onClick={() => onDuplicate(item)}>
                    Duplicate
                  </button>
                  <button type="button" className="linkish" onClick={() => onDelete(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {items.length > 0 && (
            <div className="actions">
              <button type="button" className="btn ghost" onClick={onClear}>
                Clear history
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
