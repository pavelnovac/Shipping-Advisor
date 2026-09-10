import { useState } from "react";
import { formatEUR, formatGrams, formatKg, formatMDL, formatPercent } from "../utils/format.js";
import { buildCopyText } from "../utils/copyResult.js";

export default function ResultsPanel({ form, result }) {
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!result?.ok) {
    const missingCountry = result?.errors?.countryCode && !form.countryCode;
    return (
      <section className="panel">
        <h2 className="panel-title">Results</h2>
        <p className="placeholder">
          {missingCountry
            ? "Select a destination country to see the live EMS and Nova Post comparison."
            : "Fix the highlighted fields to calculate shipping cost."}
        </p>
      </section>
    );
  }

  const { nova, ems, recommendation, explanation, warnings } = result;
  const winnerClass = recommendation.equal
    ? "equal"
    : recommendation.winner === "nova"
      ? "win-nova"
      : recommendation.winner === "ems"
        ? "win-ems"
        : "";

  async function copyResult() {
    const text = buildCopyText({ form, result });
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const winnerCost =
    recommendation.winner === "nova"
      ? nova.finalCost
      : recommendation.winner === "ems"
        ? ems.finalCost
        : recommendation.finalCost;

  return (
    <div className="results-stack">
      <section className={`winner-card ${winnerClass}`}>
        <p className="eyebrow">Best option</p>
        <h2 className="winner-name">
          {recommendation.equal
            ? "Equal cost"
            : recommendation.winnerLabel ?? "No recommendation"}
        </h2>
        {recommendation.recommendedText && (
          <p className="eyebrow" style={{ marginTop: 10 }}>
            {recommendation.recommendedText}
          </p>
        )}
        {winnerCost != null && <p className="winner-price">{formatMDL(winnerCost)}</p>}
        {recommendation.savings > 0 && (
          <p className="save-line">
            Save {formatMDL(recommendation.savings)} compared with{" "}
            {recommendation.winner === "nova" ? "EMS" : "Nova Post"}.
          </p>
        )}
        {recommendation.equal && <p className="placeholder">Both options have the same calculated cost.</p>}
        {recommendation.novaUnavailable && ems?.available && (
          <p className="placeholder">{nova?.unavailableReason}</p>
        )}
        <div className="actions">
          <button type="button" className="btn secondary" onClick={copyResult}>
            Copy result
          </button>
          {copied && <span className="copied">Copied</span>}
        </div>
      </section>

      <div className="cards">
        <CarrierCard
          title="Nova Post"
          cheapest={recommendation.winner === "nova"}
          available={nova.available}
          unavailableReason={nova.unavailableReason}
          finalCost={nova.finalCost}
          rows={novaRows(nova)}
        />
        <CarrierCard
          title="EMS"
          cheapest={recommendation.winner === "ems"}
          available={ems.available}
          unavailableReason={ems.unavailableReason}
          finalCost={ems.finalCost}
          rows={emsRows(ems)}
        />
      </div>

      {(recommendation.savings > 0 || recommendation.equal) && (
        <section className="difference">
          <div className="eyebrow">Difference</div>
          {recommendation.equal ? (
            <p>Both options have the same calculated cost.</p>
          ) : (
            <>
              <p>
                <b>{formatMDL(recommendation.savings)}</b>
              </p>
              <p>
                <strong>
                  {recommendation.winner === "nova" ? "NOVA POST" : "EMS"} IS{" "}
                  {formatPercent(recommendation.savingsPercent)} CHEAPER
                </strong>
              </p>
            </>
          )}
        </section>
      )}

      <section className="panel why">
        <h3 className="panel-title">Why this option?</h3>
        <p>{explanation}</p>
      </section>

      {warnings.length > 0 && (
        <section className="warnings">
          {warnings.map((warning) => (
            <div className={`banner ${warning.tone}`} key={warning.text}>
              {warning.text}
            </div>
          ))}
        </section>
      )}

      <section className="panel details">
        <button
          type="button"
          className="collapse-toggle"
          onClick={() => setDetailsOpen((value) => !value)}
        >
          <h3 className="panel-title" style={{ margin: 0 }}>
            Calculation details
          </h3>
          <span>{detailsOpen ? "Hide" : "Show"}</span>
        </button>
        {detailsOpen && <pre className="pre">{buildDetails(nova, ems, form)}</pre>}
      </section>
    </div>
  );
}

function CarrierCard({ title, cheapest, available, unavailableReason, finalCost, rows }) {
  return (
    <article className={`carrier-card ${cheapest ? "cheapest" : ""}`}>
      <h3>{title}</h3>
      {!available ? (
        <p className="empty-card">{unavailableReason}</p>
      ) : (
        <>
          <div className="rows">
            {rows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <b>{row.value}</b>
              </div>
            ))}
          </div>
          <div className="final-row">
            <span>Final</span>
            <b>{formatMDL(finalCost)}</b>
          </div>
        </>
      )}
    </article>
  );
}

function novaRows(nova) {
  if (!nova.available) return [];
  return [
    { label: "Base tariff", value: formatMDL(nova.baseRate) },
    { label: "Billable weight", value: formatKg(nova.billableWeightKg) },
    { label: "Actual weight", value: formatKg(nova.actualWeightKg) },
    { label: "Volumetric weight", value: formatKg(nova.volumetricWeightKg) },
    { label: "HS customs fee", value: formatMDL(nova.hsFeeMDL) },
    ...(nova.hsApplicable && nova.hsFeeEUR > 0
      ? [
          {
            label: "HS conversion",
            value: `${nova.uniqueHSCodes} HS × €3 = ${formatEUR(nova.hsFeeEUR)}`,
          },
        ]
      : []),
    { label: "Declared value fee", value: formatMDL(nova.declaredValueFee) },
    { label: "US surcharge", value: formatMDL(nova.usaFee) },
  ];
}

function emsRows(ems) {
  if (!ems.available) return [];
  return [
    { label: "Actual weight", value: formatGrams(ems.actualWeightGrams) },
    { label: "Base tariff", value: formatMDL(ems.baseTariff) },
    {
      label: "Additional weight",
      value:
        ems.additionalUnits > 0
          ? `${ems.additionalUnits} × 500 g = ${formatMDL(ems.additionalCost)}`
          : "0",
    },
  ];
}

function buildDetails(nova, ems, form) {
  const novaLines = nova.available
    ? [
        "Nova:",
        `actualWeight = ${formatKg(nova.actualWeightKg)}`,
        `volumetricWeight = ${formatKg(nova.volumetricWeightKg)}`,
        `billableWeight = ${formatKg(nova.billableWeightKg)}`,
        `tariffBracket = ${nova.tariffBracket}`,
        `baseRate = ${nova.baseRate}`,
        `declaredValueMDL = ${nova.invoiceValueMDL}`,
        `declaredValueFee = ${nova.declaredValueFee}`,
        `HS fee = ${nova.uniqueHSCodes} × €3 = ${formatEUR(nova.hsFeeEUR)}`,
        `HS fee MDL = ${nova.hsFeeMDL}`,
        `usaFee = ${nova.usaFee}`,
        `finalCost = ${nova.finalCost}`,
      ]
    : ["Nova:", nova.unavailableReason ?? "unavailable"];

  const emsLines = ems.available
    ? [
        "EMS:",
        `actualWeight = ${formatGrams(ems.actualWeightGrams)}`,
        `tariffBracket = ${ems.tariffBracket}`,
        `rate = ${ems.baseTariff}`,
        `additional500gUnits = ${ems.additionalUnits}`,
        `finalCost = ${ems.finalCost}`,
      ]
    : ["EMS:", ems.unavailableReason ?? "unavailable"];

  return [...novaLines, "", ...emsLines, "", `shipmentType = ${form.shipmentType}`].join("\n");
}
