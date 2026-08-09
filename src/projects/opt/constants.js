export const G = 9.80665;
export const RHO0 = 1.225;

// MTOW e área de asa são especificações públicas de cada modelo. CLmax por flap foi
// calibrado pra ficar num range fisicamente plausível — não é o dado certificado do
// fabricante (esse não é público). Ver README para o detalhe da fórmula usada.
export const AIRCRAFT = [
  { id: "e175", name: "EMBRAER E175", mtow: 40370, minWeight: 26000, wingArea: 72.72, thrustSL: 2 * 60000,
    flaps: [{ id: "FLAPS 1", clmax: 1.55 }, { id: "FLAPS 2", clmax: 1.75 }, { id: "FLAPS 3", clmax: 1.95 }] },
  { id: "e190", name: "EMBRAER E190", mtow: 50300, minWeight: 30000, wingArea: 92.5, thrustSL: 2 * 82000,
    flaps: [{ id: "FLAPS 1", clmax: 1.55 }, { id: "FLAPS 2", clmax: 1.75 }, { id: "FLAPS 3", clmax: 1.95 }] },
  { id: "e195e2", name: "EMBRAER E195-E2", mtow: 61500, minWeight: 38000, wingArea: 103.1, thrustSL: 2 * 103000,
    flaps: [{ id: "FLAPS 1", clmax: 1.5 }, { id: "FLAPS 2", clmax: 1.7 }, { id: "FLAPS 3", clmax: 1.9 }] },
  { id: "b738", name: "BOEING 737-800", mtow: 79015, minWeight: 45000, wingArea: 124.6, thrustSL: 2 * 121000,
    flaps: [{ id: "FLAPS 1", clmax: 1.4 }, { id: "FLAPS 5", clmax: 1.65 }, { id: "FLAPS 15", clmax: 1.9 }] },
  { id: "a320n", name: "AIRBUS A320NEO", mtow: 79000, minWeight: 45000, wingArea: 122.6, thrustSL: 2 * 120000,
    flaps: [{ id: "CONF 1+F", clmax: 1.45 }, { id: "CONF 2", clmax: 1.65 }, { id: "CONF 3", clmax: 1.85 }] },
  { id: "a321n", name: "AIRBUS A321NEO", mtow: 97000, minWeight: 55000, wingArea: 122.6, thrustSL: 2 * 143000,
    flaps: [{ id: "CONF 1+F", clmax: 1.45 }, { id: "CONF 2", clmax: 1.65 }, { id: "CONF 3", clmax: 1.85 }] },
  { id: "b77w", name: "BOEING 777-300ER", mtow: 351500, minWeight: 200000, wingArea: 436.8, thrustSL: 2 * 512000,
    flaps: [{ id: "FLAPS 5", clmax: 1.5 }, { id: "FLAPS 15", clmax: 1.75 }, { id: "FLAPS 20", clmax: 1.9 }] },
];
