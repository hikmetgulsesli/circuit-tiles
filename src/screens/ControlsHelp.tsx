// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Controls Help
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Replace placeholder data with props/state


export type ControlsHelpActionId = "start-game-1" | "resume-2" | "open-settings-3";

export interface ControlsHelpProps {
  actions?: Partial<Record<ControlsHelpActionId, () => void>>;
}

export function ControlsHelp({ actions }: ControlsHelpProps) {
  return (
    <>
      <header>
          <div><div className="meta">Circuit Tiles PRD</div><h1>Controls Help</h1><p>Task-requested keyboard/touch controls and concise rules.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-controls-help">
          <section className="command-panel">
            <p>Primary application state with clear actions, readable hierarchy, and responsive layout guidance for implementation.</p>
            <div className="action-row"><button type="button" data-action-id="start-game-1" onClick={actions?.["start-game-1"]}>Start Game</button><button type="button" data-action-id="resume-2" onClick={actions?.["resume-2"]}>Resume</button><button type="button" data-action-id="open-settings-3" onClick={actions?.["open-settings-3"]}>Open Settings</button></div>
            <div className="data-grid"><article><h2>Goal</h2><p>Build a working interactive experience, not a static mock.</p></article><article><h2>Controls</h2><p>Keyboard, pointer, restart, pause, and state feedback must be implemented.</p></article></div>
          </section></main>
    </>
  );
}
