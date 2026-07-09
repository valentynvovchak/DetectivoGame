export type TaskItem = {
    id: string;
    title: {
        ru: string;
        en: string;
    };
};

export const tasksData: Record<string, TaskItem> = {
    talk_to_witness_mei: {
        id: "talk_to_witness_mei",
        title: {
            ru: "Поговорить со свидетелем, который нашёл жертв — мисс Мэй.",
            en: "Talk to the witness who found the victims - Miss Mei.",
        },
    },

    identify_victims: {
        id: "identify_victims",
        title: {
            ru: "Установить личности жертв.",
            en: "Identify the victims.",
        },
    },

    speak_with_kanagawa: {
        id: "speak_with_kanagawa",
        title: {
            ru: "Поговорить с мужем и отцом жертв — мистером Канагавой.",
            en: "Speak with the husband and father of the victims — Mr. Kanagawa.",
        },
    },

    speak_with_medical_examiner: {
        id: "speak_with_medical_examiner",
        title: {
            ru: "Поговорить с судмедэкспертом в полицейском участке.",
            en: "Speak with the Medical Examiner at the police station.",
        },
    },

    talk_to_lawyer: {
        id: "talk_to_lawyer",
        title: {
            ru: "Поговорить с юристом мистера Канагавы.",
            en: "Talk to Mr. Kanagawa's lawyer.",
        },
    },

    search_kanagawa_house: {
        id: "search_kanagawa_house",
        title: {
            ru: "Провести обыск в доме мистера Канагавы.",
            en: "Search Mr. Kanagawa's house.",
        },
    },

    talk_to_housekeeper: {
        id: "talk_to_housekeeper",
        title: {
            ru: "Поговорить с домработницей семьи Канагава.",
            en: "Speak with the Kanagawa family housekeeper.",
        },
    },

    check_car_again: {
        id: "check_car_again",
        title: {
            ru: "Ещё раз проверить машину и найти предмет, который мог содержать газ.",
            en: "Check car again - find objects that can poison with carbon monoxide.",
        },
    },

    send_car_to_inspection: {
        id: "send_car_to_inspection",
        title: {
            ru: "Отправить машину на проверку утечки газа. Уточните, было ли отравление случайным.",
            en: "Send a car to inspection for gas leak. Confirm if the poisoning was accidental",
        },
    }
};