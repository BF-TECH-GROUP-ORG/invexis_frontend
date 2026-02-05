# Payment Methods - Visual Design Guide

## 🎨 Design System

### Color Palette

```
Primary Orange: #FF6D00
Light Orange: #FFF3E0
Dark Orange: #E65100
Light Gray: #e0e0e0
Gray Text: #757575
Success: #4caf50
Error: #d32f2f
White: #ffffff
Black: #000000
```

### Typography

```
Labels: 
  - Font Weight: 600
  - Font Size: 12px-14px
  - Color: #000000 (unselected), #E65100 (selected)

Descriptions:
  - Font Weight: 400
  - Font Size: 12px
  - Color: #757575
```

## 📐 Component Layout

### Payment Method Selector Button

#### Unselected State
```
┌─────────────────────────────────────┐
│  ╔═════════════════════════════════╗ │
│  ║                                 ║ │
│  ║      💵  or  [Image Logo]       ║ │
│  ║                                 ║ │
│  ║         Cash / MTN / ...        ║ │
│  ║                                 ║ │
│  ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
Border: 2px solid #e0e0e0
Background: #ffffff
```

#### Selected State
```
┌─────────────────────────────────────┐
│  ╔═════════════════════════════════╗ │
│  ║    🔶                           ║ │
│  ║      💵  or  [Image Logo]       ║ │
│  ║                                 ║ │
│  ║      Cash / MTN / ... (bold)    ║ │
│  ║                                 ║ │
│  ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
Border: 2px solid #FF6D00
Background: #FFF3E0
```

#### Hover State
```
┌─────────────────────────────────────┐
│  ╔═════════════════════════════════╗ │
│  ║                                 ║ │
│  ║      💵  or  [Image Logo]       ║ │
│  ║         (slightly brighter)     ║ │
│  ║         Cash / MTN / ...        ║ │
│  ║                                 ║ │
│  ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
Border: 2px solid #FF6D00
Background: #fff8f0 (transition: 200ms)
```

### Debt Repayment Dialog Layout

```
┌───────────────────────────────────────────────────┐
│  Repay Debt — Customer Name              [Orange] │  ← Dialog Title (Orange background)
├───────────────────────────────────────────────────┤
│                                                   │
│  Remaining Amount: 50,000 FRW (red text)         │  ← Info
│                                                   │
│  FRW │ [_____________________]                   │  ← Amount Input (with FRW prefix)
│       Maximum: 50,000 FRW                        │
│                                                   │
│  Payment Method *                                │  ← Label
│  ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │ Cash │ │ MTN  │ │ Air. │  ...  (5 buttons)  │
│  └──────┘ └──────┘ └──────┘                     │
│                                                   │
│  Payment Phone Number (MTN)        [conditionally]│
│  [_____________________________]                  │
│   Phone number to be used for payment request    │
│                                                   │
├───────────────────────────────────────────────────┤
│  [Cancel]                   [Record Payment] ✓   │  ← Actions
└───────────────────────────────────────────────────┘
```

### Sales Form Payment Section Layout

```
Payment Method *

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 💵  │ │ MTN │ │ Air │ │ Pesa│ │ 🏦  │
│Cash │ │ MTN │ │Artel│ │M-Pesa│ │Bank│
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘

(5-column grid layout)

[When mobile method selected ↓]

Payment Phone Number *
[+250 _______________]
Enter the phone number to be used for MTN payment
```

## 🖼️ Icon & Logo Specifications

### Logo Images

| Method | URL | Dimensions | Format |
|--------|-----|-----------|--------|
| MTN | https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg | 32x32px | PNG |
| Airtel | https://download.logo.wine/logo/Airtel_Uganda/Airtel_Uganda-Logo.wine.png | 32x32px | PNG |
| M-Pesa | https://upload.wikimedia.org/wikipedia/commons/0/03/M-pesa-logo.png | 32x32px | PNG |

### Emoji Icons

| Method | Emoji | Unicode |
|--------|-------|---------|
| Cash | 💵 | U+1F4B5 |
| Bank | 🏦 | U+1F3E6 |

### Logo Image Styling

```css
/* Default (Unselected) */
img {
  height: 32px;
  width: auto;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.7;
  margin-bottom: 0.5rem;
  transition: filter 0.2s ease, opacity 0.2s ease;
}

/* Selected */
img.selected {
  filter: none;
  opacity: 1;
}

/* Compact Mode */
img.compact {
  height: 24px;
  margin-bottom: 0.25rem;
}
```

## 📏 Spacing & Dimensions

### Button Dimensions
```
Normal Mode:
- Width: Flexible (grid-based)
- Height: 100px
- Padding: 1.5rem (24px)
- Border Radius: 8px
- Gap: 1.5 (24px between items)

Compact Mode:
- Width: Flexible (grid-based)
- Height: 70px
- Padding: 1rem (16px)
- Border Radius: 8px
- Gap: 1 (16px between items)
```

### Grid Layout
```
Debt Dialog:
- Columns: 3
- Mobile: Stack vertically

Sales Form:
- Columns: 5
- Tablet: 4 columns
- Mobile: 2 columns
```

### Dialog Spacing
```
Title: padding 2.5rem (40px)
Content: padding 4rem top (64px), default sides
Actions: padding 3rem (48px) bottom, 3rem (48px) sides, 2rem gap between buttons
```

## 🎬 Animations & Transitions

### Button Interactions
```
Default: 200ms ease
- Border color change: 200ms
- Background color change: 200ms
- Opacity change: 200ms
- Filter change (grayscale): 200ms

Timing Function: ease (cubic-bezier(0.25, 0.46, 0.45, 0.94))
```

### Hover Effects
```
Unselected → Hover:
1. Border color: #e0e0e0 → #FF6D00 (200ms)
2. Background: #ffffff → #fff8f0 (200ms)

Selected → Hover:
1. Border color: #FF6D00 (no change)
2. Background: #FFF3E0 (no change)
```

## 📱 Responsive Design

### Breakpoints
```
Desktop (1200px+):
- Payment buttons: 5-column (debt: 3-column)
- Font size: 14px
- Button height: 100px (debt), 80px (sales)

Tablet (768px - 1199px):
- Payment buttons: 4-column (debt: 2-column)
- Font size: 13px
- Button height: 90px

Mobile (< 768px):
- Payment buttons: 2-column
- Font size: 12px
- Button height: 70px
- Stack vertically on very small screens
```

### Dialog on Mobile
```
Dialog maxWidth: sm (600px on desktop, 90vw on mobile)
Full width: Yes
Margins: Auto with safe area padding
```

## 🔤 Typography Scale

```
h1: 32px, weight 700 (dialog titles not used in this component)
h6: 20px, weight 600 (section headers)
subtitle2: 14px, weight 600 (payment method label)
body1: 16px, weight 400 (info text)
caption: 12px, weight 400-600 (button labels)
```

## 🎯 Focus & Accessibility

### Keyboard Navigation
```
Tab Order: Left to right, top to bottom
- Payment method buttons (in order)
- Phone input (if visible)
- Action buttons (Cancel, Confirm)
```

### Focus States
```
Button Focus:
- outline: 2px solid #FF6D00
- outline-offset: 2px
```

### Screen Reader
```
Payment Method Buttons:
<button role="button" aria-label="Pay with MTN Mobile Money">

Phone Input:
<input aria-label="Payment Phone Number for MTN" />

Selected State:
<div aria-current="true">
```

## 🖌️ Visual Hierarchy

### Payment Method Selector
1. **Primary**: Payment method label (bold, orange when selected)
2. **Secondary**: Logo/icon
3. **Tertiary**: Description text (only in component if shown)

### Form Order (Debt)
1. Amount input (large, prominent)
2. Payment method selector (grid, prominent)
3. Phone input (conditional, appears below)

### Form Order (Sales)
1. Amount input
2. Discount input
3. Customer info
4. Payment method selector (5 columns, prominent)
5. Phone input (conditional)

## 🎨 Light/Dark Mode Considerations

Currently implemented for Light mode only. For dark mode support:

```css
/* Light Mode (Current) */
--color-primary: #FF6D00
--color-background: #ffffff
--color-border-unselected: #e0e0e0
--color-text: #000000

/* Dark Mode (Future) */
--color-primary: #FFB74D
--color-background: #1e1e1e
--color-border-unselected: #333333
--color-text: #ffffff
```

## 📋 Checklist for Implementation

- [x] Payment method buttons styled consistently
- [x] Logo images optimized for web
- [x] Hover and selected states clearly visible
- [x] Responsive grid layout working
- [x] Phone input appears conditionally
- [x] Transitions smooth and performant
- [x] Accessibility features included
- [x] Color contrast meets WCAG standards
- [ ] Dark mode support (future)
- [ ] RTL language support (future)

## 🖼️ Visual Examples

### Desktop View (Sales Form)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Payment Method *                                           │
│                                                             │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│  │  💵   │ │ 📱MTN │ │ 📱Air │ │ 📱Pesa│ │ 🏦    │        │
│  │ Cash  │ │  MTN  │ │Airtel │ │M-Pesa │ │ Bank  │        │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘        │
│                                                             │
│  [Only shown when mobile method selected]                  │
│  Payment Phone Number *                                    │
│  ┌────────────────────────────────────────────────────────┐│
│  │ +250 ________________________                          ││
│  └────────────────────────────────────────────────────────┘│
│   Enter the phone number to be used for MTN payment       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile View (Sales Form)
```
┌──────────────────────────────┐
│ Payment Method *             │
│                              │
│ ┌──────────┐ ┌──────────┐   │
│ │   💵     │ │  📱 MTN  │   │
│ │  Cash    │ │   MTN    │   │
│ └──────────┘ └──────────┘   │
│                              │
│ ┌──────────┐ ┌──────────┐   │
│ │ 📱 Air   │ │ 📱 Pesa  │   │
│ │ Airtel   │ │ M-Pesa   │   │
│ └──────────┘ └──────────┘   │
│                              │
│ ┌──────────┐                │
│ │   🏦     │                │
│ │  Bank    │                │
│ └──────────┘                │
│                              │
└──────────────────────────────┘
```

## 💡 Design Principles

1. **Clarity**: Clear visual feedback for selections
2. **Consistency**: Same styling across debt and sales
3. **Accessibility**: High contrast, keyboard navigation
4. **Responsiveness**: Works on all screen sizes
5. **Performance**: Smooth transitions, no jank
6. **Usability**: Intuitive interaction patterns
