# 🛡️ AI Guard Protocol (Safety Skill)

> **Purpose**: Prevent data loss, lockout, or UI regressions caused by faulty RLS policies or Storage configurations.

---

## 🚫 Forbidden Patterns
-   **No Auth Subqueries**: NEVER use `(SELECT ... FROM auth.users ...)` in RLS policies. It requires elevated permissions and causes total data lockout for standard users. Use `auth.jwt()` instead.
-   **No Destructive Drops**: Before dropping a policy with a generic name (e.g., "Users can view..."), verify it doesn't cover multiple roles.
-   **No Single-Role focus**: When fixing a problem for a 'client', never forget to explicitly maintain or add access for 'agent', 'gestor', and 'admin'.

## ✅ Mandatory Rules
1.  **Auth Metadata**: Always use `auth.jwt() ->> 'email'` or `auth.jwt() ->> 'role'` for identity checks.
2.  **Fallback Access**: Every sensitive table must have an explicit "Overlord" policy for 'gestor' and 'admin' roles:
    ```sql
    CREATE POLICY "Admin full access" ON table_name FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') IN ('gestor', 'admin'));
    ```
3.  **Storage Isolation**: Use `(storage.foldername(name))[1] = auth.uid()::text` for private user folders.
4.  **Graceful Code**: Frontend code must use `.maybeSingle()` and silent `.catch()`/`.then()` for non-critical sync operations to prevent UI crashes on RLS errors.

## 🏁 Verification Checklist
- [ ] Did I use `auth.jwt()` instead of a subquery?
- [ ] Do Agents still see their clients?
- [ ] Do Managers still see EVERYTHING?
- [ ] Does the UI handle a potential 403/404 without crashing?
