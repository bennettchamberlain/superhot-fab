import {post} from './documents/post'
import {product} from './documents/product'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {productVariant} from './objects/productVariant'
import {productReview} from './objects/productReview'
import {productImage} from './objects/productImage'
import {productVideo} from './objects/productVideo'
import {productSpecification} from './objects/productSpecification'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  post,
  product,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  // Product-related objects
  productVariant,
  productReview,
  productImage,
  productVideo,
  productSpecification,
]
