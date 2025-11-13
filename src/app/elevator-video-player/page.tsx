import NewElevatorModal from '@/components/NewElevatorModal/NewElevatorModal';
import './page.css';
import VideoSettingsModal from '@/components/VideoSettingsModal/VideoSettingsModal';

export const metadata = {
    title: "Elevator Video Player | Bowser Elevators",
}

export default function ElevatorVideoPlayerPage() {
    return (
        <div>
            <main className="evp-page flex flex-col items-center h-screen">
                <h1 className="page-title">Elevator Video Player</h1>
                <hr />
            </main>
            <NewElevatorModal />
        </div>
    );
}