import { BaseNode } from '../base-node'
import { Meta } from '../log'

/**
 * Client node in synchronization pair.
 *
 * Instead of server node, it initializes synchronization
 * and sends connect message.
 *
 * ```js
 * import { ClientNode } from '@logux/core'
 * const connection = new BrowserConnection(url)
 * const node = new ClientNode(nodeId, log, connection)
 * ```
 *
 * @template M Meta’s type.
 */
export class ClientNode<M = Meta> extends BaseNode<M> { }
