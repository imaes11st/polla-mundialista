export function StatisticsPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[
        { title: 'Marcadores exactos', value: '12' },
        { title: 'Tendencias acertadas', value: '27' },
        { title: 'Equipo favorito campeón', value: 'Brasil' },
        { title: 'Goleador favorito', value: 'Mbappé' },
      ].map((item) => (
        <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-sports">
          <p className="text-sm uppercase tracking-[0.2em] text-yellow-300">{item.title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
