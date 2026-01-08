import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Building2,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  TrendingUp,
  UserPlus,
  Home,
  User,
  BarChart3,
  Users,
  Calendar,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LeadsScreen = ({
  onLeadClick,
  onAddLead,
  onContactLead,
  onExportLeads,
  onDashboard,
  onListings,
  onProjects,
  onProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Mock leads data
  const leadsData = [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      propertyName: 'Skyline Residences - 3 BHK',
      inquiryType: 'Buy',
      date: 'Today',
      time: '10:30 AM',
      status: 'New',
      phone: '+1 (555) 234-5678',
      email: 'sarah.j@email.com',
      message: 'Interested in scheduling a viewing this weekend.',
    },
    {
      id: 2,
      clientName: 'Michael Chen',
      propertyName: 'Ocean View Villa',
      inquiryType: 'Buy',
      date: 'Today',
      time: '09:15 AM',
      status: 'New',
      phone: '+1 (555) 345-6789',
      email: 'michael.chen@email.com',
      message: 'Looking for luxury villa with pool.',
    },
    {
      id: 3,
      clientName: 'Emily Rodriguez',
      propertyName: 'Green Valley Apartments - 2 BHK',
      inquiryType: 'Rent',
      date: 'Yesterday',
      time: '04:20 PM',
      status: 'Contacted',
      phone: '+1 (555) 456-7890',
      email: 'emily.r@email.com',
    },
    {
      id: 4,
      clientName: 'David Park',
      propertyName: 'Corporate Heights - Office Space',
      inquiryType: 'Buy',
      date: 'Jan 6',
      time: '02:45 PM',
      status: 'Follow-up',
      phone: '+1 (555) 567-8901',
      email: 'david.park@email.com',
      message: 'Need more details about commercial property.',
    },
    {
      id: 5,
      clientName: 'Lisa Anderson',
      propertyName: 'Sunset Penthouse',
      inquiryType: 'Buy',
      date: 'Jan 5',
      time: '11:30 AM',
      status: 'Follow-up',
      phone: '+1 (555) 678-9012',
      email: 'lisa.a@email.com',
    },
    {
      id: 6,
      clientName: 'James Wilson',
      propertyName: 'Modern Living Suites - 2 BHK',
      inquiryType: 'Rent',
      date: 'Jan 4',
      time: '03:15 PM',
      status: 'Closed',
      phone: '+1 (555) 789-0123',
      email: 'james.w@email.com',
    },
  ];

  // Calculate stats
  const stats = {
    newToday: leadsData.filter((lead) => lead.date === 'Today' && lead.status === 'New').length,
    totalActive: leadsData.filter((lead) => lead.status !== 'Closed').length,
    followUpPending: leadsData.filter((lead) => lead.status === 'Follow-up').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' };
      case 'Contacted':
        return { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' };
      case 'Follow-up':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'Closed':
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
  };

  const getInquiryTypeColor = (type) => {
    return type === 'Buy'
      ? { text: '#7E22CE', bg: '#FAF5FF' }
      : { text: '#C2410C', bg: '#FFF7ED' };
  };

  const filteredLeads = leadsData.filter((lead) => {
    const matchesSearch =
      searchQuery === '' ||
      lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'All' || lead.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D6A4F" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1726003354173-a1152883ca69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3MlMjBza3lsaW5lfGVufDF8fHx8MTc2NzgwMTYwOXww&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.headerBackground}
        />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContent}>
          {/* App Header */}
          <View style={styles.appHeader}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Building2 size={16} color="#2D6A4F" strokeWidth={2} />
              </View>
              <Text style={styles.logoText}>EstateHub</Text>
            </View>
            <TouchableOpacity onPress={onExportLeads} style={styles.exportButton}>
              <Download size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Title & Description */}
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>Leads & Inquiries</Text>
            <Text style={styles.headerSubtitle}>
              Track and manage buyer and renter inquiries in one place
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <UserPlus size={20} color="#059669" strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.newToday}</Text>
              <Text style={styles.statLabel}>New Today</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <TrendingUp size={20} color="#2563EB" strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.totalActive}</Text>
              <Text style={styles.statLabel}>Active Leads</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Clock size={20} color="#D97706" strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats.followUpPending}</Text>
              <Text style={styles.statLabel}>Follow-ups</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <View style={styles.searchInputWrapper}>
            <Search
              size={20}
              color="#9CA3AF"
              strokeWidth={2}
              style={styles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or property"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Filter size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChipsContainer}
            contentContainerStyle={styles.filterChipsContent}
          >
            {['All', 'New', 'Contacted', 'Follow-up', 'Closed'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilterStatus(status)}
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Results Count */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            <Text style={styles.resultsCount}>{filteredLeads.length}</Text>{' '}
            {filteredLeads.length === 1 ? 'lead' : 'leads'} found
          </Text>
          {(filterStatus !== 'All' || searchQuery !== '') && (
            <TouchableOpacity
              onPress={() => {
                setFilterStatus('All');
                setSearchQuery('');
              }}
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Leads List */}
      <ScrollView
        style={styles.leadsScrollView}
        contentContainerStyle={styles.leadsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => {
            const statusColors = getStatusColor(lead.status);
            const inquiryColors = getInquiryTypeColor(lead.inquiryType);

            return (
              <TouchableOpacity
                key={lead.id}
                onPress={() => onLeadClick && onLeadClick(lead.id)}
                style={styles.leadCard}
                activeOpacity={0.7}
              >
                {/* Lead Header */}
                <View style={styles.leadHeader}>
                  <View style={styles.leadInfo}>
                    <Text style={styles.leadClientName} numberOfLines={1}>
                      {lead.clientName}
                    </Text>
                    <Text style={styles.leadPropertyName} numberOfLines={1}>
                      {lead.propertyName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.inquiryTypeBadge,
                      { backgroundColor: inquiryColors.bg },
                    ]}
                  >
                    <Text
                      style={[styles.inquiryTypeText, { color: inquiryColors.text }]}
                    >
                      {lead.inquiryType}
                    </Text>
                  </View>
                </View>

                {/* Status & Time */}
                <View style={styles.leadStatusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusColors.bg,
                        borderColor: statusColors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {lead.status}
                    </Text>
                  </View>
                  <View style={styles.dateTimeContainer}>
                    <Calendar size={12} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.dateTimeText}>
                      {lead.date}, {lead.time}
                    </Text>
                  </View>
                </View>

                {/* Message Preview */}
                {lead.message && (
                  <View style={styles.messagePreview}>
                    <Text style={styles.messageText} numberOfLines={2}>
                      "{lead.message}"
                    </Text>
                  </View>
                )}

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onContactLead && onContactLead(lead.id);
                    }}
                    style={styles.callButton}
                  >
                    <Phone size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Mail size={16} color="#374151" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <MessageSquare size={16} color="#374151" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Users size={40} color="#9CA3AF" strokeWidth={2} />
            </View>
            <Text style={styles.emptyStateTitle}>No leads found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your filters or search query
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFilterStatus('All');
                setSearchQuery('');
              }}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllButtonText}>Clear all filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity onPress={onAddLead} style={styles.floatingButton}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={onDashboard} style={styles.navItem}>
          <Home size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onListings} style={styles.navItem}>
          <Building2 size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navText}>Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onProjects} style={styles.navItem}>
          <BarChart3 size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navText}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Users size={24} color="#2D6A4F" strokeWidth={2} />
          <Text style={[styles.navText, styles.navTextActive]}>Leads</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfile} style={styles.navItem}>
          <User size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  headerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(45, 106, 79, 0.85)',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  exportButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipsContainer: {
    marginBottom: 12,
  },
  filterChipsContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
  },
  filterChipActive: {
    backgroundColor: '#2D6A4F',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultsCount: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#2D6A4F',
    textDecorationLine: 'underline',
  },
  leadsScrollView: {
    flex: 1,
  },
  leadsContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
    marginRight: 12,
  },
  leadClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  leadPropertyName: {
    fontSize: 14,
    color: '#6B7280',
  },
  inquiryTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  inquiryTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  leadStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagePreview: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearAllButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  navTextActive: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
});

export default LeadsScreen;