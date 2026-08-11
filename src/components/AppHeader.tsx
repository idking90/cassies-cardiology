type AppHeaderProps = { authState: 'loading' | 'signed-in' | 'signed-out'; canReset: boolean; onHome: () => void; onReset: () => void; onSignIn: () => void; onSignOut: () => void }

export function AppHeader({ authState, canReset, onHome, onReset, onSignIn, onSignOut }: AppHeaderProps) {
  return <header className="app-header"><button className="brand" onClick={onHome} type="button">Cassie's Cardiology</button><div><button className="reset-button" disabled={!canReset} onClick={onReset} type="button">Reset rotation</button>{authState === 'signed-in' ? <button className="reset-button" onClick={onSignOut} type="button">Sign out</button> : authState === 'signed-out' && <button className="reset-button" onClick={onSignIn} type="button">Sign in as educator</button>}</div></header>
}
