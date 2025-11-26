# Organ Grid Table - Invisible Grid System

## Overview

The `OrganGridTable` component creates an **invisible table grid** where each row is **pre-tagged to a specific organ**. This allows you to display labels and information for each organ in a structured, grid-based layout.

## Features

### 1. **Pre-tagged Organ Rows**
Each row in the grid is permanently assigned to a specific organ:
- Brain
- Heart
- Lungs
- Liver
- Stomach
- Kidneys
- Intestines
- Pancreas
- Sinuses
- Throat
- Bronchi
- Bladder

### 2. **Invisible Grid Overlay**
- The grid can be invisible (default) or visible for debugging
- Positioned as an absolute overlay on the visualization area
- Each row automatically updates based on analysis results

### 3. **Organ Status Display**
Each row shows:
- **Organ Label**: Pre-tagged organ name
- **Status Badge**: Severity level (LOW/MEDIUM/HIGH) if affected
- **Details**: Organ-specific information from analysis

### 4. **Visual Indicators**
- **Color-coded**: Each organ has its own color
- **Highlighted**: Affected organs are highlighted with colored left border
- **Opacity**: Non-affected organs are dimmed

## Usage

### Invisible Grid Overlay (Default)
```tsx
<OrganGridTable
  highlightedOrgans={analysisResult.organs}
  analysisResult={analysisResult}
  isDarkMode={isDarkMode}
  showGrid={false}  // Invisible by default
  className="w-full h-full"
/>
```

### Visible Grid (For Debugging)
```tsx
<OrganGridTable
  highlightedOrgans={analysisResult.organs}
  analysisResult={analysisResult}
  isDarkMode={isDarkMode}
  showGrid={true}  // Shows grid lines
  className="w-full h-full"
/>
```

## Implementation

### Two Display Modes

1. **Invisible Overlay Mode** (`showGrid={false}`)
   - Grid is invisible but functional
   - Rows are positioned absolutely
   - Can be used for data mapping or accessibility

2. **Sidebar Mode** (Default visible table)
   - Shows as a visible sidebar panel
   - Displays all organs in a scrollable list
   - Shows status and details for each organ

### Row Data Structure

Each row contains:
```typescript
{
  organKey: 'brain' | 'heart' | 'lungs' | ...,
  label: 'Brain',
  color: '#8b5cf6',
  isHighlighted: boolean,
  status?: 'LOW SEVERITY' | 'MEDIUM SEVERITY' | 'HIGH SEVERITY',
  details?: string  // Organ-specific explanation
}
```

### Data Attributes

Each row has HTML data attributes for easy targeting:
- `data-organ`: The organ key (e.g., "brain", "heart")
- `data-highlighted`: "true" or "false"

This allows you to:
- Style specific organ rows with CSS
- Query rows with JavaScript
- Add custom interactions per organ

## Example: Accessing Organ Rows

```javascript
// Get all highlighted organ rows
const highlightedRows = document.querySelectorAll('[data-highlighted="true"]');

// Get specific organ row
const brainRow = document.querySelector('[data-organ="brain"]');

// Add custom styling
brainRow.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
```

## Integration Points

### 1. **Invisible Overlay** (App.tsx)
Located in the main visualization area as an absolute overlay:
```tsx
<div className="absolute inset-0 pointer-events-none z-0">
  <OrganGridTable ... />
</div>
```

### 2. **Sidebar Panel** (App.tsx)
Visible sidebar showing organ status:
```tsx
<div className="w-80 border-l border-slate-700/50">
  <OrganGridTable ... />
</div>
```

## Customization

### Adding Custom Labels

You can extend the `ORGAN_DEFINITIONS` to add custom labels:

```typescript
const ORGAN_DEFINITIONS = {
  brain: { 
    label: 'Brain', 
    color: '#8b5cf6',
    customLabel: 'Cerebral System'  // Custom label
  },
  // ...
};
```

### Styling Specific Rows

Use CSS to target specific organ rows:
```css
[data-organ="brain"] {
  /* Custom styles for brain row */
}

[data-highlighted="true"] {
  /* Styles for all highlighted organs */
}
```

## Benefits

1. **Structured Data**: Each organ has a dedicated row
2. **Accessibility**: Screen readers can navigate organ-by-organ
3. **Extensibility**: Easy to add custom data per organ
4. **Debugging**: Can show grid lines to visualize layout
5. **Data Mapping**: Can map external data to specific organ rows

## Use Cases

- **Medical Records**: Display patient-specific organ data
- **Lab Results**: Show test results per organ system
- **Treatment Plans**: Organize treatment by affected organs
- **Data Export**: Export organ-specific data in structured format
- **Accessibility**: Provide structured navigation for assistive technologies

