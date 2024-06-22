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

export interface Gallery {
  name: string
  imgName: string
}

export interface Exhibitors {
  name: string
  description?: string
  artwork?: {
    type: string
    name: string
  }
  social_media: SocialMedia
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
    tickets?: {
      title: string
      url: Array<string[]>
    }
  }
  time: string[] | string
  more_info?: Array<string>[]
  gallery?: Gallery[]
  social_media?: SocialMedia
  exhibitors?: Array<Exhibitors>
}
