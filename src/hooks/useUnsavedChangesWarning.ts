// Demande confirmation au navigateur si on ferme ou recharge la page alors que
// des modifications ne sont pas enregistrées.

import { useEffect } from 'react'

export function useUnsavedChangesWarning(hasUnsavedChanges: boolean): void {
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const warn = (event: BeforeUnloadEvent) => {
      // le navigateur affiche son propre message ; il suffit d'annuler l'événement
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnsavedChanges])
}
