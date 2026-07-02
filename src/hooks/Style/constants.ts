// src/hooks/Style/constants.ts
import { GlobalStyles } from './types';

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  resume: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px',
    maxWidth: '1200px',
  },
  tags: {
    section: {
      padding: '16px',
      marginBottom: '12px',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
    },
    h1: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 0 8px 0',
    },
    h2: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    h3: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 4px 0',
    },
    p: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.6',
      margin: '0',
    },
    span: {
      fontSize: '14px',
      color: '#374151',
    },
    ul: {
      listStyle: 'none',
      padding: '0',
      margin: '8px 0 0 0',
    },
    li: {
      padding: '4px 0',
      marginBottom: '4px',
    },
    i: {
      fontSize: '18px',
      color: '#3b82f6',
      marginRight: '8px',
    },
    a: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '500',
      cursor: 'pointer',
    },
    img: {
      borderRadius: '50%',
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      border: '3px solid #3b82f6',
    }
  }
};

export const STYLE_PRESETS = {
  section: {
    modern: {
      label: '✨ Modern',
      styles: {
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }
    },
    minimal: {
      label: '🌸 Minimal',
      styles: {
        padding: '16px',
        borderRadius: '0px',
        backgroundColor: 'transparent',
        borderBottom: '2px solid #e5e7eb',
      }
    },
    colorful: {
      label: '🎨 Colorful',
      styles: {
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#f0f4ff',
        border: '2px solid #6366f1',
      }
    },
    elegant: {
      label: '🌟 Elegant',
      styles: {
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: '#fafafa',
        border: '1px solid #d4d4d8',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      }
    }
  },
  heading: {
    large: {
      label: '🔤 Large',
      styles: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1f2937',
        letterSpacing: '-0.5px',
      }
    },
    elegant: {
      label: '✨ Elegant',
      styles: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#374151',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }
    },
    modern: {
      label: '💫 Modern',
      styles: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#6366f1',
        letterSpacing: '-0.3px',
      }
    }
  },
  text: {
    standard: {
      label: '📝 Standard',
      styles: {
        fontSize: '14px',
        color: '#4b5563',
        lineHeight: '1.6',
      }
    },
    large: {
      label: '📖 Large',
      styles: {
        fontSize: '16px',
        color: '#1f2937',
        lineHeight: '1.8',
      }
    },
    muted: {
      label: '🌫️ Muted',
      styles: {
        fontSize: '13px',
        color: '#9ca3af',
        lineHeight: '1.5',
      }
    }
  }
};