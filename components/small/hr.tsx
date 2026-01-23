import { View } from 'react-native';

export const Hr = ({ color = '#ccc', thickness = 1, margin = 16 }) => (
    <View
        style={{
            height: thickness,
            backgroundColor: color,
            width: '100%',
            marginVertical: margin,
        }}
    />
);