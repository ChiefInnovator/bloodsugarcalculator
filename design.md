# eAG/A1C Diabetes Calculator Web Interface Design

## Overall Layout

The calculator will have a clean, modern design with a single-page layout divided into the following sections:

1. **Header** - Title and brief introduction
2. **Calculator Section** - The main interactive component
3. **Educational Content** - Information about blood glucose measurements and factors affecting them
4. **Footer** - Credits and references

## Calculator Section Design

The calculator section will be the focal point of the page and will include:

1. **Conversion Direction Selection**
   - Radio button toggle between "A1C to eAG" and "eAG to A1C"
   - Clear visual indication of the selected option

2. **Input Section**
   - Clean, labeled input field for the source value
   - For eAG input: radio button selection between mg/dL and mmol/L units
   - Validation feedback for invalid inputs

3. **Calculate Button**
   - Prominent, accessible button with clear call-to-action
   - Hover and active states for better user feedback

4. **Results Display**
   - Clear presentation of the calculated result
   - Appropriate units displayed (%, mg/dL, or mmol/L)
   - Visual distinction from the input section

## Color Scheme

The color scheme will be professional and accessible:

- **Primary Color**: A calming blue (#3498db) - For headers, buttons, and accents
- **Secondary Color**: A complementary light gray (#f5f5f5) - For backgrounds and panels
- **Text Color**: Dark gray (#333333) - For optimal readability
- **Accent Colors**: 
  - Success green (#2ecc71) - For valid inputs and positive feedback
  - Warning red (#e74c3c) - For errors and invalid inputs

All color combinations will meet WCAG 2.1 AA contrast requirements for accessibility.

## Typography

- **Primary Font**: 'Roboto' or system sans-serif - Clean, modern, and widely available
- **Font Sizes**:
  - Headings: 24px-32px
  - Body text: 16px-18px
  - Labels and small text: 14px
- **Line Height**: 1.5 for optimal readability

## Responsive Design

The layout will adapt to different screen sizes:

- **Desktop** (>992px):
  - Two-column layout for calculator and educational content
  - Spacious padding and margins

- **Tablet** (768px-992px):
  - Flexible grid that adjusts to screen width
  - Slightly reduced spacing

- **Mobile** (<768px):
  - Single column layout with stacked sections
  - Optimized touch targets (minimum 44px × 44px)
  - Simplified layout with preserved functionality

## Interactive Elements

- **Form Controls**:
  - Custom-styled radio buttons and input fields
  - Clear focus states for keyboard navigation
  - Instant validation feedback

- **Tooltips**:
  - Information icons next to technical terms
  - Hover/tap to reveal explanations
  - Accessible via keyboard

## Educational Content Layout

The educational content will be organized in collapsible sections or tabs:

1. **What are eAG and A1C?**
   - Brief explanation of each measurement
   - Clinical significance and target ranges

2. **Positive Factors for Blood Sugar Control**
   - Diet recommendations
   - Exercise benefits
   - Medication adherence

3. **Negative Factors Affecting Blood Sugar**
   - Stress impacts
   - Poor dietary choices
   - Illness and other factors

Each section will include concise, accessible text with appropriate headings and visual hierarchy.

## Mockup Sketches

```
+-----------------------------------------------+
|  eAG/A1C Diabetes Calculator                  |
|  A tool to convert between blood glucose      |
|  measurements                                 |
+-----------------------------------------------+
|                                               |
|  [ ] A1C to eAG    [ ] eAG to A1C             |
|                                               |
|  Enter value: [____________]                  |
|                                               |
|  Units: [ ] mg/dL  [ ] mmol/L                 |
|  (only visible when eAG to A1C is selected)   |
|                                               |
|  [Calculate]                                  |
|                                               |
|  Result: ___________                          |
|                                               |
+-----------------------------------------------+
|                                               |
|  Educational Content                          |
|  +-----------------------------------+        |
|  | What are eAG and A1C? [+]         |        |
|  +-----------------------------------+        |
|                                               |
|  +-----------------------------------+        |
|  | Positive Factors [+]              |        |
|  +-----------------------------------+        |
|                                               |
|  +-----------------------------------+        |
|  | Negative Factors [+]              |        |
|  +-----------------------------------+        |
|                                               |
+-----------------------------------------------+
|  Created based on ADA conversion formulas     |
+-----------------------------------------------+
```

This design focuses on clarity, usability, and accessibility while maintaining a professional appearance suitable for a medical calculator.
