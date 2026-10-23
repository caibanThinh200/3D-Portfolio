/**
 * Shared non-reactive scene scroll state.
 * Written by ScrollTracker (DOM side, 60fps), read every frame in R3F.
 *
 * progress: continuous float 0.0 -> 3.0 across the 4 phases
 *   0.0 = Hero centered
 *   1.0 = Projects centered
 *   2.0 = About centered
 *   3.0 = Contact centered
 * phase: current active section integer index (0..3)
 * phaseProgress: 0..1 progress within current section
 */
export const sceneScroll = {
  progress: 0,
  phase: 0,
  phaseProgress: 0,
};
