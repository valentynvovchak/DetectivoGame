import DanielSmile from "../assets/sprites/daniel_smile.svg";
import DanielSerious from "../assets/sprites/daniel_serious.svg";
import DanielThinking from "../assets/sprites/daniel_thinking.svg";
import DiWithoutCape from "../assets/sprites/di_without_cape.svg";
import DiInteresting from "../assets/sprites/di_interesting.svg";
import MaiFoundTheCar from "../assets/sprites/mai_found_the_car_2.svg";
import MaiFoundTheCarWithIcon from "../assets/sprites/mai_found_the_car_with_icon.svg";
import MrKanagawaCrying from "../assets/sprites/mr_kanagava_crying.svg";
import MrKanagawaSerious from "../assets/sprites/mr_kanagava_serious.svg";
import DanielFingerUp from "../assets/sprites/daniel_finger_up.svg";

export const getBackground = (name: string) => {
    switch (name) {
        case "street_closeup":
            return require("../assets/backgrounds/street_closeup.jpg");
        case "empty_yellow_car_mini_cooper_stay_on_the_road":
            return require("../assets/backgrounds/empty_yellow_car_mini_cooper_stay_on_the_road.jpg");
        case "yellow_car_stays_on_the_road_with_killed_people":
            return require("../assets/backgrounds/yellow_car_stays_on_the_road_with_killed_people.jpg");
        case "first_dialog":
            return require("../assets/backgrounds/Фон первый диалог детективов у места преступления 9.jpg");
        case "hospital":
            return require("../assets/backgrounds/Фон больница.jpg");
        case "dialog_about_distance_from_home":
            return require("../assets/backgrounds/Фон диалог детективов о расстоянии до дома 2.jpg");
        case "inside_a_car":
            return require("../assets/backgrounds/inside_a_car.jpg");
        case "inside_a_car_glove_compartment":
            return require("../assets/backgrounds/Default_Professional_graphic_design_2D_illustration_ghibli_sty.jpg");
        case "kanagava_kim_city_map":
            return require("../assets/backgrounds/Фон карта города дело Kanagawa Kim готовый 2.jpg");
        default:
            return require("../assets/backgrounds/Фон диалог детективов о расстоянии до дома 2.jpg");
    }
};

export const getSprite = (name: string) => {
    switch (name) {
        case "daniel_smile":
            // return require("../assets/sprites/SVG детектив готовый улыбка 20.08. без фона.svg");
            // return require("../assets/sprites/daniel_smile.svg");
            return DanielSmile;
        case "daniel_serious":
            // return require("../assets/sprites/SVG детектив готовый улыбка 20.08. без фона.svg");
            return DanielSerious;
        case "daniel_thinking":
            // return require("../assets/sprites/daniel_thinking.svg");
            return DanielThinking;
        case "di_without_cape":
            // return require("../assets/sprites/SVG детектив без плаща готовый  23.08..svg");
            // return require("../assets/sprites/di_without_cape.svg");
            return DiWithoutCape;
            // return require("../assets/sprites/di_interesting.svg");
        case "di_interesting":
            // return require("../assets/sprites/di_interesting.svg");
            return DiInteresting;
        case "mai_found_the_car":
            // return require("../assets/sprites/mai_found_the_car.svg");
            return MaiFoundTheCar;
        case "mai_found_the_car_with_icon":  // TODO: del
            return MaiFoundTheCarWithIcon;
        case "mr_kanagawa_crying":
            return MrKanagawaCrying;
        case "mr_kanagava_serious":
            return MrKanagawaSerious;
        case "daniel_finger_up":
            return DanielFingerUp;
        default:
            return DanielSmile;
    }
};
