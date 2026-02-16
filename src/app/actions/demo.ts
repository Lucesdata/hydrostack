"use server";

import { createClient } from '@/utils/supabase/server';
import { seedCampoalegreProject } from '@/lib/demo-seeder';
import { revalidatePath } from 'next/cache';

export async function seedDemoProject() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Usuario no autenticado' };
    }

    try {
        const result = await seedCampoalegreProject(supabase, user.id);
        revalidatePath('/dashboard');
        return result;
    } catch (error: any) {
        console.error('Error in seedDemoProject:', error);
        return { success: false, message: error.message || 'Error al crear proyecto demo' };
    }
}
