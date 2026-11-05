import { useMemo, useState, type ChangeEvent } from "react";
import { calculateProfit, type ProfitInput } from "./lib/profit";
import "./App.css";

const defaults: ProfitInput = {
  itemCost: 10,
  shippingCost: 4,
  packagingCost: 1,
  platformFeePercent: 0.1,
  paymentFeePercent: 0.03,
  paymentFixedFee: 0.3,
  taxBufferPercent: 0.05,
  salePrice: 30,
  targetNetProfit: 10,
};

type NumKey = keyof ProfitInput;
type PctKey = "platformFeePercent" | "paymentFeePercent" | "taxBufferPercent";

/**
 * Root component: holds the calculator state, derives results via calculateProfit,
 * and renders the input form plus the results panel with a price-composition bar.
 */
export default function App() {
  const [form, setForm] = useState<ProfitInput>(defaults);

  // Recalcola solo quando cambia un input: useMemo evita calcoli inutili a ogni render.
  const result = useMemo(() => calculateProfit(form), [form]);

  const setNum =
    (key: NumKey) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  // I fee % li mostriamo in percentuale (0.1 -> 10) ma nello stato restano frazioni decimali.
  const setPct =
    (key: PctKey) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: Number(e.target.value) / 100 }));

  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const money = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");

  // La barra di composizione ha senso solo con un prezzo valido e profitto non negativo:
  // in quel caso costi + fee + profitto = salePrice esattamente, quindi le frazioni sommano a 1.
  const showBreakdown = result.isValid && form.salePrice > 0 && result.netProfit >= 0;

  return (
    <div className="page">
      <header className="hero">
        <h1>ProfitLens</h1>
        <p>Estimate net profit, fees, break-even and suggested price for resale items.</p>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Inputs</h2>
          <Field label="Sale price" value={form.salePrice} onChange={setNum("salePrice")} />
          <Field label="Item cost" value={form.itemCost} onChange={setNum("itemCost")} />
          <Field label="Shipping cost" value={form.shippingCost} onChange={setNum("shippingCost")} />
          <Field label="Packaging cost" value={form.packagingCost} onChange={setNum("packagingCost")} />
          <Field label="Platform fee %" value={form.platformFeePercent * 100} onChange={setPct("platformFeePercent")} />
          <Field label="Payment fee %" value={form.paymentFeePercent * 100} onChange={setPct("paymentFeePercent")} />
          <Field label="Payment fixed fee" value={form.paymentFixedFee} onChange={setNum("paymentFixedFee")} />
          <Field label="Tax buffer %" value={form.taxBufferPercent * 100} onChange={setPct("taxBufferPercent")} />
          <Field label="Target net profit" value={form.targetNetProfit ?? 0} onChange={setNum("targetNetProfit")} />
          <button className="reset" onClick={() => setForm(defaults)}>Reset</button>
        </section>

        <section className="card results">
          <h2>Results</h2>
          {!result.isValid ? (
            <p className="warn">{result.warning}</p>
          ) : (
            <>
              {showBreakdown && (
                <div className="breakdown">
                  <div className="bar" role="img" aria-label="Price composition">
                    <span className="bar-seg seg-cost" style={{ width: `${(result.totalCosts / form.salePrice) * 100}%` }} />
                    <span className="bar-seg seg-fee" style={{ width: `${(result.estimatedFees / form.salePrice) * 100}%` }} />
                    <span className="bar-seg seg-profit" style={{ width: `${(result.netProfit / form.salePrice) * 100}%` }} />
                  </div>
                  <div className="legend">
                    <span className="legend-item"><i className="dot dot-cost" /> Costs {money(result.totalCosts)}</span>
                    <span className="legend-item"><i className="dot dot-fee" /> Fees {money(result.estimatedFees)}</span>
                    <span className="legend-item"><i className="dot dot-profit" /> Profit {money(result.netProfit)}</span>
                  </div>
                </div>
              )}

              <Row k="Total costs" v={money(result.totalCosts)} />
              <Row k="Estimated fees" v={money(result.estimatedFees)} />
              <Row k="Net profit" v={money(result.netProfit)} strong tone={result.netProfit >= 0 ? "good" : "bad"} />
              <Row k="Margin" v={pct(result.margin)} tone={result.margin >= 0.1 ? "good" : "bad"} />
              <Row k="ROI" v={pct(result.roi)} />
              <Row k="Break-even price" v={money(result.breakEvenPrice)} />
              <Row k="Suggested price" v={result.suggestedPrice !== null ? money(result.suggestedPrice) : "—"} />
              {result.warning && <p className="warn">{result.warning}</p>}
            </>
          )}
        </section>
      </main>

      <footer className="foot">Built with React + TypeScript · {new Date().getFullYear()}</footer>
    </div>
  );
}

/** A labelled numeric input row used inside the Inputs card. */
function Field(props: {
  label: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <input type="number" step="any" value={props.value} onChange={props.onChange} />
    </label>
  );
}

/** A key/value result row; `strong` bolds it, `tone` colors the value green or red. */
function Row(props: { k: string; v: string; strong?: boolean; tone?: "good" | "bad" }) {
  const cls = "row" + (props.strong ? " strong" : "") + (props.tone ? " " + props.tone : "");
  return (
    <div className={cls}>
      <span>{props.k}</span>
      <span>{props.v}</span>
    </div>
  );
}