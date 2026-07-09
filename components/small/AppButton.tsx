import { Pressable, Text } from 'react-native';
import AppText from "@/components/Common/AppText";

export const AppButton = ({ title, onPress, disabled = false }) => (
    <Pressable
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({
            opacity: pressed || disabled ? 0.7 : 1,
            backgroundColor: disabled ? '#aaa' : '#757575',
            paddingVertical: 14,
            borderRadius: 10,
        })}
    >
        <AppText style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
            {title}
        </AppText>
    </Pressable>
);
