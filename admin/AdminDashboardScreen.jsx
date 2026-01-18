import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Utility Components
const Button = ({ children, variant = 'default', size = 'default', onPress, style }) => {
  const buttonStyles = [
    styles.button,
    variant === 'outline' && styles.buttonOutline,
    variant === 'ghost' && styles.buttonGhost,
    size === 'sm' && styles.buttonSm,
    size === 'lg' && styles.buttonLg,
    style,
  ];
  
  const textStyles = [
    styles.buttonText,
    variant === 'outline' && styles.buttonOutlineText,
    variant === 'ghost' && styles.buttonGhostText,
  ];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
};

const Badge = ({ children, color = 'blue', style }) => (
  <View style={[styles.badge, { backgroundColor: color }, style]}>
    <Text style={styles.badgeText}>{children}</Text>
  </View>
);

const Avatar = ({ name, color = '#3b82f6' }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

// AdminHeader Component
const AdminHeader = ({ notificationCount = 12 }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <View style={styles.logoInner} />
          </View>
          <View>
            <Text style={styles.headerTitle}>RealEstate Pro</Text>
            <Text style={styles.headerSubtitle}>Super Admin</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerMainTitle}>Admin Dashboard</Text>
      <Text style={styles.headerDescription}>Complete platform control & analytics</Text>
    </View>
  );
};

// RoleSelector Component
const RoleSelector = ({ activeRole, onRoleChange }) => {
  const roles = [
    { id: 'super-admin', label: 'Super Admin', icon: '🛡️', color: '#9333ea' },
    { id: 'builder', label: 'Builder', icon: '🏢', color: '#3b82f6' },
    { id: 'agent', label: 'Agent', icon: '👤', color: '#10b981' },
    { id: 'user', label: 'User', icon: '👥', color: '#f59e0b' },
  ];

  return (
    <View style={styles.roleSelector}>
      {roles.map((role) => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.roleButton,
            activeRole === role.id && { backgroundColor: role.color },
          ]}
          onPress={() => onRoleChange(role.id)}
        >
          <Text style={styles.roleIcon}>{role.icon}</Text>
          <Text style={[
            styles.roleLabel,
            activeRole === role.id && styles.roleLabelActive,
          ]}>
            {role.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// KPICard Component
const KPICard = ({ title, value, change, trend }) => {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <View style={styles.kpiIconContainer}>
          <Text style={styles.kpiIcon}>📊</Text>
        </View>
        <View style={[styles.kpiChange, trend === 'up' ? styles.kpiChangeUp : styles.kpiChangeDown]}>
          <Text style={styles.kpiChangeText}>{trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%</Text>
        </View>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
    </View>
  );
};

// AlertCard Component
const AlertCard = ({ title, description, severity, count }) => {
  const severityColors = {
    info: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
    warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    critical: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  };
  const colors = severityColors[severity];

  return (
    <View style={[styles.alertCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={[styles.alertTitle, { color: colors.text }]}>{title}</Text>
          {count && (
            <View style={[styles.alertCount, { backgroundColor: colors.border }]}>
              <Text style={[styles.alertCountText, { color: colors.text }]}>{count}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.alertDescription, { color: colors.text }]}>{description}</Text>
        <View style={styles.alertActions}>
          <Button variant="default" size="sm" style={{ backgroundColor: colors.text }}>
            <Text style={styles.buttonTextWhite}>Resolve</Text>
          </Button>
          <Button variant="outline" size="sm">
            <Text>Details</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

// RoleManagementCard Component
const RoleManagementCard = ({ name, email, role, status, roleType, metric }) => {
  const statusColors = {
    active: { bg: '#d1fae5', text: '#065f46' },
    pending: { bg: '#fef3c7', text: '#92400e' },
    suspended: { bg: '#fee2e2', text: '#991b1b' },
  };
  const roleColors = {
    admin: '#9333ea',
    builder: '#3b82f6',
    agent: '#10b981',
    user: '#f59e0b',
  };

  return (
    <View style={styles.roleCard}>
      <View style={styles.roleCardHeader}>
        <Avatar name={name} color={roleColors[roleType]} />
        <View style={styles.roleCardInfo}>
          <Text style={styles.roleCardName}>{name}</Text>
          {email && <Text style={styles.roleCardEmail}>{email}</Text>}
          <View style={styles.roleCardBadges}>
            <Badge color={roleColors[roleType]}>{role}</Badge>
            <Badge color={statusColors[status].bg}>
              <Text style={{ color: statusColors[status].text }}>{status}</Text>
            </Badge>
          </View>
          {metric && (
            <View style={styles.metricContainer}>
              <Text style={styles.metricLabel}>{metric.label}: </Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.roleCardActions}>
        {status === 'pending' ? (
          <>
            <Button size="sm" style={styles.approveButton}>
              <Text style={styles.buttonTextWhite}>✓ Approve</Text>
            </Button>
            <Button variant="outline" size="sm">
              <Text>✗ Reject</Text>
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" style={styles.fullWidth}>
            <Text>👁 View Details</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

// PropertyControlCard Component
const PropertyControlCard = ({ propertyName, location, builder, status, price, listingDate }) => {
  const statusConfig = {
    pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending Review' },
    approved: { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
    flagged: { bg: '#fed7aa', text: '#9a3412', label: 'Flagged' },
  };
  const config = statusConfig[status];

  return (
    <View style={styles.propertyCard}>
      <View style={styles.propertyCardContent}>
        <View style={styles.propertyIcon}>
          <Text style={styles.propertyIconText}>🏢</Text>
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{propertyName}</Text>
          <Text style={styles.propertyLocation}>{location}</Text>
          <View style={styles.propertyMeta}>
            <Badge color={config.bg}>
              <Text style={{ color: config.text }}>{config.label}</Text>
            </Badge>
            <Text style={styles.propertyBuilder}>by {builder}</Text>
          </View>
          <View style={styles.propertyFooter}>
            <Text style={styles.propertyPrice}>{price}</Text>
            <Text style={styles.propertyDate}>{listingDate}</Text>
          </View>
        </View>
      </View>
      <View style={styles.propertyActions}>
        {status === 'pending' || status === 'flagged' ? (
          <>
            <Button size="sm" style={styles.approveButton}>
              <Text style={styles.buttonTextWhite}>✓ Approve</Text>
            </Button>
            <Button variant="outline" size="sm">
              <Text>✗ Reject</Text>
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" style={styles.fullWidth}>
            <Text>👁 View Details</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

// LeadCard Component
const LeadCard = ({ leadName, property, source, timeAgo, status, score }) => {
  const statusConfig = {
    new: { bg: '#dbeafe', text: '#1e40af', label: 'New Lead' },
    assigned: { bg: '#e9d5ff', text: '#6b21a8', label: 'Assigned' },
    contacted: { bg: '#d1fae5', text: '#065f46', label: 'Contacted' },
  };
  const config = statusConfig[status];

  return (
    <View style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>{leadName}</Text>
          <Text style={styles.leadProperty}>{property}</Text>
        </View>
        {score && (
          <View style={styles.leadScore}>
            <Text style={styles.leadScoreText}>↑ {score}%</Text>
          </View>
        )}
      </View>
      <View style={styles.leadMeta}>
        <Badge color={config.bg}>
          <Text style={{ color: config.text }}>{config.label}</Text>
        </Badge>
        <Text style={styles.leadSource}>via {source}</Text>
        <Text style={styles.leadTime}>• {timeAgo}</Text>
      </View>
      {status === 'new' && (
        <Button style={styles.assignButton}>
          <Text style={styles.buttonTextWhite}>👤 Assign to Agent</Text>
        </Button>
      )}
    </View>
  );
};

// Main App Component
export default function App() {
  const [activeRole, setActiveRole] = useState('super-admin');

  const getKPIData = () => {
    switch (activeRole) {
      case 'super-admin':
        return [
          { title: 'Total Active Users', value: '12,847', change: 15.3, trend: 'up' },
          { title: 'Verified Builders', value: '342', change: 8.7, trend: 'up' },
          { title: 'Active Agents', value: '1,256', change: 12.1, trend: 'up' },
          { title: 'Live Properties', value: '8,924', change: 18.4, trend: 'up' },
        ];
      case 'builder':
        return [
          { title: 'Active Projects', value: '24', change: 9.1, trend: 'up' },
          { title: 'Listed Properties', value: '186', change: 14.3, trend: 'up' },
          { title: 'New Inquiries', value: '52', change: 18.7, trend: 'up' },
          { title: 'Total Sales', value: '$8.9M', change: 24.2, trend: 'up' },
        ];
      case 'agent':
        return [
          { title: 'Active Listings', value: '47', change: 11.2, trend: 'up' },
          { title: 'Assigned Leads', value: '89', change: 15.6, trend: 'up' },
          { title: 'Conversions', value: '23', change: 28.3, trend: 'up' },
          { title: 'Commission', value: '$45.2K', change: 19.4, trend: 'up' },
        ];
      default:
        return [
          { title: 'Saved Properties', value: '12', change: 0, trend: 'up' },
          { title: 'Property Views', value: '67', change: 0, trend: 'up' },
          { title: 'Inquiries Sent', value: '8', change: 0, trend: 'up' },
          { title: 'Agent Meetings', value: '3', change: 0, trend: 'up' },
        ];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <AdminHeader notificationCount={activeRole === 'super-admin' ? 12 : 5} />
        
        <View style={styles.content}>
          <RoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeRole === 'super-admin' ? 'Platform Metrics' : 
                 activeRole === 'builder' ? 'Builder Metrics' : 
                 activeRole === 'agent' ? 'Agent Metrics' : 'Your Activity'}
              </Text>
              <Text style={styles.sectionSubtitle}>Live • Just now</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiScroll}>
              {getKPIData().map((kpi, index) => (
                <KPICard key={index} {...kpi} />
              ))}
            </ScrollView>
          </View>

          {(activeRole === 'super-admin' || activeRole === 'builder') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority Actions</Text>
              <View style={styles.alertList}>
                {activeRole === 'super-admin' && (
                  <>
                    <AlertCard 
                      title="Builder Registrations" 
                      description="28 new builder applications pending verification" 
                      severity="warning" 
                      count={28} 
                    />
                    <AlertCard 
                      title="Suspicious Activity" 
                      description="3 accounts flagged for unusual behavior" 
                      severity="critical" 
                      count={3} 
                    />
                  </>
                )}
                {activeRole === 'builder' && (
                  <>
                    <AlertCard 
                      title="Property Verifications" 
                      description="8 properties pending admin approval" 
                      severity="warning" 
                      count={8} 
                    />
                  </>
                )}
              </View>
            </View>
          )}

          {activeRole === 'super-admin' && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Builder Management</Text>
                  <Button variant="outline" size="sm">
                    <Text>View All</Text>
                  </Button>
                </View>
                <View style={styles.cardList}>
                  <RoleManagementCard 
                    name="Skyline Developers" 
                    email="contact@skylinedev.com" 
                    role="Premium Builder" 
                    status="pending" 
                    roleType="builder" 
                    metric={{ label: 'Projects', value: '12' }} 
                  />
                  <RoleManagementCard 
                    name="GreenSpace Constructions" 
                    email="info@greenspace.com" 
                    role="Verified Builder" 
                    status="active" 
                    roleType="builder" 
                    metric={{ label: 'Properties', value: '89' }} 
                  />
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Property Control</Text>
                  <View style={styles.propertyStats}>
                    <Text style={styles.propertyStatWarning}>28 Pending</Text>
                    <Text style={styles.propertyStatDivider}> • </Text>
                    <Text style={styles.propertyStatSuccess}>486 Active</Text>
                  </View>
                </View>
                <View style={styles.cardList}>
                  <PropertyControlCard 
                    propertyName="Metropolitan Heights Tower" 
                    location="Downtown District, Mumbai" 
                    builder="Skyline Developers" 
                    status="pending" 
                    price="₹8.5 Cr - ₹12.8 Cr" 
                    listingDate="2 hours ago" 
                  />
                  <PropertyControlCard 
                    propertyName="Green Valley Apartments" 
                    location="Sector 21, Noida" 
                    builder="GreenSpace Constructions" 
                    status="flagged" 
                    price="₹1.2 Cr - ₹2.4 Cr" 
                    listingDate="5 hours ago" 
                  />
                </View>
              </View>
            </>
          )}

          {(activeRole === 'super-admin' || activeRole === 'builder' || activeRole === 'agent') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {activeRole === 'agent' ? 'My Leads' : 'Leads Management'}
              </Text>
              <View style={styles.cardList}>
                <LeadCard 
                  leadName="Rajesh Kumar" 
                  property="Metropolitan Heights Tower" 
                  source="Website" 
                  timeAgo="5 min ago" 
                  status="new" 
                  score={87} 
                />
                <LeadCard 
                  leadName="Priya Sharma" 
                  property="Green Valley Apartments" 
                  source="Mobile App" 
                  timeAgo="12 min ago" 
                  status="new" 
                  score={92} 
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {activeRole === 'super-admin' && (
          <Button style={styles.footerButton}>
            <Text style={styles.footerButtonText}>✓ Approve Requests (156)</Text>
          </Button>
        )}
        {activeRole === 'builder' && (
          <Button style={[styles.footerButton, { backgroundColor: '#3b82f6' }]}>
            <Text style={styles.footerButtonText}>+ Add New Property</Text>
          </Button>
        )}
        {activeRole === 'agent' && (
          <Button style={[styles.footerButton, { backgroundColor: '#10b981' }]}>
            <Text style={styles.footerButtonText}>👤 Assign New Lead</Text>
          </Button>
        )}
        {activeRole === 'user' && (
          <Button style={[styles.footerButton, { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.footerButtonText}>🏠 Browse Properties</Text>
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#334155',
    padding: 16,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoInner: {
    width: 20,
    height: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconButtonText: {
    fontSize: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  headerMainTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerDescription: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  roleSelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4b5563',
    textAlign: 'center',
  },
  roleLabelActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  kpiScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 160,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  kpiIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiChange: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiChangeUp: {
    backgroundColor: '#d1fae5',
  },
  kpiChangeDown: {
    backgroundColor: '#fee2e2',
  },
  kpiChangeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertList: {
    gap: 8,
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  alertContent: {
    gap: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  alertCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertDescription: {
    fontSize: 12,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cardList: {
    gap: 8,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roleCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  roleCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roleCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  roleCardEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  roleCardBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  roleCardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  propertyCardContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  propertyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  propertyIconText: {
    fontSize: 32,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  propertyLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  propertyMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  propertyBuilder: {
    fontSize: 12,
    color: '#4b5563',
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  propertyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  propertyActions: {
    flexDirection: 'row',
    gap: 6,
  },
  propertyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyStatWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  propertyStatDivider: {
    fontSize: 12,
    color: '#9ca3af',
  },
  propertyStatSuccess: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  leadProperty: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  leadScore: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leadScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  leadMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  leadSource: {
    fontSize: 12,
    color: '#6b7280',
  },
  leadTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  assignButton: {
    backgroundColor: '#3b82f6',
    marginTop: 4,
  },
  metricContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    flexDirection: 'row',
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  button: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSm: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  buttonLg: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonOutlineText: {
    color: '#374151',
  },
  buttonGhostText: {
    color: '#374151',
  },
  buttonTextWhite: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#059669',
  },
  fullWidth: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});