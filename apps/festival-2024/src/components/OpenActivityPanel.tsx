import { openPanel, type InfoPanel } from '@stores/activityInfoStore'

interface Props {
  data: InfoPanel
  className: string
  children: React.ReactNode
}

export const OpenActivityPanel = ({
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
