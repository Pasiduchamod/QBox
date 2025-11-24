# QBox - Development Guide

## 🎨 Design System

### Color Palette
- **Primary**: `#6366F1` (Indigo) - Main brand color
- **Secondary**: `#10B981` (Emerald) - Success/Approved actions
- **Background**: `#F9FAFB` - Light grey
- **Surface**: `#FFFFFF` - Cards and elevated surfaces

### Typography
- **Title**: 32px, Bold
- **Heading**: 24px, Semibold
- **Body**: 16px, Regular
- **Caption**: 14px, Medium

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

### Border Radius
- All cards and buttons use **20px** (xl) for a modern, friendly look
- Badges and small elements use **12px** (md)

## 📱 Screens Overview

### 1. Onboarding Screen
- Welcome message with app logo
- Two main CTAs: "Join Room" and "Create Room"
- Soft gradient background with emojis

### 2. Join Room Screen
- Large, centered room code input (6 characters)
- Clean, distraction-free layout
- Auto-uppercase for room codes

### 3. Create Room Screen
- Room name input
- Auto-generated room code display
- Copy-to-clipboard functionality
- Option to regenerate code

### 4. Room Feed Screen (Main)
- Filterable question list (All, Approved, Answered, Pending)
- Question cards with upvote buttons
- Status badges for each question
- Floating "Ask Question" button

### 5. Ask Question Screen
- Large text area for question input
- Character counter (500 max)
- Anonymous identity reminder
- Tips card for writing good questions

### 6. Lecturer Panel Screen
- Room statistics dashboard
- Pending questions queue
- Quick moderation actions (Approve, Hide, Mark Answered)
- Link to Reports screen

### 7. Reports Screen
- List of reported questions
- Report count and reason display
- Actions: Keep, Dismiss, Remove

### 8. Settings Screen
- Anonymous tag display and regeneration
- Notification preferences
- About & Privacy Policy
- Logout option

## 🔧 Component Library

### Button Component
```jsx
<Button
  title="Submit"
  variant="primary" // primary, secondary, outline, ghost, danger
  size="large" // small, medium, large
  fullWidth={true}
  loading={false}
  disabled={false}
  onPress={() => {}}
/>
```

### Card Component
```jsx
<Card variant="approved" onPress={() => {}}>
  <Text>Card content</Text>
</Card>
```

### QuestionCard Component
```jsx
<QuestionCard
  question="Question text"
  upvotes={15}
  status="approved"
  onUpvote={() => {}}
  onPress={() => {}}
/>
```

### Input Component
```jsx
<Input
  label="Label"
  placeholder="Enter text"
  value={value}
  onChangeText={setValue}
  multiline={false}
  maxLength={500}
  error="Error message"
  hint="Helper text"
/>
```

### RoomCodeInput Component
```jsx
<RoomCodeInput
  value={roomCode}
  onChangeText={setRoomCode}
/>
```

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Run on device/simulator**
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS (Mac only)
   ```

## 🎯 Features to Implement

### Phase 1 (MVP)
- [x] UI Design for all screens
- [ ] Backend API integration
- [ ] Real-time updates with WebSocket
- [ ] User authentication
- [ ] Room management

### Phase 2
- [ ] Push notifications
- [ ] Question search and filtering
- [ ] Export Q&A session data
- [ ] Analytics dashboard for lecturers

### Phase 3
- [ ] Multiple room support
- [ ] Question tagging system
- [ ] Student polls and quizzes
- [ ] Integration with LMS platforms

## 📊 State Management

Consider using one of these for production:
- **Context API** - For simple state needs
- **Redux Toolkit** - For complex state management
- **Zustand** - Lightweight alternative

## 🔐 Security Considerations

1. **Anonymous IDs**: Generate unique, non-traceable IDs for each student
2. **Room Codes**: Use cryptographically secure random codes
3. **Content Moderation**: Implement automated filtering for inappropriate content
4. **Rate Limiting**: Prevent spam by limiting question submissions
5. **Data Encryption**: Use HTTPS and encrypt sensitive data

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📝 Code Style

- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use meaningful variable names
- Comment complex logic

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details
