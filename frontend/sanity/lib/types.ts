import {CallToAction, InfoSection, Link, PostReference} from '@/sanity.types'

// Define PageBuilderSection manually since the page type may not exist in schema
export type PageBuilderSection = 
  | (CallToAction & { _key: string })
  | (InfoSection & { _key: string })

// Extract specific page builder types
export type ExtractPageBuilderType<T extends PageBuilderSection['_type']> = Extract<
  PageBuilderSection,
  {_type: T}
>

// Represents a Link after GROQ dereferencing (page/post become slug strings)
// This type can be either the raw Link type from schema or the dereferenced version
export type DereferencedLink = Link | {
  _type: 'link'
  linkType?: 'href' | 'page' | 'post'
  href?: string
  page?: string | null
  post?: string | null
  openInNewTab?: boolean
}
