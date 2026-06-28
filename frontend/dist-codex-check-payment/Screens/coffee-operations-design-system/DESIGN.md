---
name: Coffee Operations Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#50453e'
  inverse-surface: '#2a313d'
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
  on-background: '#151c27'
  surface-variant: '#dce2f3'
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
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  sidebar-width: 280px
  container-max: 1440px
---

## Brand & Style

This design system is engineered for a high-traffic Coffee POS and Inventory Management environment. The brand personality balances **utilitarian efficiency** with **hospitality warmth**. It targets small to medium cafe owners and baristas who require a tool that feels as professional as an enterprise SaaS but as inviting as a neighborhood coffee shop.

The visual style is **Corporate / Modern** with a strong leaning toward **Minimalism**. It prioritizes clarity and reduced cognitive load during busy service hours. By using high-quality typography and generous white space, the UI remains legible under various lighting conditions common in cafes. The aesthetic is "uncluttered professional," removing all decorative distractions to focus purely on operational data and transactional speed.

## Colors

The palette is anchored by "Roasted Bean" (#6F4E37), a rich coffee brown that provides an immediate industry connection and serves as the primary action color. 

- **Primary (#6F4E37):** Used for primary buttons, active navigation states, and brand-critical touchpoints.
- **Surface & Background:** A clean white (#FFFFFF) is the primary canvas, supported by light gray (#F3F4F6) for secondary containers and background fills to create subtle depth.
- **Semantic Colors:** Success (#10B981) and Error (#EF4444) are used sparingly for status indicators, inventory alerts, and transaction confirmations. 
- **Neutral:** A range of grays ensures that secondary information—like ingredient SKU numbers or timestamps—remains readable without competing with primary data.

## Typography

**Inter** is the sole typeface for this design system. It was chosen for its exceptional legibility at small sizes (crucial for dense inventory tables) and its neutral, professional character.

All Vietnamese text must maintain a line-height of at least 1.5x the font size for body text to accommodate diacritics without crowding. Headlines use a slightly tighter letter-spacing to maintain a modern, "locked-in" appearance. In a POS context, the `display-lg` style is reserved for the total price at checkout, ensuring it is visible to both the barista and the customer from a distance.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model optimized for desktop web usage.
- **Sidebar:** A fixed 280px sidebar on the left contains the primary navigation (Bảng điều khiển, Đơn hàng, Kho hàng, Nhân viên, Cài đặt).
- **Main Content:** A fluid area that expands to a maximum of 1440px, centering itself on ultra-wide monitors.
- **Grid:** A 12-column system is used within the main content area, with 24px gutters.

The spacing rhythm is based on a **4px base unit**. All padding and margins should be increments of 4 (4, 8, 12, 16, 24, 32, 48). For dense data environments like "Quản lý kho" (Inventory Management), use 8px (sm) for internal cell padding and 16px (md) for layout grouping.

## Elevation & Depth

This design system uses **Tonal Layering** supplemented by **Low-Contrast Outlines** to convey hierarchy, avoiding heavy shadows that can feel dated.

- **Level 0 (Background):** The base page uses #F9FAFB.
- **Level 1 (Cards/Containers):** Main content blocks, inventory tables, and form containers use #FFFFFF with a 1px solid border of #E5E7EB. 
- **Level 2 (Interactive/Floating):** Modals, dropdown menus, and active "Add to Cart" drawers use a soft, ambient shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to suggest they are temporarily layered above the operational workspace.

This "Flat-Plus" approach ensures the UI feels light and fast, mirroring the speed of modern web applications.

## Shapes

The design system utilizes **Rounded (0.5rem / 8px)** geometry for all standard UI elements. This radius provides a "friendly" and "modern" feel that softens the industrial nature of inventory management.

- **Standard Elements (8px):** Buttons, Input fields, Cards, and Search bars.
- **Large Elements (16px):** Large modal containers and primary dashboard widgets.
- **Small Elements (4px):** Checkboxes and status tags (Chips).

The consistency in roundedness ensures that even complex forms feel cohesive and approachable to staff who may not be tech-savvy.

## Components

### Buttons
- **Primary:** Solid #6F4E37 with white text. High contrast for "Thanh toán" (Checkout) or "Lưu" (Save).
- **Secondary:** White background with #E5E7EB border and #374151 text. Used for "Hủy" (Cancel) or "In lại hóa đơn" (Reprint receipt).
- **Ghost:** No background or border, used for navigation or low-priority actions.

### Forms & Inputs
Inputs use 1px #D1D5DB borders that transition to 1px #6F4E37 on focus. Labels are positioned above the field using `label-md` in 700 weight for maximum clarity. Error messages (Thông báo lỗi) appear in #EF4444 using `label-sm` directly below the field.

### Tables (Inventory & Staff)
Tables are the heart of the system. Use a clean white background with subtle horizontal dividers. Column headers use `label-sm` with an uppercase treatment and a slightly darker gray background (#F3F4F6) to pin the data visually.

### Chips/Tags
Used for stock status:
- **Còn hàng (In Stock):** Light green background with dark green text.
- **Hết hàng (Out of Stock):** Light red background with dark red text.
- **Sắp hết (Low Stock):** Light orange background with dark orange text.

### Icons
Use **Lucide React** icons. Set stroke width to 2px for a sturdy, reliable look. Icons should be paired with text labels wherever possible to ensure clarity in the Vietnamese interface.