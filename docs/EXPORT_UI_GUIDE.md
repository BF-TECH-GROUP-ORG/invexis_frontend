# Export Feature - Visual UI Guide

## 🎨 User Interface Flow

### Screen 1: Main Reports Page (Before Click)

```
┌────────────────────────────────────────────────────────────┐
│  System-Wide Reports & Analytics                           │
│  Consolidated insights across all your business operations │
│                                                             │
│  [Export Options ▼]                                        │
└────────────────────────────────────────────────────────────┘

[General] [Inventory] [Sales] [Debts] [Payment] [Staff]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Sales Performance Tab Content...
```

### Screen 2: Dropdown Menu (After Click)

```
┌────────────────────────────────────────────────────────────┐
│  System-Wide Reports & Analytics                           │
│  Consolidated insights across all your business operations │
│                                                             │
│  [Export Options ▼] ┌─────────────────────┐                │
│                     │ 📄 Export as PDF    │                │
│                     │ 📊 Export to Excel  │                │
│                     │ 🖨️  Print Report     │                │
│                     └─────────────────────┘                │
└────────────────────────────────────────────────────────────┘
```

### Screen 3: Export Scope Dialog (After Menu Selection)

```
┌───────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗ │
│ ║  Choose Export Scope                                  ║ │
│ ╠═══════════════════════════════════════════════════════╣ │
│ ║                                                       ║ │
│ ║ Select what you would like to export:               ║ │
│ ║                                                       ║ │
│ ║ ⭕ Current Tab Only                                  ║ │
│ ║    Export only the Sales Performance tab             ║ │
│ ║                                                       ║ │
│ ║ ⚪ All Tabs as Report                                ║ │
│ ║    Export all 6 tabs as a complete system-wide       ║ │
│ ║    report                                            ║ │
│ ║                                                       ║ │
│ ╠═══════════════════════════════════════════════════════╣ │
│ ║ [Cancel]  [Export PDF]  [Export Excel]  [Print]     ║ │
│ ╚═══════════════════════════════════════════════════════╝ │
└───────────────────────────────────────────────────────────┘
```

## 📱 Button Styling

### Export Options Button (Normal State)
```
┌─────────────────────┐
│ 📥 Export Options   │  <- File Download Icon
│                     │  <- Black background (#333)
│                     │  <- White text
│                     │  <- Rounded corners (8px)
└─────────────────────┘
```

### Export Options Button (Hover State)
```
┌─────────────────────┐
│ 📥 Export Options   │  <- Darker black (#444)
│                     │  <- Slight shadow
│                     │  <- Same white text
└─────────────────────┘
```

## 🎯 Dialog Layout

```
┌──────────────────────────────────────────────────────────┐
│  Choose Export Scope                            [X]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Select what you would like to export:                  │
│                                                          │
│  ⭕ Current Tab Only                                     │
│      Export only the Sales Performance tab              │
│                                                          │
│  ⚪ All Tabs as Report                                   │
│      Export all 6 tabs as a complete system-wide        │
│      report                                             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│        [Cancel]  [Export PDF]  [Export Excel] [Print]   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

```
Primary Colors:
├── Black: #333 (Headers, buttons, text)
├── White: #fff (Backgrounds, text on dark)
├── Orange: #FF6D00 (Accents, highlights)
├── Dark Orange: #E55D00 (Hover states)
└── Light Gray: #e5e7eb (Borders, dividers)

Text Colors:
├── Dark Gray: #111827 (Main text)
├── Medium Gray: #6b7280 (Secondary text)
└── Light Gray: #999 (Helper text)
```

## 📊 Dialog Button States

### Export PDF Button
```
Normal:  ┌─────────────┐         Hover:   ┌─────────────┐
         │ Export PDF  │                   │ Export PDF  │
         │ Black #333  │                   │ Black #444  │
         └─────────────┘                   └─────────────┘
```

### Export Excel Button
```
Normal:  ┌─────────────┐         Hover:   ┌─────────────┐
         │Export Excel │                   │Export Excel │
         │Orange #FF6D │                   │Orange #E55D │
         └─────────────┘                   └─────────────┘
```

### Print Button
```
Normal:  ┌─────────────┐         Hover:   ┌─────────────┐
         │   Print     │                   │   Print     │
         │Blue #0066cc │                   │Blue #0052a3 │
         └─────────────┘                   └─────────────┘
```

## 🗂️ Menu Items

```
┌─────────────────────────────────┐
│ 📄 Export as PDF                │  <- Emoji + Text
│                                 │  <- Font weight: 600
│ 📊 Export to Excel              │
│                                 │
│ 🖨️  Print Report                │
│                                 │
└─────────────────────────────────┘
```

## 📋 Radio Button Options

### Option 1: Current Tab Only
```
⭕ Current Tab Only                ← Selected (filled circle)
   Export only the Sales            ← Primary text (bold)
   Performance tab                  ← Secondary text (gray, small)
```

### Option 2: All Tabs as Report
```
⚪ All Tabs as Report              ← Unselected (empty circle)
   Export all 6 tabs as a           ← Primary text (bold)
   complete system-wide report      ← Secondary text (gray, small)
```

## 🔄 Export File Downloads

### PDF File Naming
```
Current Tab:    Sales-Performance-Report.pdf
All Tabs:       System-Wide-Reports.pdf

Other Tabs:
├── General-Overview-Report.pdf
├── Inventory-Analysis-Report.pdf
├── Debts-&-Credit-Report.pdf
├── Payment-Methods-Report.pdf
└── Staff-&-Branches-Report.pdf
```

### Excel File Naming & Structure
```
Current Tab:    Sales-Performance-Report.xlsx
                ├── Sales Performance - KPIs
                ├── Sales Performance - Table1
                └── Sales Performance - Table2

All Tabs:       System-Wide-Reports.xlsx
                ├── General Overview - KPIs
                ├── General Overview - Table1
                ├── Inventory Analysis - KPIs
                ├── Inventory Analysis - Table1
                ├── Sales Performance - KPIs
                ├── Sales Performance - Table1
                ├── Sales Performance - Table2
                ├── Debts & Credit - KPIs
                ├── Debts & Credit - Table1
                ├── Payment Methods - KPIs
                ├── Payment Methods - Table1
                └── Staff & Branches - KPIs
```

## 📄 PDF Layout Example

### Current Tab PDF
```
╔══════════════════════════════════════╗
║       Sales Performance Report       ║
║                                      ║
║ Generated on: 1/13/2026 2:30 PM     ║
╠══════════════════════════════════════╣
║                                      ║
║ 📊 KPI Cards (4 cards in a row)     ║
║ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   ║
║ │KPI1 │ │KPI2 │ │KPI3 │ │KPI4 │   ║
║ └─────┘ └─────┘ └─────┘ └─────┘   ║
║                                      ║
║ 📋 Data Tables                       ║
║ ┌────────────────────────────────┐  ║
║ │ Product │ Qty │ Amount │ Date │  ║
║ ├────────────────────────────────┤  ║
║ │ Item 1  │ 10  │ $1000  │ 1/10 │  ║
║ │ Item 2  │ 5   │ $500   │ 1/10 │  ║
║ └────────────────────────────────┘  ║
║                                      ║
╚══════════════════════════════════════╝
```

### All Tabs PDF (Multi-page)
```
Page 1: General Overview
├── Title & Date
├── KPIs
└── Tables

Page 2: Inventory Analysis
├── Title
├── KPIs
└── Tables

Page 3: Sales Performance
├── Title
├── KPIs
└── Tables

[... more pages for remaining tabs ...]
```

## 📊 Excel Sheet Organization

### Single Tab Export (Sales Performance)
```
Workbook: Sales-Performance-Report.xlsx

Sheet Tabs at Bottom:
┌──────────────────┬──────────────────┐
│ Sales Perf - KPI │ Sales Perf - Tbl1│
└──────────────────┴──────────────────┘

Sheet 1: Sales Performance - KPIs
Metric                  │ Value
────────────────────────┼──────────────
Total Revenue           │ 45,250,000
Total Transactions      │ 1,248
Average Order Value     │ 36,289
Growth Percent          │ 12.5%
```

### All Tabs Export (System-Wide)
```
Workbook: System-Wide-Reports.xlsx

Multiple sheet tabs:
┌─────┬─────┬─────┬─────┬─────┬─────┐
│Gen  │Inv  │Sale │Debt │Pay  │Staf │
└─────┴─────┴─────┴─────┴─────┴─────┘

Each tab has KPI and Table sheets
Total: 12+ sheets
```

## 🖨️ Print Layout

### Screen Display
```
┌──────────────────────────────────────┐
│ System-Wide Reports & Analytics      │
│                                      │
│ Generated on: 1/13/2026 2:30 PM    │
│                                      │
│ Sales Performance                    │
│                                      │
│ KPIs: [4 cards]                      │
│ Tables: [3 tables]                   │
│                                      │
│ [Page Break - Next Tab]              │
│                                      │
│ Inventory Analysis                   │
│ ...                                  │
└──────────────────────────────────────┘
```

### Printed Output
```
┌──────────────────────────────────────┐
│ [All content exactly as shown above] │
│ [With proper margins for printing]   │
│ [Each tab on separate page]          │
│ [Professional headers throughout]    │
└──────────────────────────────────────┘
```

## 🎯 Tab Navigation with Export

```
Current Tab: Sales Performance

[General] [Inventory] [▸Sales◄] [Debts] [Payment] [Staff]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Export Options ▼]  ← When "Current Tab Only" is selected,
                       it will export only Sales Performance

When user switches to Inventory tab:

[General] [▸Inventory◄] [Sales] [Debts] [Payment] [Staff]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Export Options ▼]  ← Now "Current Tab Only" will export
                       only Inventory Analysis
```

## ✨ Responsive Behavior

### Desktop (> 768px)
```
┌─────────────────────────────────────────┐
│ Title              [Export Options ▼]   │
│ Subtitle                                 │
└─────────────────────────────────────────┘

[All buttons in single row on right]
```

### Tablet (576px - 768px)
```
┌─────────────────────────────────────────┐
│ Title                                    │
│ Subtitle                                 │
│                                          │
│ [Export Options ▼]                       │
│ [Button wraps to 2-3 per row]           │
└─────────────────────────────────────────┘
```

### Mobile (< 576px)
```
┌─────────────────────┐
│ Title               │
│ Subtitle            │
│                     │
│ [Export Options▼]   │
│ [Full width button] │
└─────────────────────┘
```

## 🎬 Animation & Interactions

### Dialog Open Animation
```
1. Click "Export Options"
   ↓ (instantaneous)
2. Dropdown appears with slight fade-in
   ↓ (50ms animation)
3. User selects export format
   ↓ (instantaneous)
4. Dialog appears with fade-in
   ↓ (100ms animation)
5. User selects scope and clicks action
   ↓ (instantaneous)
6. Export processing begins
   ↓ (varies by format)
7. File downloads (auto-close dialog)
```

### Button Hover Effects
```
Normal State:    [Button]
                 ↓ (on hover)
Hover State:     [Button] (darker color, subtle shadow)
                 ↓ (on click)
Active State:    [Button] (slight scale change)
```

## 📍 Accessibility Features

- ✅ Radio buttons for scope selection (keyboard navigable)
- ✅ Clear labels and descriptions
- ✅ Color-independent design (works with color-blind modes)
- ✅ Keyboard shortcuts (Tab, Enter, Space)
- ✅ ARIA labels on buttons
- ✅ Focus indicators visible

---

This visual guide helps understand how the export UI flows and looks in the application.
