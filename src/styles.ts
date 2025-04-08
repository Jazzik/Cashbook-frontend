// Remove unused import
// import { Theme } from '@mui/material/styles';

// Card dimensions
export const CARD_DIMENSIONS = {
    topCardHeight: '320px',
    bottomCardHeight: '320px',
    cardBorderRadius: '12px',
    cardPadding: '8px',
    cardHoverTransform: 'scale(1.02)',
    cardTransition: 'transform 0.3s ease',
};

// Layout dimensions
export const LAYOUT_DIMENSIONS = {
    columnWidths: {
        first: 'auto',
        second: 'auto',
        third: 'auto',
        fourth: 'auto',
    },
    gap: '10px',
    minWidth: '600px',
    marginTop: '10px',
    marginLeft: '10px',
};

// Button styles
export const BUTTON_STYLES = {
    root: {
        padding: '4px 30px',
        minWidth: '100px',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [],
    },
    small: {
        fontSize: '0.3rem',
        padding: '3px 6px',
        variants: [],
    },
};

// Dialog styles
export const DIALOG_STYLES = {
    borderRadius: '16px',
    contentPadding: '24px 32px',
    actionsPadding: '16px 32px',
    maxWidth: '600px',
};

// TextField styles
export const TEXT_FIELD_STYLES = {
    input: {
        textAlign: 'center' as const,
        fontWeight: 'bold',
        fontSize: '1.2rem',
        padding: '12px 16px',
    },
    height: '48px',
    modal: {
        '& .MuiOutlinedInput-root': {
            height: '56px',
            fontSize: '1.2rem',
            '& input': {
                padding: '12px 16px',
            },
        },
        '& .MuiInputLabel-root': {
            fontSize: '1.1rem',
        },
    },
    denomination: {
        '& .MuiOutlinedInput-root': {
            height: '40px',
            fontSize: '1.1rem',
            '& input': {
                padding: '8px 12px',
                textAlign: 'center',
                fontWeight: 'bold',
            },
            '& fieldset': {
                borderWidth: '1px',
            },
        },
    },
};

// Chip styles
export const CHIP_STYLES = {
    root: {
        height: '28px',
        variants: [],
    },
    label: {
        padding: '0 8px',
    },
};

// List styles
export const LIST_STYLES = {
    itemPadding: '4px 8px',
};

// Color functions
export const getGradientColors = (baseColor: string) => {
    if (!baseColor) {
        baseColor = '#1976d2'; // Default color if none provided
    }

    const darkerColor = baseColor.replace(
        /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i,
        (_, r, g, b) => {
            const darken = (hex: string) => {
                return Math.max(0, parseInt(hex, 16) - 30)
                    .toString(16)
                    .padStart(2, '0');
            };
            return `#${darken(r)}${darken(g)}${darken(b)}`;
        }
    );

    return `linear-gradient(to right bottom, ${baseColor}, ${darkerColor})`;
};

export const getMainColor = (color: string = 'primary') => {
    const colors: { [key: string]: string } = {
        primary: '#1976d2',
        secondary: '#c2185b',
        success: '#388e3c',
        error: '#d32f2f',
        info: '#0288d1',
        warning: '#f57c00',
    };
    return colors[color] || colors.primary;
};

// Theme overrides
export const themeOverrides = {
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: '4px 8px',
                    minWidth: '100px',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box',
                    variants: [],
                },
                sizeSmall: {
                    fontSize: '0.8rem',
                    padding: '3px 6px',
                    variants: [],
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    padding: CARD_DIMENSIONS.cardPadding,
                    boxSizing: 'border-box',
                    variants: [],
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: DIALOG_STYLES.contentPadding,
                    variants: [],
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: DIALOG_STYLES.actionsPadding,
                    variants: [],
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    padding: LIST_STYLES.itemPadding,
                    variants: [],
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    height: CHIP_STYLES.root.height,
                    variants: [],
                },
                label: CHIP_STYLES.label,
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '12px',
                    '&:last-child': {
                        paddingBottom: '12px',
                    },
                    variants: [],
                },
            },
        },
    },
}; 