
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Clientes Fiéis', value: 75, color: '#10b981' },
  { name: 'Risco Baixo', value: 15, color: '#3b82f6' },
  { name: 'Risco Médio', value: 8, color: '#f59e0b' },
  { name: 'Risco Alto', value: 2, color: '#ef4444' },
];

const RiskAnalysis = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RiskAnalysis;
