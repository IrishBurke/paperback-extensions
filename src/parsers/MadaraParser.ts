import { CheerioAPI, load } from 'cheerio'
import {
  Manga,
  Chapter,
  ChapterDetails,
  TagSection,
  createManga,
  createChapter,
  createChapterDetails,
  createTag,
  createTagSection
} from '@paperback/toolchain'

export class MadaraParser {
  parseMangaTiles($: CheerioAPI) {
    const results: Manga[] = []
    $('div.page-item-detail.manga').each((_, el) => {
      const a = $('a', el).first()
      const id = a.attr('href')?.replace(/https?:\/\/[^/]+\/manga\//, '').replace(/\/$/, '') ?? ''
      const title = $('.h5 a', el).text().trim() || a.attr('title')?.trim() || 'Untitled'
      const img = $('img', el).attr('data-src') || $('img', el).attr('src') || ''
      results.push(createManga({
        id, title,
        image: img,
        rating: 0, status: 0
      }))
    })
    return results
  }

  parseMangaDetails($: CheerioAPI, id: string): Manga {
    const title = $('.post-title h1').text().trim()
    const img = $('.summary_image img').attr('data-src') || $('.summary_image img').attr('src') || ''
    const desc = $('.description-summary .summary__content').text().trim()
    const statusTxt = $('.post-status .summary-content').first().text().toLowerCase()
    const status = statusTxt.includes('ongoing') ? 1 : statusTxt.includes('complete') ? 2 : 0

    const tagSections: TagSection[] = []
    const genreTags = $('.genres-content a').map((_, a) =>
      createTag({ id: $(a).text().trim(), label: $(a).text().trim() })
    ).get()
    if (genreTags.length) tagSections.push(createTagSection({ id: 'genres', label: 'Genres', tags: genreTags }))

    return createManga({
      id, title, image: img, rating: 0, status, desc, tags: tagSections
    })
  }

  parseChapters($: CheerioAPI, mangaId: string): Chapter[] {
    const chs: Chapter[] = []
    $('li.wp-manga-chapter').each((i, el) => {
      const a = $('a', el).first()
      const id = a.attr('href')?.replace(/^https?:\/\/[^/]+\/manga\//, '')
      const chapId = (id || '').replace(/^.*?\/chapter\//, 'chapter/')
      const name = a.text().trim()
      const time = $('span.chapter-release-date i', el).text().trim()
      const date = time ? new Date(time) : new Date()
      chs.push(createChapter({
        id: chapId || name,
        name,
        chapNum: Number((name.match(/(\d+(\.\d+)?)/) || [])[1]) || i + 1,
        mangaId,
        time: date
      }))
    })
    return chs
  }

  parseChapterDetails($: CheerioAPI, mangaId: string, chapterId: string): ChapterDetails {
    const pages = $('.reading-content img').map((_, img) => {
      const src = $(img).attr('data-src') || $(img).attr('src') || ''
      return src.trim()
    }).get()
    return createChapterDetails({ id: chapterId, mangaId, pages, longStrip: true })
  }
}
