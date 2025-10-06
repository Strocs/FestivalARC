interface Track {
  id: string
  name: string
  color: string
  category?: string
}

interface ScheduleGridHeaderProps {
  tracks: Track[]
}

export function ScheduleGridHeader({ tracks }: ScheduleGridHeaderProps) {
  return (
    <>
      <div>
        <span className='text-25-white bg-25-black flex h-[40px] items-center justify-center text-center font-bold'>
          Horario
        </span>
      </div>

      {tracks.map((track) => (
        <div key={track.id}>
          <span
            className='text-25-white flex h-[40px] items-center justify-center text-center font-bold'
            style={{ backgroundColor: track.color }}>
            {track.name} {track.category && ` - ${track.category}`}
          </span>
        </div>
      ))}
    </>
  )
}
