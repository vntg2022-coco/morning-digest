// One sample article in every supported language, for the landing page preview.
// It is an illustrative sample, not a real news report, and the page labels it that way.

export const SAMPLE_EN = {
  headline: 'Libraries add morning language clubs',
  sentences: [
    'Many public libraries now host free language clubs in the morning.',
    'Members read a short news story together and talk about it.',
  ],
}

// Learners of English see the sample next to Spanish instead of English.
export const SAMPLE_ES_FOR_ENGLISH = {
  headline: 'Las bibliotecas abren clubes de idiomas por la mañana',
  sentences: [
    'Muchas bibliotecas públicas ahora ofrecen clubes de idiomas gratuitos por la mañana.',
    'Los miembros leen juntos una noticia corta y conversan sobre ella.',
  ],
}

export const SAMPLES = {
  en: SAMPLE_EN,
  es: SAMPLE_ES_FOR_ENGLISH,
  fr: {
    headline: 'Les bibliothèques ouvrent des clubs de langues le matin',
    sentences: [
      'De nombreuses bibliothèques publiques proposent désormais des clubs de langues gratuits le matin.',
      "Les membres lisent ensemble un court article d'actualité et en discutent.",
    ],
  },
  de: {
    headline: 'Bibliotheken starten morgendliche Sprachclubs',
    sentences: [
      'Viele öffentliche Bibliotheken bieten jetzt morgens kostenlose Sprachclubs an.',
      'Die Mitglieder lesen gemeinsam eine kurze Nachricht und sprechen darüber.',
    ],
  },
  pt: {
    headline: 'Bibliotecas abrem clubes de idiomas pela manhã',
    sentences: [
      'Muitas bibliotecas públicas agora oferecem clubes de idiomas gratuitos pela manhã.',
      'Os participantes leem juntos uma notícia curta e conversam sobre ela.',
    ],
  },
  ru: {
    headline: 'Библиотеки открывают утренние языковые клубы',
    sentences: [
      'Многие публичные библиотеки теперь проводят бесплатные языковые клубы по утрам.',
      'Участники вместе читают короткую новость и обсуждают её.',
    ],
  },
  zh: {
    headline: '图书馆开设晨间语言俱乐部',
    sentences: ['现在，许多公共图书馆在早上举办免费的语言俱乐部。', '成员们一起阅读一篇简短的新闻，然后进行讨论。'],
  },
  ja: {
    headline: '図書館が朝の語学クラブを開設',
    sentences: [
      '今、多くの公共図書館が朝に無料の語学クラブを開いています。',
      '参加者は短いニュースを一緒に読み、それについて話し合います。',
    ],
  },
  ko: {
    headline: '도서관, 아침 언어 클럽 개설',
    sentences: [
      '요즘 많은 공공 도서관이 아침마다 무료 언어 클럽을 운영합니다.',
      '회원들은 짧은 뉴스를 함께 읽고 그것에 대해 이야기합니다.',
    ],
  },
  hi: {
    headline: 'पुस्तकालयों में सुबह के भाषा क्लब शुरू',
    sentences: [
      'अब कई सार्वजनिक पुस्तकालय सुबह के समय मुफ़्त भाषा क्लब चलाते हैं।',
      'सदस्य मिलकर एक छोटी खबर पढ़ते हैं और उस पर बात करते हैं।',
    ],
  },
  ur: {
    headline: 'لائبریریوں میں صبح کے زبان کلب شروع',
    sentences: [
      'اب بہت سی عوامی لائبریریاں صبح کے وقت مفت زبان کلب چلاتی ہیں۔',
      'اراکین مل کر ایک مختصر خبر پڑھتے ہیں اور اس پر بات کرتے ہیں۔',
    ],
  },
  id: {
    headline: 'Perpustakaan membuka klub bahasa pagi',
    sentences: [
      'Kini banyak perpustakaan umum mengadakan klub bahasa gratis setiap pagi.',
      'Para anggota membaca berita singkat bersama lalu membicarakannya.',
    ],
  },
}

// Clickable words for the "tap a word" demo (Spanish sentence, English meanings).
export const WORD_DEMO = {
  sentence: 'Muchas bibliotecas públicas ahora ofrecen clubes de idiomas gratuitos por la mañana.',
  translation: 'Many public libraries now offer free language clubs in the morning.',
  words: {
    bibliotecas: { meaning: 'libraries', example: 'La biblioteca abre a las nueve.', exampleEn: 'The library opens at nine.' },
    ofrecen: { meaning: 'they offer', example: 'Ofrecen café gratis.', exampleEn: 'They offer free coffee.' },
    idiomas: { meaning: 'languages', example: 'Hablo dos idiomas.', exampleEn: 'I speak two languages.' },
    gratuitos: { meaning: 'free (of charge)', example: 'Los conciertos son gratuitos.', exampleEn: 'The concerts are free.' },
    mañana: { meaning: 'morning; tomorrow', example: 'Leo las noticias por la mañana.', exampleEn: 'I read the news in the morning.' },
  },
}
