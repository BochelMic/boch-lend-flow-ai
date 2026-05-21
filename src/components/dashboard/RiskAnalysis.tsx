
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface RiskData {
  name: string;
  value: number;
  color: string;
}

const RiskAnalysis = () => {
  const [data, setData] = useState<RiskData[]>([]);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      const { data: rawLoans } = await supabase
        .from('loans')
        .select('status, end_date, remaining_amount');

      if (!rawLoans || rawLoans.length === 0) {
        setData([
          { name: 'Sem Dados', value: 100, color: '#d1d5db' },
        ]);
        return;
      }

      const loans = rawLoans.map((l: any) => {
        let status = l.status;
        if (l.end_date && Number(l.remaining_amount) > 0 && (status === 'active' || status === 'overdue')) {
          const end = new Date(l.end_date);
          const today = new Date();
          const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
          const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          status = endDateOnly >= todayDateOnly ? 'active' : 'overdue';
        }
        return { ...l, status };
      });

      const active = loans.filter(l => l.status === 'active').length;
      const pending = loans.filter(l => l.status === 'pending').length;
      const completed = loans.filter(l => l.status === 'completed').length;
      const overdue = loans.filter(l => l.status === 'overdue').length;

      const result: RiskData[] = [];
      if (active > 0) result.push({ name: 'Ativos', value: active, color: '#10b981' });
      if (pending > 0) result.push({ name: 'Pendentes', value: pending, color: '#f59e0b' });
      if (completed > 0) result.push({ name: 'Completados', value: completed, color: '#3b82f6' });
      if (overdue > 0) result.push({ name: 'Em Atraso', value: overdue, color: '#ef4444' });

      if (result.length === 0) {
        result.push({ name: 'Sem Dados', value: 100, color: '#d1d5db' });
      }

      setData(result);
    } catch (error) {
      console.error('Error loading risk data:', error);
      setData([{ name: 'Erro', value: 100, color: '#d1d5db' }]);
    }
  };

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
