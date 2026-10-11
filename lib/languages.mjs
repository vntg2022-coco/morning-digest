// The 12 languages supported at launch. Shared by the site and the digest pipeline.
// `greeting` is "Good morning" in that language (used in the landing page collage).

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', greeting: 'Good morning' },
  { code: 'zh', name: 'Chinese', native: '中文', greeting: '早上好' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', greeting: 'सुप्रभात' },
  { code: 'es', name: 'Spanish', native: 'Español', greeting: 'Buenos días' },
  { code: 'fr', name: 'French', native: 'Français', greeting: 'Bonjour' },
  { code: 'ru', name: 'Russian', native: 'Русский', greeting: 'Доброе утро' },
  { code: 'pt', name: 'Portuguese', native: 'Português', greeting: 'Bom dia' },
  { code: 'ur', name: 'Urdu', native: 'اردو', greeting: 'صبح بخیر', rtl: true },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', greeting: 'Selamat pagi' },
  { code: 'de', name: 'German', native: 'Deutsch', greeting: 'Guten Morgen' },
  { code: 'ja', name: 'Japanese', native: '日本語', greeting: 'おはよう' },
  { code: 'ko', name: 'Korean', native: '한국어', greeting: '좋은 아침' },
]

export const LANGUAGE_BY_CODE = Object.fromEntries(LANGUAGES.map(l => [l.code, l]))
