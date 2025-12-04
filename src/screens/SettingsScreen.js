import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, Card, Button } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { userAPI } from '../services/api';

export const SettingsScreen = ({ navigation, route }) => {
  const userType = route.params?.userType || 'student';
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [isOneTimeUser, setIsOneTimeUser] = useState(false);
  
  // Generate random anonymous tag for students
  const generateRandomTag = () => {
    const animals = ['Panda', 'Tiger', 'Lion', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Koala', 'Owl', 'Rabbit', 'Dragon'];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${animal}#${number}`;
  };
  
  const [anonymousTag, setAnonymousTag] = useState('');

  // Fetch user profile data and student tag
  useEffect(() => {
    checkOneTimeUser();
    fetchUserProfile();
    loadStudentTag();
  }, []);

  const checkOneTimeUser = async () => {
    try {
      const isOneTime = await AsyncStorage.getItem('isOneTimeUser');
      setIsOneTimeUser(isOneTime === 'true');
    } catch (error) {
      setIsOneTimeUser(false);
    }
  };

  const loadStudentTag = async () => {
    try {
      const tag = await AsyncStorage.getItem('studentTag');
      if (tag) {
        setAnonymousTag(tag);
      } else {
        // Generate and save a new tag if none exists
        const newTag = generateRandomTag();
        setAnonymousTag(newTag);
        await AsyncStorage.setItem('studentTag', newTag);
      }
    } catch (error) {
      // Error loading tag, generate a new one
      const newTag = generateRandomTag();
      setAnonymousTag(newTag);
    }
  };

  const fetchUserProfile = async () => {
    // Only fetch profile for lecturers
    if (userType !== 'lecturer') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      if (response.success) {
        setUserData(response.data);
        setTempName(response.data.name);
        setTempEmail(response.data.email);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTag = () => {
    Alert.alert(
      '⚠️ Warning',
      'If you regenerate your tag, you will lose connection to your previous questions. They will appear as questions from another student, and you won\'t be able to identify them as yours.\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            const newTag = generateRandomTag();
            setAnonymousTag(newTag);
            await AsyncStorage.setItem('studentTag', newTag);
            Alert.alert('✅ Tag Regenerated', 'You now have a new anonymous identity. Your previous questions will no longer show as yours.');
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (tempName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long');
      return;
    }

    try {
      const response = await userAPI.updateProfile(tempName.trim(), userData?.email);
      if (response.success) {
        setUserData(response.data);
        setActiveModal(null);
        Alert.alert('✅ Success', 'Your profile has been updated');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleOpenEditProfile = () => {
    setTempName(userData?.name || '');
    setActiveModal('editProfile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Navigate back to onboarding
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, description, rightComponent, onPress }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <Screen>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.description}>
            Manage your preferences and account settings
          </Text>
        </View>

        {/* Profile Section - Hidden for one-time users */}
        {!isOneTimeUser && (
          <>
            <SectionHeader title="Profile" />
            <Card style={styles.section}>
              {userType === 'student' ? (
                <View style={styles.profileCard}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarEmoji}>🎭</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.anonymousLabel}>Your Anonymous Tag</Text>
                    <Text style={styles.anonymousTag}>{anonymousTag}</Text>
                    <TouchableOpacity onPress={handleRegenerateTag}>
                      <Text style={styles.regenerateLink}>🔄 Regenerate Tag</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileCard}>
                  <View style={[styles.avatarContainer, styles.lecturerAvatar]}>
                    <Text style={styles.avatarEmoji}>👨‍🏫</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.lecturerName}>{userData?.name || 'Loading...'}</Text>
                    <Text style={styles.lecturerEmail}>{userData?.email || 'Loading...'}</Text>
                    <TouchableOpacity onPress={handleOpenEditProfile}>
                      <Text style={styles.regenerateLink}>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
          </>
        )}

        {/* Notifications Section - Hidden for one-time users */}
        {!isOneTimeUser && (
          <>
            <SectionHeader title="Preferences" />
            <Card style={styles.section}>
              <SettingItem
                icon="🔔"
                title="Notifications"
                description="Receive updates about your questions"
                rightComponent={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                }
              />
            </Card>
          </>
        )}

        {/* About Section */}
        <SectionHeader title="About" />
        <Card style={styles.section}>
          <SettingItem
            icon="📖"
            title="How it Works"
            description="Learn about QBox features and how to use them"
            onPress={() => setActiveModal('howItWorks')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="🔒"
            title="Privacy Policy"
            description="How we protect your data and privacy"
            onPress={() => setActiveModal('privacy')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="📜"
            title="Terms of Service"
            description="Terms and conditions for using QBox"
            onPress={() => setActiveModal('terms')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="ℹ️"
            title="App Version"
            description="Current version of QBox"
            rightComponent={
              <Text style={styles.versionText}>1.0.4</Text>
            }
          />
        </Card>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <Card style={styles.section}>
          <SettingItem
            icon="💬"
            title="Contact Support"
            description="Get help and report issues"
            onPress={() => Alert.alert('Contact Support', 'Need help? Email us at axlesolutionsinfo@gmail.com and we\'ll get back to you within 24 hours.')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="⭐"
            title="Rate QBox"
            description="Share your feedback on the app store"
            onPress={() => Alert.alert('Rate QBox', 'Enjoying QBox? Please rate us on the app store! Your feedback helps us improve.')}
          />
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            fullWidth
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with ❤️ for better learning
        </Text>
      </ScrollView>
      )}

      {/* How it Works Modal */}
      <Modal
        visible={activeModal === 'howItWorks'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>📖</Text>
                <Text style={styles.modalTitle}>How QBox Works</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>🎯 For Students</Text>
                <Text style={styles.featureText}>• Join rooms using a 6-character code</Text>
                <Text style={styles.featureText}>• Ask questions anonymously with a random tag</Text>
                <Text style={styles.featureText}>• Upvote questions you find interesting</Text>
                <Text style={styles.featureText}>• See answered questions</Text>
                <Text style={styles.featureText}>• Report inappropriate content</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>👨‍🏫 For Lecturers</Text>
                <Text style={styles.featureText}>• Create rooms with custom names</Text>
                <Text style={styles.featureText}>• Share room codes with students</Text>
                <Text style={styles.featureText}>• Manage pending and answered questions</Text>
                <Text style={styles.featureText}>• Mark questions as answered when addressed</Text>
                <Text style={styles.featureText}>• Close rooms when sessions end</Text>
                <Text style={styles.featureText}>• Choose between public or private question visibility</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>🔒 Privacy Features</Text>
                <Text style={styles.featureText}>• All student questions are anonymous</Text>
                <Text style={styles.featureText}>• Random tags ensure identity protection</Text>
                <Text style={styles.featureText}>• Private rooms for sensitive topics</Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseButtonText}>Got it!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={activeModal === 'privacy'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>🔒</Text>
                <Text style={styles.modalTitle}>Privacy Policy</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>🛡️ Data Protection</Text>
                <Text style={styles.featureText}>
                  Your privacy is our top priority. QBox is designed with privacy-first principles:
                </Text>
                <Text style={styles.featureText}>• Student questions are completely anonymous</Text>
                <Text style={styles.featureText}>• We never link questions to real identities</Text>
                <Text style={styles.featureText}>• Random tags change between sessions</Text>
                <Text style={styles.featureText}>• No tracking of individual student activity</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>📊 Data Collection</Text>
                <Text style={styles.featureText}>We only collect:</Text>
                <Text style={styles.featureText}>• Email and name for lecturer accounts</Text>
                <Text style={styles.featureText}>• Question content and votes (anonymous)</Text>
                <Text style={styles.featureText}>• Room codes and session data</Text>
                <Text style={styles.featureText}>• Basic usage analytics for improvements</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>🔐 Data Security</Text>
                <Text style={styles.featureText}>• All data encrypted in transit and at rest</Text>
                <Text style={styles.featureText}>• Secure authentication for lecturers</Text>
                <Text style={styles.featureText}>• Regular security audits and updates</Text>
                <Text style={styles.featureText}>• No third-party data sharing</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>📧 Contact</Text>
                <Text style={styles.featureText}>
                  Questions about privacy? Email us at axlesolutionsinfo@gmail.com
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={activeModal === 'terms'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>📜</Text>
                <Text style={styles.modalTitle}>Terms of Service</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>✅ Acceptable Use</Text>
                <Text style={styles.featureText}>By using QBox, you agree to:</Text>
                <Text style={styles.featureText}>• Use the app for educational purposes</Text>
                <Text style={styles.featureText}>• Be respectful to all users</Text>
                <Text style={styles.featureText}>• Ask genuine, relevant questions</Text>
                <Text style={styles.featureText}>• Not abuse the reporting system</Text>
                <Text style={styles.featureText}>• Maintain a positive learning environment</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>🚫 Prohibited Content</Text>
                <Text style={styles.featureText}>The following is strictly prohibited:</Text>
                <Text style={styles.featureText}>• Spam or irrelevant content</Text>
                <Text style={styles.featureText}>• Harassment or bullying</Text>
                <Text style={styles.featureText}>• Hate speech or discrimination</Text>
                <Text style={styles.featureText}>• Inappropriate or offensive material</Text>
                <Text style={styles.featureText}>• Academic dishonesty</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>⚠️ Consequences</Text>
                <Text style={styles.featureText}>
                  Violations may result in:
                </Text>
                <Text style={styles.featureText}>• Content removal</Text>
                <Text style={styles.featureText}>• Account suspension</Text>
                <Text style={styles.featureText}>• Permanent ban from the platform</Text>
                <Text style={styles.featureText}>• Reporting to institution authorities</Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>📝 Updates</Text>
                <Text style={styles.featureText}>
                  We may update these terms periodically. Continued use of QBox constitutes acceptance of any changes.
                </Text>
              </View>

              <View style={styles.featureSection}>
                <Text style={[styles.featureText, { fontStyle: 'italic', color: colors.textTertiary }]}>
                  Last updated: November 2025
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseButtonText}>I Understand</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={activeModal === 'editProfile'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editProfileModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>✏️</Text>
              <Text style={styles.modalTitle}>Edit Profile</Text>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
              <Text style={styles.inputHint}>This name will be visible in your account</Text>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.inputLabel}>Email</Text>
              <Text style={styles.emailDisplay}>{userData?.email}</Text>
              <Text style={styles.inputHint}>Email cannot be changed</Text>
            </View>

            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </Screen>
  );
};

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.md,
    color: colors.textSecondary,
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
  },
  
  // Section
  sectionHeader: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  section: {
    padding: 0,
    marginBottom: spacing.md,
  },
  
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  lecturerAvatar: {
    backgroundColor: colors.secondary + '20',
  },
  profileInfo: {
    flex: 1,
  },
  anonymousLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  anonymousTag: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  lecturerName: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  lecturerEmail: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  regenerateLink: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  
  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.sm,
  },
  versionText: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 24 + spacing.md,
  },
  
  // Logout
  logoutContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  // Footer
  footer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  
  // Info Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  infoModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '85%',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  featureSection: {
    marginBottom: spacing.xl,
  },
  featureTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
    marginBottom: spacing.xs,
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  modalCloseButtonText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  
  // Edit Profile Modal
  editProfileModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  editSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.md,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  inputHint: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  emailDisplay: {
    fontSize: typography.md,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
  },
});

export default SettingsScreen;
