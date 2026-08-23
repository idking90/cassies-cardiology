import type { ContentBlock } from '../data/topics'
import { MediaRenderer } from './MediaRenderer'

export function ContentBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return <div className="content-blocks">{blocks.map((block, index) => {
    const key = `${block.type}-${index}`
    switch (block.type) {
      case 'paragraph': return <p key={key}>{block.text}</p>
      case 'bullets': return <ul key={key}>{block.items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{item}</li>)}</ul>
      case 'numbered': return <ol key={key}>{block.items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{item}</li>)}</ol>
      case 'table': return <div className="content-table-scroll" key={key}><table><thead><tr>{block.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
      case 'media': return <MediaRenderer key={key} media={block.media} />
    }
  })}</div>
}
