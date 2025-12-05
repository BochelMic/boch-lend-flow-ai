export const loadSampleData = () => {
  // Verificar se já existem dados
  const existingClients = localStorage.getItem('clients');
  if (existingClients) {
    return { success: false, message: 'Já existem dados no sistema.' };
  }

  // Clientes de exemplo
  const sampleClients = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      phone: '+258 84 123 4567',
      document: '123456789',
      address: 'Bairro Central, Maputo',
      status: 'active',
      createdAt: new Date('2024-01-15').toISOString()
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      phone: '+258 85 987 6543',
      document: '987654321',
      address: 'Bairro Sommerschield, Maputo',
      status: 'active',
      createdAt: new Date('2024-02-20').toISOString()
    },
    {
      id: '3',
      name: 'Carlos Machado',
      email: 'carlos@exemplo.com',
      phone: '+258 86 555 1234',
      document: '555123456',
      address: 'Bairro Polana, Maputo',
      status: 'active',
      createdAt: new Date('2024-03-10').toISOString()
    }
  ];

  // Empréstimos de exemplo
  const sampleLoans = [
    {
      id: '1',
      clientId: '1',
      clientName: 'João Silva',
      amount: 50000,
      interestRate: 25,
      term: 12,
      monthlyPayment: 5208,
      startDate: new Date('2024-02-01').toISOString(),
      status: 'active',
      balance: 35000,
      paid: 15000
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Maria Santos',
      amount: 30000,
      interestRate: 25,
      term: 6,
      monthlyPayment: 6250,
      startDate: new Date('2024-03-01').toISOString(),
      status: 'active',
      balance: 25000,
      paid: 5000
    },
    {
      id: '3',
      clientId: '3',
      clientName: 'Carlos Machado',
      amount: 100000,
      interestRate: 25,
      term: 24,
      monthlyPayment: 5208,
      startDate: new Date('2024-01-01').toISOString(),
      status: 'completed',
      balance: 0,
      paid: 100000
    }
  ];

  // Pedidos de crédito de exemplo
  const sampleRequests = [
    {
      id: '1',
      requestNumber: 'CR-2024-001',
      name: 'Ana Costa',
      email: 'ana@exemplo.com',
      phone: '+258 87 111 2222',
      amount: 75000,
      purpose: 'Expansão de negócio',
      status: 'pending',
      createdAt: new Date('2024-11-25').toISOString()
    },
    {
      id: '2',
      requestNumber: 'CR-2024-002',
      name: 'Pedro Lopes',
      email: 'pedro@exemplo.com',
      phone: '+258 84 333 4444',
      amount: 40000,
      purpose: 'Capital de giro',
      status: 'approved',
      createdAt: new Date('2024-11-20').toISOString()
    }
  ];

  // Pagamentos de exemplo
  const samplePayments = [
    {
      id: '1',
      loanId: '1',
      clientName: 'João Silva',
      amount: 5208,
      date: new Date('2024-11-01').toISOString(),
      status: 'completed',
      method: 'Transferência'
    },
    {
      id: '2',
      loanId: '2',
      clientName: 'Maria Santos',
      amount: 6250,
      date: new Date('2024-11-15').toISOString(),
      status: 'completed',
      method: 'Dinheiro'
    }
  ];

  // Salvar tudo no localStorage
  localStorage.setItem('clients', JSON.stringify(sampleClients));
  localStorage.setItem('loans', JSON.stringify(sampleLoans));
  localStorage.setItem('credit_requests', JSON.stringify(sampleRequests));
  localStorage.setItem('payments', JSON.stringify(samplePayments));

  return { success: true, message: 'Dados de exemplo carregados com sucesso!' };
};

export const clearSampleData = () => {
  // Remove apenas os dados, mantém usuários
  const dataKeys = [
    'clients',
    'payments', 
    'loans',
    'credit_requests',
    'contracts',
    'collections',
    'expenses',
    'reports',
    'chat_messages',
    'agents_data'
  ];
  
  dataKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  return { success: true, message: 'Dados de exemplo removidos com sucesso!' };
};
