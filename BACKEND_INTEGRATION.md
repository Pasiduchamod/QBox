# QBox Frontend - Backend Integration Guide

## ✅ Completed
1. **API Service** (`src/services/api.js`) - All backend endpoints integrated
2. **Login Screen** - Connected to `/api/auth/login`
3. **SignUp Screen** - Connected to `/api/auth/signup`

## 🔧 Required Screen Updates

### Important Note About API URL
In `src/services/api.js`, update the API_URL:
- **For Android Emulator**: `http://10.0.2.2:5000/api`
- **For iOS Simulator**: `http://localhost:5000/api`
- **For Real Device**: `http://YOUR_COMPUTER_IP:5000/api` (e.g., `http://192.168.1.100:5000/api`)

Find your computer's IP:
```bash
# Windows
ipconfig

# Look for "IPv4 Address" under your WiFi/Ethernet adapter
```

## 📝 Screen-by-Screen Integration

### 1. MyRoomsScreen.js
**Replace the entire file with MyRoomsScreen.updated.js**

Key changes:
- Uses `roomAPI.getMyRooms()` to fetch real rooms
- Refreshes on screen focus using `useFocusEffect`
- Shows loading state
- Handles authentication errors

### 2. CreateRoomScreen.js
Add at top:
```javascript
import { roomAPI } from '../services/api';
```

Replace `handleCreateRoom`:
```javascript
const handleCreateRoom = async () => {
  if (!roomName.trim()) {
    Alert.alert('Error', 'Please enter a room name');
    return;
  }

  setLoading(true);
  try {
    const response = await roomAPI.createRoom(roomName.trim(), questionsVisible);
    
    if (response.success) {
      Alert.alert('Success', `Room created! Code: ${response.data.roomCode}`);
      navigation.navigate('LecturerPanel', {
        roomId: response.data._id,
        roomCode: response.data.roomCode,
        roomName: response.data.roomName,
        questionsVisible: response.data.questionsVisible,
        status: response.data.status,
      });
    }
  } catch (error) {
    console.error('Create room error:', error);
    Alert.alert('Error', error.response?.data?.message || 'Failed to create room');
  } finally {
    setLoading(false);
  }
};
```

### 3. JoinRoomScreen.js
Add at top:
```javascript
import { roomAPI } from '../services/api';
```

Replace `handleJoinRoom`:
```javascript
const handleJoinRoom = async () => {
  if (!roomCode.trim()) {
    Alert.alert('Error', 'Please enter a room code');
    return;
  }

  setLoading(true);
  try {
    const response = await roomAPI.joinRoom(roomCode.trim().toUpperCase());
    
    if (response.success) {
      navigation.navigate('RoomFeed', {
        roomId: response.data.roomId,
        roomCode: response.data.roomCode,
        roomName: response.data.roomName,
        lecturerName: response.data.lecturerName,
        questionsVisible: response.data.questionsVisible,
      });
    }
  } catch (error) {
    console.error('Join room error:', error);
    Alert.alert('Error', error.response?.data?.message || 'Invalid room code or room is closed');
  } finally {
    setLoading(false);
  }
};
```

### 4. RoomFeedScreen.js (Student View)
Add at top:
```javascript
import { questionAPI, initSocket, getSocket } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
```

Replace state and logic:
```javascript
const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(true);
const [myStudentTag, setMyStudentTag] = useState('');

useFocusEffect(
  useCallback(() => {
    fetchQuestions();
    setupSocket();
    
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new-question');
        socket.off('question-upvote-update');
        socket.off('question-removed');
        socket.off('room-status-changed');
      }
    };
  }, [])
);

const fetchQuestions = async () => {
  try {
    const studentTag = await AsyncStorage.getItem('studentTag');
    setMyStudentTag(studentTag);
    
    const response = await questionAPI.getQuestions(
      route.params.roomId,
      !route.params.questionsVisible ? studentTag : null
    );
    
    if (response.success) {
      setQuestions(response.data);
    }
  } catch (error) {
    console.error('Fetch questions error:', error);
    Alert.alert('Error', 'Failed to load questions');
  } finally {
    setLoading(false);
  }
};

const setupSocket = () => {
  const socket = initSocket();
  const roomCode = route.params.roomCode;
  
  socket.emit('join-room', roomCode);
  
  socket.on('new-question', (question) => {
    setQuestions(prev => [question, ...prev]);
  });
  
  socket.on('question-upvote-update', ({ questionId, upvotes }) => {
    setQuestions(prev =>
      prev.map(q => q._id === questionId ? { ...q, upvotes } : q)
    );
  });
  
  socket.on('question-removed', ({ questionId }) => {
    setQuestions(prev => prev.filter(q => q._id !== questionId));
  });
  
  socket.on('room-status-changed', ({ status, message }) => {
    if (status === 'closed') {
      Alert.alert('Room Closed', message);
      navigation.goBack();
    }
  });
};

const handleUpvote = async (questionId) => {
  try {
    await questionAPI.upvoteQuestion(questionId, route.params.roomCode);
  } catch (error) {
    console.error('Upvote error:', error);
    Alert.alert('Error', 'Failed to upvote question');
  }
};

const handleReport = async (questionId) => {
  Alert.alert(
    'Report Question',
    'Are you sure you want to report this question?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          try {
            await questionAPI.reportQuestion(questionId);
            Alert.alert('Success', 'Question reported');
          } catch (error) {
            console.error('Report error:', error);
            Alert.alert('Error', 'Failed to report question');
          }
        },
      },
    ]
  );
};
```

### 5. AskQuestionScreen.js
Add at top:
```javascript
import { questionAPI } from '../services/api';
```

Replace `handleSubmit`:
```javascript
const handleSubmit = async () => {
  if (!question.trim()) {
    Alert.alert('Error', 'Please enter your question');
    return;
  }

  setLoading(true);
  try {
    const response = await questionAPI.askQuestion(
      question.trim(),
      route.params.roomId,
      route.params.roomCode
    );
    
    if (response.success) {
      Alert.alert('Success', 'Question submitted!');
      navigation.goBack();
    }
  } catch (error) {
    console.error('Ask question error:', error);
    Alert.alert('Error', error.response?.data?.message || 'Failed to submit question');
  } finally {
    setLoading(false);
  }
};
```

### 6. LecturerPanelScreen.js
Similar to RoomFeedScreen but with additional lecturer actions:

```javascript
const handleToggleVisibility = async () => {
  try {
    const response = await roomAPI.toggleVisibility(route.params.roomId);
    if (response.success) {
      setQuestionsVisible(response.data.questionsVisible);
      Alert.alert('Success', `Questions are now ${response.data.questionsVisible ? 'public' : 'private'}`);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to toggle visibility');
  }
};

const handleCloseRoom = async () => {
  Alert.alert(
    'Close Room',
    'Are you sure? Students won\'t be able to ask new questions.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            await roomAPI.closeRoom(route.params.roomId, route.params.roomCode);
            Alert.alert('Success', 'Room closed');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to close room');
          }
        },
      },
    ]
  );
};

const handleApproveQuestion = async (questionId) => {
  try {
    await questionAPI.approveQuestion(questionId, route.params.roomCode);
  } catch (error) {
    Alert.alert('Error', 'Failed to approve question');
  }
};

const handleAnswerQuestion = async (questionId) => {
  try {
    await questionAPI.answerQuestion(questionId, route.params.roomCode);
  } catch (error) {
    Alert.alert('Error', 'Failed to mark as answered');
  }
};

const handleDeleteQuestion = async (questionId) => {
  Alert.alert(
    'Delete Question',
    'Are you sure you want to delete this question?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await questionAPI.deleteQuestion(questionId, route.params.roomCode);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete question');
          }
        },
      },
    ]
  );
};
```

### 7. ForgotPasswordScreen.js
```javascript
const handleResetPassword = async () => {
  if (!email.trim()) {
    Alert.alert('Error', 'Please enter your email');
    return;
  }

  setLoading(true);
  try {
    const response = await authAPI.forgotPassword(email.trim());
    
    if (response.success) {
      Alert.alert('Success', 'Password reset instructions sent to your email');
      navigation.goBack();
    }
  } catch (error) {
    Alert.alert('Error', error.response?.data?.message || 'Failed to send reset email');
  } finally {
    setLoading(false);
  }
};
```

### 8. SettingsScreen.js
Add profile and change password functionality using `userAPI.getProfile()`, `userAPI.updateProfile()`, and `userAPI.changePassword()`.

## 🚀 Testing Steps

1. **Start Backend Server**:
   ```bash
   cd QBox-Backend
   node server.js
   ```

2. **Update API URL** in `src/services/api.js` to your computer's IP

3. **Start Frontend**:
   ```bash
   cd QBox
   npm start
   ```

4. **Test Flow**:
   - Sign up as lecturer
   - Create a room
   - Note the room code
   - Join from student mode (use a different device/simulator)
   - Ask questions
   - See real-time updates!

## 🐛 Common Issues

### "Unable to connect to server"
- Backend server not running
- Wrong API_URL (check IP address)
- Firewall blocking port 5000

### "Network request failed"
- Use computer's IP instead of localhost for real devices
- Ensure phone and computer on same WiFi

### Questions not updating in real-time
- Socket.io connection issue
- Check browser console for socket errors
- Ensure SOCKET_URL matches API_URL

## 📱 Device-Specific URLs

```javascript
// src/services/api.js

// For Android Emulator
const API_URL = 'http://10.0.2.2:5000/api';
const SOCKET_URL = 'http://10.0.2.2:5000';

// For iOS Simulator  
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// For Real Device (replace with YOUR IP)
const API_URL = 'http://192.168.1.100:5000/api';
const SOCKET_URL = 'http://192.168.1.100:5000';
```

## ✨ Next Steps

1. Replace MyRoomsScreen with the updated version
2. Update all other screens following the patterns above
3. Test each screen individually
4. Add error handling and loading states
5. Test real-time features with multiple devices

Would you like me to update specific screens now?
