import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Shield,
  AlertCircle,
  Mail,
  MessageSquare,
  HelpCircle,
  FileText,
  LogOut,
  ShieldAlert,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 440;
const CONTAINER_WIDTH = Math.min(width, MAX_WIDTH);

export default function App() {
  return (
    <View style={styles.container}>
      {/* Pattern Overlay */}
      <View style={styles.patternOverlay} />

      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner} />
          </View>
          <Text style={styles.appTitle}>RealEstate Pro</Text>
        </View>
      </View>

      {/* Main Content Area - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Icon */}
        <View style={styles.iconSection}>
          {/* Outer subtle ring */}
          <View style={styles.outerRing} />

          {/* Main icon container */}
          <View style={styles.iconContainer}>
            <ShieldAlert color="#FFFFFF" size={48} strokeWidth={1.5} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Account Blocked</Text>

        {/* Primary Message */}
        <Text style={styles.primaryMessage}>
          Your account has been temporarily restricted due to a policy or
          verification issue.
        </Text>

        {/* Status & Reason Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <AlertCircle color="#D97706" size={20} />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Block Details</Text>
              <View style={styles.statusDetails}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Temporary Block</Text>
                  </View>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Reason:</Text>
                  <Text style={styles.statusValue}>Verification pending</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.statusInfoBox}>
            <Text style={styles.statusInfoText}>
              We've temporarily restricted your account while we review your
              information. This is a standard security measure to protect all
              users.
            </Text>
          </View>
        </View>

        {/* Secondary Helper Text */}
        <Text style={styles.secondaryMessage}>
          Please contact our support team for more information or to request a
          review of your account.
        </Text>

        {/* Primary Action */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <MessageSquare
              color="#FFFFFF"
              size={20}
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Contact Support</Text>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
              <FileText
                color="#374151"
                size={16}
                style={styles.smallButtonIcon}
              />
              <Text style={styles.secondaryButtonText}>Request Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
              <LogOut color="#374151" size={16} style={styles.smallButtonIcon} />
              <Text style={styles.secondaryButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Reassurance */}
        <View style={styles.securityBadge}>
          <View style={styles.securityIconContainer}>
            <Shield color="#16A34A" size={12} strokeWidth={2.5} />
          </View>
          <Text style={styles.securityText}>
            Your data remains safe and secure
          </Text>
        </View>

        {/* Help & Support Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <HelpCircle color="#4B5563" size={16} />
            <Text style={styles.helpTitle}>Need Help?</Text>
          </View>

          <View style={styles.helpOptions}>
            {/* Email Support */}
            <TouchableOpacity style={styles.helpOption} activeOpacity={0.7}>
              <View style={[styles.helpIconContainer, styles.emailIconBg]}>
                <Mail color="#2563EB" size={20} />
              </View>
              <View style={styles.helpOptionContent}>
                <Text style={styles.helpOptionTitle}>Email Support</Text>
                <Text style={styles.helpOptionSubtitle} numberOfLines={1}>
                  support@realestatepro.com
                </Text>
              </View>
            </TouchableOpacity>

            {/* Live Chat */}
            <TouchableOpacity style={styles.helpOption} activeOpacity={0.7}>
              <View style={[styles.helpIconContainer, styles.chatIconBg]}>
                <MessageSquare color="#16A34A" size={20} />
              </View>
              <View style={styles.helpOptionContent}>
                <Text style={styles.helpOptionTitle}>Live Chat</Text>
                <Text style={styles.helpOptionSubtitle}>
                  Available 9 AM - 6 PM
                </Text>
              </View>
            </TouchableOpacity>

            {/* Help Center */}
            <TouchableOpacity style={styles.helpOption} activeOpacity={0.7}>
              <View style={[styles.helpIconContainer, styles.helpCenterIconBg]}>
                <HelpCircle color="#9333EA" size={20} />
              </View>
              <View style={styles.helpOptionContent}>
                <Text style={styles.helpOptionTitle}>Help Center</Text>
                <Text style={styles.helpOptionSubtitle}>
                  FAQs and common issues
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Link */}
        <View style={styles.faqSection}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.faqLink}>Why was my account blocked?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLinkText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.copyright}>
          © 2026 RealEstate Pro. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    width: CONTAINER_WIDTH,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#FFF7ED',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoOuter: {
    width: 56,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoInner: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: '#FED7AA',
    borderRadius: 60,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#F97316',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryMessage: {
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
    fontSize: 15,
  },
  statusCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 4,
  },
  statusDetails: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#B45309',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
  },
  statusValue: {
    fontSize: 12,
    color: '#78350F',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  statusInfoBox: {
    backgroundColor: 'rgba(254, 243, 199, 0.5)',
    borderRadius: 8,
    padding: 10,
  },
  statusInfoText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
  },
  secondaryMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 24,
  },
  buttonSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  smallButtonIcon: {
    marginRight: 6,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24,
    alignSelf: 'center',
    maxWidth: 280,
  },
  securityIconContainer: {
    width: 20,
    height: 20,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
  },
  helpSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  helpOptions: {
    gap: 8,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailIconBg: {
    backgroundColor: '#DBEAFE',
  },
  chatIconBg: {
    backgroundColor: '#DCFCE7',
  },
  helpCenterIconBg: {
    backgroundColor: '#F3E8FF',
  },
  helpOptionContent: {
    flex: 1,
  },
  helpOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  helpOptionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  faqSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  faqLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  footerLinkText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerDivider: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  copyright: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#9CA3AF',
  },
});