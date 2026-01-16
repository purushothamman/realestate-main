import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import {
  ArrowLeft,
  SlidersHorizontal,
  Share2,
  HelpCircle,
  FileText,
  Star,
  MessageSquare,
  AlertCircle,
  ShieldCheck
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock review data
const mockReviews = [
  {
    id: '1',
    reviewerName: 'Priya Sharma',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    date: '2 days ago',
    reviewText: 'Absolutely fantastic experience! The builder was professional, responsive, and delivered exactly what was promised. The quality of construction is top-notch and they completed the project on time. Highly recommend to anyone looking for reliable builders!',
    projectName: 'Sunrise Apartments',
    builderResponse: {
      text: 'Thank you so much for your kind words, Priya! We\'re thrilled to hear you\'re happy with your new home. It was a pleasure working with you!',
      date: '1 day ago',
    },
  },
  {
    id: '2',
    reviewerName: 'Rajesh Kumar',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 4,
    date: '5 days ago',
    reviewText: 'Very good service overall. The construction quality is excellent and the team was cooperative. Only minor issue was some delays in the final finishing work, but they made up for it with great attention to detail.',
    projectName: 'Green Valley Villas',
    builderResponse: {
      text: 'Thank you for your feedback, Rajesh! We apologize for the delays and appreciate your patience. We\'re glad you\'re satisfied with the final result!',
      date: '4 days ago',
    },
  },
  {
    id: '3',
    reviewerName: 'Anita Desai',
    reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    date: '1 week ago',
    reviewText: 'Outstanding work! From the initial consultation to final handover, everything was seamless. The team is incredibly professional and they really care about customer satisfaction. My dream home is now a reality!',
    projectName: 'Skyline Towers',
  },
  {
    id: '4',
    reviewerName: 'Vikram Patel',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 2,
    date: '1 week ago',
    reviewText: 'Expected better quality for the price. There were several issues with waterproofing and some fittings. Customer service was slow to respond to our concerns. Hope they improve their quality control.',
    projectName: 'Metro Heights',
  },
  {
    id: '5',
    reviewerName: 'Sneha Reddy',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    date: '2 weeks ago',
    reviewText: 'Best decision we made! The entire process was transparent and the quality exceeded our expectations. Great value for money!',
    projectName: 'Palm Gardens',
    builderResponse: {
      text: 'We\'re so happy you love your new home, Sneha! Thank you for trusting us with such an important project.',
      date: '2 weeks ago',
    },
  },
  {
    id: '6',
    reviewerName: 'Arjun Singh',
    reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    rating: 4,
    date: '3 weeks ago',
    reviewText: 'Good experience overall. The team was professional and the construction quality is solid. Would have appreciated better communication during some phases of the project.',
    projectName: 'Royal Residency',
    builderResponse: {
      text: 'Thank you for your feedback, Arjun. We\'re working on improving our communication channels to serve you better!',
      date: '3 weeks ago',
    },
  },
];

// Rating distribution data
const ratingDistribution = [
  { stars: 5, count: 42, percentage: 70 },
  { stars: 4, count: 12, percentage: 20 },
  { stars: 3, count: 3, percentage: 5 },
  { stars: 2, count: 2, percentage: 3 },
  { stars: 1, count: 1, percentage: 2 },
];

// Filter options
const filterOptions = [
  { id: 'all', label: 'All', count: 60 },
  { id: 'positive', label: 'Positive', count: 54 },
  { id: 'critical', label: 'Critical', count: 3 },
  { id: 'replied', label: 'Replied', count: 45 },
  { id: 'unreplied', label: 'Unreplied', count: 15 },
];

const ReviewsScreen = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredReviews = mockReviews.filter((review) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'positive') return review.rating >= 4;
    if (activeFilter === 'critical') return review.rating <= 2;
    if (activeFilter === 'replied') return review.builderResponse !== undefined;
    if (activeFilter === 'unreplied') return review.builderResponse === undefined;
    return true;
  });

  const handleReply = (reviewId) => {
    console.log('Reply to review:', reviewId);
  };

  const handleReport = (reviewId) => {
    console.log('Report review:', reviewId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Background */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1695067438561-75492f7b6a9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />
        
        <View style={styles.headerContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              onPress={onBack} 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <ArrowLeft width={20} height={20} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <View style={styles.homeIcon}>
                  <View style={styles.homeIconRoof} />
                  <View style={styles.homeIconBody} />
                </View>
              </View>
              <View>
                <Text style={styles.logoText}>RealtyHub</Text>
                <Text style={styles.logoSubtext}>Pro Builder</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <SlidersHorizontal width={20} height={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Reviews & Ratings</Text>
            <Text style={styles.subtitle}>Manage and respond to customer feedback</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Rating Summary */}
        <View style={styles.ratingSummaryContainer}>
          <RatingSummary
            overallRating={4.6}
            totalReviews={60}
            ratingDistribution={ratingDistribution}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <FilterPills
            filters={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsCount}>
              {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
            </Text>
            <Text style={styles.sortLabel}>Sorted by Latest</Text>
          </View>
          
          <View style={styles.reviewsList}>
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReply={handleReply}
                onReport={handleReport}
              />
            ))}
          </View>
        </View>

        {/* Support & Guidelines */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Support & Guidelines</Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity style={styles.supportButton} activeOpacity={0.7}>
              <View style={styles.supportButtonContent}>
                <View style={[styles.supportIcon, { backgroundColor: '#eff6ff' }]}>
                  <FileText width={20} height={20} color="#2D6A4F" />
                </View>
                <View style={styles.supportTextContainer}>
                  <Text style={styles.supportButtonTitle}>Review Guidelines</Text>
                  <Text style={styles.supportButtonSubtitle}>Learn about our review policies</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportButton} activeOpacity={0.7}>
              <View style={styles.supportButtonContent}>
                <View style={[styles.supportIcon, { backgroundColor: '#f0fdf4' }]}>
                  <HelpCircle width={20} height={20} color="#16a34a" />
                </View>
                <View style={styles.supportTextContainer}>
                  <Text style={styles.supportButtonTitle}>Help & Support</Text>
                  <Text style={styles.supportButtonSubtitle}>Get assistance with reviews</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity 
          style={styles.ctaButton}
          activeOpacity={0.8}
        >
          <Share2 width={20} height={20} color="#ffffff" />
          <Text style={styles.ctaButtonText}>Request More Reviews</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Rating Summary Component
const RatingSummary = ({ overallRating, totalReviews, ratingDistribution }) => {
  return (
    <View style={styles.summaryCard}>
      {/* Overall Rating */}
      <View style={styles.summaryHeader}>
        <View style={styles.overallRatingContainer}>
          <Text style={styles.overallRating}>{overallRating.toFixed(1)}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                width={16}
                height={16}
                color={star <= Math.round(overallRating) ? '#facc15' : '#d1d5db'}
                fill={star <= Math.round(overallRating) ? '#facc15' : 'none'}
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
        </View>

        {/* Rating Distribution */}
        <View style={styles.distributionContainer}>
          {ratingDistribution.map((item) => (
            <View key={item.stars} style={styles.distributionRow}>
              <View style={styles.distributionLabel}>
                <Text style={styles.distributionStars}>{item.stars}</Text>
                <Star width={12} height={12} color="#facc15" fill="#facc15" />
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${item.percentage}%` }
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.distributionCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Trust Indicator */}
      <View style={styles.trustIndicator}>
        <ShieldCheck width={16} height={16} color="#16a34a" />
        <Text style={styles.trustText}>
          <Text style={styles.trustTextBold}>Verified Reviews</Text>
          <Text> • All reviews are from real customers</Text>
        </Text>
      </View>
    </View>
  );
};

// Filter Pills Component
const FilterPills = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersScrollContent}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => onFilterChange(filter.id)}
          style={[
            styles.filterPill,
            activeFilter === filter.id && styles.filterPillActive
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterPillText,
            activeFilter === filter.id && styles.filterPillTextActive
          ]}>
            {filter.label}
            {filter.count !== undefined && (
              <Text style={[
                styles.filterCount,
                activeFilter === filter.id && styles.filterCountActive
              ]}>
                {' '}({filter.count})
              </Text>
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Review Card Component
const ReviewCard = ({ review, onReply, onReport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = review.reviewText.length > 150;
  const displayText = isExpanded || !shouldTruncate 
    ? review.reviewText 
    : review.reviewText.slice(0, 150) + '...';

  return (
    <View style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        {/* Avatar */}
        <Image
          source={{ uri: review.reviewerAvatar }}
          style={styles.reviewerAvatar}
        />

        {/* Info */}
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerNameRow}>
            <Text style={styles.reviewerName} numberOfLines={1}>{review.reviewerName}</Text>
            {!review.builderResponse && (
              <View style={styles.needsReplyBadge}>
                <Text style={styles.needsReplyText}>Needs Reply</Text>
              </View>
            )}
          </View>

          {/* Rating & Date */}
          <View style={styles.ratingDateRow}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  width={14}
                  height={14}
                  color={star <= review.rating ? '#facc15' : '#d1d5db'}
                  fill={star <= review.rating ? '#facc15' : 'none'}
                />
              ))}
            </View>
            <Text style={styles.reviewDate}>• {review.date}</Text>
          </View>

          {/* Project Name */}
          {review.projectName && (
            <View style={styles.projectBadge}>
              <Text style={styles.projectBadgeText}>📍 {review.projectName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Review Text */}
      <View style={styles.reviewTextContainer}>
        <Text style={styles.reviewText}>{displayText}</Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.readMoreText}>
              {isExpanded ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Builder Response */}
      {review.builderResponse && (
        <View style={styles.builderResponse}>
          <View style={styles.builderResponseHeader}>
            <View style={styles.builderIcon}>
              <View style={styles.builderIconInner}>
                <View style={styles.homeIconSmallRoof} />
                <View style={styles.homeIconSmallBody} />
              </View>
            </View>
            <Text style={styles.builderResponseLabel}>Builder Response</Text>
            <Text style={styles.builderResponseDate}>• {review.builderResponse.date}</Text>
          </View>
          <Text style={styles.builderResponseText}>{review.builderResponse.text}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => onReply(review.id)}
          style={[
            styles.replyButton,
            review.builderResponse ? styles.replyButtonSecondary : styles.replyButtonPrimary
          ]}
          activeOpacity={0.7}
        >
          <MessageSquare 
            width={16} 
            height={16} 
            color={review.builderResponse ? '#374151' : '#ffffff'} 
          />
          <Text style={[
            styles.replyButtonText,
            review.builderResponse ? styles.replyButtonTextSecondary : styles.replyButtonTextPrimary
          ]}>
            {review.builderResponse ? 'Edit Reply' : 'Reply'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onReport(review.id)}
          style={styles.reportButton}
          activeOpacity={0.7}
        >
          <AlertCircle width={16} height={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    height: 192,
    position: 'relative'
  },
  headerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3
  },
  headerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(22, 101, 52, 0.75)'
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    justifyContent: 'space-between'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 16
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  homeIcon: {
    width: 24,
    height: 24,
    position: 'relative'
  },
  homeIconRoof: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '45deg' }]
  },
  homeIconBody: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 12,
    backgroundColor: '#ffffff'
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  logoSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12
  },
  titleSection: {
    gap: 4
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    gap: 20
  },
  ratingSummaryContainer: {
    marginTop: -16
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  overallRatingContainer: {
    alignItems: 'center'
  },
  overallRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4
  },
  totalReviews: {
    fontSize: 12,
    color: '#9ca3af'
  },
  distributionContainer: {
    flex: 1,
    gap: 8
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 48
  },
  distributionStars: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151'
  },
  progressBarContainer: {
    flex: 1
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#facc15',
    borderRadius: 4
  },
  distributionCount: {
    fontSize: 12,
    color: '#9ca3af',
    width: 32,
    textAlign: 'right'
  },
  trustIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center'
  },
  trustText: {
    fontSize: 14,
    color: '#374151'
  },
  trustTextBold: {
    fontWeight: '600',
    color: '#16a34a'
  },
  filtersSection: {
    marginTop: -4
  },
  filtersScrollContent: {
    paddingVertical: 8,
    gap: 8
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8
  },
  filterPillActive: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  filterPillTextActive: {
    color: '#ffffff'
  },
  filterCount: {
    color: '#9ca3af'
  },
  filterCountActive: {
    color: 'rgba(255, 255, 255, 0.8)'
  },
  reviewsSection: {
    gap: 16
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reviewsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  sortLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },
  reviewsList: {
    gap: 12
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  reviewerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#f3f4f6'
  },
  reviewerInfo: {
    flex: 1
  },
  reviewerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1
  },
  needsReplyBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  needsReplyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ea580c'
  },
  ratingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af'
  },
  projectBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  projectBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1d4ed8'
  },
  reviewTextContainer: {
    marginBottom: 12
  },
  reviewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2D6A4F',
    marginTop: 4
  },
  builderResponse: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6'
  },
  builderResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  builderIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  builderIconInner: {
    width: 14,
    height: 14,
    position: 'relative'
  },
  homeIconSmallRoof: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '45deg' }]
  },
  homeIconSmallBody: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 7,
    backgroundColor: '#ffffff'
  },
  builderResponseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e3a8a'
  },
  builderResponseDate: {
    fontSize: 12,
    color: '#2D6A4F',
},
builderResponseText: {
fontSize: 14,
color: '#1e3a8a',
lineHeight: 20
},
actionButtons: {
flexDirection: 'row',
gap: 8
},
replyButton: {
flex: 1,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
gap: 8,
paddingVertical: 10,
borderRadius: 12
},
replyButtonPrimary: {
backgroundColor: '#2D6A4F',
shadowColor: '#2D6A4F',
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.2,
shadowRadius: 2,
elevation: 2
},
replyButtonSecondary: {
backgroundColor: '#f9fafb'
},
replyButtonText: {
fontSize: 14,
fontWeight: '500'
},
replyButtonTextPrimary: {
color: '#ffffff'
},
replyButtonTextSecondary: {
color: '#374151'
},
reportButton: {
paddingHorizontal: 16,
paddingVertical: 10,
borderRadius: 12
},
supportCard: {
backgroundColor: '#ffffff',
borderRadius: 16,
padding: 20,
shadowColor: '#000',
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.05,
shadowRadius: 2,
elevation: 2,
borderWidth: 1,
borderColor: '#f3f4f6'
},
supportTitle: {
fontSize: 16,
fontWeight: '600',
color: '#111827',
marginBottom: 16
},
supportButtons: {
gap: 12
},
supportButton: {
width: '100%',
borderRadius: 12,
padding: 12
},
supportButtonContent: {
flexDirection: 'row',
alignItems: 'center',
gap: 12
},
supportIcon: {
width: 40,
height: 40,
borderRadius: 12,
justifyContent: 'center',
alignItems: 'center'
},
supportTextContainer: {
flex: 1
},
supportButtonTitle: {
fontSize: 14,
fontWeight: '500',
color: '#111827',
marginBottom: 2
},
supportButtonSubtitle: {
fontSize: 12,
color: '#9ca3af'
},
bottomCTA: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
backgroundColor: '#ffffff',
borderTopWidth: 1,
borderTopColor: '#e5e7eb',
padding: 16,
shadowColor: '#000',
shadowOffset: { width: 0, height: -2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 5
},
ctaButton: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
gap: 8,
backgroundColor: '#16a34a',
paddingVertical: 16,
borderRadius: 16,
shadowColor: '#16a34a',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.3,
shadowRadius: 4,
elevation: 3
},
ctaButtonText: {
fontSize: 16,
fontWeight: '600',
color: '#ffffff'
}
});
export default ReviewsScreen;
