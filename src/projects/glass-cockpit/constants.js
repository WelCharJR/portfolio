// ADI (attitude indicator) geometry, shared by every instrument so they align on one SVG canvas.
export const CX = 460;
export const CY = 190;
export const R = 150;
export const R_CLIP = 140;
export const PX_PER_DEG_PITCH = 3.6;

// Flight envelope — used for stall/overspeed warnings and tape coloring.
export const STALL_SPEED = 110;
export const OVERSPEED = 330;

export const DEFAULT_FLIGHT = { pitch: 0, roll: 0, heading: 90, airspeed: 220, altitude: 8000, vspeed: 0 };
export const DEFAULT_TARGETS = { heading: 90, altitude: 8000, airspeed: 220 };
export const DEFAULT_MANUAL = { pitch: 0, roll: 0, throttle: 220 };
