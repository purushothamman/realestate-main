import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Check,
  Lock,
  HelpCircle,
  FileText,
  Tag,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Home,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PaymentScreen({ navigation, onBack, onPaymentComplete }) {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCVV, setShowCVV] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  const paymentMethods = [
    {
      value: 'card',
      label: 'Credit / Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex',
    },
    {
      value: 'upi',
      label: 'UPI',
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm',
    },
    {
      value: 'netbanking',
      label: 'Net Banking',
      icon: Building2,
      description: 'All major banks supported',
    },
    {
      value: 'wallet',
      label: 'Wallets',
      icon: Wallet,
      description: 'Paytm, Mobikwik, Freecharge',
    },
  ];

  const banks = [
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India',
    'Axis Bank',
    'Kotak Mahindra Bank',
  ];

  const wallets = ['Paytm', 'PhonePe', 'Mobikwik', 'Freecharge', 'Amazon Pay', 'Airtel Money'];

  const planAmount = 49999;
  const gstRate = 0.18;
  const gstAmount = planAmount * gstRate;
  const discount = promoApplied ? 5000 : 0;
  const totalAmount = planAmount + gstAmount - discount;

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const formatCurrency = (value) => {
    return '₹' + value.toLocaleString('en-IN');
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE5K') {
      setPromoApplied(true);
      Alert.alert('Success', 'Promo code applied! You saved ₹5,000');
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid promo code');
    }
  };

  const handlePayment = () => {
    Alert.alert(
      'Payment Confirmation',
      `Proceed with payment of ${formatCurrency(totalAmount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            Alert.alert('Success', 'Payment completed successfully!', [
              {
                text: 'OK',
                onPress: () => {
                  onPaymentComplete && onPaymentComplete();
                },
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1762279389002-7b6abd7bd6c6?w=800',
          }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContent}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
              <View style={styles.logoContainer}>
                <View style={styles.logoBox}>
                  <Home size={24} color="#FFFFFF" strokeWidth={2} />
                </View>
                <Text style={styles.logoText}>EstateHub</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.helpButton}>
              <HelpCircle size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Complete Payment</Text>
            <Text style={styles.subtitle}>Secure & Encrypted Transaction</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={20} color="#2D6A4F" strokeWidth={2} />
            <Text style={styles.cardTitle}>Payment Summary</Text>
          </View>

          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>Premium Listing Plan</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Property</Text>
              <Text style={styles.summaryDescription}>
                Luxury Apartment, Downtown Manhattan
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Billing Type</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>One-time Payment</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountBreakdown}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Plan Amount</Text>
              <Text style={styles.amountValue}>{formatCurrency(planAmount)}</Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>GST (18%)</Text>
              <Text style={styles.amountValue}>{formatCurrency(gstAmount)}</Text>
            </View>

            {promoApplied && (
              <View style={styles.amountRow}>
                <View style={styles.discountLabel}>
                  <Tag size={16} color="#10B981" strokeWidth={2} />
                  <Text style={styles.discountText}>Discount Applied</Text>
                </View>
                <Text style={styles.discountValue}>-{formatCurrency(discount)}</Text>
              </View>
            )}

            <View style={styles.totalDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Tag size={20} color="#14B8A6" strokeWidth={2} />
            <Text style={styles.cardTitle}>Have a Promo Code?</Text>
          </View>

          <View style={styles.promoRow}>
            <TextInput
              style={[styles.promoInput, promoApplied && styles.promoInputDisabled]}
              placeholder="Enter promo code"
              placeholderTextColor="#9CA3AF"
              value={promoCode}
              onChangeText={(text) => setPromoCode(text.toUpperCase())}
              editable={!promoApplied}
              autoCapitalize="characters"
            />
            {promoApplied ? (
              <View style={styles.appliedButton}>
                <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
                <Text style={styles.appliedText}>Applied</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.applyButton, !promoCode && styles.applyButtonDisabled]}
                onPress={applyPromoCode}
                disabled={!promoCode}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>

          {!promoApplied && (
            <Text style={styles.promoHint}>Try code: SAVE5K for ₹5,000 off</Text>
          )}
        </View>

        {/* Payment Method Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Wallet size={20} color="#2D6A4F" strokeWidth={2} />
            <Text style={styles.cardTitle}>Select Payment Method</Text>
          </View>

          <View style={styles.methodsList}>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.value;
              return (
                <TouchableOpacity
                  key={method.value}
                  style={[styles.methodButton, isSelected && styles.methodButtonActive]}
                  onPress={() => setSelectedMethod(method.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.methodIcon, isSelected && styles.methodIconActive]}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? '#14B8A6' : '#6B7280'}
                      strokeWidth={2}
                    />
                  </View>

                  <View style={styles.methodInfo}>
                    <Text
                      style={[styles.methodLabel, isSelected && styles.methodLabelActive]}
                    >
                      {method.label}
                    </Text>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>

                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonActive,
                    ]}
                  >
                    {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Card Details */}
        {selectedMethod === 'card' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CreditCard size={20} color="#2D6A4F" strokeWidth={2} />
              <Text style={styles.cardTitle}>Card Details</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Card Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9CA3AF"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                maxLength={19}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Card Holder Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={cardHolder}
                onChangeText={(text) => setCardHolder(text.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiry(text))}
                  maxLength={5}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>CVV</Text>
                <View style={styles.cvvInput}>
                  <TextInput
                    style={styles.cvvField}
                    placeholder="123"
                    placeholderTextColor="#9CA3AF"
                    value={cvv}
                    onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 3))}
                    maxLength={3}
                    keyboardType="number-pad"
                    secureTextEntry={!showCVV}
                  />
                  <TouchableOpacity onPress={() => setShowCVV(!showCVV)}>
                    {showCVV ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setSavePaymentMethod(!savePaymentMethod)}
            >
              <View style={[styles.checkboxBox, savePaymentMethod && styles.checkboxBoxChecked]}>
                {savePaymentMethod && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>Save this card for future payments</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UPI Details */}
        {selectedMethod === 'upi' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Smartphone size={20} color="#2D6A4F" strokeWidth={2} />
              <Text style={styles.cardTitle}>UPI Details</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>UPI ID</Text>
              <TextInput
                style={styles.formInput}
                placeholder="yourname@upi"
                placeholderTextColor="#9CA3AF"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
              <Text style={styles.formHint}>
                Enter your UPI ID or scan QR code in the next step
              </Text>
            </View>
          </View>
        )}

        {/* Net Banking */}
        {selectedMethod === 'netbanking' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Building2 size={20} color="#2D6A4F" strokeWidth={2} />
              <Text style={styles.cardTitle}>Select Your Bank</Text>
            </View>

            <View style={styles.banksList}>
              {banks.map((bank) => (
                <TouchableOpacity key={bank} style={styles.bankButton}>
                  <Text style={styles.bankText}>{bank}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.bankButtonAll}>
                <Text style={styles.bankTextAll}>View All Banks</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Wallets */}
        {selectedMethod === 'wallet' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Wallet size={20} color="#2D6A4F" strokeWidth={2} />
              <Text style={styles.cardTitle}>Select Wallet</Text>
            </View>

            <View style={styles.walletsGrid}>
              {wallets.map((wallet) => (
                <TouchableOpacity key={wallet} style={styles.walletButton}>
                  <Text style={styles.walletText}>{wallet}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Security Assurance */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Shield size={20} color="#14B8A6" strokeWidth={2} />
          </View>
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>100% Secure Payment</Text>
            <Text style={styles.securityDescription}>
              Your payment information is encrypted and secure. We never store your card
              details.
            </Text>
            <View style={styles.securityBadges}>
              <Lock size={14} color="#6B7280" strokeWidth={2} />
              <Text style={styles.securityBadgeText}>SSL Encrypted</Text>
              <Text style={styles.securityDot}>•</Text>
              <Text style={styles.securityBadgeText}>PCI DSS Compliant</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <View style={styles.totalSection}>
          <Text style={styles.totalPayableLabel}>Total Payable</Text>
          <Text style={styles.totalPayableValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          activeOpacity={0.9}
        >
          <Lock size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.payButtonText}>Pay Now Securely</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.bottomLinks}>
          <TouchableOpacity>
            <Text style={styles.bottomLinkText}>Cancel Payment</Text>
          </TouchableOpacity>
          <Text style={styles.bottomDot}>•</Text>
          <TouchableOpacity style={styles.helpLink}>
            <HelpCircle size={12} color="#6B7280" strokeWidth={2} />
            <Text style={styles.bottomLinkText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
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
    height: 160,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 58, 138, 0.88)',
  },
  headerContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 24,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helpButton: {
    padding: 8,
  },
  titleSection: {},
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 200,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryContent: {
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryItem: {},
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryDescription: {
    fontSize: 14,
    color: '#374151',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  amountBreakdown: {
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#374151',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  discountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    fontSize: 14,
    color: '#10B981',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#14B8A6',
  },
  promoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  promoInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
  },
  promoInputDisabled: {
    backgroundColor: '#F3F4F6',
  },
  appliedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  appliedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  applyButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    paddingHorizontal: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  methodsList: {
    gap: 12,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  methodButtonActive: {
    borderColor: '#14B8A6',
    backgroundColor: '#F0FDFA',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconActive: {
    backgroundColor: '#CCFBF1',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  methodLabelActive: {
    color: '#14B8A6',
  },
  methodDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#14B8A6',
    backgroundColor: '#14B8A6',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  formHalf: {
    flex: 1,
  },
  cvvInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  cvvField: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  formHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  banksList: {
    gap: 8,
  },
  bankButton: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  bankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  bankButtonAll: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  bankTextAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  walletsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  walletButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    minWidth: '48%',
    alignItems: 'center',
  },
  walletText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 12,
    color: '#14B8A6',
    lineHeight: 18,
    marginBottom: 8,
  },
  securityBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityBadgeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  securityDot: {
    fontSize: 11,
    color: '#6B7280',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalPayableLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalPayableValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bottomLinkText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomDot: {
    fontSize: 12,
    color: '#6B7280',
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});