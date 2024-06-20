export interface Day {
  day: string
  color: Color
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
  flickr?: string
}

export interface Color {
  border?: string,
  background?: string,
  text?: string,
  textHover?: string,
  borderHover?: string,
  backgroundHover?: string,
  afterBackground?: string
}

export interface Activity {
  title: string
  subTitle?: string
  description: string
  category: string
  location: {
    city: string
    name: string
    maps: string
  }
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
