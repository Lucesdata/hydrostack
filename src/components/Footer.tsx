import React from 'react';

export default function Footer() {
    return (
        <footer style={{
            padding: '2rem 0',
            marginTop: 'auto',
            borderTop: '1px solid var(--color-gray-medium)',
            textAlign: 'center',
            color: 'var(--color-foreground)'
        }}>
            <div className="container">
                <p>© {new Date().getFullYear()} HYDROSTACK. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
