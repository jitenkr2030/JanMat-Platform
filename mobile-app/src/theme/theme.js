/**
 * JanMat App Theme Configuration
 * Based on Modern Indian Minimalism Design System
 */

export const theme = {
  colors: {
    // Primary Colors (Chakra Blue)
    primary: {
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#0D47A1', // Main primary
      600: '#0B3A88',
      700: '#002B7A', // Darker hover states
      800: '#001D4D',
      900: '#000F2E'
    },

    // Accent Colors (Tricolor)
    accent: {
      saffron: '#FF9933', // Positive sentiment
      green: '#138808',   // 'Yes' votes, success
      neutral: '#808080'  // 'No' votes, neutral
    },

    // Neutral Grays
    neutral: {
      0: '#F8F9FA',    // Page Background
      50: '#F1F3F4',
      100: '#FFFFFF',  // Card Background
      200: '#DEE2E6',  // Borders/Dividers
      300: '#CED4DA',
      400: '#ADB5BD',
      500: '#495057',  // Body Text/Icons
      600: '#6C757D',
      700: '#212529',  // Headings
      800: '#343A40',
      900: '#212529'
    },

    // Semantic Colors
    success: '#198754',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#0DCAF0',

    // Text Colors
    text: {
      primary: '#212529',
      secondary: '#495057',
      muted: '#6C757D',
      inverse: '#FFFFFF'
    },

    // Background Colors
    background: {
      default: '#F8F9FA',
      card: '#FFFFFF',
      modal: 'rgba(0, 0, 0, 0.5)',
      overlay: 'rgba(248, 249, 250, 0.95)'
    },

    // Border Colors
    border: {
      light: '#DEE2E6',
      medium: '#CED4DA',
      dark: '#ADB5BD'
    }
  },

  // Typography System
  typography: {
    // Font Family
    fontFamily: {
      primary: 'Poppins', // Will be loaded via react-native-google-fonts
      fallback: 'System'
    },

    // Font Sizes (Major Third scale - 1.25 ratio)
    fontSize: {
      caption: 12,
      small: 14,
      body: 16,
      h3: 18,
      h2: 20,
      h1: 24,
      display: 32,
      hero: 40
    },

    // Font Weights
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },

    // Line Heights
    lineHeight: {
      tight: 1.3,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.8
    }
  },

  // Spacing System (8px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48
  },

  // Border Radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 24,
    full: 9999
  },

  // Shadows
  shadows: {
    small: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4
    },
    medium: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12
    },
    large: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24
    }
  },

  // Animation Durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  },

  // Screen Sizes (for responsive design)
  screenSize: {
    small: 320,
    medium: 375,
    large: 414,
    tablet: 768
  }
};

// Component-specific theme extensions
export const componentTheme = {
  // Button Variants
  button: {
    height: {
      small: 40,
      medium: 48,
      large: 56
    },
    padding: {
      small: { horizontal: 16, vertical: 8 },
      medium: { horizontal: 24, vertical: 12 },
      large: { horizontal: 32, vertical: 16 }
    },
    fontSize: {
      small: 14,
      medium: 16,
      large: 18
    }
  },

  // Card Variants
  card: {
    padding: 16,
    borderRadius: theme.borderRadius.large,
    shadow: theme.shadows.medium,
    backgroundColor: theme.colors.neutral[100]
  },

  // Input Variants
  input: {
    height: 48,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    paddingHorizontal: 16,
    fontSize: theme.typography.fontSize.body
  },

  // Poll Card Specific
  pollCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    shadow: theme.shadows.medium,
    backgroundColor: theme.colors.neutral[100],
    marginBottom: theme.spacing.lg
  },

  // Navigation
  tabBar: {
    height: 60,
    backgroundColor: theme.colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingBottom: 5
  }
};

export default theme;