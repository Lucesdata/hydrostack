import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    id: string;
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
    return (
        <div className="input-group">
            {label && <label htmlFor={id} className="label">{label}</label>}
            <input
                id={id}
                className={`input ${error ? 'input-error' : ''} ${className}`}
                {...props}
            />
            {error && <span style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
        </div>
    );
}
