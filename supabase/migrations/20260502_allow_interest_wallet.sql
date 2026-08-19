-- Migration to allow 'interest' and 'penalty' transaction types in the wallet ledger
ALTER TABLE public.wallet_ledger DROP CONSTRAINT IF EXISTS wallet_ledger_transaction_type_check; 
ALTER TABLE public.wallet_ledger 
  ADD CONSTRAINT wallet_ledger_transaction_type_check 
  CHECK (transaction_type IN ('injection', 'disbursement', 'repayment', 'interest', 'penalty'));
