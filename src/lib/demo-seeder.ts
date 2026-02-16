
import { SupabaseClient } from '@supabase/supabase-js';
import { RecommendationEngine } from './recommendation-engine';
import { ViabilityEngine } from './viability-engine';
import { ProjectDomain, ProjectContext, ProjectLevel, TreatmentCategory } from '@/types/project';

export async function seedCampoalegreProject(supabase: SupabaseClient, userId: string) {
    console.log('🌱 Starting Demo Seeder for User:', userId);

    // 1. Check if project exists
    const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .eq('name', 'Campoalegre 2')
        .single();

    if (existing) {
        console.log('✅ Campoalegre 2 already exists. ID:', existing.id);
        return { success: true, projectId: existing.id, message: 'El proyecto ya existe.' };
    }

    // 2. Create Project
    const { data: project, error: createError } = await supabase
        .from('projects')
        .insert({
            user_id: userId,
            name: 'Campoalegre 2',
            description: 'Proyecto demostrativo FIME para comunidad rural en zona de ladera.',
            location: 'Campoalegre, Huila',
            project_domain: 'water_treatment',
            project_context: 'rural',
            project_level: 'complete_design',
            treatment_category: 'fime',
            status: 'En diseño',
            decision_metadata: { demo: true, created_via: 'seeder' }
        })
        .select()
        .single();

    if (createError || !project) {
        console.error('❌ Error creating project:', createError);
        throw new Error('Failed to create demo project.');
    }

    const projectId = project.id;
    console.log('✨ Project created:', projectId);

    // 3. Populate Tables (Parallel execution for speed)
    const timestamp = new Date().toISOString();

    const tasks = [
        // A. Viability Matrix
        supabase.from('project_viability_matrix').insert({
            project_id: projectId,
            settlement_type: 'rural_concentrado',
            population_range: 'medium',
            community_organization: 'high',
            operator_availability: 'low',
            energy_access: 'partial',
            chemical_access: 'low',
            maintenance_capacity: 'medium',
            capex_tolerance: 'high',
            opex_tolerance: 'low',
            project_horizon: 20,
            source_quality: 'fair',
            climate_variability: 'medium',
            environmental_sensitivity: 'high',
            selected_technology: 'fime',
            results: ViabilityEngine.calculateViability('water_treatment', {
                settlement_type: 'rural_concentrado',
                population_range: 'medium',
                community_organization: 'high',
                operator_availability: 'low',
                energy_access: 'partial',
                chemical_access: 'low',
                maintenance_capacity: 'medium',
                capex_tolerance: 'high',
                opex_tolerance: 'low',
                project_horizon: 20,
                source_quality: 'fair',
                climate_variability: 'medium',
                environmental_sensitivity: 'high'
            })
        }),

        // B. Module Statuses
        supabase.from('project_module_status').insert(
            RecommendationEngine.initializeModuleStatuses(projectId, 'water_treatment', 'rural', 'complete_design', 'fime')
        ),

        // C. Population
        supabase.from('project_population').insert({
            project_id: projectId,
            current_population: 2500,
            growth_rate: 1.5,
            design_population: 3367, // Calculated for 20 years
            method: 'geometric',
            updated_at: timestamp
        }),

        // D. Consumption
        supabase.from('project_consumption').insert({
            project_id: projectId,
            dotacion_neta: 120,
            dotacion_bruta: 160, // 25% losses
            loss_percentage: 25,
            climate: 'warm',
            updated_at: timestamp
        }),

        // E. Sources
        supabase.from('project_sources').insert({
            project_id: projectId,
            sources: [
                { type: 'superficial', name: 'Río Neiva', flow_lps: 45, reliability: 'high', is_permanent: true }
            ],
            total_supply_lps: 45,
            updated_at: timestamp
        }),

        // F. Water Quality (Requires PFD + FGAC + FLA)
        supabase.from('project_water_quality').insert({
            project_id: projectId,
            turbidity: 45, // Requires PFD (optional) + FGAC + FLA
            color: 25,
            ph: 7.2,
            fecal_coliforms: 1200,
            iron: 0.5,
            alkalinity: 60,
            hardness: 50,
            updated_at: timestamp
        }),

        // G. Calculations (Flows)
        supabase.from('project_calculations').insert({
            project_id: projectId,
            calculated_flows: {
                qmd_max: 8.5, // Approx for 3367 hab
                qmh_max: 12.5,
                q_ecological: 5.0
            },
            updated_at: timestamp
        }),

        // H. Treatment Selection (FIME modules)
        supabase.from('project_desarenador').insert({
            project_id: projectId,
            has_desarenador: true,
            length: 4.5,
            width: 1.2,
            depth: 1.5,
            retention_time: 20, // min
            updated_at: timestamp
        }),

        supabase.from('project_pfd').insert({ // Prefiltro Dinámico
            project_id: projectId,
            number_of_modules: 1,
            filtration_velocity: 3.0,
            media_type: 'grava',
            updated_at: timestamp
        }),

        supabase.from('project_filtros_gruesos').insert({ // FGAC
            project_id: projectId,
            number_of_units: 2,
            filtration_velocity: 0.45,
            type: 'ascendente',
            updated_at: timestamp
        }),

        supabase.from('project_filtros_lentos').insert({ // FLA
            project_id: projectId,
            number_of_units: 3,
            filtration_velocity: 0.15,
            media_depth: 0.9,
            updated_at: timestamp
        }),

        supabase.from('project_disinfection').insert({
            project_id: projectId,
            method: 'chlorine',
            contact_time: 30,
            chlorine_dose: 2.0,
            updated_at: timestamp
        }),

        // I. OpEx
        supabase.from('project_opex').insert({
            project_id: projectId,
            energy_monthly_cost: 250000,
            operator_monthly_salary: 1300000,
            alum_price_per_kg: 1500,
            chlorine_price_per_kg: 8000,
            updated_at: timestamp
        })
    ];

    await Promise.all(tasks);

    console.log('🚀 Demo project seeded successfully!');
    return { success: true, projectId, message: 'Proyecto demo creado exitosamente.' };
}
