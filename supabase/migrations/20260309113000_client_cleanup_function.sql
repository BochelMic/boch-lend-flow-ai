-- Create a function to handle bulk client deletion with manual cascading
-- This ensures all related data is wiped out when a test client is removed.

CREATE OR REPLACE FUNCTION delete_clients_bulk(client_ids UUID[])
RETURNS VOID AS $$
DECLARE
    client_user_ids UUID[];
BEGIN
    -- Get user_ids for later cleanup from auth or profiles
    SELECT array_agg(user_id) INTO client_user_ids FROM public.clients WHERE id = ANY(client_ids) AND user_id IS NOT NULL;

    -- 1. Delete Payments associated with those clients' loans
    DELETE FROM public.payments 
    WHERE loan_id IN (
        SELECT id FROM public.loans 
        WHERE client_id = ANY(client_ids)
    );

    -- 2. Delete Loans
    DELETE FROM public.loans 
    WHERE client_id = ANY(client_ids);

    -- 3. Delete Contracts
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.contracts 
        WHERE client_id = ANY(client_user_ids);
    END IF;

    -- 4. Delete Chat Messages (sent or received)
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.chat_messages 
        WHERE sender_id = ANY(client_user_ids) OR receiver_id = ANY(client_user_ids);
    END IF;

    -- 5. Delete Notifications
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.notifications 
        WHERE user_id = ANY(client_user_ids) OR from_user_id = ANY(client_user_ids);
    END IF;

    -- 6. Delete Credit Requests
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.credit_requests 
        WHERE user_id = ANY(client_user_ids);
    END IF;

    -- 7. Delete Profiles
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.profiles 
        WHERE user_id = ANY(client_user_ids);
    END IF;

    -- 8. Delete User Roles
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.user_roles 
        WHERE user_id = ANY(client_user_ids);
    END IF;

    -- 9. Delete Client records
    DELETE FROM public.clients 
    WHERE id = ANY(client_ids);

    -- 10. Finally Delete Auth Users (requires SECURITY DEFINER)
    -- This will also trigger cascading deletes in profiles and user_roles 
    -- if not already deleted by the steps above.
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM auth.users 
        WHERE id = ANY(client_user_ids);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
