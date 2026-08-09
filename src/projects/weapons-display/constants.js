export const NM = 1852;
export const KT = 0.514444;
export const FT = 0.3048;
export const SCOPE_RANGE_NM = 40;
export const HIT_RADIUS_M = 20;
export const MIN_MISSILE_SPEED = 130;
export const MAX_FLIGHT_TIME = 90;
export const OWNSHIP_ALT_FT = 25000;

// RF-guided weapons (fox1/fox3) are detectable by the target's RWR almost immediately.
// Fox2 (IR) has no radar signature, so detection depends on a missile-approach-warning
// system and is much slower/less reliable — a real tactical advantage of heat-seekers.
export const WEAPONS = {
  fox1: { label: "FOX 1", name: "semi-ativo por radar", initSpeed: 850, boostTime: 4, decel: 3, N: 3.5, maxG: 25, gimbal: 60, elevGimbal: 40, rmaxNm: 20, rminNm: 1.5, counter: "chaff", reaction: [1.2, 2.2] },
  fox2: { label: "FOX 2", name: "infravermelho", initSpeed: 700, boostTime: 2.5, decel: 4, N: 4, maxG: 35, gimbal: 90, elevGimbal: 55, rmaxNm: 8, rminNm: 0.5, counter: "flare", reaction: [4.5, 7] },
  fox3: { label: "FOX 3", name: "ativo por radar", initSpeed: 900, boostTime: 5, decel: 2.5, N: 3.5, maxG: 30, gimbal: 55, elevGimbal: 35, rmaxNm: 35, rminNm: 2, counter: "chaff", reaction: [1.2, 2.2], pitbullNm: 8 },
};
