
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', entrada: 240000, saida: 180000 },
  { month: 'Fev', entrada: 280000, saida: 200000 },
  { month: 'Mar', entrada: 320000, saida: 240000 },
  { month: 'Abr', entrada: 350000, saida: 260000 },
  { month: 'Mai', entrada: 380000, saida: 290000 },
  { month: 'Jun', entrada: 420000, saida: 310000 },
];

const CashFlowChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`MZN ${value.toLocaleString()}`, '']}
        />
        <Line type="monotone" dataKey="entrada" stroke="#10b981" strokeWidth={2} name="Entradas" />
        <Line type="monotone" dataKey="saida" stroke="#ef4444" strokeWidth={2} name="Saídas" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
