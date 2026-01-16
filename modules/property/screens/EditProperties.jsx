import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Home,
  BookOpen,
  Briefcase,
  User,
  Camera,
  Upload,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function EditProfile() {
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=300&fit=crop'
  );
  const [logoImage, setLogoImage] = useState(
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  // Form state
  const [formData, setFormData] = useState({
    companyName: 'TechFlow Solutions',
    industry: 'technology',
    companySize: '50-200',
    website: 'www.techflow.com',
    email: 'contact@techflow.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    address: '123 Market Street, Suite 400',
    description:
      'TechFlow Solutions is a leading technology company specializing in innovative software solutions for businesses worldwide.',
    foundedYear: '2015',
    linkedIn: 'techflow-solutions',
    twitter: 'techflow',
    facebook: 'techflowsolutions',
    instagram: 'techflow_official',
  });

  const [notifications, setNotifications] = useState({
    newApplications: true,
    applicationUpdates: true,
    interviewReminders: true,
    marketingEmails: false,
    weeklyReport: true,
    productUpdates: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const renderCompanyTab = () => (
    <View style={styles.tabContent}>
      {/* Basic Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Building2 color="#2D6A4F" size={20} />
          <Text style={styles.cardTitle}>Company Information</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.companyName}
            onChangeText={(text) =>
              setFormData({ ...formData, companyName: text })
            }
            placeholder="Enter company name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Industry *</Text>
          <View style={styles.picker}>
            <Text style={styles.pickerText}>{formData.industry}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Size</Text>
          <View style={styles.picker}>
            <Text style={styles.pickerText}>{formData.companySize} employees</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Founded Year</Text>
          <TextInput
            style={styles.input}
            value={formData.foundedYear}
            onChangeText={(text) =>
              setFormData({ ...formData, foundedYear: text })
            }
            placeholder="e.g., 2015"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Tell candidates about your company..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.helperText}>
            {formData.description.length}/500 characters
          </Text>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Mail color="#2D6A4F" size={20} />
          <Text style={styles.cardTitle}>Contact Information</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="contact@company.com"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <View style={styles.inputWithIcon}>
            <Globe
              color="#9CA3AF"
              size={16}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              value={formData.website}
              onChangeText={(text) =>
                setFormData({ ...formData, website: text })
              }
              placeholder="www.company.com"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.inputWithIcon}>
            <MapPin
              color="#9CA3AF"
              size={16}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
              placeholder="City, State"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Address</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) =>
              setFormData({ ...formData, address: text })
            }
            placeholder="Street address"
          />
        </View>
      </View>

      {/* Social Media */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Globe color="#2D6A4F" size={20} />
          <Text style={styles.cardTitle}>Social Media Links</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>LinkedIn</Text>
          <View style={styles.inputWithIcon}>
            <Linkedin
              color="#9CA3AF"
              size={16}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              value={formData.linkedIn}
              onChangeText={(text) =>
                setFormData({ ...formData, linkedIn: text })
              }
              placeholder="company-name"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Twitter</Text>
          <View style={styles.inputWithIcon}>
            <Twitter
              color="#9CA3AF"
              size={16}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              value={formData.twitter}
              onChangeText={(text) =>
                setFormData({ ...formData, twitter: text })
              }
              placeholder="@company"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Facebook</Text>
          <View style={styles.inputWithIcon}>
            <Facebook
              color="#9CA3AF"
              size={16}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              value={formData.facebook}
              onChangeText={(text) =>
                setFormData({ ...formData, facebook: text })
              }
              placeholder="company-page"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instagram</Text>
          <View style={styles.inputWithIcon}>
            <Instagram
              color="#9CA3AF"
              size={16}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              value={formData.instagram}
              onChangeText={(text) =>
                setFormData({ ...formData, instagram: text })
              }
              placeholder="@company"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      {/* Account Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <User color="#2D6A4F" size={20} />
          <Text style={styles.cardTitle}>Account Settings</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Email</Text>
          <TextInput
            style={styles.input}
            defaultValue="sarah.johnson@techflow.com"
            keyboardType="email-address"
          />
          <Text style={styles.helperText}>
            Used for login and account notifications
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Change Password</Text>
          <View style={styles.passwordInput}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Enter new password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              {showPassword ? (
                <EyeOff color="#9CA3AF" size={16} />
              ) : (
                <Eye color="#9CA3AF" size={16} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.alertBox}>
          <AlertCircle color="#D97706" size={16} />
          <Text style={styles.alertText}>
            Password must be at least 8 characters with letters and numbers
          </Text>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Bell color="#2D6A4F" size={20} />
          <Text style={styles.cardTitle}>Notifications</Text>
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>New Applications</Text>
            <Text style={styles.switchDescription}>
              Get notified when someone applies
            </Text>
          </View>
          <Switch
            value={notifications.newApplications}
            onValueChange={(value) =>
              setNotifications({ ...notifications, newApplications: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={notifications.newApplications ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Application Updates</Text>
            <Text style={styles.switchDescription}>
              Status changes and responses
            </Text>
          </View>
          <Switch
            value={notifications.applicationUpdates}
            onValueChange={(value) =>
              setNotifications({ ...notifications, applicationUpdates: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={notifications.applicationUpdates ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Interview Reminders</Text>
            <Text style={styles.switchDescription}>
              Upcoming interview notifications
            </Text>
          </View>
          <Switch
            value={notifications.interviewReminders}
            onValueChange={(value) =>
              setNotifications({ ...notifications, interviewReminders: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={notifications.interviewReminders ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Weekly Reports</Text>
            <Text style={styles.switchDescription}>
              Analytics and activity summary
            </Text>
          </View>
          <Switch
            value={notifications.weeklyReport}
            onValueChange={(value) =>
              setNotifications({ ...notifications, weeklyReport: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={notifications.weeklyReport ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Product Updates</Text>
            <Text style={styles.switchDescription}>
              New features and improvements
            </Text>
          </View>
          <Switch
            value={notifications.productUpdates}
            onValueChange={(value) =>
              setNotifications({ ...notifications, productUpdates: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={notifications.productUpdates ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Marketing Emails</Text>
            <Text style={styles.switchDescription}>
              Tips and promotional content
            </Text>
          </View>
          <Switch
            value={notifications.marketingEmails}
            onValueChange={(value) =>
              setNotifications({ ...notifications, marketingEmails: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={notifications.marketingEmails ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Shield color="#2D6A4F" size={20} />
          <Text style={styles.cardTitle}>Privacy Settings</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profile Visibility</Text>
          <View style={styles.picker}>
            <Text style={styles.pickerText}>
              {privacy.profileVisibility === 'public'
                ? 'Public - Visible to all'
                : privacy.profileVisibility === 'registered'
                ? 'Registered Users Only'
                : 'Private - Hidden'}
            </Text>
          </View>
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Show Email on Profile</Text>
            <Text style={styles.switchDescription}>
              Let candidates contact you directly
            </Text>
          </View>
          <Switch
            value={privacy.showEmail}
            onValueChange={(value) =>
              setPrivacy({ ...privacy, showEmail: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={privacy.showEmail ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Show Phone Number</Text>
            <Text style={styles.switchDescription}>
              Display phone on public profile
            </Text>
          </View>
          <Switch
            value={privacy.showPhone}
            onValueChange={(value) =>
              setPrivacy({ ...privacy, showPhone: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={privacy.showPhone ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Allow Direct Messages</Text>
            <Text style={styles.switchDescription}>
              Receive messages from candidates
            </Text>
          </View>
          <Switch
            value={privacy.allowMessages}
            onValueChange={(value) =>
              setPrivacy({ ...privacy, allowMessages: value })
            }
            trackColor={{ false: '#D1D5DB', true: '#74C0A8' }}
            thumbColor={privacy.allowMessages ? '#2D6A4F' : '#F3F4F6'}
          />
        </View>
      </View>
    </View>
  );

  const renderBrandingTab = () => (
    <View style={styles.tabContent}>
      {/* Cover Image */}
      <View style={styles.card}>
        <View style={styles.coverImageContainer}>
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <TouchableOpacity style={styles.changeCoverButton}>
            <Camera color="#000" size={16} />
            <Text style={styles.changeCoverText}>Change Cover</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Cover Image</Text>
          <Text style={styles.helperText}>
            Recommended size: 1200 x 300 pixels. Max file size: 5MB
          </Text>
          <TouchableOpacity style={styles.outlineButton}>
            <Upload color="#2D6A4F" size={16} />
            <Text style={styles.outlineButtonText}>Upload New Cover</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Company Logo */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
            Company Logo
          </Text>

          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image source={{ uri: logoImage }} style={styles.logoImage} />
              <TouchableOpacity style={styles.logoChangeButton}>
                <Camera color="#000" size={12} />
              </TouchableOpacity>
            </View>

            <View style={styles.logoInfo}>
              <Text style={styles.logoTitle}>Current Logo</Text>
              <Text style={styles.logoDescription}>
                Square format recommended{'\n'}Min 200 x 200 pixels
              </Text>
              <TouchableOpacity style={styles.smallOutlineButton}>
                <Upload color="#2D6A4F" size={12} />
                <Text style={styles.smallOutlineButtonText}>Upload New</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.alertBox, { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}>
            <AlertCircle color="#2563EB" size={16} />
            <Text style={[styles.alertText, { color: '#1E40AF' }]}>
              Your logo appears on job postings and company profile. Use a
              clear, high-quality image.
            </Text>
          </View>
        </View>
      </View>

      {/* Brand Colors */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Brand Colors</Text>
          <Text style={styles.helperText}>
            Customize your company page appearance
          </Text>

          <View style={styles.colorItem}>
            <View>
              <Text style={styles.colorTitle}>Primary Color</Text>
              <Text style={styles.colorCode}>#2D6A4F</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: '#2D6A4F' }]} />
          </View>

          <View style={styles.colorItem}>
            <View>
              <Text style={styles.colorTitle}>Secondary Color</Text>
              <Text style={styles.colorCode}>#74C0A8</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: '#74C0A8' }]} />
          </View>

          <View style={styles.badge}>
            <Users color="#6B7280" size={12} />
            <Text style={styles.badgeText}>Enterprise Plan Feature</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Success Toast */}
      {showSuccess && (
        <View style={styles.successToast}>
          <CheckCircle2 color="#FFF" size={20} />
          <Text style={styles.successText}>Profile updated successfully!</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Building2 color="#FFF" size={32} />
        </View>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Text style={styles.headerSubtitle}>Update your company information</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'company' && styles.activeTab]}
          onPress={() => setActiveTab('company')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'company' && styles.activeTabText,
            ]}
          >
            Company
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && styles.activeTabText,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'branding' && styles.activeTab]}
          onPress={() => setActiveTab('branding')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'branding' && styles.activeTabText,
            ]}
          >
            Branding
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'company' && renderCompanyTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'branding' && renderBrandingTab()}

        {/* Save Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.savingButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Text style={styles.saveButtonText}>Saving Changes...</Text>
              </>
            ) : (
              <>
                <Save color="#FFF" size={20} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home color="#9CA3AF" size={20} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <BookOpen color="#9CA3AF" size={20} />
          <Text style={styles.navText}>Blogs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Briefcase color="#9CA3AF" size={20} />
          <Text style={styles.navText}>Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <User color="#2D6A4F" size={20} />
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  successToast: {
    position: 'absolute',
    top: 50,
    left: 24,
    right: 24,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  successText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2D6A4F',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    marginTop: -16,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  tabContent: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 20,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  picker: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  pickerText: {
    fontSize: 14,
    color: '#111827',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  inputWithIconText: {
    paddingLeft: 44,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  alertBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    flex: 1,
    paddingRight: 16,
  },
  switchTitle: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  coverImageContainer: {
    height: 128,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeCoverText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 12,
  },
  outlineButtonText: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  logoSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  logoContainer: {
    position: 'relative',
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#F3F4F6',
  },
  logoChangeButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  logoDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  smallOutlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  smallOutlineButtonText: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 12,
  },
  colorTitle: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  colorCode: {
    fontSize: 12,
    color: '#6B7280',
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#2D6A4F',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  savingButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activeNavText: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
});