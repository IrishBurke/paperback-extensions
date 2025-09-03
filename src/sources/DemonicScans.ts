import {
  Source,
  RequestManager,
  createRequestManager,
  PagedResults,
  SearchRequest,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  createHomeSection
} from '@paperback/toolchain'
import { load } from 'cheerio'
import { MadaraParser } from '../parsers/MadaraParser'

const BASE = 'https://demonicscans.org'

export class DemonicScans extends Source {
  private parser = new MadaraParser()

  override requestManager: RequestManager = createRequestManager({
    requestsPerSecond: 2,
    requestTimeout: 15000,
    // Some Madara sites require Referer
    interceptor: {
      interceptRequest: async (req) => {
        req.headers = {
          ...(req.headers ?? {}),
          'referer': BASE,
          'user-agent': 'Mozilla/5.0 Paperback'
        }
        return req
      },
      interceptResponse: async (res) => res
    }
  })

  private async fetch(url: string) {
    const resp = await this.requestManager.schedule({
      url,
      method: 'GET'
    }, 1)
    if (!resp?.data) throw new Error('Empty response')
    return load(resp.data as string)
  }

  // ----- Home -----
  override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const latest = createHomeSection({ id: 'latest', title: 'Latest Updates' })
    sectionCallback(latest)
    const $ = await this.fetch(`${BASE}/?m_orderby=latest`)
    latest.items = this.parser.parseMangaTiles($)
    sectionCallback(latest)
  }

  override async getViewMoreItems(homeSectionId: string, metadata: any): Promise<PagedResults> {
    const page = Number(metadata?.page ?? 1)
    const url = homeSectionId === 'latest'
      ? `${BASE}/page/${page}/?m_orderby=latest`
      : `${BASE}/page/${page}/?s=&post_type=wp-manga`
    const $ = await this.fetch(url)
    const results = this.parser.parseMangaTiles($)
    const next = results.length ? { page: page + 1 } : undefined
    return { results, metadata: next }
  }

  // ----- Search -----
  override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
    const page = Number(metadata?.page ?? 1)
    const q = encodeURIComponent(query.title ?? '')
    const $ = await this.fetch(`${BASE}/page/${page}/?s=${q}&post_type=wp-manga`)
    const results = this.parser.parseMangaTiles($)
    const next = results.length ? { page: page + 1 } : undefined
    return { results, metadata: next }
  }

  // ----- Details -----
  override async getMangaDetails(mangaId: string): Promise<Manga> {
    const $ = await this.fetch(`${BASE}/manga/${mangaId}/`)
    return this.parser.parseMangaDetails($, mangaId)
  }

  override async getChapters(mangaId: string): Promise<Chapter[]> {
    const $ = await this.fetch(`${BASE}/manga/${mangaId}/`)
    return this.parser.parseChapters($, mangaId)
  }

  override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    // chapterId can be like "chapter/123" from parser
    const full = chapterId.startsWith('http') ? chapterId : `${BASE}/manga/${mangaId}/${chapterId}/`
    const $ = await this.fetch(full)
    return this.parser.parseChapterDetails($, mangaId, chapterId)
  }
}
