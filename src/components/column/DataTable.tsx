export default function DataTable({
  caption,
  headers,
  rows,
  note,
}: {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
  note?: string;
}) {
  return (
    <figure className="my-6">
      <figcaption className="mb-2 text-sm font-bold text-slate-200">{caption}</figcaption>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-slate-900">
            <tr>
              {headers.map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-3 py-2 text-left font-bold text-slate-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-800 odd:bg-slate-950 even:bg-slate-900/40">
                {row.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="whitespace-nowrap px-3 py-2 text-left font-bold text-white">
                      {cell}
                    </th>
                  ) : (
                    <td key={j} className="whitespace-nowrap px-3 py-2 tabular-nums text-slate-200">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="mt-2 text-xs leading-relaxed text-slate-500">{note}</p>}
    </figure>
  );
}
