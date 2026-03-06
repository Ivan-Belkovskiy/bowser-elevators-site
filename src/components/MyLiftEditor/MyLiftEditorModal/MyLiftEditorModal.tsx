import { CategoryDefinition } from "@/constants/elevatorPanel";
import "./MyLiftEditorModal.css";
import { LiftJson } from "@/types/elevator";
import { useEffect, useState } from "react";

export default function MyLiftEditorModal({ activeCondition, category, elevator }: {
    activeCondition?: boolean,
    category: CategoryDefinition | null,
    elevator: LiftJson,
}) {
    const [liftData, setLiftData] = useState<LiftJson>(elevator);

    const getLiftPropValueByPath = (path?: string[]) => {
        let result = null;
        let obj: LiftJson | Record<string, any> | string = liftData;

        path?.forEach(value => {
            if (typeof obj !== 'string') obj = obj[value as keyof LiftJson];
            if (typeof obj === 'string') {
                result = obj;
            }
        });
        return result;
    }

    const setLiftPropValueByPath = (path: string[], value: any) => {
        let result = {
            ...liftData,
        };
        let obj: LiftJson | Record<string, any> = liftData;
        path.forEach(prop => {
            if (typeof obj[prop as keyof LiftJson] === 'string') {
                obj[prop as keyof LiftJson] = value;
            } else {
                obj = obj[prop as keyof LiftJson];
            }
        });
        setLiftData({
            ...result,
            ...obj,
        });
    }

    useEffect(() => setLiftData(elevator), [elevator]);

    if (activeCondition && category && liftData) return (
        <div className="mylift-editor-modal__overlay">
            <div className="mylift-editor-modal">
                <div className="mylift-editor-modal__header">
                    <h1 className="mylift-editor-modal__title">{category.label}</h1>
                </div>
                <div className="mylift-editor-modal__content">
                    {category.sections?.map((section, idx) => (
                        <section className="mylift-editor-modal__section">
                            <h2 className="mylift-editor-modal__subtitle">{section.label}</h2>
                            {section.options.map((opt, i) => {
                                let props = opt.property?.split('>');
                                const value = getLiftPropValueByPath(props);
                                if (opt.type === 'string') return (
                                    <div className="mylift-editor-modal__property">
                                        <span className="mylift-editor-modal__label">{opt.label}:</span>
                                        <input
                                            type="text"
                                            className="mylift-editor-modal__input"
                                            value={value || ""}
                                            onChange={(e) => setLiftPropValueByPath(props || [], e.target.value)}
                                        />
                                    </div>
                                )
                            })}
                        </section>
                    )
                    )}
                </div>
            </div>
        </div>
    );
}