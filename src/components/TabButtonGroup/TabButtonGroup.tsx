'use client';
import { Children, ReactNode, ReactElement, useState, useEffect } from "react";
import TabButton from "../TabButton/TabButton";

export default function TabButtonGroup({ value, children, onChange }: { value: string, children?: ReactNode, onChange?: (value: string) => any }) {
    const [currentValue, setCurrentValue] = useState(value);
    const updateValue = (val: string) => {
        setCurrentValue(val);
        onChange?.(val);
    };
    const callback = (val: string) => updateValue(val);

    useEffect(() => setCurrentValue(value), [value]);

    return (
        <>
            {Children.map(children, (child) => {
                if (!child) return null;
                if (typeof child === "object" && "type" in child && child.type === TabButton) {
                    const el = child as ReactElement<any>;
                    return (
                        <TabButton
                            {...el.props}
                            selected={el.props.value === currentValue}
                            onClick={() => callback(el.props.value)}
                        >
                            {el.props.children}
                        </TabButton>
                    );
                }
                return child;
            })}
        </>
    );
}
