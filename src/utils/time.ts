export const formatTime = (input?: number | null) => {
  if (!input) return null;
  const hours = Math.floor(input / 3600);
  const minutes = Math.floor((input / 60) % 60);
  const seconds = Math.floor(input % 60);
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}