// Message centré pour les écrans sans données : chargement, erreur ou liste vide.
// Un bouton d'action est affiché seulement si `actionLabel` et `onAction` sont fournis.

import { Button, CircularProgress, Typography } from '@mui/material'

interface StateMessageProps {
  message: string
  loading?: boolean
  actionLabel?: string
  onAction?: () => void
}

export default function StateMessage({ message, loading, actionLabel, onAction }: StateMessageProps) {
  return (
    <div className="state-message">
      {loading && <CircularProgress size={28} />}
      <Typography color="text.secondary">{message}</Typography>
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
