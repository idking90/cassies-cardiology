type AppHeaderProps = { canReset: boolean; onHome: () => void; onReset: () => void }

export function AppHeader({ canReset, onHome, onReset }: AppHeaderProps) {
  return <header className="app-header"><button className="brand" onClick={onHome} type="button">Cassie's Cardiology</button><button className="reset-button" disabled={!canReset} onClick={onReset} type="button">Reset rotation</button></header>
}
