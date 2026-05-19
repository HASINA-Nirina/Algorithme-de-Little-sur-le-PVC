const STEPS = [
  { num: 1, label: 'Villes' },
  { num: 2, label: 'Matrice' },
  { num: 3, label: 'Calcul' },
  { num: 4, label: 'Résultat' },
]

export default function Stepper({ current }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '0',
      marginBottom: '36px',
    }}>
      {STEPS.map((step, i) => {
        const done    = step.num < current
        const active  = step.num === current
        const last    = i === STEPS.length - 1

        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px',
                background: done || active ? 'var(--bg-step-done)' : 'var(--bg-step-todo)',
                color: done || active ? 'var(--text-btn)' : 'var(--text-muted)',
                border: active ? '2px solid var(--border-focus)' : '2px solid transparent',
              }}>
                {done ? '✓' : step.num}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: active ? '600' : '400',
                color: active ? 'var(--text-title)' : 'var(--text-muted)',
              }}>{step.label}</span>
            </div>

            {!last && (
              <div style={{
                width: '48px',
                height: '2px',
                background: done ? 'var(--bg-step-done)' : 'var(--bg-step-todo)',
                margin: '0 4px',
                marginBottom: '20px',
              }} />
            )}

          </div>
        )
      })}
    </div>
  )
}