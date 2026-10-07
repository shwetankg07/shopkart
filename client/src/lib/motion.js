export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const hasFinePointer = () => {
  return window.matchMedia("(pointer: fine)").matches;
};
