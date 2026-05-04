export type MockHighlight = {
  id: string;
  title: string;
  description: string;
  type:
    | "goal"
    | "save"
    | "skill"
    | "assist"
    | "shot"
    | "mistake"
    | "funny"
    | "celebration"
    | "historic"
    | "other";
  player_name: string | null;
  club_name: string | null;
  team_name: string | null;
  opponent_team_name: string | null;
  competition: string | null;
  season: string | null;
  match_date: string | null;
  location: string | null;
  external_video_url: string | null;
  video_url: string | null;
  tags: string[];
  submitted_by: string;
  submitted_by_club: string | null;
  discussion_prompt: string | null;
  views: number;
  likes: number;
  comments_count: number;
};

export type MockComment = {
  id: string;
  author: string;
  avatar_initials: string;
  avatar_color: string;
  body: string;
  created_at: string;
  likes: number;
};

export const mockHighlights: MockHighlight[] = [
  {
    id: "demo-1",
    title: "Meistaramarkið — Aron Sigurðarson skorar í 90. mínútu",
    description:
      "Aron Sigurðarson tryggir meistara Breiðabliks með dramatísku marki í síðustu mínútu leiks gegn KR á Kópavogsvelli. Öll hliðin á fótum og fanarnir á þaki.",
    type: "goal",
    player_name: "Aron Sigurðarson",
    club_name: "Breiðablik",
    team_name: "Breiðablik",
    opponent_team_name: "KR",
    competition: "Úrvalsdeild",
    season: "2024",
    match_date: "2024-10-20",
    location: "Kópavogsvöllur",
    external_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    video_url: null,
    tags: ["Úrvalsdeild", "Mark", "Síðasta mínúta", "Meistarar", "Dramatískt"],
    submitted_by: "breidablik_official",
    submitted_by_club: "Breiðablik",
    discussion_prompt: "Er þetta mark ársins í íslensku úrvalsdeildinni?",
    views: 18420,
    likes: 1247,
    comments_count: 89,
  },
  {
    id: "demo-2",
    title: "Óskar Hauksson — Ótrúleg varsla á tveimur leggjum",
    description:
      "Markvörðurinn hjá FH Hafnarfirði réddist þrisvar sinnum á einni sókn og varðveitti forystuna í deildarleiknum.",
    type: "save",
    player_name: "Óskar Hauksson",
    club_name: "FH Hafnarfjörður",
    team_name: "FH",
    opponent_team_name: "Víkingur",
    competition: "Úrvalsdeild",
    season: "2024",
    match_date: "2024-08-14",
    location: "Kaplakrikavöllur",
    external_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    video_url: null,
    tags: ["FH", "Varsla", "Markvörður"],
    submitted_by: "fh_faninn_95",
    submitted_by_club: "FH Hafnarfjörður",
    discussion_prompt: "Besta varslan á tímabilinu?",
    views: 6830,
    likes: 512,
    comments_count: 34,
  },
  {
    id: "demo-3",
    title: "Gísli Sigurðsson — Erlendu Meistaradeildina er stef",
    description:
      "Gísli Sigurðsson með glæsilega stoðsendingu í leiknum gegn Bayern München á Allianz Arena. Ísland á alþjóðlegri sviðsmynd.",
    type: "assist",
    player_name: "Gísli Sigurðsson",
    club_name: null,
    team_name: "RB Leipzig",
    opponent_team_name: "Bayern München",
    competition: "Meistaradeildin",
    season: "2024/25",
    match_date: "2024-11-05",
    location: "Allianz Arena",
    external_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    video_url: null,
    tags: ["Meistaradeildin", "Stoðsending", "Íslenski sérfræðingurinn"],
    submitted_by: "dr_football_admin",
    submitted_by_club: null,
    discussion_prompt: "Var þetta besta íslenski augnablikið erlendis í ár?",
    views: 52100,
    likes: 3890,
    comments_count: 201,
  },
  {
    id: "demo-4",
    title: "KR 4. flokkur — Markmaðurinn gleymir hvar hann er",
    description:
      "Markmaðurinn hjá KR-yngrum í 4. flokki heldur á boltanum handlangarlega og gefur Hauki beint möguleika. Samfélagið er á hliðinni!",
    type: "mistake",
    player_name: null,
    club_name: "KR",
    team_name: "KR U14",
    opponent_team_name: "Haukar U14",
    competition: "4. flokkur",
    season: "2024",
    match_date: "2024-05-18",
    location: "Hlíðarendi",
    external_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    video_url: null,
    tags: ["Klúður", "Local", "Fyndið", "4. flokkur"],
    submitted_by: "kris_siggi_81",
    submitted_by_club: "KR",
    discussion_prompt: "Hvað var hann að gera? 😂",
    views: 9100,
    likes: 743,
    comments_count: 57,
  },
];

export const mockCommentsByHighlight: Record<string, MockComment[]> = {
  "demo-1": [
    {
      id: "c1",
      author: "Siggi Fótbolti",
      avatar_initials: "SF",
      avatar_color: "#d7fb4f",
      body: "Þetta mark verður aldrei gleymt. Ég var á vellinum og hljóðið þegar netklokkurinn hljómaði var eins og þrumur.",
      created_at: "2024-10-20T21:15:00Z",
      likes: 47,
    },
    {
      id: "c2",
      author: "KRfaninn1907",
      avatar_initials: "KR",
      avatar_color: "#ff5a4e",
      body: "Hér er ég alveg sammála. Aron er ofurleikmaður. En við eigum enn möguleika næsta tímabil. Komum sterk!",
      created_at: "2024-10-20T21:40:00Z",
      likes: 12,
    },
    {
      id: "c3",
      author: "dr_football",
      avatar_initials: "DF",
      avatar_color: "#26d6ff",
      body: "Við ræddum þetta mark í nýjasta þættirnir. Hlustið á podcast-inn! Tengill í bio.",
      created_at: "2024-10-21T08:00:00Z",
      likes: 89,
    },
    {
      id: "c4",
      author: "Hrafnhildur92",
      avatar_initials: "HH",
      avatar_color: "#a78bfa",
      body: "Jæja, mark ársins er klárað. Takk Aron 🙏⚽",
      created_at: "2024-10-21T10:30:00Z",
      likes: 31,
    },
  ],
  "demo-2": [
    {
      id: "c5",
      author: "Varslan_er_allt",
      avatar_initials: "VA",
      avatar_color: "#26d6ff",
      body: "Markvörðurinn er ótrúlegur. Þrír björgunarnir á einni sókn — það er eitt af því besta sem ég hef séð.",
      created_at: "2024-08-14T20:05:00Z",
      likes: 28,
    },
    {
      id: "c6",
      author: "FH_faninn_95",
      avatar_initials: "FH",
      avatar_color: "#d7fb4f",
      body: "Óskar er alveg á öðru stigi. Hann á að vera í efstu deildinni erlendis!",
      created_at: "2024-08-14T22:00:00Z",
      likes: 19,
    },
  ],
  "demo-3": [
    {
      id: "c7",
      author: "LandsliðsFaninn",
      avatar_initials: "LF",
      avatar_color: "#d7fb4f",
      body: "Þetta er svo mikilvægt. Gísli er sönnunin þess að íslenskir leikmenn geta staðið sig á hæsta stigi.",
      created_at: "2024-11-05T22:30:00Z",
      likes: 103,
    },
    {
      id: "c8",
      author: "BundesligaBoy",
      avatar_initials: "BB",
      avatar_color: "#ff5a4e",
      body: "Ég sá þetta live á stadion! Hljóðið þegar Íslendingurinn skoraði var ótrúlegt.",
      created_at: "2024-11-06T07:15:00Z",
      likes: 67,
    },
    {
      id: "c9",
      author: "dr_football",
      avatar_initials: "DF",
      avatar_color: "#26d6ff",
      body: "Við settum þetta efst á lista yfir bestu íslensk augnablik erlendis á þessu ári. Fullkomin stoðsending.",
      created_at: "2024-11-06T09:00:00Z",
      likes: 145,
    },
  ],
  "demo-4": [
    {
      id: "c10",
      author: "Hlægilegasti_4_fl",
      avatar_initials: "H4",
      avatar_color: "#fb923c",
      body: "HAHAHA þetta er best sem ég hef séð á löngu. Strákurinn lítur bara í hina áttina! 😂😂",
      created_at: "2024-05-18T17:00:00Z",
      likes: 88,
    },
    {
      id: "c11",
      author: "KoachKristján",
      avatar_initials: "KK",
      avatar_color: "#a78bfa",
      body: "Sem þjálfari — þetta getur gerst. En við þurfum að vinna á þessu í æfingum 😅",
      created_at: "2024-05-18T18:30:00Z",
      likes: 41,
    },
  ],
};

export function getMockHighlight(id: string): MockHighlight | null {
  return mockHighlights.find((h) => h.id === id) ?? null;
}

export function getMockComments(highlightId: string): MockComment[] {
  return mockCommentsByHighlight[highlightId] ?? [];
}
