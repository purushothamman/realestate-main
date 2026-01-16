import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  FileText,
  Shield,
  Award,
  TrendingUp,
  Eye,
  HelpCircle,
  FileCheck,
  Mail,
  Building2,
  MapPin,
  AlertCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const BuilderVerificationScreen = ({ onBack }) => {
  const [verificationStatus] = useState('under-review');

  const builderInfo = {
    name: 'Skyline Constructions Ltd.',
    location: 'New York, NY',
    builderId: 'BLD-2024-8475',
    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop',
    memberSince: 'January 2024'
  };

  const verificationSteps = [
    {
      id: '1',
      title: 'Identity Proof',
      description: 'Government-issued ID or passport',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Business Documents',
      description: 'Company registration & license',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Address Verification',
      description: 'Proof of business address',
      status: 'pending',
      action: 'Upload'
    },
    {
      id: '4',
      title: 'Bank Details',
      description: 'Bank account verification',
      status: 'rejected',
      action: 'Re-upload',
      rejectionReason: 'Document quality is unclear. Please upload a clearer image.'
    }
  ];

  const documents = [
    {
      id: '1',
      name: 'Business License.pdf',
      status: 'approved',
      uploadedDate: '3 days ago'
    },
    {
      id: '2',
      name: 'Tax Registration.pdf',
      status: 'approved',
      uploadedDate: '3 days ago'
    },
    {
      id: '3',
      name: 'Bank Statement.pdf',
      status: 'rejected',
      uploadedDate: '2 days ago',
      rejectionReason: 'Document quality is unclear'
    },
    {
      id: '4',
      name: 'Address Proof.pdf',
      status: 'pending',
      uploadedDate: '1 day ago'
    }
  ];

  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
  const totalSteps = verificationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified Builder',
          icon: CheckCircle2,
          bgColor: '#f0fdf4',
          textColor: '#15803d',
          iconColor: '#16a34a',
          borderColor: '#bbf7d0'
        };
      case 'under-review':
        return {
          label: 'Under Review',
          icon: Clock,
          bgColor: '#fffbeb',
          textColor: '#b45309',
          iconColor: '#d97706',
          borderColor: '#fde68a'
        };
      case 'not-verified':
        return {
          label: 'Not Verified',
          icon: XCircle,
          bgColor: '#fef2f2',
          textColor: '#b91c1c',
          iconColor: '#dc2626',
          borderColor: '#fecaca'
        };
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 width={20} height={20} color="#16a34a" />;
      case 'pending':
        return <Clock width={20} height={20} color="#f59e0b" />;
      case 'rejected':
        return <XCircle width={20} height={20} color="#ef4444" />;
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <View style={styles.badgeApproved}>
            <Text style={styles.badgeTextApproved}>Approved</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.badgePending}>
            <Text style={styles.badgeTextPending}>Pending</Text>
          </View>
        );
      case 'rejected':
        return (
          <View style={styles.badgeRejected}>
            <Text style={styles.badgeTextRejected}>Rejected</Text>
          </View>
        );
    }
  };

  const statusBadge = getStatusBadge(verificationStatus);
  const StatusIcon = statusBadge.icon;
  const hasPendingActions = verificationSteps.some(step => step.status === 'pending' || step.status === 'rejected');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1695067438561-75492f7b6a9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />
        
        <View style={styles.headerContent}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                  <ChevronLeft width={24} height={24} color="#ffffff" />
                </TouchableOpacity>
              )}
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Building2 width={24} height={24} color="#ffffff" />
                </View>
                <Text style={styles.logoText}>EstateBuilder</Text>
              </View>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Verification Status</Text>
            <Text style={styles.subtitle}>Track your builder profile verification progress</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Builder Identity Card */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.builderInfo}>
              <Image
                source={{ uri: builderInfo.avatar }}
                style={styles.avatar}
              />
              <View style={styles.builderDetails}>
                <Text style={styles.builderName}>{builderInfo.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin width={16} height={16} color="#6b7280" />
                  <Text style={styles.locationText}>{builderInfo.location}</Text>
                </View>
                <Text style={styles.infoText}>ID: {builderInfo.builderId}</Text>
                <Text style={styles.infoText}>Member since {builderInfo.memberSince}</Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor, borderColor: statusBadge.borderColor }]}>
              <StatusIcon width={20} height={20} color={statusBadge.iconColor} />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusLabel, { color: statusBadge.textColor }]}>{statusBadge.label}</Text>
                {verificationStatus === 'under-review' && (
                  <Text style={styles.statusSubtext}>Your documents are being reviewed by our team</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Verification Progress */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Verification Progress</Text>
              <Text style={styles.stepsText}>{completedSteps}/{totalSteps} Steps</Text>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressPercent}>{Math.round(progressPercentage)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
            </View>

            <View style={styles.stepsList}>
              {verificationSteps.map((step) => (
                <View
                  key={step.id}
                  style={[
                    styles.stepCard,
                    step.status === 'rejected' && styles.stepCardRejected,
                    step.status === 'pending' && styles.stepCardPending
                  ]}
                >
                  <View style={styles.stepContent}>
                    <View style={styles.stepIcon}>{getStepIcon(step.status)}</View>
                    <View style={styles.stepDetails}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepTextContainer}>
                          <Text style={styles.stepTitle}>{step.title}</Text>
                          <Text style={styles.stepDescription}>{step.description}</Text>
                        </View>
                        {step.action && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              step.status === 'rejected' ? styles.actionButtonRejected : styles.actionButtonPrimary
                            ]}
                          >
                            <Text style={styles.actionButtonText}>{step.action}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {step.rejectionReason && (
                        <View style={styles.rejectionNotice}>
                          <AlertCircle width={16} height={16} color="#dc2626" />
                          <Text style={styles.rejectionText}>{step.rejectionReason}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Document Status */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Submitted Documents</Text>
            <View style={styles.documentsList}>
              {documents.map((doc) => (
                <View key={doc.id} style={styles.documentCard}>
                  <View style={styles.documentContent}>
                    <FileText width={20} height={20} color="#9ca3af" />
                    <View style={styles.documentDetails}>
                      <View style={styles.documentHeader}>
                        <View style={styles.documentTextContainer}>
                          <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                          <Text style={styles.documentDate}>Uploaded {doc.uploadedDate}</Text>
                        </View>
                        {getDocumentStatusBadge(doc.status)}
                      </View>
                      {doc.rejectionReason && (
                        <View style={styles.documentRejection}>
                          <Text style={styles.rejectionReasonText}>Reason: {doc.rejectionReason}</Text>
                          <TouchableOpacity style={styles.reuploadButton}>
                            <Upload width={14} height={14} color="#2D6A4F" />
                            <Text style={styles.reuploadText}>Re-upload Document</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Verification Benefits */}
        <View style={styles.section}>
          <View style={styles.benefitsCard}>
            <View style={styles.benefitsHeader}>
              <Award width={20} height={20} color="#2D6A4F" />
              <Text style={styles.benefitsTitle}>Verification Benefits</Text>
            </View>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Shield width={16} height={16} color="#14b8a6" />
                <Text style={styles.benefitText}>Build trust with verified builder badge</Text>
              </View>
              <View style={styles.benefitItem}>
                <TrendingUp width={16} height={16} color="#14b8a6" />
                <Text style={styles.benefitText}>Increase listing visibility by up to 3x</Text>
              </View>
              <View style={styles.benefitItem}>
                <Eye width={16} height={16} color="#14b8a6" />
                <Text style={styles.benefitText}>Access premium features and analytics</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Help & Support */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Need Help?</Text>
            <View style={styles.helpList}>
              <TouchableOpacity style={styles.helpButton}>
                <View style={styles.helpButtonContent}>
                  <FileCheck width={20} height={20} color="#6b7280" />
                  <Text style={styles.helpButtonText}>Verification Guidelines</Text>
                </View>
                <ChevronLeft width={16} height={16} color="#9ca3af" style={styles.chevronRight} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpButton}>
                <View style={styles.helpButtonContent}>
                  <HelpCircle width={20} height={20} color="#6b7280" />
                  <Text style={styles.helpButtonText}>Help & Support</Text>
                </View>
                <ChevronLeft width={16} height={16} color="#9ca3af" style={styles.chevronRight} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpButton}>
                <View style={styles.helpButtonContent}>
                  <Mail width={20} height={20} color="#6b7280" />
                  <Text style={styles.helpButtonText}>Contact Admin</Text>
                </View>
                <ChevronLeft width={16} height={16} color="#9ca3af" style={styles.chevronRight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          disabled={!hasPendingActions}
          style={[
            styles.ctaButton,
            !hasPendingActions && styles.ctaButtonDisabled
          ]}
        >
          <Text style={styles.ctaButtonText}>
            {hasPendingActions ? 'Complete Verification' : 'Verification In Progress'}
          </Text>
        </TouchableOpacity>
        {!hasPendingActions && verificationStatus === 'under-review' && (
          <Text style={styles.ctaSubtext}>
            Your documents are under review. We'll notify you once verified.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    height: 176,
    position: 'relative'
  },
  headerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  headerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(30, 58, 138, 0.8)'
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600'
  },
  titleSection: {
    gap: 4
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 14
  },
  scrollView: {
    flex: 1
  },
  section: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 8
  },
  lastSection: {
    paddingBottom: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  builderInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f3f4f6'
  },
  builderDetails: {
    flex: 1,
    gap: 4
  },
  builderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280'
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1
  },
  statusTextContainer: {
    flex: 1
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600'
  },
  statusSubtext: {
    fontSize: 12,
    color: '#d97706',
    marginTop: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  stepsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6'
  },
  progressSection: {
    marginBottom: 24
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14b8a6',
    borderRadius: 6
  },
  stepsList: {
    gap: 12
  },
  stepCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa'
  },
  stepCardRejected: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2'
  },
  stepCardPending: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb'
  },
  stepContent: {
    flexDirection: 'row',
    gap: 12
  },
  stepIcon: {
    marginTop: 2
  },
  stepDetails: {
    flex: 1
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4
  },
  stepTextContainer: {
    flex: 1
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2
  },
  stepDescription: {
    fontSize: 12,
    color: '#6b7280'
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  actionButtonPrimary: {
    backgroundColor: '#2D6A4F'
  },
  actionButtonRejected: {
    backgroundColor: '#dc2626'
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
  rejectionNotice: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8
  },
  rejectionText: {
    flex: 1,
    fontSize: 12,
    color: '#b91c1c'
  },
  documentsList: {
    gap: 12
  },
  documentCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16
  },
  documentContent: {
    flexDirection: 'row',
    gap: 12
  },
  documentDetails: {
    flex: 1
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4
  },
  documentTextContainer: {
    flex: 1
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2
  },
  documentDate: {
    fontSize: 12,
    color: '#9ca3af'
  },
  badgeApproved: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  badgeTextApproved: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803d'
  },
  badgePending: {
    backgroundColor: '#fffbeb',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  badgeTextPending: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b45309'
  },
  badgeRejected: {
    backgroundColor: '#fef2f2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  badgeTextRejected: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b91c1c'
  },
  documentRejection: {
    marginTop: 8
  },
  rejectionReasonText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 8
  },
  reuploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  reuploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2D6A4F'
  },
  benefitsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbeafe'
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  benefitsList: {
    gap: 8
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#374151'
  },
  helpList: {
    gap: 8
  },
  helpButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12
  },
  helpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  chevronRight: {
    transform: [{ rotate: '180deg' }]
  },
  bottomCTA: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  ctaButton: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  ctaButtonDisabled: {
    backgroundColor: '#d1d5db'
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  ctaSubtext: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8
  }
});

export default BuilderVerificationScreen;