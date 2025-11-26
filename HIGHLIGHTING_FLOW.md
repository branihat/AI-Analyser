# How `highlightedOrgans` Works - Complete Flow

## Overview
The `highlightedOrgans` array flows from Gemini API → Backend → Frontend → SVG Visualization

## Step-by-Step Flow

### 1. **User Input** (Frontend)
```
User enters: "Patient has chest pain and difficulty breathing"
```

### 2. **API Request** (Frontend → Backend)
```javascript
// App.tsx - handleAnalyze()
POST /api/analyze
{
  "patient_name": "John Doe",
  "doctor_name": "Dr. Smith", 
  "description": "Patient has chest pain and difficulty breathing"
}
```

### 3. **Gemini Analysis** (Backend)
```python
# app.py - analyze_symptoms()
Gemini receives: Clinical description
Gemini returns: {
  "supporting_organs": ["lungs", "heart"],  # ← Gemini identifies organs
  "diagnosis": "Respiratory Distress",
  ...
}
```

### 4. **Organ Sanitization** (Backend)
```python
# app.py - sanitize_organs()
Input: ["lungs", "heart", "kidneys"]  # From Gemini
Output: ["lungs", "heart", "kidney"]  # Normalized to match SVG
```

**Mapping Rules:**
- `kidneys` → `kidney`
- `intestines` → `intestine`  
- `lung` → `lungs`
- `sinus` → `sinuses`

### 5. **API Response** (Backend → Frontend)
```json
{
  "diagnosis": "Respiratory Distress",
  "supporting_organs": ["lungs", "heart"],  // ← This becomes highlightedOrgans
  "explanation": "...",
  "severity": "high",
  "confidence": 85,
  "recommendations": [...]
}
```

### 6. **State Update** (Frontend)
```javascript
// App.tsx
const result: AnalysisResult = {
  organs: apiResult.supporting_organs || [],  // ["lungs", "heart"]
  ...
}
setAnalysisResult(result);
```

### 7. **Pass to Visualization** (App.tsx → BodyVisualizationMain)
```javascript
<BodyVisualizationMain 
  highlightedOrgans={analysisResult?.organs || []}  // ["lungs", "heart"]
  ...
/>
```

### 8. **Organ Matching** (BodyOrganSvg.tsx)
```javascript
// OrganSvg.tsx
const normalizedHighlights = ["lungs", "heart"];  // Lowercased

const isOrganHighlighted = (organKey: OrganKey) => {
  // Check if "lungs" includes "lungs" → ✅ true
  // Check if "heart" includes "heart" → ✅ true
  // Check if "brain" includes "brain" → ❌ false (not in array)
  return normalizedHighlights.some(name => name.includes(organKey));
};
```

### 9. **SVG Highlighting** (BodyOrganSvg.tsx)
For each organ in the SVG:

```javascript
// For "lungs" organ group:
if (isOrganHighlighted("lungs")) {
  organGroup.style.opacity = "1";           // Make visible
  organGroup.style.filter = "drop-shadow(0 0 12px #3b82f6)";  // Blue glow
} else {
  organGroup.style.opacity = "0";          // Hide organ
}

// Calculate marker position
const bbox = organGroup.getBBox();
position = {
  left: (bbox.x + bbox.width / 2) / viewBoxWidth * 100,
  top: (bbox.y + bbox.height / 2) / viewBoxHeight * 100
};
```

### 10. **Marker Display** (OrganMarker component)
```javascript
// Only shows if highlighted AND position calculated
if (highlighted && position) {
  // Shows pulsing ⚠ icon with organ label
  // Positioned at center of organ in SVG
}
```

## Visual Example

**Input:** `"chest pain and difficulty breathing"`

**Flow:**
```
User Input
    ↓
Gemini API → ["lungs", "heart"]
    ↓
Backend sanitizes → ["lungs", "heart"]
    ↓
Frontend receives → highlightedOrgans = ["lungs", "heart"]
    ↓
BodyOrganSvg checks:
  - "lungs" in array? → ✅ Highlight with blue glow
  - "heart" in array? → ✅ Highlight with red glow
  - "brain" in array? → ❌ Hide (opacity = 0)
    ↓
SVG shows: Lungs and Heart visible with colored glow + warning markers
```

## Key Files

1. **Backend** (`src/app.py`):
   - `analyze_symptoms()` - Calls Gemini
   - `sanitize_organs()` - Normalizes organ names

2. **Frontend** (`src/App.tsx`):
   - `handleAnalyze()` - Receives API response
   - `analysisResult.organs` - Stores highlighted organs

3. **Visualization** (`src/components/OrganSvg.tsx`):
   - `isOrganHighlighted()` - Checks if organ should be highlighted
   - Updates SVG opacity and filter
   - Calculates marker positions

4. **Component** (`src/components/BodyVisualizationMain.tsx`):
   - Passes `highlightedOrgans` to `BodyOrganSvg`
   - Shows status indicator with count

## Organ Name Matching

The system uses **case-insensitive partial matching**:

```javascript
// If highlightedOrgans = ["lungs", "heart"]
isOrganHighlighted("lungs")  // ✅ true (exact match)
isOrganHighlighted("lung")   // ✅ true (partial match)
isOrganHighlighted("brain")   // ❌ false (not in array)
```

This makes the system flexible - Gemini can return variations like "lung" or "lungs" and both will work.

