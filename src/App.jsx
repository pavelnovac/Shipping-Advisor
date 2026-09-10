import { useEffect, useMemo, useState } from "react";
import { EMPTY_FORM } from "./constants/calculator.js";
import { novaMeta } from "./data/novaRates.js";
import { emsMeta } from "./data/emsRates.js";
import ShipmentForm from "./components/ShipmentForm.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import { calculateShipment } from "./utils/calculateShipment.js";
import { historyEntryFromCalculation, loadHistory, saveHistory } from "./utils/history.js";
import { loadSettings, persistSettings } from "./utils/settings.js";

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [settings, setSettings] = useState(loadSettings);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    persistSettings({
      ...settings,
      eurToMdl: Number(settings.eurToMdl),
    });
  }, [settings]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const computed = useMemo(() => calculateShipment(form, settings), [form, settings]);
  const errors = computed.errors;
  const result = computed;

  function calculate() {
    if (computed.ok) {
      setHistory((items) => [historyEntryFromCalculation({ form, result: computed, settings }), ...items]);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function openHistory(item) {
    setForm({ ...EMPTY_FORM, ...item.form });
  }

  function duplicateHistory(item) {
    setForm({ ...EMPTY_FORM, ...item.form });
  }

  return (
    <div className="app">
      <header className="site-header">
        <div>
          <p className="kicker">Internal decision tool</p>
          <h1 className="wordmark">LA FORMA</h1>
          <p className="header-copy">Shipping Cost Calculator for Moldova outbound parcels.</p>
        </div>
        <div className="header-meta">
          Nova Post from {novaMeta.validFrom}
          <br />
          EMS source: {emsMeta.lastUpdated}
          <br />
          Poșta Moldovei EMS · Nova Post
        </div>
      </header>

      <main className="layout">
        <div>
          <ShipmentForm
            form={form}
            errors={errors}
            onChange={setForm}
            onSubmit={calculate}
            onReset={resetForm}
          />
          <SettingsPanel settings={settings} errors={errors} onChange={setSettings} />
          <HistoryPanel
            items={history}
            onOpen={openHistory}
            onDuplicate={duplicateHistory}
            onDelete={(id) => setHistory((items) => items.filter((item) => item.id !== id))}
            onClear={() => setHistory([])}
          />
        </div>
        <div className="results-column">
          <ResultsPanel form={form} result={result} />
        </div>
      </main>

      <footer className="site-footer">
        This calculator is an internal decision-support tool. Results are based on the tariff
        documents entered into the application and should be verified if carrier tariffs or
        conditions change. Compare final cost, including Nova Post extra fees, not only the
        published headline shipping tariff.
      </footer>
    </div>
  );
}
