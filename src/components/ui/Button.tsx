import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
    loading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    loading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : (variant === 'secondary' ? 'btn-secondary' : 'btn-outline');

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="spinner" style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></span>
            )}
            {children}
        </button>
    );
}

