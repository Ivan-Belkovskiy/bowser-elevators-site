import ElevatorVideoPlayer from "../ElevatorVideoPlayer/ElevatorVideoPlayer";
import "./MyLiftEditor.css";

export default function MyLiftEditor({ elevator }: { elevator: any }) {
    return (
        <div className="mylift-editor">
            <title>{`${elevator.title} | MyLift Editor` || `MyLift Editor`}</title>
            <div className="mylift-editor__elevator-container"> 
                <ElevatorVideoPlayer liftData={elevator} editMode />
            </div>
        </div>
    );
}