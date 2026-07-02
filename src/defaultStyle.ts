import { CSSProperties } from "react";

export const defaultStyles : Record<string, CSSProperties>= {
    h1: {
        fontSize: '2.5rem',
        fontWeight: '700',
        lineHeight: '1.2',
        marginBottom: '1rem',
        color: '#1a202c',
        letterSpacing: '-0.02em',
    },
    h2: {
        fontSize: '2rem',
        fontWeight: '600',
        lineHeight: '1.3',
        marginBottom: '0.875rem',
        color: '#1a202c',
        letterSpacing: '-0.01em',
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: '600',
        lineHeight: '1.4',
        marginBottom: '0.75rem',
        color: '#2d3748',
    },
    h4: {
        fontSize: '1.5rem',
        fontWeight: '500',
        lineHeight: '1.4',
        marginBottom: '0.625rem',
        color: '#2d3748',
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: '500',
        lineHeight: '1.5',
        marginBottom: '0.5rem',
        color: '#4a5568',
    },
    h6: {
        fontSize: '1.125rem',
        fontWeight: '500',
        lineHeight: '1.5',
        marginBottom: '0.5rem',
        color: '#4a5568',
    },
    section: {
        display: 'block',
        padding: '1.5rem',
        // marginBottom: '1.5rem',
        backgroundColor: '#ffffff',
        // borderRadius: '0.5rem',
        // boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        // border: '1px solid #e2e8f0',
    },
    div: {
        display: 'block',
        boxSizing: 'border-box',
    },
    span: {
        display: 'inline',
    },
    p: {
        fontSize: '1rem',
        lineHeight: '1.6',
        marginBottom: '1rem',
        color: '#4a5568',
    },
    a: {
        color: '#3182ce',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        cursor: 'pointer',
    },
    svg: {
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: '0',
    },
    ul: {
        listStyle: 'disc',
        padding: '0',
        margin: '0 0 1rem 0',
    },
    li: {
        gap:"5px",
        padding: '0.5rem 0',
        borderBottom: '1px solid #f7fafc',
        display:"flex",
        flexDirection:"column",
        alignItems:"start"
    },
    img: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #e2e8f0',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }
};
export function getStyles(elementType: keyof typeof defaultStyles) {
    return defaultStyles[elementType] || {};
}
export default defaultStyles;