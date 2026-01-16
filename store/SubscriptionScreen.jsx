import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Calendar,
  FileText,
  TrendingUp,
  Check,
  Crown,
  Clock,
  Receipt,
  HelpCircle,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Subscription plans data
const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    period: 'month',
    isCurrentPlan: false,
    isRecommended: false,
    features: [
      '5 active listings',
      '2 active projects',
      'Basic lead access',
      'Standard visibility',
      'Email support',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 2499,
    period: 'month',
    isCurrentPlan: true,
    isRecommended: false,
    features: [
      '15 active listings',
      '5 active projects',
      'Priority lead access',
      'Enhanced visibility',
      'Priority support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4999,
    period: 'month',
    isCurrentPlan: false,
    isRecommended: true,
    features: [
      'Unlimited listings',
      'Unlimited projects',
      'Premium lead access',
      'Featured promotion',
      '24/7 phone support',
      'Verified badge',
    ],
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      {/* Header with Background */}
      <View style={styles.headerContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1716827173021-57a1b5e85580?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidWlsZGluZyUyMGFic3RyYWN0fGVufDF8fHx8MTc2ODUwOTc3MHww&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.headerBackground}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.8}>
              <ArrowLeft color="#FFFFFF" size={20} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.appInfo}>
              <View style={styles.appIcon}>
                <Text style={styles.appIconText}>🏠</Text>
              </View>
              <View>
                <Text style={styles.appTitle}>RealtyHub</Text>
                <Text style={styles.appSubtitle}>Pro Builder</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Subscription Plans</Text>
            <Text style={styles.headerSubtitle}>
              Choose the perfect plan for your business
            </Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Subscription */}
        <View style={styles.currentSubscriptionContainer}>
          <CurrentSubscriptionCard />
        </View>

        {/* Available Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          <View style={styles.plansList}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </View>
        </View>

        {/* Plan Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Quick Comparison</Text>
          <View style={styles.comparisonList}>
            <ComparisonRow
              feature="Active Listings"
              basic="5"
              standard="15"
              premium="Unlimited"
            />
            <ComparisonRow
              feature="Active Projects"
              basic="2"
              standard="5"
              premium="Unlimited"
            />
            <ComparisonRow
              feature="Lead Access"
              basic="Basic"
              standard="Priority"
              premium="Premium"
            />
            <ComparisonRow
              feature="Support"
              basic="Email"
              standard="Priority"
              premium="24/7 Phone"
            />
            <ComparisonRow
              feature="Verified Badge"
              basic="—"
              standard="—"
              premium="✓"
            />
          </View>
        </View>

        {/* Billing Section */}
        <BillingSection />

        {/* Support Options */}
        <SupportOptions />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.8}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Current Subscription Card Component
function CurrentSubscriptionCard() {
  return (
    <View style={styles.currentCard}>
      <View style={styles.currentCardHeader}>
        <View>
          <View style={styles.currentCardTitleRow}>
            <Text style={styles.currentCardTitle}>Standard Plan</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
          <Text style={styles.currentCardSubtitle}>Your current subscription</Text>
        </View>
        <TrendingUp color="#BFDBFE" size={32} strokeWidth={2} />
      </View>

      <View style={styles.currentCardInfo}>
        <View style={styles.currentCardInfoRow}>
          <Calendar color="#BFDBFE" size={16} strokeWidth={2} />
          <Text style={styles.currentCardInfoLabel}>Valid: </Text>
          <Text style={styles.currentCardInfoValue}>
            Jan 1, 2026 – Jan 31, 2026
          </Text>
        </View>
        <View style={styles.currentCardInfoRow}>
          <View style={styles.dotIndicator} />
          <Text style={styles.currentCardInfoLabel}>Next renewal: </Text>
          <Text style={styles.currentCardInfoValue}>Feb 1, 2026</Text>
        </View>
      </View>

      <View style={styles.currentCardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>15</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>127</Text>
          <Text style={styles.statLabel}>Leads</Text>
        </View>
      </View>

      <View style={styles.currentCardButtons}>
        <TouchableOpacity style={styles.manageButton} activeOpacity={0.8}>
          <Text style={styles.manageButtonText}>Manage Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.upgradeNowButton} activeOpacity={0.8}>
          <Text style={styles.upgradeNowButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Plan Card Component
function PlanCard({ plan }) {
  const isRecommended = plan.isRecommended;
  const isCurrent = plan.isCurrentPlan;

  return (
    <View
      style={[
        styles.planCard,
        isRecommended && styles.planCardRecommended,
        isCurrent && styles.planCardCurrent,
      ]}
    >
      {/* Header */}
      <View style={styles.planCardHeader}>
        <View style={styles.planCardHeaderLeft}>
          <View style={styles.planCardTitleRow}>
            <Text style={styles.planCardTitle}>{plan.name}</Text>
            {isRecommended && (
              <View style={styles.recommendedBadge}>
                <Crown color="#FFFFFF" size={12} strokeWidth={2} />
                <Text style={styles.recommendedBadgeText}>Recommended</Text>
              </View>
            )}
          </View>
          {isCurrent && (
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.planCardPricing}>
        <View style={styles.planCardPriceRow}>
          <Text style={styles.planCardPrice}>
            ₹{plan.price.toLocaleString()}
          </Text>
          <Text style={styles.planCardPeriod}>/{plan.period}</Text>
        </View>
        <Text style={styles.planCardBillingInfo}>
          Billed monthly • Cancel anytime
        </Text>
      </View>

      {/* Features */}
      <View style={styles.planCardFeatures}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                isRecommended && styles.featureIconRecommended,
                isCurrent && styles.featureIconCurrent,
              ]}
            >
              <Check
                color={
                  isRecommended
                    ? '#2D6A4F'
                    : isCurrent
                    ? '#16A34A'
                    : '#6B7280'
                }
                size={14}
                strokeWidth={2}
              />
            </View>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        disabled={isCurrent}
        style={[
          styles.planCardButton,
          isCurrent && styles.planCardButtonDisabled,
          isRecommended && styles.planCardButtonRecommended,
          !isCurrent && !isRecommended && styles.planCardButtonDefault,
        ]}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.planCardButtonText,
            isCurrent && styles.planCardButtonTextDisabled,
          ]}
        >
          {isCurrent
            ? 'Current Plan'
            : isRecommended
            ? 'Upgrade to Premium'
            : 'Choose Plan'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Comparison Row Component
function ComparisonRow({ feature, basic, standard, premium }) {
  return (
    <View style={styles.comparisonRow}>
      <Text style={styles.comparisonFeature}>{feature}</Text>
      <Text style={styles.comparisonValue}>{basic}</Text>
      <Text style={styles.comparisonValue}>{standard}</Text>
      <Text style={styles.comparisonValuePremium}>{premium}</Text>
    </View>
  );
}

// Billing Section Component
function BillingSection() {
  return (
    <View style={styles.billingSection}>
      <Text style={styles.billingSectionTitle}>Billing & Payment</Text>
      <View style={styles.billingList}>
        {/* Payment Method */}
        <TouchableOpacity style={styles.billingItem} activeOpacity={0.7}>
          <View style={styles.billingIcon}>
            <CreditCard color="#2D6A4F" size={20} strokeWidth={2} />
          </View>
          <View style={styles.billingText}>
            <Text style={styles.billingLabel}>Payment Method</Text>
            <Text style={styles.billingValue}>•••• •••• •••• 4242</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} strokeWidth={2} />
        </TouchableOpacity>

        {/* Billing Cycle */}
        <TouchableOpacity style={styles.billingItem} activeOpacity={0.7}>
          <View style={[styles.billingIcon, styles.billingIconGreen]}>
            <Calendar color="#16A34A" size={20} strokeWidth={2} />
          </View>
          <View style={styles.billingText}>
            <Text style={styles.billingLabel}>Billing Cycle</Text>
            <Text style={styles.billingValue}>Monthly (Auto-renew enabled)</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} strokeWidth={2} />
        </TouchableOpacity>

        {/* Invoice History */}
        <TouchableOpacity style={styles.billingItem} activeOpacity={0.7}>
          <View style={[styles.billingIcon, styles.billingIconPurple]}>
            <FileText color="#9333EA" size={20} strokeWidth={2} />
          </View>
          <View style={styles.billingText}>
            <Text style={styles.billingLabel}>Invoice History</Text>
            <Text style={styles.billingValue}>
              View past payments & receipts
            </Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.viewBillingButton} activeOpacity={0.8}>
        <Text style={styles.viewBillingButtonText}>View Billing Details</Text>
      </TouchableOpacity>
    </View>
  );
}

// Support Options Component
function SupportOptions() {
  return (
    <View style={styles.supportSection}>
      <Text style={styles.supportSectionTitle}>Support & Information</Text>
      <View style={styles.supportList}>
        <SupportItem
          icon={<Clock color="#2D6A4F" size={20} strokeWidth={2} />}
          title="Subscription History"
          subtitle="View past plans & upgrades"
        />
        <SupportItem
          icon={<Receipt color="#16A34A" size={20} strokeWidth={2} />}
          title="Payment Receipts"
          subtitle="Download invoices & receipts"
        />
        <SupportItem
          icon={<HelpCircle color="#9333EA" size={20} strokeWidth={2} />}
          title="FAQs & Help"
          subtitle="Get answers to common questions"
        />
        <SupportItem
          icon={<FileText color="#F97316" size={20} strokeWidth={2} />}
          title="Terms & Refund Policy"
          subtitle="Review subscription terms"
        />
      </View>
    </View>
  );
}

function SupportItem({ icon, title, subtitle }) {
  return (
    <TouchableOpacity style={styles.supportItem} activeOpacity={0.7}>
      <View style={styles.supportIcon}>{icon}</View>
      <View style={styles.supportText}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight color="#9CA3AF" size={20} strokeWidth={2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    position: 'relative',
    height: 192,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 58, 138, 0.7)',
  },
  headerContent: {
    position: 'relative',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  appIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appIconText: {
    fontSize: 24,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  appSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  headerTextContainer: {
    marginTop: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  currentSubscriptionContainer: {
    marginTop: -16,
    marginBottom: 24,
  },
  currentCard: {
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  currentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currentCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  currentCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  currentCardSubtitle: {
    color: '#BFDBFE',
    fontSize: 14,
  },
  currentCardInfo: {
    marginBottom: 16,
    gap: 12,
  },
  currentCardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#BFDBFE',
    borderRadius: 4,
  },
  currentCardInfoLabel: {
    color: '#BFDBFE',
    fontSize: 14,
  },
  currentCardInfoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  currentCardStats: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3B82F6',
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#BFDBFE',
    fontSize: 12,
  },
  currentCardButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeNowButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeNowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  plansSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  plansList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  planCardRecommended: {
    borderWidth: 2,
    borderColor: '#2D6A4F',
  },
  planCardCurrent: {
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  planCardHeader: {
    marginBottom: 16,
  },
  planCardHeaderLeft: {
    flex: 1,
  },
  planCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  currentPlanBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currentPlanBadgeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },
  planCardPricing: {
    marginBottom: 20,
  },
  planCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planCardPrice: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  planCardPeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  planCardBillingInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  planCardFeatures: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconRecommended: {
    backgroundColor: '#DBEAFE',
  },
  featureIconCurrent: {
    backgroundColor: '#D1FAE5',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  planCardButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  planCardButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  planCardButtonRecommended: {
    backgroundColor: '#2D6A4F',
  },
  planCardButtonDefault: {
    backgroundColor: '#111827',
  },
  planCardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  planCardButtonTextDisabled: {
    color: '#9CA3AF',
  },
  comparisonSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  comparisonList: {
    gap: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  comparisonFeature: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  comparisonValue: {
    width: 60,
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
  comparisonValuePremium: {
    width: 60,
    textAlign: 'center',
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '600',
  },
  billingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  billingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  billingList: {
    gap: 12,
  },
  billingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  billingIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billingIconGreen: {
    backgroundColor: '#D1FAE5',
  },
  billingIconPurple: {
    backgroundColor: '#F3E8FF',
  },
  billingText: {
    flex: 1,
  },
  billingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  viewBillingButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  viewBillingButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  supportSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  supportSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  supportList: {
    gap: 8,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  supportIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    },
upgradeButton: {
backgroundColor: '#2D6A4F',
paddingVertical: 16,
borderRadius: 16,
alignItems: 'center',
},
upgradeButtonText: {
color: '#FFFFFF',
fontSize: 16,
fontWeight: '600',
},
});