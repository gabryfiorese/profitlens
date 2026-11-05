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
 * Renders the ProfitLens calculator, managing its inputs and displaying calculated results.
 * @returns The calculator interface as a JSX element.
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
              <Row k="Total costs" v={money(result.totalCosts)} />
              <Row k="Estimated fees" v={money(result.estimatedFees)} />
              <Row k="Net profit" v={money(result.netProfit)} strong />
              <Row k="Margin" v={pct(result.margin)} />
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

/**
 * Renders a controlled numeric input with a descriptive label.
 * @param props.label The text displayed beside the input.
 * @param props.value The current numeric value of the input.
 * @param props.onChange The handler called when the input value changes.
 * @returns A labeled numeric input as a JSX element.
 */
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

/**
 * Renders a labeled result value, optionally emphasizing the row.
 * @param props.k The result label.
 * @param props.v The result value to display.
 * @param props.strong Whether to emphasize the result row.
 * @returns A result row as a JSX element.
 */
function Row(props: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={"row" + (props.strong ? " strong" : "")}>
      <span>{props.k}</span>
      <span>{props.v}</span>
    </div>
  );
}