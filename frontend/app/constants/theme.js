const theme = {
    colors: {
      primary: '#3E64FF',
      secondary: '#5A73FC',
      accent: '#FF9F1C',
      success: '#2DCE89',
      warning: '#FB8C00',
      error: '#F5365C',
      
      background: '#FFFFFF',
      card: '#FFFFFF',
      inputBackground: '#F8FAFC',
      border: '#E2E8F0',
      
      text: '#1E293B',
      secondaryText: '#64748B',
      placeholder: '#94A3B8',
      icon: '#64748B',
      
      // Button states
      buttonPrimary: '#3E64FF',
      buttonPrimaryPressed: '#2A4CD9',
      buttonSecondary: '#F1F5F9',
      buttonSecondaryPressed: '#E2E8F0',
      
      overlay: 'rgba(15, 23, 42, 0.3)',
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      circle: 9999,
    },
    
    typography: {
      fontFamily: {
        regular: 'Poppins-Regular',
        medium: 'Poppins-Medium',
        semiBold: 'Poppins-SemiBold',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
      },
      lineHeight: {
        compact: 1.2,  // For headings
        normal: 1.5,   // For body text
        relaxed: 1.8,  // For readable content
      },
    },
    
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
    },
    
    animation: {
      timing: {
        fast: 150,
        normal: 250,
        slow: 400,
      },
    },
  };

  export default theme;