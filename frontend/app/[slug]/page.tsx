import type {Metadata} from 'next'
import Head from 'next/head'

import PageBuilderPage from '@/app/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {PageOnboarding} from '@/app/components/Onboarding'
import {PageBuilderSection} from '@/sanity/lib/types'

type Props = {
  params: Promise<{slug: string}>
}

// Define page type locally since the schema may not have page type
type PageData = {
  _id: string
  _type: string
  name?: string
  heading?: string
  subheading?: string
  pageBuilder?: PageBuilderSection[]
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    // // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data || []
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })

  // Handle case where page type doesn't exist in schema
  const pageData = page as PageData | null

  return {
    title: pageData?.name ?? 'Page',
    description: pageData?.heading ?? '',
  } satisfies Metadata
}

export default async function Page(props: Props) {
  const params = await props.params
  const [{data: page}] = await Promise.all([sanityFetch({query: getPageQuery, params})])

  // Cast to expected shape since page type may not exist in schema
  const pageData = page as PageData | null

  if (!pageData?._id) {
    return (
      <div className="py-40">
        <PageOnboarding />
      </div>
    )
  }

  return (
    <div className="my-12 lg:my-24">
      <Head>
        <title>{pageData.heading}</title>
      </Head>
      <div className="">
        <div className="container">
          <div className="pb-6 border-b border-gray-100">
            <div className="max-w-3xl">
              <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">{pageData.heading}</h1>
              <p className="mt-4 text-base lg:text-lg leading-relaxed text-gray-600 uppercase font-light">
                {pageData.subheading}
              </p>
            </div>
          </div>
        </div>
      </div>
      <PageBuilderPage page={pageData} />
    </div>
  )
}
