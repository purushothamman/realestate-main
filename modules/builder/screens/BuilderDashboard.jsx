import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import {
  Home,
  Building2,
  Plus,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  Eye,
  Edit,
  Clock,
  MessageSquare,
  BarChart3,
  MapPin,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function BuilderDashboard({
  builderName = 'John Anderson',
  navigation,
  onBack,
  onPropertyClick,
  onAddProperty,
  onMyProperties,
}) {
  // Dashboard stats
  const stats = {
    activeProjects: 8,
    totalListings: 24,
    pendingInquiries: 15,
    upcomingDeadlines: 3,
  };

  // Recent listings
  const recentListings = [
    {
      id: '1',
      title: 'Luxury Villa - Sunset Hills',
      location: 'Beverly Hills, CA',
      price: '$2,450,000',
      status: 'active',
      views: 342,
      inquiries: 12,
      image: 'https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?w=1080',
      beds: 5,
      baths: 4,
      area: '4,200 sq ft',
      type: 'Villa',
      description: 'Stunning luxury villa with modern architecture',
    },
    {
      id: '2',
      title: 'Modern Apartment Complex',
      location: 'Downtown LA',
      price: '$850,000',
      status: 'pending',
      views: 189,
      inquiries: 8,
      image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1080',
      beds: 3,
      baths: 2,
      area: '2,100 sq ft',
      type: 'Apartment',
      description: 'Contemporary apartment in prime location',
    },
    {
      id: '3',
      title: 'Beachfront Condos',
      location: 'Malibu, CA',
      price: '$1,250,000',
      status: 'active',
      views: 521,
      inquiries: 23,
      image: 'https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?w=1080',
      beds: 4,
      baths: 3,
      area: '3,500 sq ft',
      type: 'Condo',
      description: 'Exclusive beachfront condos with ocean views',
    },
  ];

  // Active projects
  const activeProjects = [
    {
      id: '1',
      name: 'Sunset Residences Phase 2',
      progress: 75,
      deadline: 'Dec 15, 2025',
      status: 'on-track',
    },
    {
      id: '2',
      name: 'Green Valley Townhomes',
      progress: 45,
      deadline: 'Jan 30, 2026',
      status: 'on-track',
    },
    {
      id: '3',
      name: 'Downtown Luxury Apartments',
      progress: 60,
      deadline: 'Nov 20, 2025',
      status: 'delayed',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'sold':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'on-track':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'delayed':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'completed':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getStatusText = (status) => {
    if (status === 'on-track') return 'On Track';
    if (status === 'delayed') return 'Delayed';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handlePropertyClick = (listing) => {
    console.log('Property clicked:', listing.title);
    if (onPropertyClick) {
      onPropertyClick(listing);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Fixed Header with Background */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY2MjI1ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />

          {/* Header Content */}
          <View style={styles.headerContent}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.topBarLeft}>
                <View style={styles.logoBox}>
                  <Building2 size={20} color="#2D6A4F" strokeWidth={2} />
                </View>
                <Text style={styles.logoText}>EstateHub</Text>
              </View>
              <View style={styles.topBarRight}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Bell size={24} color="#FFFFFF" strokeWidth={2} />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {stats.pendingInquiries}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Settings size={24} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome, {builderName}!</Text>
              <Text style={styles.welcomeSubtitle}>
                Manage your properties, listings, and projects in one place
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#2D6A4F15' }]}>
                <Building2 size={20} color="#2D6A4F" strokeWidth={2} />
              </View>
              <TrendingUp size={16} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Active Projects</Text>
            <Text style={styles.statValue}>{stats.activeProjects}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#3B82F615' }]}>
                <FileText size={20} color="#3B82F6" strokeWidth={2} />
              </View>
              <TrendingUp size={16} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Total Listings</Text>
            <Text style={styles.statValue}>{stats.totalListings}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#F9731615' }]}>
                <Users size={20} color="#F97316" strokeWidth={2} />
              </View>
              <Text style={styles.newBadge}>New</Text>
            </View>
            <Text style={styles.statLabel}>Pending Inquiries</Text>
            <Text style={styles.statValue}>{stats.pendingInquiries}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#EF444415' }]}>
                <Calendar size={20} color="#EF4444" strokeWidth={2} />
              </View>
              <Clock size={16} color="#EF4444" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Upcoming Deadlines</Text>
            <Text style={styles.statValue}>{stats.upcomingDeadlines}</Text>
          </View>
        </View>

        {/* Primary Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onAddProperty}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryButtonText}>Add New Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onMyProperties}
            activeOpacity={0.8}
          >
            <Building2 size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.secondaryButtonText}>Create Project</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Navigation */}
        <View style={styles.quickAccessCard}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#2D6A4F15' }]}>
                <FileText size={24} color="#2D6A4F" strokeWidth={2} />
              </View>
              <Text style={styles.quickAccessLabel}>My Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#3B82F615' }]}>
                <BarChart3 size={24} color="#3B82F6" strokeWidth={2} />
              </View>
              <Text style={styles.quickAccessLabel}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#A855F715' }]}>
                <MessageSquare size={24} color="#A855F7" strokeWidth={2} />
              </View>
              <Text style={styles.quickAccessLabel}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Active Projects</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {activeProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={styles.projectDeadline}>
                    <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.projectDeadlineText}>
                      {project.deadline}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(project.status).bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: getStatusColor(project.status).text,
                      },
                    ]}
                  >
                    {getStatusText(project.status)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{project.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${project.progress}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Recent Listings</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentListings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              style={styles.listingCard}
              onPress={() => handlePropertyClick(listing)}
              activeOpacity={0.7}
            >
              <View style={styles.listingHeader}>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <View style={styles.listingLocation}>
                    <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.listingLocationText}>
                      {listing.location}
                    </Text>
                  </View>
                  <Text style={styles.listingPrice}>{listing.price}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(listing.status).bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: getStatusColor(listing.status).text,
                      },
                    ]}
                  >
                    {getStatusText(listing.status)}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.listingStats}>
                <View style={styles.listingStat}>
                  <Eye size={16} color="#9CA3AF" strokeWidth={2} />
                  <Text style={styles.listingStatText}>{listing.views} views</Text>
                </View>
                <View style={styles.listingStat}>
                  <MessageSquare size={16} color="#9CA3AF" strokeWidth={2} />
                  <Text style={styles.listingStatText}>
                    {listing.inquiries} inquiries
                  </Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Edit size={16} color="#2D6A4F" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help & Support */}
        <View style={styles.helpCard}>
          <View style={styles.helpContent}>
            <View style={styles.helpIcon}>
              <HelpCircle size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpSubtitle}>
                Get support or learn more about managing your properties
              </Text>
              <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
                <Text style={styles.helpButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    height: 208,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  welcomeSection: {
    marginTop: 'auto',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: -40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '500',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAccessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  quickAccessItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectDeadlineText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D6A4F',
    borderRadius: 4,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  listingLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  listingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listingStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  editButton: {
    marginLeft: 'auto',
  },
  helpCard: {
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  helpContent: {
    flexDirection: 'row',
    gap: 16,
  },
  helpIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 18,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D6A4F',
  },
});