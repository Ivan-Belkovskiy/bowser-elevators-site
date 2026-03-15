"use client";
import NewElevatorModal from '@/components/NewElevatorModal/NewElevatorModal';
import './page.css';
import VideoSettingsModal from '@/components/VideoSettingsModal/VideoSettingsModal';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// export const metadata = {
//     title: "Elevator Video Player | Bowser Elevators",
// }


export default function ElevatorVideoPlayerPage() {
    const [modalOpened, setModalOpened] = useState(false);
    const [elevators, setElevators] = useState<any[]>([]);
    const router = useRouter();

    const fetchElevators = async () => {
        try {
            const res = await fetch(`/api/elevators/`);
            const data = await res.json();
            if (data.success) setElevators(data.elevators);
            // else setError(data.error);
        } catch (err: any) {
            // setError(err.message);
        }
    };

    useEffect(() => {
        fetchElevators();
    }, []);

    return (
        <div>
            <title>Elevator Video Player | Bowser Elevators</title>
            <main className="evp-page flex flex-col items-center h-screen">
                <h1 className="page-title">Elevator Video Player</h1>
                <hr />
                <h3>Мои Лифты:</h3>
                <div className="elevators-list">
                    {elevators.map((elevator, idx) => (
                        <div className="elevators-list__item" key={idx}>
                            <div className="elevators-list__item-left">
                                <span>{idx + 1}</span>
                                <h1>{elevator?.title}</h1>
                            </div>
                            <div className="elevators-list__item-right">
                                <button className="elevator-list-btn edit-btn" onClick={() => router.push(`/mylift/editor/${elevator.id}`)}>Редактировать</button>
                                <button className="elevator-list-btn play-btn" onClick={() => router.push(`/mylift/elevator/${elevator.id}`)}>Открыть</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="add-lift" onClick={() => setModalOpened(true)}>Добавить Лифт</button>
            </main>
            {modalOpened && <NewElevatorModal />}
        </div>
    );
}