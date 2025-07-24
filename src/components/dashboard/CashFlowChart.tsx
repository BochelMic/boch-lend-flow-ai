
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', entrada: 0, saida: 0 },
  { month: 'Fev', entrada: 0, saida: 0 },
  { month: 'Mar', entrada: 0, saida: 0 },
  { month: 'Abr', entrada: 0, saida: 0 },
  { month: 'Mai', entrada: 0, saida: 0 },
  { month: 'Jun', entrada: 0, saida: 0 },
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
