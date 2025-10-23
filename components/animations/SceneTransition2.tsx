// components/SceneTransition2.tsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";

interface Props {
    children: (isVisible: boolean) => React.ReactNode;
    triggerKey: string;
}

export default function SceneTransition2({ children, triggerKey }: Props) {
    const opacity = useRef(new Animated.Value(0)).current;
    const [visible, setVisible] = useState(true);

    // Плавное появление при первом монтировании
    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);


    useEffect(() => {
        let isMounted = true;

        const fadeOut = () =>
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            });

        const fadeIn = () =>
            Animated.timing(opacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            });

        // запускаем переход
        fadeOut().start(() => {
            if (!isMounted) return;
            setVisible(false);

            setTimeout(() => {
                if (!isMounted) return;
                setVisible(true);
                fadeIn().start();
            }, 250); // задержка для перерисовки новой сцены
        });

        return () => {
            isMounted = false;
        };
    }, [triggerKey]);

    return (
        <>
            {children(visible)}
            <Animated.View
                pointerEvents="none"
                style={[styles.overlay, { opacity }]}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        zIndex: 999,
    },
});
