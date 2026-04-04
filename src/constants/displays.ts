import { ElevatorDisplayTypes } from "@/types/elevator";

export interface DisplayParamOptCondition {
    id: string; // ID параметра
    values: (string | number | boolean)[]; // Если параметр будет иметь любое значение, как в данном массиве, то опция будет отображаться.
}

export interface DisplayParamOption {
    value: string | number | boolean;
    label: string;
    condition?: DisplayParamOptCondition;
    message?: {
        type: "info" | "warning" | "error";
        text: string;
    };
}

export interface DisplayParam {
    id: string;
    label: string;
    type: "number" | "string" | "boolean" | "select";
    options?: DisplayParamOption[],
    optionsSource?: string;
}

export interface DisplayDefinition {
    id: ElevatorDisplayTypes;
    label: string;
    preview: string;
    params: DisplayParam[];
}

export const DISPLAYS: DisplayDefinition[] = [
    {
        id: "MLMLCD",
        label: "Табло Индикации MLM LCD",
        preview: "/images/displays/mlm_lcd.jpeg",
        params: [
            {
                id: "voiceNotifications",
                label: "Объявления этажей",
                type: "select",
                options: [
                    {
                        value: "off",
                        label: "Отключены"
                    },
                    {
                        value: "atEndMove",
                        label: "При подъезде к этажу",
                    },
                    {
                        value: "atDoorOpen",
                        label: "При открытии дверей",
                    }
                ]
            },
            {
                id: "endMoveBeep",
                label: "Сигнал прибытия",
                type: "select",
                options: [
                    {
                        value: "off",
                        label: "Отключен",
                    },
                    {
                        value: "beforeFloorNotification",
                        label: "Перед объявлением этажа",
                        condition: {
                            id: "voiceNotifications",
                            values: ["atEndMove", "atDoorOpen"],
                        }
                    },
                    {
                        value: "atEndMove",
                        label: "При подъезде к этажу",
                    },
                    {
                        value: "atDoorOpen",
                        label: "При открытии/закрытии дверей",
                        message: {
                            type: "warning",
                            text: "Проверьте звуки лифта на наличие сигнала прибытия — возможно наслоение звуков!!!"
                        }
                    }
                ]
            },
            // {
            //     id: "endMoveBeepSound",
            //     label: "Звук сигнала прибытия",
            //     type: "select",
            //     options: [
            //         {
            //             value: "01",
            //             label: "Вариант №1",
            //         },
            //         {
            //             value: "02",
            //             label: "Вариант №2"
            //         }
            //     ]
            // },
            {
                id: "backgroundMusic",
                label: "Фоновая музыка",
                type: "boolean",
            }
        ]
    },
    {
        id: "TIM2",
        label: "Табло Индикации Матричное (ТИМ-2)",
        preview: "/images/displays/tim2.png",
        params: [
            {
                id: "floorNotifications",
                label: "Объявления этажей",
                type: "select",
                options: [
                    {
                        value: "off",
                        label: "Выключены"
                    },
                    {
                        value: "atDoorOpenClose",
                        label: "При открытии/закрытии дверей"
                    },
                    {
                        value: "atEndMove",
                        label: "При подъезде к этажу"
                    }
                ]
            },
            {
                id: "endMoveBeep",
                label: "Сигнал прибытия",
                type: "select",
                options: [
                    {
                        value: "off",
                        label: "Выключен",
                    },
                    {
                        value: "beforeFloorNotification",
                        label: "Перед объявлением этажа",
                        condition: {
                            id: "floorNotifications",
                            values: ["atDoorOpenClose", "atEndMove"],
                        }
                    },
                    {
                        value: "withFloorNotification",
                        label: "Вместе с объявлением этажа",
                        condition: {
                            id: "floorNotifications",
                            values: ["atDoorOpenClose", "atEndMove"],
                        }
                    },
                    {
                        value: "atEndMove",
                        label: "При подъезде к этажу",
                    },
                    {
                        value: "atDoorOpenClose",
                        label: "При открытии/закрытии дверей",
                        message: {
                            type: "warning",
                            text: "Проверьте звуки лифта на наличие сигнала прибытия — возможно наслоение звуков!!!"
                        }
                    },
                ]
            }
        ]
    },
    {
        id: "7SEGMENT_NEW",
        label: "Табло Индикации Семисегментное (2019+)",
        preview: "/images/displays/7segment_new.svg",
        params: [
            {
                id: "indicationColor",
                label: "Цвет индикации",
                type: "select",
                options: [
                    {
                        value: "red",
                        label: "Красный",
                    },
                    {
                        value: "blue",
                        label: "Синий",
                    }
                ]
            },
            {
                id: "endMoveBeep",
                label: "Сигнал прибытия",
                type: "select",
                options: [
                    {
                        value: "off",
                        label: "Выключен",
                    },
                    {
                        value: "atDoorOpenClose",
                        label: "При открытии/закрытии дверей",
                        message: {
                            type: "warning",
                            text: "Проверьте звуки лифта на наличие сигнала прибытия — возможно наслоение звуков!!!"
                        }
                    },
                    {
                        value: "atEndMove",
                        label: "При подъезде к этажу"
                    }
                ]
            }
        ]
    },
    {
        id: "7SEGMENT_OLD",
        label: "Табло Индикации Семисегментное (<2018 годы выпуска)",
        preview: "/images/displays/7segment_old.png",
        params: [
            {
                id: "endMoveBeep",
                label: "Сигнал прибытия",
                type: "select",
                options: [
                    {
                        value: "off",
                        label: "Выключен",
                    },
                    {
                        value: "atDoorOpenClose",
                        label: "При открытии/закрытии дверей",
                        message: {
                            type: "warning",
                            text: "Проверьте звуки лифта на наличие сигнала прибытия — возможно наслоение звуков!!!"
                        }
                    },
                    {
                        value: "atEndMove",
                        label: "При подъезде к этажу"
                    }
                ]
            }
        ]
    }
];