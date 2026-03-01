// Sample data functions are no longer needed.
// Data is now managed through Supabase.

export const loadSampleData = () => {
  return { success: false, message: 'Dados são geridos pelo Supabase. Não é necessário carregar dados de exemplo.' };
};

export const clearSampleData = () => {
  return { success: true, message: 'Dados de exemplo já não são utilizados.' };
};
