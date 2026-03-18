export interface RulesSection {
  heading: string;
  body: string;
}

export interface Translations {
  app: {
    title: string;
    subtitle: string;
  };
  start: {
    play: string;
    description: string;
    createRoom: string;
    joinRoom: string;
    waiting: string;
    roomCode: string;
    share: string;
    waitingOpponent: string;
    cancelQueue: string;
    queuePosition: (pos: number) => string;
    elapsedWait: (sec: number) => string;
    connected: string;
    connecting: string;
    setUsername: string;
    rules: string;
  };
  setup: {
    title: string;
    subtitle: string;
    confirm: string;
    waiting: string;
    opponentReady: string;
    secretSaved: string;
    vs: string;
    you: string;
  };
  game: {
    yourTurn: string;
    opponentTurn: string;
    send: string;
    yourGuess: string;
    yourGuesses: string;
    opponentGuesses: string;
    noGuess: string;
    bullHint: string;
    cowHint: string;
    opponentMoves: (n: number) => string;
    round: string;
    you: string;
    opponent: string;
  };
  result: {
    gameOver: string;
    youWon: string;
    youLost: string;
    draw: string;
    movesWin: (n: number) => string;
    opponentSecret: string;
    yourMoves: string;
    opponentMoves: string;
    newGame: string;
    home: string;
    waitingRematch: string;
    rematch: string;
    accept: string;
    rematchTimeout: string;
    rematchTimeoutSub: string;
  };
  profile: {
    title: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    save: string;
    stats: string;
    totalGames: string;
    wins: string;
    losses: string;
    draws: string;
    bestScore: string;
    bestScoreUnit: string;
    noWinsYet: string;
    language: string;
    turkish: string;
    english: string;
    close: string;
    validation: {
      required: string;
      tooShort: string;
      tooLong: string;
      invalidChars: string;
    };
  };
  onboarding: {
    skip: string;
    next: string;
    start: string;
    page1: {
      title: string;
      subtitle: string;
    };
    page2: {
      title: string;
      subtitle: string;
      bull: string;
      bullDesc: string;
      cow: string;
      cowDesc: string;
      example: string;
      exampleResult: string;
    };
    page3: {
      title: string;
      rule1: string;
      rule2: string;
      rule3: string;
      rule4: string;
    };
  };
  rules: {
    title: string;
    close: string;
    sections: RulesSection[];
  };
  connection: {
    opponentReconnecting: string;
    opponentReconnectingSub: string;
    selfDisconnected: string;
    selfReconnecting: string;
    timeoutSuffix: string;
  };
  errors: {
    disconnected: string;
    connectionLost: string;
    generic: string;
  };
}

export const tr: Translations = {
  app: {
    title: 'SAYISAL\nZEKA OYUNU',
    subtitle: 'BULLS & COWS',
  },
  start: {
    play: 'HIZLI EŞLEŞTİR',
    description: 'Rastgele bir rakiple 4 haneli\ngizli sayını bulma yarışı!',
    createRoom: 'ODA OLUŞTUR',
    joinRoom: 'ODAYA KATIL',
    waiting: 'Rakip aranıyor...',
    roomCode: 'Oda Kodu:',
    share: 'PAYLAŞ',
    waitingOpponent: 'Rakip bekleniyor...',
    cancelQueue: 'İPTAL',
    queuePosition: (pos: number) => `Sıradaki konum: ${pos}`,
    elapsedWait: (sec: number) => `Bekleme süresi: ${sec}s`,
    connected: 'Bağlı',
    connecting: 'Bağlanıyor...',
    setUsername: 'Kullanıcı Adı Seç',
    rules: 'Nasıl Oynanır?',
  },
  setup: {
    title: 'Gizli Sayını Seç!',
    subtitle: '4 Haneli Farklı Rakamlar Gir',
    confirm: 'ONAYLA',
    waiting: 'Rakip seçim yapıyor...',
    opponentReady: 'Rakip hazır!',
    secretSaved: 'Sayın kaydedildi',
    vs: 'VS',
    you: 'SEN',
  },
  game: {
    yourTurn: 'Senin Sıran',
    opponentTurn: 'Rakip Düşünüyor...',
    send: 'TAHMİNİ GÖNDER',
    yourGuess: 'Tahminin:',
    yourGuesses: 'Senin Tahminlerin',
    opponentGuesses: 'Rakip Tahminleri',
    noGuess: 'Henüz tahmin yok',
    bullHint: 'Doğru rakam, doğru yer',
    cowHint: 'Doğru rakam, yanlış yer',
    opponentMoves: (n: number) => `${n} hamle`,
    round: 'Tur',
    you: 'SEN',
    opponent: 'RAKİP',
  },
  result: {
    gameOver: 'OYUN BİTTİ!',
    youWon: 'KAZANDIN! 🏆',
    youLost: 'KAYBETTİN',
    draw: 'BERABERE!',
    movesWin: (n: number) => `${n} hamlede kazandın!`,
    opponentSecret: 'Rakibin Sayısı:',
    yourMoves: 'Senin Hamleler',
    opponentMoves: 'Rakip Hamleler',
    newGame: 'TEKRAR OYNA',
    home: 'Ana Sayfa',
    waitingRematch: 'Rakip bekleniyor...',
    rematch: 'TEKRAR OYNA',
    accept: 'KABUL ET',
    rematchTimeout: 'Rakip cevap vermedi.',
    rematchTimeoutSub: 'Yeni bir oyun başlatabilirsin.',
  },
  profile: {
    title: 'Profil',
    usernameLabel: 'Kullanıcı Adı',
    usernamePlaceholder: 'Adını gir...',
    save: 'KAYDET',
    stats: 'İstatistikler',
    totalGames: 'Toplam Oyun',
    wins: 'Kazanılan',
    losses: 'Kaybedilen',
    draws: 'Berabere',
    bestScore: 'En İyi Skor',
    bestScoreUnit: 'hamlede kazanıldı',
    noWinsYet: 'Henüz kazanılan oyun yok',
    language: 'Dil',
    turkish: 'Türkçe',
    english: 'İngilizce',
    close: 'KAPAT',
    validation: {
      required: 'Kullanıcı adı gerekli',
      tooShort: 'En az 2 karakter olmalı',
      tooLong: 'En fazla 16 karakter olabilir',
      invalidChars: 'Sadece harf, rakam ve _ kullanılabilir',
    },
  },
  onboarding: {
    skip: 'Atla',
    next: 'İLERİ',
    start: 'OYNAMAYA BAŞLA',
    page1: {
      title: 'Zihin Düellosu',
      subtitle: 'Rakibini 4 haneli gizli sayıyı tahmin ederek yenmek zorundasın!',
    },
    page2: {
      title: 'Boğa & İnek',
      subtitle: 'Her tahminden sonra ipuçları alırsın:',
      bull: '🐂 Boğa',
      bullDesc: 'Doğru rakam, doğru yerde',
      cow: '🐄 İnek',
      cowDesc: 'Doğru rakam, yanlış yerde',
      example: 'Örnek: Gizli sayı 1234, tahmin 1325',
      exampleResult: '→ 2 Boğa, 1 İnek',
    },
    page3: {
      title: 'Nasıl Kazanırsın?',
      rule1: '• 4 Boğa = Kazandın! (4 doğru rakam, doğru yerde)',
      rule2: '• Rakibinden daha az hamlede bul → Kazan',
      rule3: '• Aynı hamlede bulursanız → Berabere',
      rule4: '• Rakibinin bağlantısı kesilirse → Kazandın',
    },
  },
  rules: {
    title: 'Nasıl Oynanır?',
    close: 'KAPAT',
    sections: [
      {
        heading: 'Oyunun Amacı',
        body: 'Rakibinin gizli 4 haneli sayısını, rakibinden önce bulmak.',
      },
      {
        heading: 'Kurallar',
        body: '• Sayı 4 farklı rakamdan oluşmalı\n• İlk rakam 0 olamaz\n• Sırayla tahmin yapılır',
      },
      {
        heading: '🐂 Boğa',
        body: 'Doğru rakam, doğru konumda.',
      },
      {
        heading: '🐄 İnek',
        body: 'Doğru rakam var ama yanlış konumda.',
      },
      {
        heading: 'Kazanma Koşulu',
        body: '4 Boğa → Kazandın!\nRakibinden az hamlede bulursan kazanırsın.\nAynı hamlede bulursanız berabere.',
      },
      {
        heading: 'Hızlı Eşleştir Hakkında',
        body: 'Hızlı Eşleştir, önce gerçek bir rakip arar. Kısa süre içinde gerçek oyuncu bulunamazsa sistem otomatik olarak bir rakip sağlar.',
      },
    ],
  },
  connection: {
    opponentReconnecting: 'Rakibin bağlantı sorunu',
    opponentReconnectingSub: 'Çözülmesi bekleniyor...',
    selfDisconnected: 'Bağlantı sorunu yaşıyorsun',
    selfReconnecting: 'Yeniden bağlanılıyor...',
    timeoutSuffix: 'saniye',
  },
  errors: {
    disconnected: 'Rakip ayrıldı',
    connectionLost: 'Bağlantı kesildi',
    generic: 'Bir hata oluştu',
  },
};
