import { useState, type FormEvent } from "react";
import { useApp } from "../../hooks/useAppState";
import { useToast } from "../../hooks/useToast";
import { monthLabel, todayKey } from "../../lib/date";
import { insertAt } from "../../lib/collections";
import { computeFinance, SAMPLE_FINANCE } from "../../lib/finance";
import { eur } from "../../lib/money";
import { uid } from "../../lib/storage";
import type { FinanceEntry } from "../../types";

export function EntriesCard() {
  const { state, update } = useApp();
  const { show } = useToast();
  const currentMonth = todayKey().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [net, setNet] = useState("");

  const netByMonth = new Map(computeFinance(state.finance).map(r => [r.month, r.net]));
  const entries = [...state.finance].sort((a, b) => (a.month < b.month ? 1 : -1));

  const addEntry = (e: FormEvent) => {
    e.preventDefault();
    if (!month) return;
    const entry: FinanceEntry = {
      id: uid(),
      month,
      income: Number(income) || 0,
      expenses: Number(expenses) || 0,
      net: net === "" ? null : Number(net),
    };
    update(s => ({
      ...s,
      finance: [...s.finance.filter(f => f.month !== month), entry],
    }));
    setMonth(currentMonth);
    setIncome("");
    setExpenses("");
    setNet("");
  };

  const remove = (id: string) => {
    const index = state.finance.findIndex(f => f.id === id);
    const entry = state.finance[index];
    if (!entry) return;
    update(s => ({ ...s, finance: s.finance.filter(f => f.id !== id) }));
    show(`Entry for ${monthLabel(entry.month, "long")} deleted`, () =>
      update(s => ({ ...s, finance: insertAt(s.finance, index, entry) })),
    );
  };

  const loadSample = () =>
    update(s => ({
      ...s,
      finance: SAMPLE_FINANCE.map(([m, inc, exp, n]) => ({
        id: uid(),
        month: m,
        income: inc,
        expenses: exp,
        net: n,
      })),
    }));

  return (
    <section className="card">
      <h2>Monthly entries</h2>
      <form className="row-form" onSubmit={addEntry}>
        <input type="month" required title="Month" value={month} onChange={e => setMonth(e.target.value)} />
        <input
          type="number"
          placeholder="Income €"
          min={0}
          step="0.01"
          required
          value={income}
          onChange={e => setIncome(e.target.value)}
        />
        <input
          type="number"
          placeholder="Expenses €"
          min={0}
          step="0.01"
          required
          value={expenses}
          onChange={e => setExpenses(e.target.value)}
        />
        <input
          type="number"
          placeholder="Net worth € (optional)"
          step="0.01"
          title="Leave empty to carry it forward automatically"
          value={net}
          onChange={e => setNet(e.target.value)}
        />
        <button className="btn" type="submit">
          Save
        </button>
      </form>
      {entries.length === 0 ? (
        <div className="fin-table-wrap">
          <p className="empty">No entries yet — add your first month above, or explore with sample data.</p>
          <button className="btn-ghost" onClick={loadSample}>
            Load sample data
          </button>
        </div>
      ) : (
        <div className="fin-table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Net</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td>{monthLabel(e.month, "long")}</td>
                  <td>{eur(e.income)}</td>
                  <td>{eur(e.expenses)}</td>
                  <td>{eur(netByMonth.get(e.month) ?? 0)}</td>
                  <td>
                    <button className="icon-btn" onClick={() => remove(e.id)} title="Delete">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
