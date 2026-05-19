import PropTypes from 'prop-types'

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Basculer le thème"
      style={{
        padding: '8px 14px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        fontSize: '18px',
        lineHeight: '1',
        cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

ThemeToggle.propTypes = {
  theme:    PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
}