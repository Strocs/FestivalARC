import type { Activity } from '@cTypes/types'
import { openPanel } from '@store/MoreInfoStore'

interface Props {
  data: Activity
  className: string
  children: React.ReactNode
}

export const MoreInfoButton = ({
  data,
  children,
  className: customStyle
}: Props) => {
  const handleOpenPanel = () => {
    openPanel(data)
  }

  return (
    <button onClick={handleOpenPanel} className={customStyle}>
      {children}
    </button>
  )
}
