export const clearAllData = () => {
  // Limpar todos os dados do sistema, exceto usuários cadastrados
  const keysToKeep = ['users']; // Manter apenas usuários para permitir login
  
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  // Limpar também dados de exemplo se existirem
  const dataKeys = [
    'clients',
    'payments', 
    'loans',
    'credit_requests',
    'contracts',
    'collections',
    'expenses',
    'reports'
  ];
  
  dataKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('Todos os dados foram limpos. Sistema pronto para dados reais.');
};

export const resetToRealData = () => {
  // Limpar dados de demonstração
  clearAllData();
  
  // Recarregar página para aplicar mudanças
  window.location.reload();
};