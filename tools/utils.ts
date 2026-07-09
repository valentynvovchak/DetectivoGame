import DanielSmile from "../assets/sprites/Daniel/daniel_smile_2.svg";
import DanielSerious from "../assets/sprites/Daniel/daniel_serious_2.svg";
import DanielThinking from "../assets/sprites/Daniel/daniel_thinking_2.svg";
import DanielFingerUp from "../assets/sprites/Daniel/daniel_finger_up_2.svg";
import DanielShocked from "../assets/sprites/Daniel/daniel_shocked_2.svg";
import DiSerious from "../assets/sprites/Di/di_serious_2.svg";
import DiThinking from "../assets/sprites/Di/di_thinking_2.svg";
import DiShocked from "../assets/sprites/Di/di_shocked_2.svg";
import DiOk from "../assets/sprites/Di/di_ok_2.svg";
import MaiFoundTheCar from "../assets/sprites/Mai/WitnessMei.svg";
import MaiFoundTheCarWithIcon from "../assets/sprites/Mai/WitnessMei.svg";
import MrKanagawaCrying from "../assets/sprites/MrKanagava/mr_kanagava_crying.svg";
import MrKanagawaSerious from "../assets/sprites/MrKanagava/mr_kanagava_serious.svg";
import MrKanagawaScared from "../assets/sprites/MrKanagava/mr_kanagava_scared.svg";
import MrKanagawaThinking from "../assets/sprites/MrKanagava/mr_kanagava_thinking.svg";
import Roberts from "../assets/sprites/Roberts/roberts_serious.svg";
import RobertsYes from "../assets/sprites/Roberts/roberts_yes.svg";
import Housekeeper from "../assets/sprites/Housekeeper/housekeeper.svg";
import HousekeeperWorried from "../assets/sprites/Housekeeper/housekeeper_worried.svg";

export const BACKGROUNDS: Record<string, any> = {
    inventory_bg: require("../assets/backgrounds/inventory_bg.jpg"),
    based_on_a_true_story: require("../assets/backgrounds/bassed_on_a_true_story.jpg"),
    events_and_facts_will_be: require("../assets/backgrounds/events_and_facts_will_be.png"),
    street_closeup: require("../assets/backgrounds/street_closeup.jpg"),
    empty_yellow_car_mini_cooper_stay_on_the_road: require("../assets/backgrounds/empty_yellow_car_mini_cooper_stay_on_the_road.jpg"),
    yellow_car_stays_on_the_road_with_killed_people: require("../assets/backgrounds/yellow_car_stays_on_the_road_with_killed_people.jpg"),
    first_dialog: require("../assets/backgrounds/Фон первый диалог детективов у места преступления 9.jpg"),
    mei_is_jogging_along_the_street_running_on_the_sidewalk: require("../assets/backgrounds/mei_is_jogging_along_the_street_running_on_the_sidewalk..jpg"),
    mei_walks_back_and_looks_at_the_car_with_mild_surprise: require("../assets/backgrounds/mei_walks_back_and_looks_at_the_car_with_mild_surprise.jpg"),
    mei_see_that_the_woman_is_sleeping_in_the_driver_s_seat: require("../assets/backgrounds/mei_see_that_the_woman_is_sleeping_in_the_driver_s_seat.jpg"),
    mei_calling_police_with_worried_face: require("../assets/backgrounds/mei_calling_police_with_worried_face.jpg"),
    hospital: require("../assets/backgrounds/Фон больница.jpg"),
    dialog_about_distance_from_home: require("../assets/backgrounds/Фон диалог детективов о расстоянии до дома 2.jpg"),
    inside_a_car: require("../assets/backgrounds/inside_a_car.jpg"),
    inside_a_car_glove_compartment: require("../assets/backgrounds/Default_Professional_graphic_design_2D_illustration_ghibli_sty.jpg"),
    kanagava_kim_city_map: require("../assets/backgrounds/Фон карта города дело Kanagawa Kim готовый 2.jpg"),
    pathologist_reports: require("../assets/backgrounds/Фон патологоанатом сообщает.jpg"),
    laboratory: require("../assets/backgrounds/Фон лаборатория.jpg"),
    police: require("../assets/backgrounds/police.jpg"),
    kanagawa_house_outdoor: require("../assets/backgrounds/kanagawa_house_outdoor.jpg"),
    kanagawa_house_indoor: require("../assets/backgrounds/kanagawa_house_indoor.jpg"),

};

export const getBackground = (name: string) => {
    return BACKGROUNDS[name] ?? BACKGROUNDS.dialog_about_distance_from_home;
};

export const getSprite = (name: string) => {
    switch (name) {
        case "daniel_smile":
            return DanielSmile;
        case "daniel_serious":
            return DanielSerious;
        case "daniel_thinking":
            return DanielThinking;
        case "daniel_finger_up":
            return DanielFingerUp;
        case "daniel_shocked":
            return DanielShocked;
        case "di_serious":
            return DiSerious;
        case "di_thinking":
            return DiThinking;
        case "di_shocked":
            return DiShocked;
        case "di_ok":
            return DiOk;
        case "mai_found_the_car":
            return MaiFoundTheCar;
        case "mai_found_the_car_with_icon":  // TODO: del
            return MaiFoundTheCarWithIcon;
        case "mr_kanagawa_crying":
            return MrKanagawaCrying;
        case "mr_kanagava_serious":
            return MrKanagawaSerious;
        case "mr_kanagava_scared":
            return MrKanagawaScared;
        case "mr_kanagava_thinking":
            return MrKanagawaThinking;
        case "roberts":
            return Roberts;
        case "roberts_yes":
            return RobertsYes;
        case "housekeeper":
            return Housekeeper;
        case "housekeeper_worried":
            return HousekeeperWorried;
        default:
            return DanielSmile;
    }
};
