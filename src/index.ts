import {
  SourceInfo,
  createSource,
  LanguageCode,
  ContentRating,
} from '@paperback/toolchain'
import { DemonicScans } from './sources/DemonicScans'

export const DEMONIC_SCANS_INFO: SourceInfo = {
  version: '1.0.0',
  name: 'DemonicScans',
  description: 'Unofficial DemonicScans source (Madara)',
  author: 'Matthew Burke',
  authorWebsite: '',
  icon: 'icon.png',
  contentRating: ContentRating.EVERYONE,
  websiteBaseURL: 'https://demonicscans.org',
  language: LanguageCode.ENGLISH,
  sourceTags: []
}

export const DemonicScansSource = createSource(DEMONIC_SCANS_INFO, () => new DemonicScans())
