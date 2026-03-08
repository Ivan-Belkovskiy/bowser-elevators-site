export interface FileUploaderData {
    label: string | {
        upload: string;
        replace: string;
    };
    accept?: string;

}

export interface CategoryOption {
    id: string;
    label?: string;
    type: "string" | "number" | "boolean" | "select" | "fileUploader" | "floorSelector";
    fileUploaderData?: FileUploaderData;
    property?: string; // Свойство лифта из LiftJson, которое привязано к данной опции.
}

export interface CategorySection {
    id: string;
    label: string;
    options: CategoryOption[];
}

export interface CategoryButton {

}

export interface CategoryDefinition {
    id: string;
    label: string;
    buttonData?: {
        text?: string;
        image?: string;
    }
    sections?: CategorySection[];
}

export const CATEGORIES: CategoryDefinition[] = [
    {
        id: "main",
        label: "Основная информация",
        buttonData: {
            image: "/images/liftPanel_mainInfo.svg",
        },
        sections: [
            {
                id: "metadata",
                label: "Название и описание",
                options: [
                    {
                        id: "name",
                        label: "Название",
                        type: "string",
                        property: "title",
                    },
                    {
                        id: "description",
                        label: "Описание",
                        type: "string",
                        property: "description",
                    }
                ]
            },
            {
                id: "floors",
                label: "Этажи и видео",
                options: [
                    {
                        id: "floorSelector",
                        type: "floorSelector",
                        property: "floors",
                    }
                ]
            },
            {
                id: "soundEffects",
                label: "Звуковые эффекты",
                options: [
                    {
                        id: "doorOpen",
                        label: "Открытие дверей",
                        type: "fileUploader",
                        property: "elevator>soundEffects>doorOpen",
                        fileUploaderData: {
                            accept: "audio/*",
                            label: {
                                upload: "Загрузить аудиофайл...",
                                replace: "Заменить аудиофайл"
                            }
                        }
                    },
                    {
                        id: "doorClose",
                        label: "Закрытие дверей",
                        type: "fileUploader",
                        property: "elevator>soundEffects>doorClose",
                        fileUploaderData: {
                            accept: "audio/*",
                            label: {
                                upload: "Загрузить аудиофайл...",
                                replace: "Заменить аудиофайл"
                            }
                        }
                    },
                    {
                        id: "buttonClick",
                        label: "Нажатие на кнопку",
                        type: "fileUploader",
                        property: "elevator>soundEffects>buttonClick",
                        fileUploaderData: {
                            accept: "audio/*",
                            label: {
                                upload: "Загрузить аудиофайл...",
                                replace: "Заменить аудиофайл"
                            }
                        }
                    },
                    {
                        id: "startMove",
                        label: "Начало движения лифта",
                        type: "fileUploader",
                        property: "elevator>soundEffects>movement>start",
                        fileUploaderData: {
                            accept: "audio/*",
                            label: {
                                upload: "Загрузить аудиофайл...",
                                replace: "Заменить аудиофайл"
                            }
                        }
                    },
                    {
                        id: "movement",
                        label: "Движение лифта",
                        type: "fileUploader",
                        property: "elevator>soundEffects>movement>move",
                        fileUploaderData: {
                            accept: "audio/*",
                            label: {
                                upload: "Загрузить аудиофайл...",
                                replace: "Заменить аудиофайл"
                            }
                        }
                    },
                    {
                        id: "endMove",
                        label: "Остановка лифта",
                        type: "fileUploader",
                        property: "elevator>soundEffects>movement>end",
                        fileUploaderData: {
                            accept: "audio/*",
                            label: {
                                upload: "Загрузить аудиофайл...",
                                replace: "Заменить аудиофайл"
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: "elevator",
        label: "Лифт",
        buttonData: {
            image: "/images/liftPanel_elevatorSettings.svg",
        }
    },
    {
        id: "coursebot",
        label: "Уровнебот",
        buttonData: {
            image: "/images/liftPanel_coursebotOptions.svg",
        }
    }
];