// Keep this decorative subtree stable when the floor's interactive state changes.
const lighting = (
  <div className="scene-lighting" aria-hidden="true">
    <span className="scene-light-beam scene-light-beam-primary" />
    <span className="scene-light-beam scene-light-beam-secondary" />
    <span className="scene-light-beam scene-light-beam-accent" />
    <span className="scene-light-beam scene-light-beam-left" />
    <span className="scene-light-beam scene-light-beam-right" />
    <span className="scene-light-pool scene-light-pool-primary" />
    <span className="scene-light-pool scene-light-pool-secondary" />
    <span className="scene-light-pool scene-light-pool-accent" />
  </div>
);

export function SceneLighting() {
  return lighting;
}
