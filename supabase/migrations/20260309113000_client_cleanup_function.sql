-- IMPROVED: Function to handle bulk client deletion with deep sweep
-- This ensures ALL traces of a client are removed by sweeping by ID, Email, and Phone.

CREATE OR REPLACE FUNCTION delete_clients_bulk(client_ids UUID[])
RETURNS VOID AS $$
DECLARE
    client_user_ids UUID[];
    client_emails TEXT[];
    client_phones TEXT[];
    loan_ids UUID[];
    request_ids UUID[];
BEGIN
    -- 0. Collect all relevant identifiers for a thorough sweep
    SELECT array_agg(user_id) FILTER (WHERE user_id IS NOT NULL) INTO client_user_ids FROM public.clients WHERE id = ANY(client_ids);
    SELECT array_agg(email) FILTER (WHERE email IS NOT NULL) INTO client_emails FROM public.clients WHERE id = ANY(client_ids);
    SELECT array_agg(phone) FILTER (WHERE phone IS NOT NULL) INTO client_phones FROM public.clients WHERE id = ANY(client_ids);
    
    SELECT array_agg(id) INTO loan_ids FROM public.loans WHERE client_id = ANY(client_ids);
    SELECT array_agg(id) INTO request_ids FROM public.credit_requests 
    WHERE id IN (SELECT credit_request_id FROM public.contracts WHERE client_id = ANY(client_ids))
       OR user_id = ANY(client_user_ids)
       OR client_email = ANY(client_emails)
       OR client_phone = ANY(client_phones);

    -- 1. Delete Payments
    IF loan_ids IS NOT NULL THEN
        DELETE FROM public.payments WHERE loan_id = ANY(loan_ids);
        
        -- Delete Wallet Ledger entries related to these loans or payments
        DELETE FROM public.wallet_ledger WHERE reference_id = ANY(loan_ids);
    END IF;

    -- 2. Delete Loans
    DELETE FROM public.loans WHERE client_id = ANY(client_ids);

    -- 3. Delete Contracts (Fixed logic: map to client_id or request_id)
    DELETE FROM public.contracts 
    WHERE client_id = ANY(client_ids) 
       OR credit_request_id = ANY(request_ids);

    -- 4. Delete Chat Messages (by user_id)
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.chat_messages 
        WHERE sender_id = ANY(client_user_ids) OR receiver_id = ANY(client_user_ids);
    END IF;

    -- 5. Delete Notifications (by user_id)
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.notifications 
        WHERE user_id = ANY(client_user_ids) OR from_user_id = ANY(client_user_ids);
    END IF;

    -- 6. Delete Credit Requests (Enhanced sweep)
    DELETE FROM public.credit_requests 
    WHERE id = ANY(request_ids)
       OR user_id = ANY(client_user_ids)
       OR client_email = ANY(client_emails)
       OR client_phone = ANY(client_phones);

    -- 7. Delete Profiles
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.profiles WHERE user_id = ANY(client_user_ids);
    END IF;

    -- 8. Delete User Roles
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.user_roles WHERE user_id = ANY(client_user_ids);
    END IF;

    -- 9. Delete Clients (sweep by ID and email/phone to catch duplicates)
    DELETE FROM public.clients 
    WHERE id = ANY(client_ids)
       OR email = ANY(client_emails)
       OR phone = ANY(client_phones);

    -- 10. Finally Delete Auth Users (using service_role privileges via SECURITY DEFINER)
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = ANY(client_user_ids);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
