import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  Bell,
  Check,
  Home,
  Building2,
  Search,
  MessageCircle,
} from 'lucide-react-native';

const ScheduleViewingScreen = ({ onBack, onConfirm }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const property = {
    id: 'prop-001',
    image: 'https://images.unsplash.com/photo-1759093887568-529b349d151e?w=800',
    title: 'Downtown Luxury Penthouse',
    location: 'Downtown LA, California',
    price: '$2,450,000',
    type: 'Penthouse',
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        available: true,
      });
    }
    return dates;
  };

  const timeSlots = [
    { id: '1', time: '9:00 AM',  available: true  },
    { id: '2', time: '10:00 AM', available: true  },
    { id: '3', time: '11:00 AM', available: false },
    { id: '4', time: '12:00 PM', available: true  },
    { id: '5', time: '2:00 PM',  available: true  },
    { id: '6', time: '3:00 PM',  available: true  },
    { id: '7', time: '4:00 PM',  available: false },
    { id: '8', time: '5:00 PM',  available: true  },
  ];

  const [dateOptions] = useState(generateDateOptions());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [useProfileDetails, setUseProfileDetails] = useState(true);
  const [fullName, setFullName] = useState('John Anderson');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState('john.anderson@email.com');
  const [notes, setNotes] = useState('');
  const [appNotification, setAppNotification] = useState(true);
  const [smsReminder, setSmsReminder] = useState(true);

  const isFormValid =
    selectedDate && selectedTimeSlot && fullName && phone && email;

  const handleConfirmBooking = () => {
    if (isFormValid) {
      const bookingData = {
        propertyId: property.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        fullName,
        phone,
        email,
        notes,
        appNotification,
        smsReminder,
      };
      console.log('Booking confirmed:', bookingData);
      onConfirm?.(bookingData);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft width={20} height={20} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Schedule Viewing</Text>
            <Text style={styles.headerSubtitle}>
              Book a visit to see this property
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Property Card */}
        <View style={styles.propertyCard}>
          <Image
            source={{ uri: property.image }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyInfo}>
            <View style={styles.propertyHeader}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {property.title}
              </Text>
              <View style={styles.propertyTypeBadge}>
                <Text style={styles.propertyTypeText}>{property.type}</Text>
              </View>
            </View>
            <View style={styles.propertyLocation}>
              <MapPin width={12} height={12} color="#9ca3af" />
              <Text style={styles.propertyLocationText} numberOfLines={1}>
                {property.location}
              </Text>
            </View>
            <Text style={styles.propertyPrice}>{property.price}</Text>
          </View>
        </View>

        {/* Select Date */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar width={20} height={20} color="#2D6A4F" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesScroll}
          >
            {dateOptions.map((dateOption, index) => {
              const isSelected =
                selectedDate?.toDateString() === dateOption.date.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDate(dateOption.date)}
                  disabled={!dateOption.available}
                  style={[
                    styles.dateButton,
                    isSelected && styles.dateButtonSelected,
                    !dateOption.available && styles.dateButtonDisabled,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateDayName,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {dateOption.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dateDayNumber,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {dateOption.dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {dateOption.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock width={20} height={20} color="#2D6A4F" />
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
          </View>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() =>
                    slot.available && setSelectedTimeSlot(slot.time)
                  }
                  disabled={!slot.available}
                  style={[
                    styles.timeSlotButton,
                    isSelected && styles.timeSlotButtonSelected,
                    !slot.available && styles.timeSlotButtonDisabled,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSelected && styles.timeSlotTextSelected,
                      !slot.available && styles.timeSlotTextDisabled,
                    ]}
                  >
                    {slot.time}
                  </Text>
                  {!slot.available && (
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <View style={styles.contactTitleContainer}>
              <User width={20} height={20} color="#2D6A4F" />
              <Text style={styles.sectionTitle}>Contact Details</Text>
            </View>
            <View style={styles.profileToggleContainer}>
              <Switch
                value={useProfileDetails}
                onValueChange={setUseProfileDetails}
                trackColor={{ false: '#d1d5db', true: '#2D6A4F' }}
                thumbColor="#ffffff"
              />
              <Text style={styles.profileToggleText}>Use profile</Text>
            </View>
          </View>

          <View style={styles.inputsContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <User width={16} height={16} color="#9ca3af" />
                </View>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!useProfileDetails}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  style={[
                    styles.input,
                    useProfileDetails && styles.inputDisabled,
                  ]}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Phone width={16} height={16} color="#9ca3af" />
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  editable={!useProfileDetails}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  style={[
                    styles.input,
                    useProfileDetails && styles.inputDisabled,
                  ]}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Mail width={16} height={16} color="#9ca3af" />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  editable={!useProfileDetails}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    useProfileDetails && styles.inputDisabled,
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare width={20} height={20} color="#2D6A4F" />
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.optionalText}>(Optional)</Text>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            maxLength={200}
            placeholder="Add any specific requests or questions..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            style={styles.textArea}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {notes.length}/200 characters
          </Text>
        </View>

        {/* Reminder Preferences */}
        <View style={styles.remindersCard}>
          <View style={styles.sectionHeader}>
            <Bell width={20} height={20} color="#2D6A4F" />
            <Text style={styles.sectionTitle}>Reminder Preferences</Text>
          </View>
          <View style={styles.remindersList}>
            <View style={styles.reminderItem}>
              <View style={styles.reminderLeft}>
                <View
                  style={[styles.reminderIcon, { backgroundColor: '#dbeafe' }]}
                >
                  <Bell width={20} height={20} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.reminderTitle}>App Notification</Text>
                  <Text style={styles.reminderSubtitle}>
                    Get reminded in the app
                  </Text>
                </View>
              </View>
              <Switch
                value={appNotification}
                onValueChange={setAppNotification}
                trackColor={{ false: '#d1d5db', true: '#2D6A4F' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.reminderItem}>
              <View style={styles.reminderLeft}>
                <View
                  style={[styles.reminderIcon, { backgroundColor: '#dcfce7' }]}
                >
                  <MessageCircle width={20} height={20} color="#16a34a" />
                </View>
                <View>
                  <Text style={styles.reminderTitle}>SMS Reminder</Text>
                  <Text style={styles.reminderSubtitle}>
                    Get a text message
                  </Text>
                </View>
              </View>
              <Switch
                value={smsReminder}
                onValueChange={setSmsReminder}
                trackColor={{ false: '#d1d5db', true: '#2D6A4F' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Booking Summary */}
        {selectedDate && selectedTimeSlot && (
          <LinearGradient
            colors={['#2D6A4F', '#245A42']}
            style={styles.summaryCard}
          >
            <View style={styles.summaryHeader}>
              <Check width={20} height={20} color="#ffffff" />
              <Text style={styles.summaryTitle}>Booking Summary</Text>
            </View>
            <View style={styles.summaryItems}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Property</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>
                  {property.title}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
              </View>
              <View style={[styles.summaryItem, styles.summaryItemBorder]}>
                <Text style={styles.summaryLabel}>Contact</Text>
                <Text style={styles.summaryValue}>{phone}</Text>
              </View>
            </View>
          </LinearGradient>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={!isFormValid}
          style={[
            styles.confirmButton,
            !isFormValid && styles.confirmButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          <Check width={20} height={20} color="#ffffff" />
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { Icon: Home,         label: 'Home'     },
          { Icon: Building2,    label: 'Listings' },
          { Icon: Search,       label: 'Search'   },
          { Icon: MessageSquare,label: 'Messages' },
          { Icon: User,         label: 'Profile'  },
        ].map(({ Icon, label }) => (
          <TouchableOpacity key={label} style={styles.navItem}>
            <Icon width={24} height={24} color="#9ca3af" />
            <Text style={styles.navText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: '#9ca3af' },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 180 },

  // Property Card
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 16,
  },
  propertyImage: { width: 80, height: 80, borderRadius: 12 },
  propertyInfo: { flex: 1 },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  propertyTypeBadge: {
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  propertyTypeText: { fontSize: 12, color: '#2D6A4F', fontWeight: '500' },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  propertyLocationText: { fontSize: 12, color: '#6b7280', flex: 1 },
  propertyPrice: { fontSize: 18, fontWeight: 'bold', color: '#2D6A4F' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  optionalText: { fontSize: 12, color: '#9ca3af' },

  // Dates
  datesScroll: { gap: 8, paddingRight: 24 },
  dateButton: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  dateButtonSelected: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dateButtonDisabled: { backgroundColor: '#f9fafb', opacity: 0.5 },
  dateDayName: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  dateDayNumber: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  dateMonth: { fontSize: 12, color: '#9ca3af' },
  dateTextSelected: { color: '#ffffff' },

  // Time Slots
  timeSlotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeSlotButton: {
    flex: 1,
    minWidth: '47%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  timeSlotButtonSelected: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSlotButtonDisabled: { backgroundColor: '#f9fafb', opacity: 0.5 },
  timeSlotText: { fontSize: 14, fontWeight: '500', color: '#111827' },
  timeSlotTextSelected: { color: '#ffffff' },
  timeSlotTextDisabled: { color: '#9ca3af' },
  unavailableText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  // Contact Card
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileToggleText: { fontSize: 14, color: '#6b7280' },
  inputsContainer: { gap: 12 },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  // FIX: inputWrapper uses flexDirection row so the icon sits beside/over the input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  // FIX: icon positioned absolutely inside the wrapper
  inputIconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: 14,
    color: '#111827',
  },
  inputDisabled: { backgroundColor: '#f3f4f6', color: '#9ca3af' },

  // Notes
  textArea: {
    minHeight: 96,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#111827',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },

  // Reminders
  remindersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  remindersList: { gap: 12, marginTop: 16 },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  reminderSubtitle: { fontSize: 12, color: '#9ca3af' },

  // Summary
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  summaryItems: { gap: 12 },
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
  summaryLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' },
  summaryValue: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'right',
    maxWidth: '60%',
  },

  // Bottom Actions
  bottomActions: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  confirmButton: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#e5e7eb',
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  cancelButton: { alignItems: 'center' },
  cancelButtonText: { fontSize: 14, color: '#6b7280' },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  navItem: { alignItems: 'center', gap: 4 },
  navText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
});

export default ScheduleViewingScreen;
