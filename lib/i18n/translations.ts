export const defaultLocale = "is";

export const highlightTypes = [
  "goal",
  "save",
  "skill",
  "assist",
  "shot",
  "mistake",
  "funny",
  "celebration",
  "historic",
  "other"
] as const;

export type HighlightType = (typeof highlightTypes)[number];

export const translations = {
  is: {
    common: {
      admin: "Stjórnandi",
      approve: "Samþykkja",
      apply: "Sækja um",
      club: "Félag",
      configuredMissing: "Supabase stillingar vantar.",
      email: "Netfang",
      errorPrefix: "Villa",
      loading: "Hleð...",
      optional: "Valfrjálst",
      password: "Lykilorð",
      reject: "Hafna",
      review: "Yfirferð",
      role: "Hlutverk",
      copied: "Afritað",
      share: "Deila",
      signIn: "Skrá inn",
      signOut: "Skrá út",
      status: "Staða",
      submit: "Senda inn",
      team: "Lið"
    },
    roleLabels: {
      admin: "Stjórnandi",
      pending_uploader: "Bíður samþykkis sem leikmaður",
      uploader: "Leikmaður",
      viewer: "Áhorfandi"
    },
    statusLabels: {
      approved: "Samþykkt",
      pending: "Í yfirferð",
      rejected: "Hafnað"
    },
    highlightTypes: {
      assist: "Stoðsending",
      celebration: "Fagnaðarlæti",
      funny: "Fyndið",
      goal: "Mark",
      historic: "Sögulegt",
      mistake: "Klúður",
      other: "Annað",
      save: "Varsla",
      shot: "Skot",
      skill: "Tilþrif"
    },
    nav: {
      adminApplications: "Umsóknir",
      adminHighlights: "Myndbönd í yfirferð",
      apply: "Verða leikmaður",
      submit: "Senda inn mark"
    },
    layout: {
      description: "Football highlights",
      footer: "Community-driven mörk, tilþrif og augnablik. Ísland fyrst, heimurinn með."
    },
    home: {
      badge: "Samþykkt community",
      emptyHighlights: "Engin samþykkt myndbönd eru komin inn enn.",
      approvedCountSuffix: "samþykkt",
      filterAll: "Allt",
      filterByCategory: "Sía eftir flokki",
      filterByCollection: "Sía eftir stemningu",
      feedEyebrow: "Feedið",
      feedIntro:
        "Samþykkt myndbönd frá leikmönnum og liðum. Vel merkt efni raðast í rétta flokka og verður auðvelt að skoða, spila og deila.",
      feedTitle: "Myndbönd frá liðunum",
      featuredEmptyCopy: "Um leið og fyrsta samþykkta myndbandið kemur inn birtist það hér sem aðalklippa.",
      featuredEmptyTitle: "Aðalklippa vantar enn",
      featuredEyebrow: "Aðalklippa",
      featuredMore: "Opna feedið",
      heroCopy:
        "Samþykktir leikmenn senda inn mörk, vörslur og augnablik frá sínum liðum. Stjórnandi yfirfer, flokkar og birtir.",
      heroPoints: ["Samþykktir leikmenn", "Yfirfarið fyrst", "Auðvelt að deila"],
      heroSubtitle: "Myndbönd frá íslenska fótboltasamfélaginu.",
      heroTitle: "GOALZONE",
      lanesEyebrow: "Í feedinu",
      lanesTitle: "Það sem fær fólk til að ýta á play",
      pendingReview: "bíður yfirferðar",
      primaryCta: "Skoða myndbönd",
      secondaryCta: "Senda inn",
      statApproved: "Horfa án þess að fara út",
      statApprovedCopy: "Public feedið heldur bara eftir klippum sem má spila beint á Goalzone.",
      statModerated: "Deila marki á einu augnabliki",
      statModeratedCopy: "Hver klippa fær sinn hlekk svo hægt sé að senda markið beint á rétta augnablikið.",
      statStorage: "Local fyrst, stórt seinna",
      statStorageCopy: "Bestu deildirnar, yngri flokkar, bikarleikir og local augnablik eiga að lifa á sama stað.",
      videoUnavailable: "Ekki tókst að búa til slóð fyrir myndbandið.",
      latestApprovedCopy: "Allar klippurnar hér eru samþykktar og spilanlegar á síðunni.",
      viewCategory: "Sjá flokk",
      watchHere: "Spila hér"
    },
    auth: {
      access: "Aðgangur",
      createAccount: "Stofna aðgang",
      createSuccess: "Aðgangur var stofnaður. Staðfestu netfangið ef þess þarf, skráðu þig inn og sæktu svo um að verða leikmaður.",
      intro:
        "Stofnaðu aðgang eða skráðu þig inn. Nýir notendur byrja sem áhorfendur og geta svo sótt um að verða leikmenn sem senda inn mörk.",
      missingSupabase: "Supabase er ekki stillt. Bættu URL og anon lykli í .env.local.",
      submitWorking: "Augnablik...",
      title: "Skráðu þig inn á Goalzone.",
      uploaderApplication: "Halda áfram í leikmannsumsókn"
    },
    apply: {
      alreadyUploader: "Aðgangurinn þinn er samþykktur sem leikmaður og má senda inn mörk.",
      closedTitle: "Umsóknarleiðin er lokuð í bili.",
      clubOrTeamName: "Félag eða lið sem þú spilar með",
      clubOrTeamPlaceholder: "t.d. KR, Valur, Breiðablik eða 5. flokkur",
      contactEmail: "Netfang tengiliðar",
      createOrSignIn: "Stofna aðgang / skrá inn",
      currentRole: "Núverandi hlutverk",
      intro:
        "Segðu stjórnendum hvaða félagi eða liði þú tengist. Samþykktir leikmenn geta sent inn mörk sem fara fyrst í yfirferð.",
      latestApplication: "Síðasta umsókn",
      loading: "Hleð umsóknarsvæði...",
      missingSupabaseCopy: "Búðu til .env.local út frá .env.example og ræstu vefinn aftur.",
      missingSupabaseTitle: "Bættu við Supabase stillingum.",
      note: "Af hverju viltu senda inn mörk?",
      pending: "Nýjasta umsóknin þín bíður yfirferðar. Þegar hún er samþykkt getur þú sent inn mörk.",
      signInCopy: "Goalzone aðgangar byrja sem áhorfendur. Þegar þú hefur stofnað aðgang getur þú sótt um að verða leikmaður sem má senda inn mörk.",
      signInTitle: "Stofnaðu aðgang til að sækja um sem leikmaður.",
      submit: "Senda umsókn",
      submitting: "Sendi...",
      success: "Umsóknin hefur verið send inn. Aðgangurinn þinn bíður nú samþykkis sem leikmaður.",
      title: "Sækja um að verða leikmaður.",
      uploaderAccess: "Leikmannsaðgangur"
    },
    submit: {
      category: "Flokkur",
      categoryRequired: "Veldu flokk áður en þú sendir inn.",
      clubName: "Félag",
      competition: "Keppni",
      competitionRequired: "Veldu keppni áður en þú sendir inn.",
      description: "Lýsing",
      file: "Myndband",
      fileTooLarge: "Myndbandið er of stórt. Hámarksstærð er 250 MB í þessari útgáfu.",
      formTitle: "Fljótleg innsend",
      intro:
        "Sendu inn myndband úr leik eða æfingu. Það fer í yfirferð og birtist opinberlega þegar stjórnandi samþykkir það.",
      loading: "Hleð innsendingarsvæði...",
      location: "Staðsetning",
      matchDate: "Leikdagur",
      opponentTeamName: "Andstæðingur",
      playerName: "Leikmaður",
      requiresApproval: "Aðeins samþykktir leikmenn og stjórnendur geta sent inn mörk.",
      season: "Tímabil",
      selectFile: "Veldu myndband til að senda inn.",
      selectCategory: "Veldu flokk",
      selectCompetition: "Veldu keppni",
      simpleIntro: "Settu inn titil, flokk, keppni og myndband. Nánari leikupplýsingar mega koma seinna.",
      submitting: "Sendi inn...",
      success: "Myndbandið hefur verið sent inn og bíður yfirferðar.",
      teamName: "Lið",
      title: "Senda inn mark",
      titleField: "Titill",
      type: "Tegund hápunkts",
      uploadAccess: "Innsendingar",
      uploadFile: "Hlaða upp myndbandi",
      videoLink: "YouTube, Vimeo eða TikTok hlekkur",
      videoSource: "Myndband",
      videoUrl: "Hlekkur á myndband",
      unsupportedVideoUrl: "Notaðu gildan YouTube, Vimeo eða TikTok hlekk.",
      moreDetails: "Nánari upplýsingar"
    },
    adminApplications: {
      applicant: "Umsækjandi",
      countSuffix: "í yfirferð",
      empty: "Engar umsóknir eru komnar inn.",
      introMissingSupabase: "Bættu við .env.local áður en stjórnendasvæðið er opnað.",
      loading: "Hleð umsóknarlista...",
      queue: "Stjórnendasvæði",
      requiresAdmin: "Stjórnandahlutverk þarf.",
      signInRequired: "Innskráning nauðsynleg.",
      title: "Umsóknir leikmanna"
    },
    adminHighlights: {
      approveWithMetadata: "Samþykkja með flokkun",
      categoryRequired: "Veldu flokk áður en myndband er samþykkt.",
      classificationHelp:
        "Farðu yfir titil, tegund, flokk og keppni áður en myndband fer á forsíðuna.",
      competitionRequired: "Veldu keppni áður en myndband er samþykkt.",
      countSuffix: "myndbönd í yfirferð",
      empty: "Engin myndbönd bíða yfirferðar.",
      loading: "Hleð myndbönd í yfirferð...",
      queue: "Stjórnendasvæði",
      requiresAdmin: "Stjórnandahlutverk þarf.",
      saved: "Vistað",
      saveMetadata: "Vista flokkun",
      signInRequired: "Innskráning nauðsynleg.",
      title: "Myndbönd í yfirferð",
      titleRequired: "Titill má ekki vera tómur.",
      videoMissing: "Engin myndbandsslóð tiltæk."
    }
  },
  en: {
    common: {
      admin: "Admin",
      approve: "Approve",
      apply: "Apply",
      club: "Club",
      configuredMissing: "Supabase is not configured.",
      email: "Email",
      errorPrefix: "Error",
      loading: "Loading...",
      optional: "Optional",
      password: "Password",
      reject: "Reject",
      review: "Review",
      role: "Role",
      signIn: "Sign in",
      signOut: "Sign out",
      status: "Status",
      submit: "Submit",
      team: "Team"
    },
    roleLabels: {
      admin: "Admin",
      pending_uploader: "Pending uploader",
      uploader: "Uploader",
      viewer: "Viewer"
    },
    statusLabels: {
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected"
    },
    highlightTypes: {
      assist: "Assist",
      celebration: "Celebration",
      funny: "Funny",
      goal: "Goal",
      historic: "Historic",
      mistake: "Mistake",
      other: "Other",
      save: "Save",
      shot: "Shot",
      skill: "Skill"
    }
  }
} as const;

export const t = translations[defaultLocale];
