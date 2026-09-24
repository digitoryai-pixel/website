'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { getSession } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { inr, lastMonth, pct } from '@/lib/format';
import { ErrorBox, Loading, PageHeader } from '@/components/ui';

type Row = { outlet: string; netSales: number; foodCostPct: number; foodTheoPct: number; bevCostPct: number; giveaways: number; wastage: number; stockVariance: number; cashVariance: number; unbilledKot: number; purchases: number; debitNotes: number };

export default function Reports() {
  const [month, setMonth] = useState(lastMonth());
  const d = useApi<{ rows: Row[] }>('web', `/periods/${month}/mis`);
  const download = async () => {
    const res = await fetch(`/api/periods/${month}/mis?format=csv`, { headers: { authorization: `Bearer ${getSession('web')?.token ?? ''}` } });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageHeader title="Monthly MIS pack" sub="For the accountant until the Tally/Zoho export arrives in Phase 2" right={<><input type="month" className="input w-auto" value={month} onChange={(e) => setMonth(e.target.value)} /><button className="btn btn-primary" onClick={download}><Download className="h-4 w-4" />Download CSV</button></>} />
      <ErrorBox message={d.error?.message} />
      <div className="card overflow-x-auto">
        {!d.data ? <Loading /> : (
          <table className="grid-table">
            <thead><tr><th>Outlet</th><th className="r">Net sales</th><th className="r">Food cost</th><th className="r">Theory</th><th className="r">Bev cost</th><th className="r">Giveaways</th><th className="r">Wastage</th><th className="r">Stock var.</th><th className="r">Cash var.</th><th className="r">Unbilled KOT</th><th className="r">Purchases</th><th className="r">Debit notes</th></tr></thead>
            <tbody>{d.data.rows.map((r) => <tr key={r.outlet}><td className="font-medium">{r.outlet}</td><td className="r num">{inr(r.netSales)}</td><td className="r num">{pct(r.foodCostPct)}</td><td className="r num">{pct(r.foodTheoPct)}</td><td className="r num">{pct(r.bevCostPct)}</td><td className="r num">{inr(r.giveaways)}</td><td className="r num">{inr(r.wastage)}</td><td className="r num">{inr(r.stockVariance)}</td><td className="r num">{inr(r.cashVariance)}</td><td className="r num">{inr(r.unbilledKot)}</td><td className="r num">{inr(r.purchases)}</td><td className="r num">{inr(r.debitNotes)}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
