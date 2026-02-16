import { useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Hook centralizado para crear una instancia memoizada del cliente Supabase.
 * Evita recrear el cliente en cada render.
 */
export function useSupabase() {
    return useMemo(() => createClient(), []);
}
