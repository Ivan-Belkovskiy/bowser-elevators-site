'use client';
import { ChangeEvent, useRef } from "react";

interface FileUploaderProps {
    btnClass?: string,
    msgClass?: string,
    label?: string | {
        upload?: string,
        replace?: string,
    },
    accept?: string,
    onUpload?: (e: ChangeEvent<HTMLInputElement>) => any,
    multiple?: boolean,
    file?: string | File,
    hideMessage?: boolean
}

export default function FileUploader({ btnClass, msgClass, label, accept, multiple, onUpload, file, hideMessage }: FileUploaderProps) {
    const inpRef = useRef<HTMLInputElement>(null);
    let uploadLabel = (typeof label === 'string') ? label : (label?.upload) ? label.upload : 'Выберите файл...';
    let replaceLabel = (typeof label !== 'string' && label?.replace) ? label.replace : 'Заменить...';
    return (
        <div className="file-uploader">
            <input type="file" ref={inpRef} onChange={onUpload} accept={accept} multiple={multiple} hidden />
            {file instanceof File ? (
                <>
                    { !hideMessage && <span className={msgClass}>{file.name}</span>}
                    <button className={btnClass} onClick={() => inpRef.current?.click()}>{replaceLabel}</button>
                </>
            ) : (
                <>
                    <button className={btnClass} onClick={() => inpRef.current?.click()}>{uploadLabel}</button>
                </>
            )}
        </div>
    );
}