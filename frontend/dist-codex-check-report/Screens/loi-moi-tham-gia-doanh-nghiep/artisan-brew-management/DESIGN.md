---
name: Artisan Brew Management
colors:
  surface: '#fff8f5'
  surface-dim: '#e1d8d5'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ee'
  surface-container: '#f5ece8'
  surface-container-high: '#efe6e3'
  surface-container-highest: '#e9e1dd'
  on-surface: '#1e1b19'
  on-surface-variant: '#50453e'
  inverse-surface: '#34302d'
  inverse-on-surface: '#f8efeb'
  outline: '#82746d'
  outline-variant: '#d4c3ba'
  surface-tint: '#79573f'
  primary: '#553722'
  on-primary: '#ffffff'
  primary-container: '#6f4e37'
  on-primary-container: '#eec1a4'
  inverse-primary: '#eabda0'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#00482f'
  on-tertiary: '#ffffff'
  tertiary-container: '#006242'
  on-tertiary-container: '#53e3a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc6'
  primary-fixed-dim: '#eabda0'
  on-primary-fixed: '#2d1604'
  on-primary-fixed-variant: '#5f402a'
  secondary-fixed: '#e1e2e4'
  secondary-fixed-dim: '#c5c6c8'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fff8f5'
  on-background: '#1e1b19'
  surface-variant: '#e9e1dd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 32px
  container-max: 1440px
  sidebar-width: 260px
---

## Brand & Style

The design system is built upon a "Warm Professionalism" philosophy. It balances the high-efficiency requirements of a Point of Sale (POS) and inventory management tool with the welcoming atmosphere of a specialty coffee shop. The visual style is rooted in **Modern Minimalism**, emphasizing clarity, generous whitespace, and a sophisticated color palette that feels organic yet systematic.

The target audience includes both administrative staff managing complex logistics and floor staff requiring rapid, error-free interactions. The emotional response should be one of calm control and reliability. By utilizing a light-mode-only interface, the system ensures maximum legibility under various cafe lighting conditions, from bright morning sun to soft evening ambiance.

## Colors

The palette is anchored by a rich primary coffee brown, used purposefully for brand moments and primary actions to guide the user's eye. 

- **Primary:** Reserved for the most important calls to action, active navigation states, and key brand touchpoints.
- **Surface & Background:** A combination of pure white and light gray creates a multi-layered interface that separates navigation, content areas, and sidebars without the need for heavy borders.
- **Functional Colors:** Success (Green) and Error (Red) are used strictly for status indicators, inventory alerts, and transaction confirmations.
- **Typography:** Deep Charcoal provides high-contrast readability, essential for quick-glance data entry in a fast-paced environment.

## Typography

This design system utilizes **Inter** for all typographic levels. Inter’s tall x-height and exceptional legibility make it ideal for data-heavy inventory tables and fast-moving POS screens.

The hierarchy is structured to favor quick scanning. Headlines are bold and slightly tracked-in for a more compact, modern feel. Body text uses standard weights to ensure comfort during long periods of administrative work. Labels and micro-copy are slightly more weighted (Medium) to ensure they remain legible even at smaller sizes in dense UI components like ingredient lists or order timestamps. All typography is optimized for the Vietnamese language, ensuring diacritics are clear and do not overlap with line heights.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The main container is capped at 1440px for desktop viewing to maintain optimal line lengths and prevent information dispersion on ultra-wide monitors.

A 12-column grid system is employed for the main content area.
- **Admin Sidebar:** A permanent 260px left-hand navigation rail for deep management (Inventory, Reports, Staffing).
- **Staff Sidebar:** A right-hand contextual sidebar for the POS view, focusing on "Current Order" details and quick-action checkout buttons.
- **Gutters & Margins:** A consistent 24px gutter ensures clear separation between cards and table columns. 32px external margins provide the layout with "room to breathe."

Spacing follows a 4px baseline grid. Internal component padding should typically use 12px or 16px to maintain a compact yet touch-friendly target for POS interaction.

## Elevation & Depth

This design system uses a **Tonal Layering** approach combined with **Ambient Shadows** to create hierarchy. 

1. **Level 0 (Base):** The primary background (#FFFFFF) or light gray (#F3F4F6) for secondary sidebars.
2. **Level 1 (Cards/Tables):** White surfaces with a 1px border (#E5E7EB) and a subtle, low-opacity shadow (0px 1px 3px rgba(0,0,0,0.05)). This is the standard for inventory items and dashboard widgets.
3. **Level 2 (Modals/Overlays):** Elevated surfaces with a more pronounced, diffused shadow (0px 10px 15px rgba(0,0,0,0.1)). Modals use a semi-transparent charcoal backdrop blur to focus user attention.

Interactive elements like buttons use a slight "lift" effect on hover, increasing the shadow depth slightly to provide tactile feedback.

## Shapes

The shape language is **Rounded**, reflecting the friendly and approachable nature of a cafe environment. 

- **Standard Elements:** Buttons, input fields, and cards utilize a 0.5rem (8px) corner radius. This provides a soft, modern aesthetic that is more inviting than sharp corners while appearing more professional than full pills.
- **Large Containers:** Modals and large dashboard sections use 1rem (16px) for a distinct "contained" feel.
- **Small Elements:** Status badges and tags use a 0.25rem (4px) radius to maintain clarity at small scales.

## Components

### Buttons
- **Primary:** Solid Coffee Brown (#6F4E37) with White text.
- **Secondary:** White background with a 1px Light Gray border and Charcoal text.
- **Ghost:** No background, primary color text; used for tertiary actions like "Hủy."

### Tables & Lists
Inventory and transaction data should be housed in tables with subtle horizontal dividers. Avoid vertical borders to keep the UI clean. Headers must be Deep Charcoal with Medium weight.

### Form Fields
Inputs use a 1px border (#D1D5DB). When focused, the border transitions to Primary Coffee Brown with a 2px soft glow. Labels sit above the field in Label-MD styling.

### Cards
Dashboard widgets and product selection items are contained in cards. Product cards in the POS view should feature high-quality imagery or clear category labels, with the price anchored to the bottom right in Title-MD.

### Modals
Confirmation modals for destructive actions (e.g., "Xóa nguyên liệu") or successful transactions must be centered. Use Lucide React icons (e.g., `AlertCircle` for errors, `CheckCircle` for success) positioned at the top center of the modal for immediate visual context.

### Navigation
- **Admin:** Vertical sidebar with icons to the left of the text.
- **Staff:** Horizontal category tabs for quick menu navigation, with a vertical "Current Order" list on the right.