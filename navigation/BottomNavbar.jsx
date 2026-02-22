import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import {
    Home,
    MessageCircle,
    User,
} from 'lucide-react-native';

export default function BottomNavbar({
    navigation,
    currentScreen,
    userRole,
}) {
    const tabs = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            target: 'home',
        },
        {
            id: 'chatList',
            label: 'Chats',
            icon: MessageCircle,
            target: 'chatList',
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: User,
            target: 'profile',
        },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentScreen === tab.id;

                return (
                    <TouchableOpacity
                        key={tab.id}
                        style={styles.tab}
                        onPress={() => navigation.navigate(tab.target)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Icon
                                color={isActive ? '#2D6A4F' : '#9CA3AF'}
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {isActive && <View style={styles.activeDot} />}
                        </View>
                        <Text
                            style={[
                                styles.label,
                                isActive && styles.labelActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 90 : 70,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: Platform.OS === 'ios' ? 25 : 0,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 1000,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    labelActive: {
        color: '#2D6A4F',
        fontWeight: '700',
    },
    activeDot: {
        position: 'absolute',
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2D6A4F',
    },
});
