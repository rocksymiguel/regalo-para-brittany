import { useEffect, useRef, useState } from 'react'

interface Props {
  onAuthenticated: () => void
  leaving?: boolean
}

export function PasswordGate({ onAuthenticated, leaving = false }: Props) {
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [failed, setFailed] = useState(false)
  const [failedAttempt, setFailedAttempt] = useState(0)
  const firstInput = useRef<HTMLInputElement>(null)
  const secondInput = useRef<HTMLInputElement>(null)

  useEffect(() => { firstInput.current?.focus() }, [])
  const digit = (value: string) => value.replace(/\D/g, '').slice(-1)
  const submit = () => {
    if (first === '1' && second === '4') return onAuthenticated()
    setFailed(true)
    setFailedAttempt(current => current + 1)
    setFirst('')
    setSecond('')
    window.setTimeout(() => firstInput.current?.focus(), 0)
  }

  return <main className={`password-scene ${leaving ? 'password-leaving' : ''}`}>
    <div className="password-wash" aria-hidden="true" />
    <form key={failedAttempt} className={`password-card ${failed ? 'password-failed' : ''}`} onSubmit={event => { event.preventDefault(); submit() }}>
      <h1>Antes de continuar...</h1>
      <p>Introduce la contraseña.</p>
      <div className="password-digits">
        <input ref={firstInput} aria-label="Primer dígito" inputMode="numeric" maxLength={1} value={first} onChange={event => { const value = digit(event.target.value); setFirst(value); if (value) secondInput.current?.focus() }} />
        <input ref={secondInput} aria-label="Segundo dígito" inputMode="numeric" maxLength={1} value={second} onChange={event => setSecond(digit(event.target.value))} onKeyDown={event => { if (event.key === 'Backspace' && !second) firstInput.current?.focus() }} />
      </div>
      {failed && <p className="password-hint">Creo que la contraseña es tu número favorito.</p>}
      <button className="primary-button" type="submit" disabled={!first || !second}>CONTINUAR →</button>
    </form>
  </main>
}
