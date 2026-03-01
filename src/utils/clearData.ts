// Data cleanup utilities
// Data is now managed in Supabase, these functions clear localStorage preferences only.

export const clearAllData = () => {
  // Only clear non-essential localStorage keys (not auth or PWA preferences)
  const keysToKeep = ['sb-', 'pwa-install-dismissed', 'profile-photo'];

  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    const shouldKeep = keysToKeep.some(prefix => key.startsWith(prefix));
    if (!shouldKeep) {
      localStorage.removeItem(key);
    }
  });

  console.log('Dados locais limpos. Dados do Supabase permanecem intactos.');
};

export const clearAllTestData = () => {
  // Clear local preferences only
  clearAllData();
  console.log('Dados de preferências locais limpos.');
};

export const resetToRealData = () => {
  clearAllData();
  window.location.reload();
};