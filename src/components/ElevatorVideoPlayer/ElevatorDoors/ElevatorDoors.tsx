import "./ElevatorDoors.css";

export default function ElevatorDoors({ position }: { position: number }) {
  return (
    <div className="elevator-doors">
      <div className="door left" style={{ transform: `translateX(-${position * 100}%)` }} />
      <div className="door right" style={{ transform: `translateX(${position * 100}%)` }} />
    </div>
  );
}
