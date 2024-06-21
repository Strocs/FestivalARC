import { openPanel, type InfoPanel } from '@stores/moreInfoStore.ts'

interface Props {
  data: InfoPanel
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
