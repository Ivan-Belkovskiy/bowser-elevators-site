export interface ActionParam {
    id: string;
    label: string;
    type: "number" | "string" | "boolean" | "select";
    options?: ActionParamOption[];
    optionsSource?: "floors";
}

export interface ActionParamOption {
    value: string | number;
    label: string;
}


export interface ActionDefinition {
    id: string;
    label: string;
    params?: ActionParam[];
}

export interface ElementDefinition {
    id: string;
    label: string;
    actions: ActionDefinition[];
}

export const ELEMENTS: ElementDefinition[] = [
    {
        id: "Elevator",
        label: "Лифт",
        actions: [
            { id: "doorOpen", label: "Открыть двери" },
            { id: "doorClose", label: "Закрыть двери" },
            { id: "resetCalls", label: "Отменить вызовы" },
            {
                id: "callElevator",
                label: "Вызвать на этаж",
                params: [
                    {
                        id: "floor",
                        label: "Этаж назначения",
                        type: "select",
                        optionsSource: "floors",
                    }
                ]
            },
            { id: "callService", label: "Вызов диспетчера" }
        ],
    },
    {
        id: "Coursebot",
        label: "Уровнебот",
        actions: [
            {
                id: "openDefaultMode",
                label: "Открыть Уровнебот"
            }
        ]
    }
];
