export interface Day {
  day: string
  color: { [key: string]: string }
  schedule: {
    [key: string]: Activity[]
  }
}

export interface SocialMedia {
  ig?: string
  fb?: string
  yt?: string
  spotify?: string
  soundcloud?: string
  x?: string
  tumblr?: string
}

export interface Activity {
  title: string
  subTitle?: string
  description: string
  category: string
  location: {
    name: string
    maps: string
  }
  city: string
  time: string[] | string
  more_info?: Array<string>[]
  tickets?: string
  gallery?: string[]
  social_media?: SocialMedia
  exhibitors?: Array<{
    name: string
    description?: string
    artwork?: {
      type: string
      name: string
    }
    social_media: SocialMedia
  }>
}
