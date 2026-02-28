import { redirect } from 'next/navigation';

/**
 * Standalone selector route — redirects to dashboard.
 * The selector is now project-scoped at /dashboard/projects/[id]/selector
 */
export default function SelectorRedirect() {
    redirect('/dashboard');
}
