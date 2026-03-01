
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface MonthData {
  month: string;
  entrada: number;
  saida: number;
}

const CashFlowChart = () => {
  const [data, setData] = useState<MonthData[]>([]);

  useEffect(() => {
    loadCashFlow();
  }, []);

  const loadCashFlow = async () => {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      // Pagamentos recebidos (entradas)
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .gte('payment_date', sixMonthsAgo.toISOString().split('T')[0]);

      // Empréstimos desembolsados (saídas)
      const { data: loans } = await supabase
        .from('loans')
        .select('amount, created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      const months: MonthData[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        const monthPayments = payments?.filter(p => {
          const pd = new Date(p.payment_date);
          return `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}` === monthKey;
        }) || [];

        const monthLoans = loans?.filter(l => {
          const ld = new Date(l.created_at);
          return `${ld.getFullYear()}-${String(ld.getMonth() + 1).padStart(2, '0')}` === monthKey;
        }) || [];

        months.push({
          month: monthNames[d.getMonth()],
          entrada: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
          saida: monthLoans.reduce((sum, l) => sum + Number(l.amount), 0),
        });
      }

      setData(months);
    } catch (error) {
      console.error('Error loading cash flow:', error);
      // Fallback to empty data
      setData([
        { month: 'Jan', entrada: 0, saida: 0 },
        { month: 'Fev', entrada: 0, saida: 0 },
        { month: 'Mar', entrada: 0, saida: 0 },
        { month: 'Abr', entrada: 0, saida: 0 },
        { month: 'Mai', entrada: 0, saida: 0 },
        { month: 'Jun', entrada: 0, saida: 0 },
      ]);
    }
  };

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
