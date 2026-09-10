import { useEffect, useMemo, useRef, useState } from "react";
import { countries, searchCountries } from "../data/countries.js";

export default function CountrySelect({ value, onChange, error }) {
  const selected = countries.find((country) => country.code === value) ?? null;
  const selectedLabel = selected ? `${selected.name} — ${selected.code}` : "";
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);

  const results = useMemo(() => searchCountries(open ? query : ""), [open, query]);

  useEffect(() => {
    if (!open) setQuery(selectedLabel);
  }, [selectedLabel, open]);

  useEffect(() => {
    function onDocClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function choose(country) {
    onChange(country.code);
    setQuery(`${country.name} — ${country.code}`);
    setOpen(false);
  }

  return (
    <div className="field country-select" ref={rootRef}>
      <span>Country</span>
      <input
        className="search-input"
        value={open ? query : selectedLabel}
        placeholder="Search country or ISO code"
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setActiveIndex(0);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          }
          if (event.key === "Enter" && results[activeIndex]) {
            event.preventDefault();
            choose(results[activeIndex]);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <div className="country-menu" role="listbox">
          {results.length === 0 && (
            <div className="country-option">No matching country</div>
          )}
          {results.map((country, index) => (
            <button
              type="button"
              key={country.code}
              className={`country-option ${index === activeIndex ? "active" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(country)}
            >
              <span>
                {country.name} — {country.code}
              </span>
              <span className="carrier-pills">
                {country.novaAvailable && <span className="pill">Nova</span>}
                {country.emsAvailable && <span className="pill">EMS</span>}
              </span>
            </button>
          ))}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
