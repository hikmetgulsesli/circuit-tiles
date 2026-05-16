// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Pause Overlay
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Replace placeholder data with props/state


export type PauseOverlayActionId = "restart-1" | "main-menu-2";

export interface PauseOverlayProps {
  actions?: Partial<Record<PauseOverlayActionId, () => void>>;
}

export function PauseOverlay({ actions }: PauseOverlayProps) {
  return (
    <>
      <header>
          <div><div className="meta">Circuit Tiles PRD</div><h1>Pause Overlay</h1><p>Paused state with resume, restart, and return-to-menu actions.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-pause-overlay">
            <section className="result-panel">
              <p className="scoreline">Final score 24,800 with strong progress through the challenge.</p>
              <button type="button" data-action-id="restart-1" onClick={actions?.["restart-1"]}>Restart</button><button type="button" data-action-id="main-menu-2" onClick={actions?.["main-menu-2"]}>Main Menu</button>
            </section></main>
    </>
  );
}
