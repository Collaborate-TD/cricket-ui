import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
    useFonts,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const CustomHeader = ({
    title,
    onBackPress,
    showBackButton = true,
    gradientColors,
    defaultRoute = '/student',
    children
}) => {
    const router = useRouter();
    const scheme = useColorScheme();

    // Load Custom Fonts
    const [fontsLoaded] = useFonts({
        Poppins_700Bold,
    });

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.canGoBack() ? router.back() : router.replace(defaultRoute);
        }
    };

    // Default gradient colors based on theme
    const defaultGradientColors = gradientColors ||
        (scheme === 'dark' ? ['#23243a', '#1a1c3e'] : ['#6dd5ed', '#2193b0', '#4c669f']);

    if (!fontsLoaded) {
        return null; // or a loading placeholder
    }

    return (
        <LinearGradient
            colors={defaultGradientColors}
            style={styles.header}
        >
            <View style={styles.headerContent}>
                {showBackButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackPress}
                    >
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>
                    {title}
                </Text>
            </View>
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 120,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingTop: 50,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
        shadowOpacity: 0.18,
        shadowRadius: 10,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.2,
        fontFamily: 'Poppins_700Bold',
    },
});

export default CustomHeader;