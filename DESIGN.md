# QBox - UI Design Screenshots & Component Guide

## 🎨 Color Palette

### Primary Colors
```
Primary:       #6366F1 (Indigo Blue)
Primary Light: #818CF8
Primary Dark:  #4F46E5

Secondary:       #10B981 (Emerald Green)
Secondary Light: #34D399
Secondary Dark:  #059669
```

### Neutral Colors
```
White:       #FFFFFF
Background:  #F9FAFB
Surface:     #FFFFFF
Border:      #E5E7EB

Text Primary:   #111827
Text Secondary: #6B7280
Text Tertiary:  #9CA3AF
```

### Status Colors
```
Success: #10B981 (Green)
Warning: #F59E0B (Amber)
Error:   #EF4444 (Red)
Info:    #3B82F6 (Blue)
```

## 📱 Screen Layouts

### 1. Onboarding Screen
```
┌─────────────────────────┐
│                         │
│         ╔═══╗          │
│         ║ Q ║          │
│         ╚═══╝          │
│         QBox           │
│                         │
│  "Ask Freely,          │
│   Learn Better"        │
│                         │
│     💬  🎓  🤔        │
│                         │
│   ┏━━━━━━━━━━━━━━━┓   │
│   ┃   Join Room    ┃   │
│   ┗━━━━━━━━━━━━━━━┛   │
│                         │
│   ┏━━━━━━━━━━━━━━━┓   │
│   ┃  Create Room   ┃   │
│   ┗━━━━━━━━━━━━━━━┛   │
│                         │
└─────────────────────────┘
```

### 2. Join Room Screen
```
┌─────────────────────────┐
│  ← Join Room            │
├─────────────────────────┤
│                         │
│  Enter the 6-character  │
│  room code...           │
│                         │
│         🚪              │
│                         │
│   ┏━━━━━━━━━━━━━━━┓   │
│   ┃  A B C 1 2 3   ┃   │
│   ┗━━━━━━━━━━━━━━━┛   │
│                         │
│  Room codes are case-   │
│  insensitive...         │
│                         │
│   ┏━━━━━━━━━━━━━━━┓   │
│   ┃   Join Room    ┃   │
│   ┗━━━━━━━━━━━━━━━┛   │
│                         │
│        Back             │
│                         │
└─────────────────────────┘
```

### 3. Room Feed Screen
```
┌─────────────────────────┐
│  ← Q&A Feed         ⚙️  │
├─────────────────────────┤
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃ Room: ABC123     ┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
│                         │
│  [All][Approved][...]   │
│                         │
│  ╔═════════════════╗   │
│  ║ What is the...  ║   │
│  ║ 👍 15  [Approved]║   │
│  ╚═════════════════╝   │
│                         │
│  ╔═════════════════╗   │
│  ║ Can you explain ║   │
│  ║ 👍 23  [Answered]║   │
│  ╚═════════════════╝   │
│                         │
│              ┏━━━━━┓   │
│              ┃✏️ Ask┃   │
│              ┗━━━━━┛   │
└─────────────────────────┘
```

### 4. Ask Question Screen
```
┌─────────────────────────┐
│  ← Ask Question         │
├─────────────────────────┤
│                         │
│  Your question will be  │
│  posted anonymously...  │
│                         │
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃ 🎭 You're Anonymous┃  │
│  ┃ Your identity won't┃  │
│  ┃ be revealed        ┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
│                         │
│  ╔═══════════════════╗ │
│  ║                   ║ │
│  ║ Type your         ║ │
│  ║ question here...  ║ │
│  ║                   ║ │
│  ╚═══════════════════╝ │
│                         │
│  💡 Tips for great     │
│  questions:             │
│  • Be clear and specific│
│                         │
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃ 📤 Submit Anon   ┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
└─────────────────────────┘
```

### 5. Lecturer Panel
```
┌─────────────────────────┐
│  ← Lecturer Panel   ⚙️  │
├─────────────────────────┤
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃ Computer Sci 101  ┃  │
│  ┃ Code: ABC123      ┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
│                         │
│  [5]     [24]    [18]   │
│  Pending Approved Answer│
│                         │
│  Pending Questions 📋  │
│                         │
│  ╔═════════════════╗   │
│  ║ 👍 12  2 min ago ║   │
│  ║                  ║   │
│  ║ What is the diff ║   │
│  ║ between...       ║   │
│  ║                  ║   │
│  ║[✅][❌][✔️]      ║   │
│  ╚═════════════════╝   │
│                         │
└─────────────────────────┘
```

### 6. Settings Screen
```
┌─────────────────────────┐
│  ← Settings             │
├─────────────────────────┤
│                         │
│  Manage your preferences│
│                         │
│  PROFILE                │
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃ 🎭 Panda#1274    ┃  │
│  ┃ 🔄 Regenerate Tag┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
│                         │
│  PREFERENCES            │
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃ 🔔 Notifications ⚪┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
│                         │
│  ABOUT                  │
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃ 📖 How it Works  ┃  │
│  ┃ 🔒 Privacy Policy┃  │
│  ┃ ℹ️ Version 1.0.0 ┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
│                         │
│  ┏━━━━━━━━━━━━━━━━━┓  │
│  ┃     Logout       ┃  │
│  ┗━━━━━━━━━━━━━━━━━┛  │
└─────────────────────────┘
```

## 🎯 Key Design Elements

### Buttons
- **Primary**: Solid indigo background, white text, large rounded corners
- **Secondary**: Solid green background, white text
- **Outline**: Transparent with colored border
- **Ghost**: Transparent with colored text

### Cards
- White surface with subtle shadow
- 20px border radius
- 16px padding
- Status-colored left border (4px)

### Input Fields
- Light grey background
- 2px border (blue when focused)
- 20px border radius
- Placeholder text in light grey

### Typography
- **Titles**: 32px, Bold, Dark grey
- **Headings**: 20-24px, Semibold
- **Body**: 16px, Regular
- **Captions**: 14px, Medium, Secondary grey

### Spacing
- Consistent 16px padding for screen edges
- 24px spacing between major sections
- 8px spacing for related elements

### Status Badges
- Rounded rectangle (12px radius)
- Light background with colored text
- Small (14px) medium-weight font

### Floating Action Button (FAB)
- Large circle with shadow
- Primary color background
- White icon/text
- Positioned bottom-right with 32px margin

## 📐 Layout Principles

1. **Single Column**: All content in single column for mobile
2. **Hierarchy**: Clear visual hierarchy with size and weight
3. **Whitespace**: Generous padding and margins
4. **Touch Targets**: Minimum 44px for all interactive elements
5. **Contrast**: High contrast text for readability
6. **Consistency**: Same spacing/sizing across screens

## 🎨 Illustrations & Icons

- Use emoji (💬🎓🤔🚪✏️⚙️) for quick recognition
- Soft, rounded style for any custom icons
- Minimal, clean aesthetic
- Consistent size and positioning

## ✨ Animations (To Implement)

- Button press: Scale down to 0.95
- Screen transitions: Slide from right
- Cards: Fade in with slight scale
- Loading: Spinner in primary color
- Success: Checkmark with bounce

## 📱 Responsive Considerations

- Support portrait orientation primarily
- Landscape: Utilize horizontal space for filters
- Tablet: Two-column layout for feed
- Safe areas: Respect notches and system UI
