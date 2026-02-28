import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── COLORS ───────────────────────────────────────────────
const C = {
    green: '#2D6A4F',
    greenLt: '#40916C',
    greenBg: '#F0FDF4',
    greenBd: '#BBF7D0',
    blue: '#3B82F6',
    amber: '#F59E0B',
    purple: '#8B5CF6',
    red: '#EF4444',
    sold: '#6B7280',
    bg: '#F4F6F8',
    card: '#ffffff',
    text: '#111827',
    muted: '#6B7280',
    faint: '#9CA3AF',
    border: '#E5E7EB',
    border2: '#F3F4F6',
};

// ─── SIMPLE SVG-LIKE ICONS (using Unicode / text) ─────────
// Since we can't use SVG in RN without react-native-svg, we use emoji/unicode symbols
const Icon = ({ name, size = 16, color = C.green }) => {
    const icons = {
        arrowLeft: '←',
        share: '⤴',
        edit: '✎',
        camera: '📷',
        verified: '✓',
        mapPin: '📍',
        home: '🏠',
        trendingUp: '📈',
        star: '★',
        award: '🏅',
        phone: '📞',
        mail: '✉',
        globe: '🌐',
        map: '🗺',
        building: '🏢',
        shield: '🛡',
        dollar: '💲',
        eye: '👁',
        clock: '🕐',
        calendar: '📅',
        bell: '🔔',
        lock: '🔒',
        help: '❓',
        doc: '📄',
        logout: '🚪',
        chevronRight: '›',
        instagram: '📸',
        twitter: '🐦',
        linkedin: '💼',
        message: '💬',
        callBtn: '📱',
        loadMore: '→',
        layoutDashboard: '📊',
    };
    return (
        <Text style={{ fontSize: size, color, lineHeight: size * 1.3 }}>
            {icons[name] || '•'}
        </Text>
    );
};

// ─── STAR ROW ──────────────────────────────────────────────
const StarRow = ({ count = 5, size = 12 }) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
            <Text key={i} style={{ fontSize: size, color: C.amber }}>★</Text>
        ))}
    </View>
);

// ════════════════════════════════════════════════════════════
//  HERO SECTION
// ════════════════════════════════════════════════════════════
const HeroSection = ({ userData, onBack }) => (
    <View style={styles.hero}>
        <Image
            source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=jpg&q=60&w=1200&auto=format&fit=crop' }}
            style={styles.heroCover}
            resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        <SafeAreaView style={{ flex: 0 }}>
            <View style={styles.heroInner}>

                {/* Top Nav */}
                <View style={styles.topnav}>
                    <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                        <Text style={styles.iconBtnText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.topnavBrand}>
                        <View style={styles.brandIcon}>
                            <Text style={{ fontSize: 14 }}>🏠</Text>
                        </View>
                        <Text style={styles.brandName}>EstateHub</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Text style={styles.iconBtnText}>⤴</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Identity */}
                <View style={styles.identity}>
                    <View style={styles.avatarWrap}>
                        <Image
                            source={{ uri: userData.profileImage || 'https://images.unsplash.com/photo-1548637724-cbc39e0c8d3b?fm=jpg&q=80&w=400&auto=format&fit=crop' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.avatarCam}>
                            <Text style={{ fontSize: 10, color: C.green }}>📷</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.identityInfo}>
                        <View style={styles.identityNameRow}>
                            <Text style={styles.identityName}>{userData.name || 'User Name'}</Text>
                            {userData.isVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Text style={{ fontSize: 9, color: '#60A5FA' }}>✓ Verified</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.identityTitle}>{userData.title || 'Advisor'}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>📍</Text>
                            <Text style={styles.identityLoc}>{userData.city || 'Location'}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Strip */}
                <View style={styles.statsStrip}>
                    {[
                        { val: '18', lbl: 'Active' },
                        { val: '147', lbl: 'Sold' },
                        { val: '4.9★', lbl: 'Rating' },
                        { val: '$284M', lbl: 'Volume' },
                    ].map((item, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.stripCell,
                                idx < 3 && { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.12)' },
                            ]}
                        >
                            <Text style={styles.stripVal}>{item.val}</Text>
                            <Text style={styles.stripLbl}>{item.lbl}</Text>
                        </View>
                    ))}
                </View>

                {/* CTA Row */}
                <View style={styles.ctaRow}>
                    <TouchableOpacity style={styles.btnPrimary}>
                        <Text style={{ fontSize: 14, color: '#fff', marginRight: 4 }}>💬</Text>
                        <Text style={styles.btnPrimaryText}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnSecondary}>
                        <Text style={{ fontSize: 14, color: C.green, marginRight: 4 }}>📞</Text>
                        <Text style={styles.btnSecondaryText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnIcon}>
                        <Text style={{ fontSize: 15, color: C.green }}>✉</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    </View>
);

// ════════════════════════════════════════════════════════════
//  OVERVIEW TAB
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ userData, onDashboard }) => {
    const statPills = [
        { val: '18', lbl: 'Active Listings', color: C.green, icon: '🏠' },
        { val: '$284M', lbl: 'Total Volume', color: C.blue, icon: '📈' },
        { val: '4.9', lbl: '98 Reviews', color: C.amber, icon: '★' },
        { val: '147', lbl: 'Homes Sold', color: C.purple, icon: '🏅' },
    ];

    const contactInfo = [
        { icon: '📞', label: 'Phone', value: userData.phone || 'N/A' },
        { icon: '✉', label: 'Email', value: userData.email || 'N/A' },
        { icon: '🌐', label: 'Website', value: userData.website || 'N/A' },
        { icon: '📍', label: 'Location', value: userData.city || 'N/A' },
    ];

    const credentials = [
        { icon: '🏠', label: 'Agency', value: 'Johnson Real Estate Group' },
        { icon: '🛡', label: 'RERA ID', value: 'RERA-CA-2024-12345' },
        { icon: '💲', label: 'Avg. Days on Market', value: '21 days' },
    ];

    const socials = [
        { icon: '📸', handle: '@sarahjohnsonre', color: '#E1306C' },
        { icon: '🐦', handle: '@sarahjohnsonre', color: '#1DA1F2' },
        { icon: '💼', handle: 'in/sarahjohnson', color: '#0A66C2' },
    ];

    const settings = [
        { icon: '🔒', label: 'Change Password', sub: 'Last changed 3 months ago' },
        { icon: '🔔', label: 'Notifications', sub: 'Push, Email, SMS' },
        { icon: '🌐', label: 'Language & Region', sub: 'English (US)' },
        { icon: '❓', label: 'Help & Support', sub: 'FAQs, chat support' },
        { icon: '📄', label: 'Privacy Policy', sub: '' },
        { icon: '📄', label: 'Terms & Conditions', sub: '' },
    ];

    return (
        <View style={{ gap: 14 }}>

            {/* Dashboard Banner */}
            <TouchableOpacity style={[styles.editBanner, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' }]} onPress={onDashboard} activeOpacity={0.85}>
                <View style={styles.editBannerLeft}>
                    <View style={[styles.editBannerIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                        <Icon name="layoutDashboard" size={16} color={C.blue} />
                    </View>
                    <View>
                        <Text style={[styles.editBannerTitle, { color: C.blue }]}>Agent Dashboard</Text>
                        <Text style={[styles.editBannerSub, { color: '#60A5FA' }]}>Manage your listings, leads and performance</Text>
                    </View>
                </View>
                <Text style={{ color: C.blue, fontSize: 20 }}>›</Text>
            </TouchableOpacity>

            {/* Stat Pills */}
            <View style={styles.statGrid}>
                {statPills.map((p, i) => (
                    <View key={i} style={[styles.statPill, { borderColor: p.color + '33' }]}>
                        <View style={[styles.statIcon, { backgroundColor: p.color + '18' }]}>
                            <Text style={{ fontSize: 16 }}>{p.icon}</Text>
                        </View>
                        <View>
                            <Text style={[styles.statVal, { color: p.color }]}>{p.val}</Text>
                            <Text style={styles.statLbl}>{p.lbl}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* About */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>About</Text>
                <Text style={styles.aboutText}>
                    With over 12 years of experience in luxury real estate, I specialize in connecting
                    discerning clients with exceptional properties across Beverly Hills, Bel Air, and the
                    greater Los Angeles area. My commitment to white-glove service and deep market knowledge
                    ensures every transaction exceeds expectations.
                </Text>
                <View style={styles.aboutMeta}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📅</Text>
                        <Text style={styles.metaText}>Member since March 2013</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>🕐</Text>
                        <Text style={styles.metaText}>Responds in &lt; 1 hour</Text>
                    </View>
                </View>
            </View>

            {/* Specializations */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Specializations</Text>
                <View style={styles.tagRow}>
                    {['Luxury Homes', 'Waterfront Properties', 'New Developments', 'Investment Properties'].map(t => (
                        <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                    ))}
                </View>
            </View>

            {/* Languages */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Languages</Text>
                <View style={styles.tagRow}>
                    {['English', 'Spanish', 'French'].map(t => (
                        <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                    ))}
                </View>
            </View>

            {/* Contact */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Contact Information</Text>
                {contactInfo.map((item, i) => (
                    <View key={i} style={[styles.infoRow, i === contactInfo.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={styles.infoIcon}><Text style={{ fontSize: 14 }}>{item.icon}</Text></View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>{item.label}</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{item.value}</Text>
                        </View>
                        {i < contactInfo.length - 1 && <Text style={{ color: C.faint, fontSize: 18 }}>›</Text>}
                    </View>
                ))}
            </View>

            {/* Business & Credentials */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Business & Credentials</Text>
                {credentials.map((item, i) => (
                    <View key={i} style={[styles.infoRow, i === credentials.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={styles.infoIcon}><Text style={{ fontSize: 14 }}>{item.icon}</Text></View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>{item.label}</Text>
                            <Text style={styles.infoValue}>{item.value}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Social Profiles */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Social Profiles</Text>
                {socials.map((s, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.socialChip, { borderColor: s.color + '44' }]}
                    >
                        <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                        <Text style={[styles.socialHandle, { color: s.color }]}>{s.handle}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Account Settings */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Account Settings</Text>
                {settings.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.settingsRow, i === settings.length - 1 && { borderBottomWidth: 0 }]}
                    >
                        <View style={styles.settingsLeft}>
                            <View style={styles.settingsIcon}><Text style={{ fontSize: 14 }}>{item.icon}</Text></View>
                            <View>
                                <Text style={styles.settingsLabel}>{item.label}</Text>
                                {!!item.sub && <Text style={styles.settingsSub}>{item.sub}</Text>}
                            </View>
                        </View>
                        <Text style={{ color: C.faint, fontSize: 18 }}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sign Out */}
            <View style={{ gap: 10 }}>
                <TouchableOpacity
                    style={styles.btnSignOut}
                    onPress={() => Alert.alert('Sign Out', 'Sign out of EstateHub?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Sign Out', style: 'destructive' },
                    ])}
                >
                    <Text style={{ fontSize: 17, marginRight: 6 }}>🚪</Text>
                    <Text style={styles.btnSignOutText}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete your account?')}>
                    <Text style={styles.btnDelete}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.version}>EstateHub v1.0.0 · © 2025 All rights reserved</Text>
        </View>
    );
};

// ════════════════════════════════════════════════════════════
//  LISTINGS TAB
// ════════════════════════════════════════════════════════════
const ListingsTab = () => {
    const listings = [
        {
            img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=jpg&q=60&w=600&auto=format&fit=crop',
            badge: 'ACTIVE', badgeColor: '#10B981',
            title: 'Modern Villa in Bel Air',
            price: '$8,500,000',
            meta: '6 bd · 7 ba · 9,200 sqft',
            views: '1,240 views', listed: '5d listed',
        },
        {
            img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?fm=jpg&q=60&w=600&auto=format&fit=crop',
            badge: 'ACTIVE', badgeColor: '#10B981',
            title: 'Beverly Hills Estate',
            price: '$14,200,000',
            meta: '8 bd · 10 ba · 14,500 sqft',
            views: '3,820 views', listed: '12d listed',
        },
        {
            img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?fm=jpg&q=60&w=600&auto=format&fit=crop',
            badge: 'SOLD', badgeColor: '#6B7280',
            title: 'Malibu Beachfront Home',
            price: '$6,750,000',
            meta: '5 bd · 6 ba · 6,800 sqft',
            views: '5,100 views', listed: '18d listed',
        },
    ];

    return (
        <View style={{ gap: 14 }}>
            {/* Header */}
            <View style={styles.listingsHdr}>
                <View>
                    <Text style={styles.listingsCount}>24 Properties</Text>
                    <Text style={styles.listingsSub}>18 active · 147 sold</Text>
                </View>
                <TouchableOpacity style={styles.btnFilter}>
                    <Text style={styles.btnFilterText}>Filter</Text>
                </TouchableOpacity>
            </View>

            {/* Cards */}
            {listings.map((l, i) => (
                <TouchableOpacity key={i} style={styles.listingCard} activeOpacity={0.85}>
                    <View>
                        <Image
                            source={{ uri: l.img }}
                            style={styles.listingImg}
                            resizeMode="cover"
                        />
                        <View style={[styles.listingBadge, { backgroundColor: l.badgeColor }]}>
                            <Text style={styles.listingBadgeText}>{l.badge}</Text>
                        </View>
                    </View>
                    <View style={styles.listingBody}>
                        <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                        <Text style={styles.listingPrice}>{l.price}</Text>
                        <Text style={styles.listingMeta}>{l.meta}</Text>
                        <View style={styles.listingFooter}>
                            <View style={styles.listingFootItem}>
                                <Text style={styles.footIcon}>👁 </Text>
                                <Text style={styles.footText}>{l.views}</Text>
                            </View>
                            <View style={styles.listingFootItem}>
                                <Text style={styles.footIcon}>🕐 </Text>
                                <Text style={styles.footText}>{l.listed}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.btnLoadMore}>
                <Text style={styles.btnLoadMoreText}>View All Listings  →</Text>
            </TouchableOpacity>
        </View>
    );
};

// // ════════════════════════════════════════════════════════════
// //  REVIEWS TAB
// // ════════════════════════════════════════════════════════════
// const ReviewsTab = () => {
//   const bars = [
//     { label: '5 ★', pct: 82 },
//     { label: '4 ★', pct: 12 },
//     { label: '3 ★', pct: 4  },
//     { label: '2 ★', pct: 1  },
//     { label: '1 ★', pct: 1  },
//   ];

//   const reviews = [
//     {
//       img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=100&auto=format&fit=crop',
//       name: 'Michael Chen', date: '· January 2025',
//       text: 'Sarah made our home buying journey seamless. Her expertise in the Beverly Hills market is unmatched and her attention to detail is extraordinary.',
//     },
//     {
//       img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&q=60&w=100&auto=format&fit=crop',
//       name: 'Emily Rodriguez', date: '· December 2024',
//       text: "Sold our Bel Air home 15% above asking price within 3 weeks. Sarah's negotiation skills and market knowledge are truly exceptional.",
//     },
//   ];

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Rating Hero */}
//       <View style={styles.ratingHero}>
//         <Text style={styles.ratingNumber}>4.9</Text>
//         <View style={styles.starsRow}>
//           {[1,2,3,4,5].map(i => <Text key={i} style={styles.bigStar}>★</Text>)}
//         </View>
//         <Text style={styles.ratingCount}>Based on 98 verified reviews</Text>

//         <View style={styles.ratingBars}>
//           {bars.map((b, i) => (
//             <View key={i} style={styles.barRow}>
//               <Text style={styles.barLabel}>{b.label}</Text>
//               <View style={styles.barTrack}>
//                 <View style={[styles.barFill, { width: `${b.pct}%` }]} />
//               </View>
//               <Text style={styles.barPct}>{b.pct}%</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* Review Cards */}
//       {reviews.map((r, i) => (
//         <View key={i} style={styles.reviewCard}>
//           <View style={styles.reviewHeader}>
//             <Image source={{ uri: r.img }} style={styles.reviewAvatar} />
//             <View>
//               <Text style={styles.reviewAuthor}>{r.name}</Text>
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
//                 <StarRow count={5} size={11} />
//                 <Text style={styles.reviewDate}>{r.date}</Text>
//               </View>
//             </View>
//           </View>
//           <Text style={styles.reviewText}>{r.text}</Text>
//         </View>
//       ))}

//       <TouchableOpacity style={styles.btnLoadMore}>
//         <Text style={styles.btnLoadMoreText}>Load More Reviews  ›</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// ════════════════════════════════════════════════════════════
//  MAIN SCREEN
// ════════════════════════════════════════════════════════════
export default function AgentProfileScreen({
    navigation,
    userData = {},
    onBack = () => { },
    onDashboard = () => { },
    onLogout = () => { },
}) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'listings', label: 'Listings' },
        // { key: 'reviews',   label: 'Reviews'   },
    ];

    // Normalize stats
    const stats = userData.stats || {
        totalProperties: 0,
        activeListings: 0,
        soldProperties: 0,
        sold: 0,
        rating: 0,
        volume: '0',
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Hero — rendered outside ScrollView so it stays at top */}
            <HeroSection userData={userData} onBack={onBack} />

            {/* Sticky Tab Bar */}
            <View style={styles.tabbar}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Scrollable Body */}
            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyInner}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'overview' && <OverviewTab userData={userData} onDashboard={onDashboard} />}
                {activeTab === 'listings' && <ListingsTab userData={userData} />}
                {/* {activeTab === 'reviews'   && <ReviewsTab  />} */}
            </ScrollView>
        </View>
    );
}

// ════════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },

    // ── HERO ─────────────────────────────────────────────────
    hero: {
        backgroundColor: '#0f2d1e',
        position: 'relative',
    },
    heroCover: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.35,
    },
    heroOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15,45,30,0.82)',
    },
    heroInner: {
        paddingHorizontal: 20,
        paddingBottom: 22,
    },

    topnav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
        paddingBottom: 20,
    },
    iconBtn: {
        width: 36, height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnText: {
        color: '#fff',
        fontSize: 18,
        lineHeight: 22,
    },
    topnavBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brandIcon: {
        width: 30, height: 30,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    identity: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 16,
        marginBottom: 18,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 86, height: 86,
        borderRadius: 43,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarCam: {
        position: 'absolute',
        bottom: 2, right: 2,
        width: 26, height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    identityInfo: { flex: 1, paddingBottom: 4 },
    identityNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    identityName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 26,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(96,165,250,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.45)',
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    identityTitle: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 5,
    },
    identityLoc: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
    },

    statsStrip: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
    },
    stripCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 6,
    },
    stripVal: { color: '#fff', fontSize: 15, fontWeight: '700' },
    stripLbl: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 2 },

    ctaRow: { flexDirection: 'row', gap: 10 },
    btnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        backgroundColor: C.green,
        borderRadius: 12,
    },
    btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    btnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    btnSecondaryText: { color: C.green, fontSize: 13, fontWeight: '700' },
    btnIcon: {
        width: 44, height: 44,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── TAB BAR ──────────────────────────────────────────────
    tabbar: {
        flexDirection: 'row',
        backgroundColor: C.card,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 13,
        alignItems: 'center',
        borderBottomWidth: 2.5,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: { borderBottomColor: C.green },
    tabBtnText: { fontSize: 13, fontWeight: '500', color: C.muted },
    tabBtnTextActive: { color: C.green, fontWeight: '700' },

    // ── BODY ─────────────────────────────────────────────────
    body: { flex: 1 },
    bodyInner: { padding: 14, paddingBottom: 60, gap: 0 },

    // ── CARD ─────────────────────────────────────────────────
    card: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: C.text,
        marginBottom: 14,
    },

    // ── STAT PILLS ───────────────────────────────────────────
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: C.card,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1.5,
        width: '47.5%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    statIcon: {
        width: 36, height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statVal: { fontSize: 16, fontWeight: '800', lineHeight: 20 },
    statLbl: { fontSize: 10, color: C.faint, marginTop: 2 },

    // ── ABOUT ─────────────────────────────────────────────────
    aboutText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 22,
    },
    aboutMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginTop: 12,
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaIcon: { fontSize: 13 },
    metaText: { fontSize: 11, color: C.faint },

    // ── TAGS ─────────────────────────────────────────────────
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        backgroundColor: C.greenBg,
        borderWidth: 1,
        borderColor: C.greenBd,
        borderRadius: 20,
        paddingHorizontal: 13,
        paddingVertical: 5,
    },
    tagText: { fontSize: 12, color: C.green, fontWeight: '600' },

    // ── INFO ROWS ─────────────────────────────────────────────
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: C.border2,
    },
    infoIcon: {
        width: 36, height: 36,
        borderRadius: 10,
        backgroundColor: C.greenBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: { flex: 1 },
    infoLabel: { fontSize: 10, color: C.faint, marginBottom: 2 },
    infoValue: { fontSize: 13, color: C.text, fontWeight: '500' },

    // ── SOCIAL CHIPS ─────────────────────────────────────────
    socialChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1.5,
        backgroundColor: '#FAFAFA',
        marginBottom: 8,
    },
    socialHandle: { fontSize: 13, fontWeight: '600' },

    // ── SETTINGS ROWS ─────────────────────────────────────────
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: C.border2,
    },
    settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingsIcon: {
        width: 34, height: 34,
        borderRadius: 9,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: C.border2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsLabel: { fontSize: 13, color: C.text, fontWeight: '500' },
    settingsSub: { fontSize: 11, color: C.faint, marginTop: 1 },

    // ── SIGN OUT ──────────────────────────────────────────────
    btnSignOut: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        backgroundColor: C.card,
        borderWidth: 1.5,
        borderColor: C.border,
        borderRadius: 12,
    },
    btnSignOutText: { fontSize: 14, color: '#374151', fontWeight: '600' },
    btnDelete: {
        fontSize: 13,
        color: C.red,
        textAlign: 'center',
        paddingVertical: 8,
    },
    version: {
        textAlign: 'center',
        fontSize: 11,
        color: C.faint,
        paddingTop: 4,
        marginBottom: 14,
    },

    // ── LISTINGS ──────────────────────────────────────────────
    listingsHdr: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    listingsCount: { fontSize: 18, fontWeight: '800', color: C.text },
    listingsSub: { fontSize: 12, color: C.muted, marginTop: 2 },
    btnFilter: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: C.green,
    },
    btnFilterText: { fontSize: 12, fontWeight: '700', color: C.green },

    listingCard: {
        backgroundColor: C.card,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 14,
    },
    listingImg: { width: '100%', height: 200 },
    listingBadge: {
        position: 'absolute',
        top: 12, left: 12,
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderRadius: 20,
    },
    listingBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
    listingBody: { padding: 14 },
    listingTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 3 },
    listingPrice: { fontSize: 20, fontWeight: '800', color: C.green, marginBottom: 6, letterSpacing: -0.4 },
    listingMeta: { fontSize: 12, color: C.muted, marginBottom: 10 },
    listingFooter: { flexDirection: 'row', gap: 16 },
    listingFootItem: { flexDirection: 'row', alignItems: 'center' },
    footIcon: { fontSize: 11 },
    footText: { fontSize: 11, color: C.faint },

    btnLoadMore: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 12,
        marginBottom: 14,
    },
    btnLoadMoreText: { fontSize: 13, color: C.green, fontWeight: '700' },

    // ── REVIEWS ───────────────────────────────────────────────
    ratingHero: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 14,
    },
    ratingNumber: {
        fontSize: 58,
        fontWeight: '900',
        color: C.text,
        lineHeight: 64,
    },
    starsRow: { flexDirection: 'row', gap: 4, marginVertical: 10 },
    bigStar: { fontSize: 20, color: C.amber },
    ratingCount: { fontSize: 12, color: C.faint },
    ratingBars: { width: '100%', marginTop: 18, gap: 7 },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    barLabel: { fontSize: 11, color: C.muted, width: 28 },
    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: C.border2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: C.amber,
        borderRadius: 4,
    },
    barPct: { fontSize: 11, color: C.faint, width: 32, textAlign: 'right' },

    reviewCard: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 14,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    reviewAvatar: { width: 44, height: 44, borderRadius: 22 },
    reviewAuthor: { fontSize: 13, fontWeight: '700', color: C.text },
    reviewDate: { fontSize: 10, color: C.faint, marginLeft: 5 },
    reviewText: { fontSize: 13, color: '#4B5563', lineHeight: 21 },
});