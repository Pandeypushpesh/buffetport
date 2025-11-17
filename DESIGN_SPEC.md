# Portfolio Website - Design Specification

## Design Philosophy
Simple, classic, conservative design inspired by Warren Buffett's website. Focus on clarity, readability, and professionalism with minimal distractions.

---

## Color Palette

### Primary Colors
- **Text Primary**: `#1a1a1a` (Almost black, soft on eyes)
- **Text Secondary**: `#2c3e50` (Muted navy)
- **Text Muted**: `#6c757d` (Gray for secondary text)
- **Background**: `#ffffff` (Pure white)
- **Accent**: `#0d47a1` (Deep navy blue for links/CTAs)

### Usage
- Headlines: `#1a1a1a` or `#2c3e50`
- Body text: `#1a1a1a`
- Secondary text: `#6c757d`
- Links: `#0d47a1`
- Hover states: `#1565c0` (Lighter navy)

---

## Typography

### Font Pairing

**Headlines (Serif)**
- Primary: `Georgia, "Times New Roman", Times, serif`
- Alternative: `"Merriweather", Georgia, serif` (if web font desired)

**Body Text (System Sans)**
- Primary: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Fallback: System fonts for optimal performance

### Type Scale
- **H1 (Hero Name)**: 3.5rem - 4rem (56px - 64px)
- **H2 (Section Headings)**: 2rem - 2.5rem (32px - 40px)
- **H3 (Subheadings)**: 1.5rem (24px)
- **Body**: 1rem (16px), line-height: 1.6
- **Small Text**: 0.875rem (14px)
- **Tagline**: 1.25rem (20px), font-weight: 300

---

## Layout Structure

### Wireframe Overview

```
┌─────────────────────────────────────┐
│         [Navigation Bar]            │
│    About  |  Work  |  Contact       │
│                                     │
│                                     │
│         [HERO SECTION]              │
│                                     │
│         Your Full Name              │
│    Short Professional Tagline        │
│                                     │
│    [Download Resume Button]         │
│                                     │
│                                     │
│         [ABOUT SECTION]             │
│                                     │
│    Brief professional introduction  │
│    paragraph (2-3 sentences max)    │
│                                     │
│                                     │
│         [WORK/PROJECTS]             │
│                                     │
│    Project Title                    │
│    Brief description                │
│                                     │
│    Project Title                    │
│    Brief description                │
│                                     │
│                                     │
│         [CONTACT SECTION]           │
│                                     │
│    [Send Resume] or                │
│    [Contact Form]                   │
│                                     │
│                                     │
│         [Footer]                    │
│    © Year Name                     │
└─────────────────────────────────────┘
```

---

## Component Specifications

### 1. Navigation
- **Position**: Top center, minimal
- **Style**: Simple text links, no background
- **Spacing**: 2rem between items
- **Font**: System sans, 1rem
- **Hover**: Underline or color change
- **Padding**: 2rem top, 1rem bottom

### 2. Hero Section
- **Layout**: Centered, single column
- **Spacing**: 
  - Top padding: 8rem - 10rem
  - Bottom padding: 6rem
- **Name**: Serif font, large size (3.5rem - 4rem)
- **Tagline**: System sans, lighter weight, 1.25rem
- **CTA Button**: 
  - Background: `#0d47a1`
  - Text: White
  - Padding: 1rem 2rem
  - Border-radius: 2px (minimal)
  - Margin-top: 2rem

### 3. About Section
- **Spacing**: 
  - Top: 6rem
  - Bottom: 6rem
- **Max Width**: 600px - 700px (centered)
- **Text**: 1rem, line-height 1.6
- **Paragraphs**: 2-3 sentences max

### 4. Work/Projects Section
- **Layout**: Single column, centered
- **Max Width**: 700px
- **Project Items**:
  - Title: Serif, 1.5rem
  - Description: System sans, 1rem
  - Spacing between projects: 3rem
- **No images** (or minimal, small thumbnails if needed)

### 5. Contact Section
- **Layout**: Centered
- **CTA Button**: Same style as hero
- **Or Simple Form**:
  - Name, Email, Message fields
  - Minimal styling
  - Submit button matches CTA style

### 6. Footer
- **Style**: Minimal, centered
- **Text**: Small, muted color (`#6c757d`)
- **Padding**: 3rem top, 2rem bottom

---

## Spacing System

- **Section Padding**: 6rem - 8rem vertical
- **Content Max Width**: 700px (centered)
- **Line Height**: 1.6 for body text
- **Letter Spacing**: Normal (no tracking adjustments)
- **Whitespace**: Generous - minimum 4rem between major sections

---

## Interactive Elements

### Buttons
- **Primary CTA**: 
  - Background: `#0d47a1`
  - Text: White
  - Hover: `#1565c0`
  - No shadow, minimal border-radius
  - Padding: 1rem 2rem

### Links
- **Color**: `#0d47a1`
- **Hover**: Underline or `#1565c0`
- **No visited state styling** (keep it simple)

---

## Responsive Considerations

- **Mobile**: 
  - Hero font: 2.5rem
  - Section padding: 3rem
  - Max width: 90% of viewport
- **Tablet**: 
  - Hero font: 3rem
  - Section padding: 4rem
- **Desktop**: 
  - As specified above

---

## Design Principles

1. **Minimalism**: No unnecessary elements
2. **Whitespace**: Generous spacing throughout
3. **Typography First**: Let text be the hero
4. **No Gradients**: Solid colors only
5. **No Shadows**: Flat design approach
6. **Centered Layout**: Everything aligned center
7. **Single Column**: No multi-column layouts
8. **Professional**: Conservative color choices

---

## Implementation Notes

- Use CSS Grid or Flexbox for centering
- Implement smooth scroll behavior
- Keep animations minimal (fade-in on scroll if any)
- Ensure high contrast for accessibility
- Test readability at all screen sizes

---

## Example CSS Variables

```css
:root {
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #2c3e50;
  --color-text-muted: #6c757d;
  --color-bg: #ffffff;
  --color-accent: #0d47a1;
  --color-accent-hover: #1565c0;
  
  --font-serif: Georgia, "Times New Roman", Times, serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  --spacing-section: 6rem;
  --spacing-large: 8rem;
  --max-width-content: 700px;
}
```

