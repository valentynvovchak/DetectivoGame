import { StyleSheet, Dimensions, Platform } from "react-native";

export const { width, height } = Dimensions.get("window");
export const isSmallScreen = width < 400;
export const isTablet = width > 800;


export const globalStyles = StyleSheet.create({
    // Screen //
    screen: {
        overflow: "hidden",
        width: "100wh",
        height: "100wv",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: isSmallScreen ? 16 : 32,
        paddingVertical: 24,
    },
    menu: {
        alignItems: "center",
        gap: 20,
    },
    text: {
        fontFamily: Platform.select({ ios: "Arial", android: "Roboto" }),
        // fontFamily: Platform.select({ ios: "BebasNeue-Regular, sans-serif", android: "BebasNeue-Regular, sans-serif" }),
        color: "#fff",
    },
    webSafe: { maxWidth: 500, alignSelf: "center" },

    // Dialogs //
    // dialogBox: {
    //     backgroundColor: "rgba(0,0,0,0.7)",
    //     padding: 16,
    //     borderTopLeftRadius: 16,
    //     borderTopRightRadius: 16,
    // },
    // dialogText: {
    //     marginTop: 4,
    //     fontSize: 16,
    //     fontFamily: Platform.select({ ios: "Arial", android: "Roboto" }),
    //     color: "#fff",
    // },
    // speaker: { color: "#ffd166", fontWeight: "bold", fontSize: 18 },
    // next: { position: "absolute", bottom: '48.5%', right: 24 },
    // nextText: { color: "#fff", fontSize: 28 },

});
