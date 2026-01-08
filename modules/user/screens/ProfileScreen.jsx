import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  Bell,
  Globe,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  Camera,
  CheckCircle,
  Home,
  Heart,
  Trash2,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({
  onEditProfile = () => {},
  onMyProperties = () => {},
  onNotifications = () => {},
  onHelpSupport = () => {},
  onLogout = () => {},
  onChangePassword = () => {},
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mock user data
  const userData = {
    name: 'John Anderson',
    email: 'john.anderson@builderco.com',
    phone: '+1 (555) 123-4567',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    companyName: 'Anderson Real Estate Group',
    businessAddress: '123 Main Street, Beverly Hills, CA 90210',
    reraId: 'RERA-CA-2024-12345',
    verified: true,
    stats: {
      totalProperties: 24,
      activeListings: 18,
      soldProperties: 6,
    },
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => onLogout(),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { icon: User, label: 'Full Name', value: userData.name },
        { icon: Mail, label: 'Email Address', value: userData.email },
        { icon: Phone, label: 'Phone Number', value: userData.phone },
      ],
    },
    {
      title: 'Business Information',
      items: [
        { icon: Building2, label: 'Company Name', value: userData.companyName },
        { icon: MapPin, label: 'Business Address', value: userData.businessAddress },
        { icon: Shield, label: 'RERA ID', value: userData.reraId },
      ],
    },
    {
      title: 'Account Settings',
      items: [
        { icon: Lock, label: 'Change Password', value: '••••••••', action: onChangePassword },
        { icon: Bell, label: 'Notifications', value: 'Enabled', action: onNotifications },
        { icon: Globe, label: 'Language', value: 'English (US)' },
      ],
    },
  ];

  const quickActions = [
    {
      icon: Home,
      label: 'My Properties',
      value: userData.stats.totalProperties,
      color: '#2D6A4F',
      action: onMyProperties,
    },
    { icon: Heart, label: 'Saved Listings', value: 12, color: '#E74C3C' },
    { icon: Bell, label: 'Notifications', value: 3, color: '#F39C12', action: onNotifications },
    { icon: HelpCircle, label: 'Help & Support', value: null, color: '#3498DB', action: onHelpSupport },
  ];

  const legalLinks = [
    { icon: FileText, label: 'Privacy Policy' },
    { icon: FileText, label: 'Terms & Conditions' },
    { icon: Shield, label: 'Security Settings' },
  ];

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Building2 size={16} color="#2D6A4F" />
            </View>
            <Text style={styles.logoText}>EstateHub</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Edit3 size={16} color="#FFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={{ uri: userData.profileImage }}
                style={styles.profileImage}
                // defaultSource={require('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400')}
              />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#2D6A4F" />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {userData.name}
              </Text>
              {userData.verified && <CheckCircle size={20} color="#60A5FA" />}
            </View>
            <View style={styles.contactRow}>
              <Mail size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.contactText} numberOfLines={1}>
                {userData.email}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Phone size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.contactText}>{userData.phone}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userData.stats.totalProperties}</Text>
            <Text style={styles.statLabel}>Total Properties</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {userData.stats.activeListings}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {userData.stats.soldProperties}
            </Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.cardContent}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: `${action.color}15` },
                    ]}
                  >
                    <action.icon size={20} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
                <View style={styles.actionRight}>
                  {action.value !== null && (
                    <Text style={styles.actionValue}>{action.value}</Text>
                  )}
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profile Details Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <View style={styles.cardContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.detailItem}
                  onPress={item.action}
                  activeOpacity={0.7}
                  disabled={!item.action}
                >
                  <View style={styles.detailLeft}>
                    <item.icon size={16} color="#9CA3AF" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {item.value}
                      </Text>
                    </View>
                  </View>
                  {item.action && <ChevronRight size={16} color="#9CA3AF" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Legal Links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal & Privacy</Text>
          <View style={styles.cardContent}>
            {legalLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.legalItem}
                activeOpacity={0.7}
              >
                <View style={styles.legalLeft}>
                  <link.icon size={16} color="#9CA3AF" />
                  <Text style={styles.legalLabel}>{link.label}</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout & Delete Account */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#374151" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionText}>© 2025 EstateHub. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#FFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  contactText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 96,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  cardContent: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    color: '#111827',
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  detailTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalLabel: {
    fontSize: 14,
    color: '#111827',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF4444',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ProfileScreen;