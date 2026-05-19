import { useEffect, useState } from 'react'
import Layout           from './components/Layout'
import PanneauHistorique from './components/PanneauHistorique'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useHistorique }   from './hooks/useHistorique'
import Step1Villes   from './pages/Step1Villes'
import Step2Matrice  from './pages/Step2Matrice'
import Step3Calcul   from './pages/Step3Calcul'
import Step4Resultat from './pages/Step4Resultat'
import './index.css'

export default function App() {
  const [theme, setTheme]      = useLocalStorage('pvc-theme', 'light')
  const [currentStep, setStep] = useLocalStorage('pvc-step', 1)
  const [panneauOuvert, setPanneauOuvert] = useState(false)

  const {
    historique,
    ajouterEntree,
    supprimerEntree,
    viderHistorique,
  } = useHistorique()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () =>
    setTheme(t => t === 'dark' ? 'light' : 'dark')

  const handleRestart = () => {
    localStorage.removeItem('pvc-villes')
    localStorage.removeItem('pvc-matrice')
    localStorage.removeItem('pvc-resultat')
    localStorage.removeItem('pvc-step')
    setStep(1)
  }

  // Appelé depuis Step3Calcul après le calcul pour sauvegarder dans l'historique
  const handleSauvegarderHistorique = (villes, matrice, resultat) => {
    ajouterEntree(villes, matrice, resultat)
  }

  return (
    <Layout
      theme={theme}
      onToggle={toggleTheme}
      nbHistorique={historique.length}
      onOuvrirHistorique={() => setPanneauOuvert(true)}
    >
      {currentStep === 1 && (
        <Step1Villes onNext={() => setStep(2)} />
      )}
      {currentStep === 2 && (
        <Step2Matrice
          onNext={() => setStep(3)}
          onPrev={() => setStep(1)}
        />
      )}
      {currentStep === 3 && (
        <Step3Calcul
          onNext={() => setStep(4)}
          onPrev={() => setStep(2)}
          onSauvegarder={handleSauvegarderHistorique}
        />
      )}
      {currentStep === 4 && (
        <Step4Resultat
          onPrev={() => setStep(3)}
          onRestart={handleRestart}
        />
      )}

      {/* Panneau historique */}
      {panneauOuvert && (
        <PanneauHistorique
          historique={historique}
          onSupprimer={supprimerEntree}
          onVider={viderHistorique}
          onFermer={() => setPanneauOuvert(false)}
        />
      )}
    </Layout>
  )
}