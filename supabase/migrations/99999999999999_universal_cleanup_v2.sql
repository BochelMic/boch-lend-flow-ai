-- ==========================================
-- UNIVERSAL CLEANUP MIGRATION (V2)
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Function to list all auth users (to find orphans)
CREATE OR REPLACE FUNCTION list_all_auth_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    role_meta TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        id as user_id, 
        u.email::TEXT, 
        u.created_at, 
        u.last_sign_in_at as last_login,
        u.raw_user_meta_data->>'role' as role_meta
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- 2. Advanced deep deletion function targeting auth.users.id directly
CREATE OR REPLACE FUNCTION delete_users_bulk(user_ids UUID[])
RETURNS VOID AS $$
DECLARE
    client_ids UUID[];
    client_emails TEXT[];
    client_phones TEXT[];
    loan_ids UUID[];
    request_ids UUID[];
BEGIN
    -- Collect all associated client IDs, emails, and phones based on the user_ids
    SELECT array_agg(id), array_agg(email) FILTER (WHERE email IS NOT NULL), array_agg(phone) FILTER (WHERE phone IS NOT NULL)
    INTO client_ids, client_emails, client_phones
    FROM public.clients 
    WHERE user_id = ANY(user_ids);

    -- Collect ALL emails from profiles as well
    SELECT array_agg(email) FILTER (WHERE email IS NOT NULL)
    INTO client_emails
    FROM (
        SELECT unnest(client_emails) as email
        UNION
        SELECT email FROM public.profiles WHERE id = ANY(user_ids) AND email IS NOT NULL
    ) as merged_emails;

    -- Collect related loan and request IDs
    IF client_ids IS NOT NULL THEN
        SELECT array_agg(id) INTO loan_ids FROM public.loans WHERE client_id = ANY(client_ids);
    END IF;

    SELECT array_agg(id) INTO request_ids FROM public.credit_requests 
    WHERE user_id = ANY(user_ids)
       OR (client_ids IS NOT NULL AND id IN (SELECT credit_request_id FROM public.contracts WHERE client_id = ANY(client_ids)))
       OR (client_emails IS NOT NULL AND client_email = ANY(client_emails))
       OR (client_phones IS NOT NULL AND client_phone = ANY(client_phones));

    -- CASCADE DELETES
    IF loan_ids IS NOT NULL THEN
        DELETE FROM public.payments WHERE loan_id = ANY(loan_ids);
        DELETE FROM public.wallet_ledger WHERE reference_id = ANY(loan_ids);
    END IF;

    IF client_ids IS NOT NULL THEN
        DELETE FROM public.loans WHERE client_id = ANY(client_ids);
    END IF;

    DELETE FROM public.contracts 
    WHERE (client_ids IS NOT NULL AND client_id = ANY(client_ids))
       OR (request_ids IS NOT NULL AND credit_request_id = ANY(request_ids));

    DELETE FROM public.chat_messages WHERE sender_id = ANY(user_ids) OR receiver_id = ANY(user_ids);
    DELETE FROM public.notifications WHERE user_id = ANY(user_ids) OR from_user_id = ANY(user_ids);

    DELETE FROM public.credit_requests 
    WHERE (request_ids IS NOT NULL AND id = ANY(request_ids))
       OR user_id = ANY(user_ids)
       OR (client_emails IS NOT NULL AND client_email = ANY(client_emails))
       OR (client_phones IS NOT NULL AND client_phone = ANY(client_phones));

    -- CORE RECORDS
    DELETE FROM public.profiles WHERE id = ANY(user_ids);
    DELETE FROM public.user_roles WHERE user_id = ANY(user_ids);
    DELETE FROM public.clients 
    WHERE user_id = ANY(user_ids)
       OR (client_ids IS NOT NULL AND id = ANY(client_ids))
       OR (client_emails IS NOT NULL AND email = ANY(client_emails))
       OR (client_phones IS NOT NULL AND phone = ANY(client_phones));

    -- AUTH USERS
    DELETE FROM auth.users WHERE id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
