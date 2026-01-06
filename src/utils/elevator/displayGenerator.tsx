import { ElevatorDisplayTypes } from "@/types/elevator";
import { elevatorDisplays } from "@/config/elevator/displayPresets";

export const generateDisplaySVG = (displayType: ElevatorDisplayTypes, {
    floor,
    direction
}: {
    floor: number,
    direction: "UP" | "DOWN" | "NONE"
}) => {
    let svg = "<svg />"
    let disp = {
        ...elevatorDisplays[displayType],
        floor: floor,
        direction: direction,
    };
    if (!disp || !displayType) return svg;
    if (displayType == "MLMLCD") {
        let display = elevatorDisplays.MLMLCD;
        let leftSegmentFloor = String(disp.floor)[String(disp.floor).length - 2];
        let rightSegmentFloor = String(disp.floor)[String(disp.floor).length - 1];
        svg = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
                    width="195.38151" height="81.10702" viewBox="0,0,195.38151,81.10702">
                    <g transform="translate(-142.30925,-140.00393)">
                        <g stroke="none" stroke-miterlimit="10">
                            <path
                                d="M142.30925,216.37274c0,-15.26685 0,-62.68158 0,-71.35188c0,-2.66127 1.88138,-5.01693 4.45949,-5.01693c15.26374,0 159.29059,0 186.09916,0c2.75429,0 4.82286,2.35566 4.82286,5.01694c0,8.46892 0,53.90346 0,70.237c0,3.65524 -1.7159,5.85308 -4.82286,5.85308c-28.22121,0 -171.21207,0 -185.54172,0c-2.27579,0 -5.01693,-1.75561 -5.01693,-4.7382z"
                                fill="#00a6ff" stroke-width="NaN" />
                            <path d="M162.7,179.78592l10,-31.2l9.8,30.8l-10.2,31.4z" fill="#ffffff" stroke-width="0" />
                            
                            ${(disp.direction == "DOWN") ? (
                `
                                <path d="M171.7,148.92815l-9.4,29.8l-10.2,-35.8z" fill="#ffffff" stroke-width="0" />
                                <path d="M193.07719,142.92815l-10,36l-9.6,-30z" fill="#ffffff" stroke-width="0" />
                                `
            ) : (disp.direction == "UP") ? (
                `
                                <path d="M173.1,210.78592l9.6,-30l10,36z" fill="#ffffff" stroke-width="0" />
                                <path d="M152.1,216.78592l10.2,-35.8l9.4,29.8z" fill="#ffffff" stroke-width="0" />
                                `
            ) : (
                `
                                
                                `
            )}
                           ${display.newSegment(leftSegmentFloor, -42)}
                           ${display.newSegment(rightSegmentFloor, 0)}
                           
                        </g>
                    </g>
                </svg>
            `;
    }
    return svg;
}

// export const generateDisplaySVG = (displayType: ElevatorDisplayTypes, {
//     floor,
//     direction
// }: {
//     floor: number,
//     direction: "UP" | "DOWN" | "NONE"
// }) => {
//     let svg = <svg />;
//     let disp = {
//         ...elevatorDisplays[displayType],
//         floor: floor,
//         direction: direction,
//     };
//     if (!disp || !displayType) return svg;
//     if (displayType == "MLMLCD") {
//         let display = elevatorDisplays.MLMLCD;
//         let leftSegmentFloor = String(disp.floor)[String(disp.floor).length - 2];
//         let rightSegmentFloor = String(disp.floor)[String(disp.floor).length - 1];
//         svg = (
//             <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
//                 width="195.38151" height="81.10702" viewBox="0,0,195.38151,81.10702">
//                 <g transform="translate(-142.30925,-140.00393)">
//                     <g stroke="none" strokeMiterlimit="10">
//                         <path
//                             d="M142.30925,216.37274c0,-15.26685 0,-62.68158 0,-71.35188c0,-2.66127 1.88138,-5.01693 4.45949,-5.01693c15.26374,0 159.29059,0 186.09916,0c2.75429,0 4.82286,2.35566 4.82286,5.01694c0,8.46892 0,53.90346 0,70.237c0,3.65524 -1.7159,5.85308 -4.82286,5.85308c-28.22121,0 -171.21207,0 -185.54172,0c-2.27579,0 -5.01693,-1.75561 -5.01693,-4.7382z"
//                             fill="#00a6ff" strokeWidth="NaN" />
//                         <path d="M162.7,179.78592l10,-31.2l9.8,30.8l-10.2,31.4z" fill="#ffffff" strokeWidth="0" />

//                         {(disp.direction == "DOWN") ? (
//                             <>
//                                 <path d="M171.7,148.92815l-9.4,29.8l-10.2,-35.8z" fill="#ffffff" strokeWidth="0" />
//                                 <path d="M193.07719,142.92815l-10,36l-9.6,-30z" fill="#ffffff" strokeWidth="0" />
//                             </>
//                         ) : (disp.direction == "UP") ? (
//                             <>
//                                 <path d="M173.1,210.78592l9.6,-30l10,36z" fill="#ffffff" strokeWidth="0" />
//                                 <path d="M152.1,216.78592l10.2,-35.8l9.4,29.8z" fill="#ffffff" strokeWidth="0" />
//                             </>
//                         ) : (
//                             <></>

//                         )}
//                         {display.newSegment(leftSegmentFloor, -42)}
//                         {display.newSegment(rightSegmentFloor, 0)}

//                     </g>
//                 </g>
//             </svg>
//         );
//     }
//     return svg;
// }