import NewElevatorModal from '@/components/NewElevatorModal/NewElevatorModal';
import './page.css';
import VideoSettingsModal from '@/components/VideoSettingsModal/VideoSettingsModal';

// export const metadata = {
//     title: "Elevator Video Player | Bowser Elevators",
// }

export default function AboutPage() {
    return (
        <div>
            <title>Elevator Video Player | Bowser Elevators</title>
            <section className="main-container" data-url="about">
                <div className="about__content">
                    <h1>О компании</h1>
                    <hr />
                    <p><i>Bowser Elevators</i> — лучшая в мире лифтовая компания, созданная Боузером-младшим, сыном Великого Дракона Боузера.</p>
                    <p>Компания производит подъемное оборудование, такое, как лифты, эскалаторы, автоматические двери и траволаторы (пассажирские конвейеры)</p>
                    <hr />
                    {/* <div className="about__video">
                        <h4>Если Вам интересно, как я открыл эту компанию, то посмотрите <b>1-ую часть</b> этого видео</h4>
                        <video src="video/About Company/How I Created Bowser Elevators, Part 1.mp4" className="elevators__player" width="700" controls></video>
                    </div>
                    <br />
                    <div className="about__video">
                        <h4>Продолжение истории компании, то есть 2-ую часть можно посмотреть ниже!</h4>
                        <video src="video/About Company/How I Created Bowser Elevators, Part 2.mp4" className="elevators__player" width="700" controls></video>
                    </div> */}
                </div>
            </section>
        </div>
    );
}