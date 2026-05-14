export const ANIMATION_TYPE_MAP: Record<string, string> = {
  "Fade in": "fadeIn",
  "Slide up": "slideUp",
  "Slide down": "slideDown",
  "Slide left": "slideLeft",
  "Slide right": "slideRight",
  "Scale in": "scaleIn",
  "Scale out": "scaleOut",
  "Flip in": "flipIn",
};

export const EASING_MAP: Record<string, string> = {
  Ease: "ease",
  "Ease In": "ease-in",
  "Ease Out": "ease-out",
  "Ease In Out": "ease-in-out",
  Linear: "linear",
  Smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  Bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  Elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
};

export const LOOP_TYPE_MAP: Record<string, string> = {
  "Bay lơ lửng": "float",
  Nảy: "bounce",
  "Nhấp nháy": "flash",
  "Xoay tròn": "spin",
  Lắc: "shake",
  "Lắc lư": "swing",
  "Lắc lư nhún nhảy": "wiggle",
  "Nhịp tim": "heartBeat",
};
