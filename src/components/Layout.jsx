import PropTypes from 'prop-types'
import { History } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Layout({ children, theme, onToggle, nbHistorique, onOuvrirHistorique }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>

      <header style={{
        borderBottom: '1px solid var(--border)',
        background:   'var(--bg-card)',
      }}>
        <div style={{
          maxWidth:       '760px',
          margin:         '0 auto',
          padding:        '14px 20px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{ fontSize: '20px', margin: 0 }}>
            Problème du Voyageur de commerce
          </h1>

          {/* Boutons à droite : Historique + ThemeToggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Bouton historique avec badge compteur */}
            <button
              onClick={onOuvrirHistorique}
              title="Voir l'historique des calculs"
              style={btnHistorique}
            >
              <History size={18} />
              {nbHistorique > 0 && (
                <span style={badgeCount}>{nbHistorique}</span>
              )}
            </button>

            <ThemeToggle theme={theme} onToggle={onToggle} />
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '760px',
        margin:   '0 auto',
        padding:  '32px 20px',
      }}>
        {children}
      </main>

    </div>
  )
}

Layout.propTypes = {
  children:            PropTypes.node.isRequired,
  theme:               PropTypes.string.isRequired,
  onToggle:            PropTypes.func.isRequired,
  nbHistorique:        PropTypes.number.isRequired,
  onOuvrirHistorique:  PropTypes.func.isRequired,
}

const btnHistorique = {
  position:     'relative',
  display:      'flex',
  alignItems:   'center',
  padding:      '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border:       '1px solid var(--border)',
  background:   'var(--bg-card)',
  color:        'var(--text-main)',
  cursor:       'pointer',
}

const badgeCount = {
  position:        'absolute',
  top:             '-6px',
  right:           '-6px',
  minWidth:        '18px',
  height:          '18px',
  borderRadius:    '9px',
  background:      'var(--bg-btn)',
  color:           'var(--text-btn)',
  fontSize:        '10px',
  fontWeight:      '700',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
  padding:         '0 4px',
}