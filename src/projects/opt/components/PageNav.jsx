import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PageNav({ page, setPage }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
      <button type="button" className="page-btn focus-ring" disabled={page === 1} onClick={() => setPage(1)}>
        <ChevronLeft size={12} /> PREV PAGE
      </button>
      <button type="button" className="page-btn focus-ring" disabled={page === 2} onClick={() => setPage(2)}>
        NEXT PAGE <ChevronRight size={12} />
      </button>
    </div>
  );
}
