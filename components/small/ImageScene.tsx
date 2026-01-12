import React, {useEffect} from "react";
import {ImageBackground} from "react-native";

import {globalStyles} from "@/styles/global";
import MainMenu from "@/components/MainMenu";

import {getBackground} from "@/tools/utils";


// импортируем спрайты заранее, чтобы require был статическим

export default function ImageScene(background: string, menuEnabled: boolean = true) {
    return (
        <ImageBackground
            source={getBackground(background)}
            style={[globalStyles.screen]}
            resizeMode="contain"
        >
            <MainMenu />
        </ImageBackground>
    );
}
