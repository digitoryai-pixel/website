'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAction } from '@/lib/hooks';
import { ErrorBox, Explainer, PageHeader } from '@/components/ui';

type Answer = { answer: string; citations: { type: string; id: string; label: string }[]; table: { columns: string[]; rows: (string | number | null)[][] } | null };
type Turn = { q: string; a?: Answer };
const HREF: Record<string, (id: string) => string> = { exception: (id) => `/exceptions/${id}`, invoice: () => '/purchases', countTask: (id) => `/counts/${id}`, kot: () => '/kot', bill: () => '/giveaways', wastage: () => '/wastage', transfer: () => '/wastage', cashShift: () => '/cash' };
const EXAMPLES = ['Why did food cost go up at Koramangala yesterday?', 'Show refunds this week where the refund mode differs from how the guest paid', 'Who was on the bar at Indiranagar yesterday?', 'Which vendor invoices are on hold and why?'];

export default function Ask() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState('');
  const act = useAction();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [turns]);
  const ask = async (question: string) => {
    if (!question.trim()) return;
    setQ('');
    setTurns((t) => [...t, { q: question }]);
    const a = await act.run(() => api<Answer>('web', '/ask', { body: { question } }));
    setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, a: a ?? { answer: 'Could not answer that.', citations: [], table: null } } : x)));
  };
  return (
    <>
      <PageHeader title="Ask Controller" sub="Answers from your Digitory data only" />
      <div className="card flex min-h-[60vh] flex-col">
        <div className="flex-1 space-y-5 p-5">
          {turns.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Ask what you would ask a controller. For example:</p>
              {EXAMPLES.map((e) => <button key={e} onClick={() => ask(e)} className="block rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50">{e}</button>)}
            </div>
          )}
          {turns.map((t, i) => (
            <div key={i} className="space-y-2">
              <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-navy px-4 py-2 text-sm text-white">{t.q}</div>
              {!t.a ? <div className="text-sm text-slate-500">Looking at your data…</div> : (
                <div className="max-w-[90%] space-y-3 rounded-2xl rounded-bl-sm bg-slate-50 px-4 py-3 text-sm">
                  <p className="whitespace-pre-wrap">{t.a.answer}</p>
                  {t.a.table && (
                    <div className="overflow-x-auto rounded border bg-white">
                      <table className="grid-table"><thead><tr>{t.a.table.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{t.a.table.rows.map((r, j) => <tr key={j}>{r.map((v, k) => <td key={k}>{v}</td>)}</tr>)}</tbody></table>
                    </div>
                  )}
                  {t.a.citations.length > 0 && <div className="flex flex-wrap gap-1.5">{t.a.citations.map((c) => <Link key={c.type + c.id} href={(HREF[c.type] ?? (() => '#'))(c.id)} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-navy hover:border-brand">{c.label}</Link>)}</div>}
                </div>
              )}
            </div>
          ))}
          <div ref={end} />
        </div>
        <ErrorBox message={act.error} />
        <form className="flex gap-2 border-t border-slate-100 p-3" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
          <input className="input" placeholder="Ask about sales, stock, costs, vendors or staff…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary" disabled={act.busy || !q.trim()}><Send className="h-4 w-4" />Ask</button>
        </form>
      </div>
      <Explainer>
        <p>Every figure links to its source records. The assistant explains and suggests; it cannot approve, adjust stock or close exceptions. Scoped to your outlets and permissions.</p>
        <p>The same assistant answers on WhatsApp for owners who won&apos;t open a dashboard.</p>
      </Explainer>
    </>
  );
}
