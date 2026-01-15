import React from 'react'

import Cta from '@/app/components/Cta'
import Info from '@/app/components/InfoSection'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'

type BlockProps = {
  index: number
  block: PageBuilderSection
  pageId: string
  pageType: string
}

// Wrapper component for InfoSection to match BlockProps interface
const InfoSectionWrapper = ({block, index, pageId, pageType}: BlockProps) => {
  if (block._type !== 'infoSection') {
    return null
  }
  
  // Access properties that may exist on the block
  const blockData = block as unknown as {
    imageUrl?: string
    videoUrl?: string
    title?: string
    text?: string
    heading?: string
    subheading?: string
  }
  
  return (
    <Info
      imageUrl={blockData.imageUrl}
      videoUrl={blockData.videoUrl}
      title={blockData.title || blockData.heading || ''}
      text={blockData.text || blockData.subheading || ''}
    />
  )
}

// Map of block types to their components
const getBlockComponent = (blockType: string) => {
  const blocks: Record<string, React.ComponentType<BlockProps>> = {
    infoSection: InfoSectionWrapper,
  }
  return blocks[blockType]
}

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({block, index, pageId, pageType}: BlockProps) {
  // Handle callToAction blocks directly
  if (block._type === 'callToAction') {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        <Cta block={block} index={index} pageId={pageId} pageType={pageType} />
      </div>
    )
  }

  // Check if a component exists for this block type
  const BlockComponent = getBlockComponent(block._type)
  
  if (BlockComponent) {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        <BlockComponent block={block} index={index} pageId={pageId} pageType={pageType} />
      </div>
    )
  }

  // Block doesn't exist yet
  return (
    <div key={block._key} className="w-full bg-gray-100 text-center text-gray-500 p-20 rounded">
      A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
    </div>
  )
}
