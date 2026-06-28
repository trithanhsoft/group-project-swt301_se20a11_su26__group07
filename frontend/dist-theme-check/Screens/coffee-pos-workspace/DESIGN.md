---
name: Coffee POS Workspace
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff3ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fd'
  surface-container-highest: '#d9e3f7'
  on-surface: '#121c2a'
  on-surface-variant: '#50453e'
  inverse-surface: '#273140'
  inverse-on-surface: '#ebf1ff'
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
  background: '#f9f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f7'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
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
  2xl: 48px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
---

## Brand & Style

The design system focuses on a clean, modern SaaS aesthetic tailored for high-frequency retail environments. The brand personality is professional yet warm, balancing the efficiency required for inventory management with the inviting nature of coffee culture. 

The visual style leans into **Minimalism** with a **Corporate Modern** structure. It prioritizes clarity, utilizing generous whitespace to reduce cognitive load during fast-paced transactions. Depth is achieved through subtle tonal layering rather than heavy shadows, ensuring the interface feels lightweight and responsive. The target audience includes both baristas requiring speed and managers requiring analytical precision.

## Colors

The palette is rooted in a crisp white background to maximize legibility. 
- **Primary Coffee Brown (#6F4E37):** Used for key actions, brand identification, and active states.
- **Surface Gray (#F3F4F6):** Used for secondary layout containers, input backgrounds, and subtle grouping of information.
- **Success Green (#10B981):** Reserved for completed transactions and positive inventory status.
- **Error Red (#EF4444):** Used for critical alerts, low stock warnings, and validation errors.
- **Text Neutrals:** Deep charcoal (#374151) is used for body text to maintain high contrast while appearing softer than pure black.

## Typography

The design system utilizes **Be Vietnam Pro** for its excellent legibility in Vietnamese and its friendly, contemporary character. 

Hierarchy is established through weight and scale. Headlines use SemiBold (600) to stand out against the clean background. Body text is optimized for readability at 16px. Label styles are used for form headers and button text, ensuring they are distinct from flowing content. For inventory tables and POS line items, a slightly tighter line height is used to maximize information density without sacrificing clarity.

## Layout & Spacing

The design system employs a **Fixed Grid** model for the desktop experience, centered at 1440px. 
- **Grid System:** A 12-column grid with 24px gutters.
- **Spacing Scale:** A 4px baseline grid ensures vertical rhythm. Spacing increments (8px, 16px, 24px) are used to define the relationship between elements.
- **POS Interface:** Uses a split-pane layout. The left side (8 columns) is reserved for the product catalog or inventory management table, while the right side (4 columns) functions as the "Cart" or "Details" panel.
- **Padding:** Internal card padding is set to 24px (lg) to provide a premium, airy feel to data-heavy screens.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-contrast Outlines** to define hierarchy. 

1. **Level 0 (Background):** Pure white (#FFFFFF).
2. **Level 1 (Sub-containers):** Light gray (#F3F4F6) with no shadow. Used for sidebar navigation backgrounds and inactive input fields.
3. **Level 2 (Cards/Primary Containers):** White background with a 1px border (#E5E7EB). A very soft, diffuse shadow (Y: 2px, Blur: 4px, Opacity: 4% Black) is applied to signify interactivity.
4. **Level 3 (Modals/Dropdowns):** White background with a medium shadow (Y: 8px, Blur: 16px, Opacity: 8% Black) to clearly separate floating elements from the workspace.

## Shapes

The shape language is consistently **Rounded**, reflecting a friendly and approachable SaaS environment.
- **Default (8px):** Applied to buttons, input fields, and standard cards.
- **Large (16px):** Applied to main dashboard containers and larger product image wrappers.
- **Extra Large (24px):** Reserved for specific "Hero" moments or soft-call-to-action sections.
- **Interactive States:** Focus states for inputs should use a 2px Coffee Brown border with a subtle 2px outer glow (ring) of the same color at 20% opacity.

## Components

### Buttons
- **Primary:** Background #6F4E37, Text #FFFFFF. High emphasis for "Pay", "Add Product", or "Save".
- **Secondary:** Background #FFFFFF, Border 1px #D1D5DB, Text #374151. Used for "Cancel", "Print Receipt", or "Edit".
- **Ghost:** No background/border, Text #6F4E37. Used for tertiary actions within lists.

### Forms & Inputs
- **Labels:** SemiBold #374151, positioned above the field.
- **Input Fields:** 48px height for touch-friendly POS use. Background #FFFFFF, Border #D1D5DB.
- **Helper Text:** #6B7280 (Small) below the field for instructions.
- **Validation:** #EF4444 text and border for error states.

### Tables (Inventory)
- **Header:** Background #F3F4F6, Text #6B7280 (Caps/Label-sm), 1px bottom border.
- **Rows:** 64px height to accommodate product images and clear text. Hover state #F9FAFB.

### Cards (Product Grid)
- **Structure:** Image at top (ratio 1:1), followed by Product Name (Headline-md) and Price (Primary Color, Bold).
- **Interactivity:** On-click, provide a brief scale-down animation (0.98) to simulate a physical press.

### Chips & Badges
- **Status Badges:** Rounded-pill shape. "In Stock" (Green background 10%, Green text 100%), "Low Stock" (Brown background 10%, Brown text 100%).

### Icons
- Use **Lucide React** icons only. Stroke width: 2px. Size: 20px for buttons/navigation, 16px for inline status indicators.