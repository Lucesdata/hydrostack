import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
    const widthClass = fullWidth ? 'w-full' : '';

    // Note: fullWidth implementation requires a utility or inline style if not using Tailwind.
    // I'll add a style for it or just handle it via className.
    // Let's rely on standard CSS in globals.css for basic button styles, 
    // but for fullWidth I might need to append a class or style.
    // Given I didn't add .w-full in global css, I'll add inline style for safety or a specific class if I added it.
    // I didn't add w-full, so I'll use inline style for now or add it to globals later.

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            style={{ width: fullWidth ? '100%' : 'auto' }}
            {...props}
        >
            {children}
        </button>
    );
}
