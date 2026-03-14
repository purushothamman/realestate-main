import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Switch,
} from 'react-native';
import {
  ArrowLeft,
  Shield,
  MapPin,
  DollarSign,
  CreditCard,
  Building,
  Wallet,
  Calendar,
  MessageSquare,
  User,
  Phone,
  Mail,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Check,
  Lock,
  Home,
  Building2,
  Search,
  MessageCircle,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function MakeOfferScreen({ onBack, onSubmit }) {
  // Property data
  const property = {
    id: 'prop-001',
    image:
      'https://images.unsplash.com/photo-1760611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzE4NjQ5NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Downtown Luxury Penthouse',
    location: 'Downtown LA, California',
    listedPrice: 2450000,
    type: 'Penthouse',
    daysListed: 12,
  };

  const [offerAmount, setOfferAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [downPayment, setDownPayment] = useState('');
  const [preApprovalAttached, setPreApprovalAttached] = useState(false);
  const [closingTimeline, setClosingTimeline] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [useProfileDetails, setUseProfileDetails] = useState(true);
  const [fullName, setFullName] = useState('John Anderson');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState('john.anderson@email.com');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getOfferValidation = () => {
    const amount = parseFloat(offerAmount.replace(/,/g, ''));
    if (!amount || isNaN(amount)) return null;

    const percentDiff =
      ((amount - property.listedPrice) / property.listedPrice) * 100;

    if (percentDiff < -10) {
      return {
        type: 'low',
        message: 'Significantly below asking price',
        color: '#EA580C',
        bg: '#FFF7ED',
        icon: TrendingDown,
      };
    } else if (percentDiff < 0) {
      return {
        type: 'below',
        message: 'Below asking price',
        color: '#CA8A04',
        bg: '#FEFCE8',
        icon: AlertCircle,
      };
    } else if (percentDiff > 0) {
      return {
        type: 'above',
        message: 'Above asking price',
        color: '#16A34A',
        bg: '#F0FDF4',
        icon: TrendingUp,
      };
    }

    return {
      type: 'exact',
      message: 'Asking price',
      color: '#2563EB',
      bg: '#EFF6FF',
      icon: Check,
    };
  };

  const handleQuickOffer = (percentage) => {
    const calculatedAmount = property.listedPrice * (1 + percentage / 100);
    setOfferAmount(Math.round(calculatedAmount).toLocaleString());
  };

  const isFormValid =
    offerAmount &&
    parseFloat(offerAmount.replace(/,/g, '')) > 0 &&
    paymentMethod &&
    closingTimeline &&
    fullName &&
    phone &&
    email &&
    termsAccepted;

  const handleSubmitOffer = () => {
    if (isFormValid) {
      const offerData = {
        propertyId: property.id,
        offerAmount: parseFloat(offerAmount.replace(/,/g, '')),
        paymentMethod,
        downPayment: downPayment
          ? parseFloat(downPayment.replace(/,/g, ''))
          : undefined,
        closingTimeline,
        additionalTerms,
        fullName,
        phone,
        email,
        termsAccepted,
      };

      console.log('Offer submitted:', offerData);
      onSubmit?.(offerData);
    }
  };

  const validation = getOfferValidation();

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#374151" size={20} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Make an Offer</Text>
              <Shield color="#16A34A" size={16} strokeWidth={2} />
            </View>
            <Text style={styles.headerSubtitle}>
              Submit your price proposal to the seller
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
        {/* Property Summary Card */}
        <View style={styles.propertyCard}>
          <Image
            source={{ uri: property.image }}
            style={styles.propertyImage}
            resizeMode="cover"
          />

          <View style={styles.propertyDetails}>
            <View style={styles.propertyHeader}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {property.title}
              </Text>
              <View style={styles.propertyTypeBadge}>
                <Text style={styles.propertyTypeText}>{property.type}</Text>
              </View>
            </View>

            <View style={styles.propertyLocation}>
              <MapPin color="#9CA3AF" size={12} strokeWidth={2} />
              <Text style={styles.propertyLocationText} numberOfLines={1}>
                {property.location}
              </Text>
            </View>

            <Text style={styles.propertyPrice}>
              {formatCurrency(property.listedPrice)}
            </Text>
            <Text style={styles.propertyDays}>
              Listed {property.daysListed} days ago
            </Text>
          </View>
        </View>

        {/* Offer Amount Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color="#2D6A4F" size={20} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Your Offer</Text>
          </View>

          {/* Offer Input */}
          <View style={styles.offerInputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.offerInput}
              value={offerAmount}
              onChangeText={(value) => {
                const numValue = value.replace(/[^0-9]/g, '');
                if (numValue) {
                  setOfferAmount(parseInt(numValue).toLocaleString());
                } else {
                  setOfferAmount('');
                }
              }}
              placeholder="Enter your offer amount"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          {/* Validation Message */}
          {validation && (
            <View
              style={[
                styles.validationMessage,
                { backgroundColor: validation.bg },
              ]}
            >
              <validation.icon
                color={validation.color}
                size={16}
                strokeWidth={2}
              />
              <Text style={[styles.validationText, { color: validation.color }]}>
                {validation.message}
              </Text>
            </View>
          )}

          {/* Helper Text */}
          <Text style={styles.helperText}>
            Listed at {formatCurrency(property.listedPrice)}
          </Text>

          {/* Quick Percentage Chips */}
          <View style={styles.quickOfferButtons}>
            <TouchableOpacity
              onPress={() => handleQuickOffer(-5)}
              style={styles.quickOfferButton}
            >
              <Text style={styles.quickOfferButtonText}>-5%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleQuickOffer(-2)}
              style={styles.quickOfferButton}
            >
              <Text style={styles.quickOfferButtonText}>-2%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleQuickOffer(0)}
              style={styles.quickOfferButtonAsking}
            >
              <Text style={styles.quickOfferButtonTextAsking}>Asking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleQuickOffer(2)}
              style={styles.quickOfferButtonAbove}
            >
              <Text style={styles.quickOfferButtonTextAbove}>+2%</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financing Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard color="#2D6A4F" size={20} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <View style={styles.paymentMethods}>
            {/* Cash Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('cash')}
              style={[
                styles.paymentMethod,
                paymentMethod === 'cash' && styles.paymentMethodSelected,
              ]}
            >
              <View
                style={[
                  styles.paymentIcon,
                  paymentMethod === 'cash' && styles.paymentIconSelected,
                ]}
              >
                <Wallet
                  color={paymentMethod === 'cash' ? '#FFFFFF' : '#6B7280'}
                  size={20}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>Cash</Text>
                <Text style={styles.paymentSubtitle}>
                  Full payment, no financing
                </Text>
              </View>
              {paymentMethod === 'cash' && (
                <Check color="#2D6A4F" size={20} strokeWidth={2} />
              )}
            </TouchableOpacity>

            {/* Mortgage Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('mortgage')}
              style={[
                styles.paymentMethod,
                paymentMethod === 'mortgage' && styles.paymentMethodSelected,
              ]}
            >
              <View
                style={[
                  styles.paymentIcon,
                  paymentMethod === 'mortgage' && styles.paymentIconSelected,
                ]}
              >
                <Building
                  color={paymentMethod === 'mortgage' ? '#FFFFFF' : '#6B7280'}
                  size={20}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>Mortgage</Text>
                <Text style={styles.paymentSubtitle}>Financing required</Text>
              </View>
              {paymentMethod === 'mortgage' && (
                <Check color="#2D6A4F" size={20} strokeWidth={2} />
              )}
            </TouchableOpacity>

            {/* Pre-approved Loan Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('preapproved')}
              style={[
                styles.paymentMethod,
                paymentMethod === 'preapproved' && styles.paymentMethodSelected,
              ]}
            >
              <View
                style={[
                  styles.paymentIcon,
                  paymentMethod === 'preapproved' && styles.paymentIconSelected,
                ]}
              >
                <Check
                  color={paymentMethod === 'preapproved' ? '#FFFFFF' : '#6B7280'}
                  size={20}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>Pre-approved Loan</Text>
                <Text style={styles.paymentSubtitle}>
                  Financing already secured
                </Text>
              </View>
              {paymentMethod === 'preapproved' && (
                <Check color="#2D6A4F" size={20} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          {/* Down Payment Input (if Mortgage selected) */}
          {paymentMethod === 'mortgage' && (
            <View style={styles.downPaymentContainer}>
              <Text style={styles.inputLabel}>Down Payment Amount</Text>
              <View style={styles.downPaymentInputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.downPaymentInput}
                  value={downPayment}
                  onChangeText={(value) => {
                    const numValue = value.replace(/[^0-9]/g, '');
                    if (numValue) {
                      setDownPayment(parseInt(numValue).toLocaleString());
                    } else {
                      setDownPayment('');
                    }
                  }}
                  placeholder="Enter down payment"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Pre-approval Toggle */}
          {paymentMethod === 'preapproved' && (
            <View style={styles.preApprovalContainer}>
              <View style={styles.preApprovalLeft}>
                <View style={styles.preApprovalIcon}>
                  <Shield color="#2563EB" size={20} strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.preApprovalTitle}>
                    Pre-approval Letter
                  </Text>
                  <Text style={styles.preApprovalSubtitle}>
                    Attach document
                  </Text>
                </View>
              </View>
              <Switch
                value={preApprovalAttached}
                onValueChange={setPreApprovalAttached}
                trackColor={{ false: '#D1D5DB', true: '#2D6A4F' }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}
        </View>

        {/* Closing Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color="#2D6A4F" size={20} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Closing Timeline</Text>
          </View>

          <View style={styles.timelineButtons}>
            {['30 Days', '45 Days', '60 Days', 'Flexible'].map((timeline) => (
              <TouchableOpacity
                key={timeline}
                onPress={() => setClosingTimeline(timeline)}
                style={[
                  styles.timelineButton,
                  closingTimeline === timeline && styles.timelineButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.timelineButtonText,
                    closingTimeline === timeline &&
                      styles.timelineButtonTextSelected,
                  ]}
                >
                  {timeline}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Terms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare color="#2D6A4F" size={20} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Additional Terms</Text>
            <Text style={styles.optionalLabel}>(Optional)</Text>
          </View>

          <TextInput
            style={styles.termsTextarea}
            value={additionalTerms}
            onChangeText={setAdditionalTerms}
            maxLength={300}
            placeholder="Add contingencies or special terms&#10;Examples:&#10;• Subject to inspection&#10;• Subject to financing&#10;• Include appliances"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {additionalTerms.length}/300 characters
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.contactHeader}>
            <View style={styles.sectionHeader}>
              <User color="#2D6A4F" size={20} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>

            <View style={styles.useProfileToggle}>
              <Switch
                value={useProfileDetails}
                onValueChange={setUseProfileDetails}
                trackColor={{ false: '#D1D5DB', true: '#2D6A4F' }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.useProfileText}>Use profile</Text>
            </View>
          </View>

          <View style={styles.contactInputs}>
            <View style={styles.contactInputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.contactInputWrapper}>
                <User
                  color="#9CA3AF"
                  size={16}
                  strokeWidth={2}
                  style={styles.contactInputIcon}
                />
                <TextInput
                  style={[
                    styles.contactInput,
                    useProfileDetails && styles.contactInputDisabled,
                  ]}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!useProfileDetails}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.contactInputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.contactInputWrapper}>
                <Phone
                  color="#9CA3AF"
                  size={16}
                  strokeWidth={2}
                  style={styles.contactInputIcon}
                />
                <TextInput
                  style={[
                    styles.contactInput,
                    useProfileDetails && styles.contactInputDisabled,
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  editable={!useProfileDetails}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.contactInputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.contactInputWrapper}>
                <Mail
                  color="#9CA3AF"
                  size={16}
                  strokeWidth={2}
                  style={styles.contactInputIcon}
                />
                <TextInput
                  style={[
                    styles.contactInput,
                    useProfileDetails && styles.contactInputDisabled,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  editable={!useProfileDetails}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Offer Summary */}
        {offerAmount && paymentMethod && closingTimeline && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Check color="#FFFFFF" size={20} strokeWidth={2} />
              <Text style={styles.summaryTitle}>Offer Summary</Text>
            </View>

            <View style={styles.summaryItems}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Property</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>
                  {property.title}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Listed Price</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(property.listedPrice)}
                </Text>
              </View>

              <View style={[styles.summaryItem, styles.summaryItemBorder]}>
                <Text style={styles.summaryLabel}>Your Offer</Text>
                <Text style={styles.summaryValueLarge}>${offerAmount}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Payment Method</Text>
                <Text style={[styles.summaryValue, styles.capitalize]}>
                  {paymentMethod === 'preapproved' ? 'Pre-approved' : paymentMethod}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Closing</Text>
                <Text style={styles.summaryValue}>{closingTimeline}</Text>
              </View>

              <View style={[styles.summaryItem, styles.summaryItemBorder]}>
                <Text style={styles.summaryLabel}>Contact</Text>
                <Text style={styles.summaryValue}>{phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Trust & Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerContent}>
            <Lock
              color="#2563EB"
              size={20}
              strokeWidth={2}
              style={styles.disclaimerIcon}
            />
            <View style={styles.disclaimerText}>
              <Text style={styles.disclaimerPrimary}>
                By submitting this offer, you acknowledge that this is a
                non-binding proposal subject to seller acceptance.
              </Text>
              <Text style={styles.disclaimerSecondary}>
                Your information is secure and will only be shared with the
                property seller or their authorized agent.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setTermsAccepted(!termsAccepted)}
            style={styles.termsCheckbox}
          >
            <View
              style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked,
              ]}
            >
              {termsAccepted && (
                <Check color="#FFFFFF" size={12} strokeWidth={3} />
              )}
            </View>
            <Text style={styles.termsCheckboxText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>terms and conditions</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          onPress={handleSubmitOffer}
          disabled={!isFormValid}
          style={[
            styles.submitButton,
            !isFormValid && styles.submitButtonDisabled,
          ]}
        >
          <Check color="#FFFFFF" size={20} strokeWidth={2} />
          <Text style={styles.submitButtonText}>Submit Offer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBack} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home color="#9CA3AF" size={24} strokeWidth={2} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Building2 color="#9CA3AF" size={24} strokeWidth={2} />
          <Text style={styles.navLabel}>Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Search color="#9CA3AF" size={24} strokeWidth={2} />
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MessageCircle color="#9CA3AF" size={24} strokeWidth={2} />
          <Text style={styles.navLabel}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <User color="#9CA3AF" size={24} strokeWidth={2} />
          <Text style={styles.navLabel}>Profile</Text>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 200,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  propertyImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  propertyDetails: {
    flex: 1,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  propertyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  propertyTypeBadge: {
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  propertyTypeText: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  propertyLocationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 4,
  },
  propertyDays: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  optionalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  offerInputWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 18,
    color: '#6B7280',
    zIndex: 1,
  },
  offerInput: {
    height: 56,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    fontSize: 18,
    color: '#111827',
  },
  validationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  validationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  quickOfferButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickOfferButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickOfferButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  quickOfferButtonAsking: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickOfferButtonTextAsking: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  quickOfferButtonAbove: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickOfferButtonTextAbove: {
    fontSize: 14,
    color: '#15803D',
    fontWeight: '500',
  },
  paymentMethods: {
    gap: 12,
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  paymentMethodSelected: {
    borderColor: '#2D6A4F',
    backgroundColor: 'rgba(45, 106, 79, 0.05)',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconSelected: {
    backgroundColor: '#2D6A4F',
  },
  paymentText: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  downPaymentContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  downPaymentInputWrapper: {
    position: 'relative',
  },
  downPaymentInput: {
    height: 48,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#111827',
  },
  preApprovalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  preApprovalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  preApprovalIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preApprovalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  preApprovalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  timelineButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timelineButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  timelineButtonSelected: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  timelineButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timelineButtonTextSelected: {
    color: '#FFFFFF',
  },
  termsTextarea: {
    height: 112,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  useProfileToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  useProfileText: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactInputs: {
    gap: 12,
  },
  contactInputGroup: {
    gap: 8,
  },
  contactInputWrapper: {
    position: 'relative',
  },
  contactInputIcon: {
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 1,
  },
  contactInput: {
    height: 48,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#111827',
  },
  contactInputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryItems: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryItemBorder: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: '60%',
  },
  summaryValueLarge: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  disclaimerCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  disclaimerContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  disclaimerIcon: {
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
  },
  disclaimerPrimary: {
    fontSize: 14,
    color: '#1E3A8A',
    marginBottom: 8,
    lineHeight: 20,
  },
  disclaimerSecondary: {
    fontSize: 12,
    color: '#1D4ED8',
    lineHeight: 18,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  termsCheckboxText: {
    flex: 1,
    fontSize: 14,
    color: '#1E3A8A',
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
