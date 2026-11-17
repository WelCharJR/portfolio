import { KEY, ROWS, COLS } from "../constants.js";

export const emptySlots = () =>
  ROWS.flatMap((row) =>
    Array.from({ length: COLS }, (_, i) => ({
      id: `${row}-${i + 1}`,
      code: "",
      name: "",
      qty: 0,
      unit: "un",
    })),
  );
function makeSlots(items = []) {
  const slots = emptySlots();
  let next = 0;
  items.forEach((item) => {
    let remaining = Number(item.qty) || 10;
    while (remaining > 0 && next < slots.length) {
      const qty = Math.min(10, remaining);
      slots[next] = {
        ...slots[next],
        code: item.code || "",
        name: item.name || "",
        qty,
        unit: item.unit || "un",
      };
      remaining -= qty;
      next++;
    }
  });
  return slots;
}
const initial = {
  kanbans: [
    {
      id: "K-01",
      name: "Fixadores asa",
      x: -12,
      z: -5,
      items: [
        { code: "NAS1097", name: "Rebite escareado", qty: 240, unit: "un" },
        { code: "MS21042", name: "Porca autofrenante", qty: 80, unit: "un" },
      ],
    },
    {
      id: "K-02",
      name: "Montagem fuselagem",
      x: 0,
      z: 4,
      items: [{ code: "NAS660", name: "Parafuso estrutural", qty: 120, unit: "un" }],
    },
    {
      id: "K-03",
      name: "Ferramentas",
      x: 12,
      z: -5,
      items: [{ code: "DR-48", name: "Broca 4.8 mm", qty: 12, unit: "un" }],
    },
  ].map(({ items, ...kanban }) => ({ ...kanban, slots: makeSlots(items) })),
  areas: [],
  paths: [],
};

export function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return initial;
    return {
      ...saved,
      kanbans: (saved.kanbans || []).map((k) => {
        const savedSlots = Array.isArray(k.slots)
          ? emptySlots().map((empty) => k.slots.find((slot) => slot.id === empty.id) || empty)
          : null;
        const { items, ...kanban } = k;
        return {
          ...kanban,
          slots: savedSlots?.some((slot) => slot.code) ? savedSlots : makeSlots(items || []),
        };
      }),
      areas: saved.areas || [],
      paths: saved.paths || [],
    };
  } catch {
    return initial;
  }
}
