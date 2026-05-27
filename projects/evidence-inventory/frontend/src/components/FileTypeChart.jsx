import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function FileTypeChart({ byExtension }) {
  const data = Object.entries(byExtension)
    .map(([ext, info]) => ({ extension: ext, archivos: info.count }))
    .sort((a, b) => b.archivos - a.archivos);

  return (
    <div className="chart-card">
      <p className="chart-card__title">Archivos por tipo</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="extension" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="archivos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FileTypeChart;
