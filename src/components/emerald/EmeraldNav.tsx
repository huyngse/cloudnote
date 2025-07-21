export default function EmeraldNav({
  currentPage,
  setPage,
}: {
  currentPage: number;
  setPage: (n: number) => void;
}) {
  return (
    <div className="fixed top-3 left-3 bg-white rounded-lg shadow p-2 flex gap-2 items-center z-50">
      <button onClick={() => setPage(Math.max(1, currentPage - 1))}>⬅️</button>
      <span>Page {currentPage}</span>
      <button onClick={() => setPage(currentPage + 1)}>➡️</button>
    </div>
  );
}
