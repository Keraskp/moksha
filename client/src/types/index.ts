export type HTMLElementTagNames = keyof HTMLElementTagNameMap

export interface User {
  avatar_idx: number
  name: string
  user_id: string
  username: string
  email: string
  institution: string
  phone_no: number
}

// # Contest and Event types

type Heading = Record<'heading', string>
type UnorderedList = Record<'ul', string[]>

interface Para {
  p: string
  bold?: boolean
}

interface ImageSource {
  srcSet: string
  media?: string
  type?: string
}

// # EVENT

export interface Event {
  id: number
  slug: string
  name: string
  club: string
  image: {
    sources?: ImageSource[]
    src: string
  }
  description: (Heading | Para | UnorderedList)[]
  instructions?: (Heading | Para | UnorderedList)[]
}

// # CONTEST

type ContestType = 'solo' | 'team' | 'duo' | 'duet' | 'squad' | 'open'

interface TeamSizeRange {
  min: number
  max: number | null
}

type AllowedTeamSize = number | TeamSizeRange

interface BaseContest {
  id: number
  slug: string
  name: string
  club?: string
  subtitle?: string
  image: {
    sources?: ImageSource[]
    src: string
  }
  deadline: Date
  description: (Heading | Para | UnorderedList)[]
  instructions?: (Heading | Para | UnorderedList)[]
}

interface SoloContest extends BaseContest {
  type: ['solo'] | ['open']
}

interface TeamContest extends BaseContest {
  type: ContestType[]
  allowedTeamSize: AllowedTeamSize
}

export type Contest = SoloContest | TeamContest
