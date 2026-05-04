# Goalzone Product Plan

## Stutt lýsing

Goalzone er community-driven fótbolta-highlight vettvangur fyrir íslenska og alþjóðlega fótboltaumræðu.

Markmiðið er ekki bara að safna myndböndum. Markmiðið er að gera mörk, tilþrif, klúður og umdeild augnablik að efni sem miðill, podcast, réttindahafi og samfélag geta horft á, flokkað, deilt og rætt.

**Staðsetning vörunnar:**

> Goalzone er staðurinn þar sem fótboltamyndbönd verða að umræðu.

## Fyrir hvern er þetta?

### 1. Fótboltaáhorfendur

Áhorfendur vilja finna og deila klippum fljótt:

- mörk sem allir eru að tala um
- íslensk local augnablik sem annars týnast
- stór alþjóðleg augnablik úr Enska, Meistaradeild og stærstu nöfnunum
- beinir share-hlekkir á staka klippu
- einföld síun eftir keppni, flokki og stemningu

### 2. Dr. Football eða stór fótboltamiðill

Miðillinn þarf meira en video feed. Hann þarf efnisvél:

- setja inn klippur sem umræðuefni
- tengja klippur við þætti, greinar og samfélagsmiðla
- búa til "mark vikunnar", "klúður vikunnar", "umdeildasta atvikið"
- fá innsendingar frá samfélaginu
- hafa stjórn á því hvað fer út og hvenær
- geta unnið með réttindahöfum án þess að brjóta réttindi

### 3. Leyfishafar og rétthafar

Réttindahafi þarf einfaldan, öruggan bakenda:

- hlaða upp eða embedda official klippum
- merkja hvað má spila beint á Goalzone
- merkja hvað má bara linka út
- setja gildistíma á birtingu
- fjarlægja klippu strax ef réttindastaða breytist
- sjá hvað er að fá mest áhorf og umræðu

### 4. Samþykktir innsendendur

Samfélagið getur sent inn efni, en ekki beint á forsíðu:

- notandi sækir um að verða innsendandi
- admin samþykkir hlutverk
- innsendandi sendir inn klippu
- klippa fer alltaf í yfirferð
- admin lagar flokkun og samþykkir eða hafnar

## Kjarnapróblemið

Fótboltamyndbönd eru alls staðar, en umræðan er dreifð.

Á Íslandi týnast mörg local augnablik í stories, Messenger, X, TikTok eða lokuðum hópum. Á sama tíma eru stærstu umræðurnar oft um alþjóðleg augnablik: Enska, Meistaradeild, Messi, Ronaldo, dómaramál og viral klippur.

Goalzone sameinar þetta í eina vöru:

- local community uploads
- official/rightsholder uploads
- external embeds
- editorial flokkun
- umræðu- og deilingarlag

## Vörustefna

### Ísland fyrst, heimurinn með

Goalzone á að byrja á íslensku samfélagi en má ekki lokast þar. Dr. Football fjallar um allan fótbolta, þannig feedið þarf að bera bæði:

- Breiðablik gegn Val
- mark í 4. flokki
- Enska úrvalsdeildin
- Meistaradeildin
- Messi-klippa
- fyndið markmannsklúður
- umdeilt dómaramál

### Ekki bara archive

Goalzone á ekki að líta út eins og gagnagrunnur. Það á að líta út eins og staður sem fólk opnar til að horfa, ræða og senda áfram.

### Rights-aware frá byrjun

Allt efni þarf að hafa birtingarstöðu:

- má spila á Goalzone
- má embedda
- má bara linka út
- bíður réttindaskoðunar
- hafnað vegna réttinda
- rennur út á ákveðnum tíma

Þetta er mikilvægt sérstaklega fyrir deildir eins og Enska og Meistaradeildina.

## Núverandi MVP staða

Til staðar núna:

- Next.js app
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- hlutverk: viewer, pending_uploader, uploader, admin
- umsóknarflæði fyrir uploaders
- innsendingarflæði fyrir samþykkta uploaders/admins
- video upload í private bucket
- external video support
- admin yfirferð fyrir highlight
- samþykkt/hafnað flow
- public feed með samþykktum og spilanlegum klippum
- flokkar og demo highlights
- íslenskt UI by default
- einföld share virkni

## Það sem þarf fyrir alvöru kynningu

### 1. Forsíða

Forsíðan þarf að selja vöruna á 5 sekúndum.

Nauðsynlegt:

- stórt GOALZONE brand
- aðalklippa efst
- einföld síun
- skýr skilaboð: íslenskt community + alþjóðlegur fótbolti
- ekki of mikill texti
- klippur sem spilast á síðunni
- share-hnappar

Æskilegt:

- "Dr. Football val vikunnar"
- "Mest deilt"
- "Nýjast"
- "Umdeilt"
- "Local heroes"

### 2. Klippusíða

Hver klippa þarf sína eigin síðu:

- `/h/[id]`
- video player
- title
- flokkur
- keppni
- lið
- leikmaður
- dagsetning
- share metadata
- tengdar klippur
- umræðuspurning

Þetta er mikilvægt fyrir samfélagsmiðla. Þegar Dr. Football deilir einu marki þarf linkurinn að opna beint á það mark.

### 3. Betri flokkun

Núverandi flokkun er góð fyrir MVP, en þarf að verða vöruhæf.

Nýtt gagnamódel ætti að styðja:

- competitions
- seasons
- clubs
- teams
- players
- matches
- tags
- editorial collections
- rights holders
- rights status
- source type

Helstu flokkar fyrir feed:

- Ísland
- Enska
- Meistaradeildin
- Evrópa
- Landslið
- Stjörnurnar
- Local uploads
- Viral
- Umdeilt
- Fyndið
- Classic

Highlight tegundir:

- mark
- varsla
- stoðsending
- skot
- tilþrif
- klúður
- sjálfsmark
- fagnaðarlæti
- dómaramál
- annað

### 4. Einfaldur bakendi fyrir leyfishafa

Þetta er lykilatriði fyrir sölu.

Leyfishafi eða official partner þarf sér interface sem er léttara en admin-dev tól.

Þarf að geta:

- bætt við klippu
- hlaðið upp video eða sett inn embed
- valið keppni
- valið lið
- valið leikmann
- valið match
- valið birtingarstöðu
- valið réttindastöðu
- sett birtingardag
- sett expiry date
- vistað sem draft
- previewað public card
- birt strax
- tekið niður strax

Rights fields:

- rights_holder
- rights_status
- playback_allowed
- embed_allowed
- external_link_only
- geo_restriction
- expires_at
- takedown_reason
- reviewed_by
- reviewed_at

### 5. Editorial backend fyrir Dr. Football

Miðill þarf að geta búið til umræðu, ekki bara birt video.

Þarf að styðja:

- editorial title
- discussion prompt
- poll
- clip of the week
- topic collections
- podcast episode link
- article link
- sponsor label
- featured position
- publish/schedule

Dæmi:

- "Var þetta víti?"
- "Mark ársins?"
- "Hvað var markmaðurinn að gera?"
- "Þetta ræddum við í nýjasta þættinum"
- "Dr. Football velur 5 mörk helgarinnar"

### 6. Community upload öryggi

Community upload þarf að vera sterkt en einfalt.

Þarf að bæta:

- uploader terms
- copyright checkbox
- source declaration
- contact info
- club/team affiliation
- admin notes
- strike system
- trusted uploader flag
- automatic pending status
- moderation history

Uploaders ættu ekki að geta:

- birt beint án yfirferðar
- breytt samþykktum klippum án nýrrar yfirferðar
- sett inn obvious rights-protected stórdeildarefni án merkingar

### 7. Réttindi og compliance

Þetta þarf að vera tilbúið áður en rætt er við stóran aðila.

Nauðsynlegt:

- terms of use
- uploader agreement
- copyright takedown process
- privacy policy
- admin audit log
- takedown button
- rights status per highlight
- external embed validation
- blocked/unavailable video detection
- clear distinction between user-generated, official, embedded and linked content

Athugið: réttindastaða breytist reglulega og þarf alltaf að staðfesta við réttindahafa.

### 8. Analytics

Til að selja þetta þarf að sýna virði.

Mælingar:

- views
- unique viewers
- shares
- clicks
- completion rate
- top clips
- top competitions
- top uploaders
- top tags
- conversion to podcast/article/sponsor

Admin dashboard:

- mest skoðað í dag
- mest deilt
- bíður yfirferðar
- réttindavandamál
- uploaders með flest samþykkt
- klippur sem þarf að taka niður

### 9. Commercial model

Mögulegar tekjuleiðir:

- sponsor á "Mark vikunnar"
- sponsor á "Dr. Football val"
- sponsor á feed categories
- auglýsingar í kringum official clips
- partner dashboard fyrir réttindahafa
- white-label útgáfa fyrir miðla/félög
- premium community competitions

Sponsor hugmyndir:

- "Mark vikunnar í boði X"
- "Tilþrif helgarinnar"
- "Klúður vikunnar"
- "Dr. Football clip room"

## Roadmap

### Phase 1: Pitch-ready MVP

Markmið: hægt að sýna miðli vöruna með trúverðugum hætti.

Verkefni:

- klára polished forsíðu
- búa til klippusíðu `/h/[id]`
- bæta Open Graph metadata
- bæta rights_status við highlights
- bæta source_type við highlights
- bæta editorial fields við highlights
- bæta "discussion prompt"
- bæta "featured" flag
- bæta simple analytics counters
- búa til 20-30 góð demo records
- tryggja að demo videos séu embeddable
- útbúa pitch script

### Phase 2: Partner backend

Markmið: Dr. Football eða leyfishafi geti notað þetta án tæknimanns.

Verkefni:

- partner role
- partner dashboard
- simplified upload flow
- draft/publish flow
- preview card
- rights controls
- expiry controls
- takedown controls
- moderation notes
- search/filter í admin

### Phase 3: Community growth

Markmið: fá innsendingar og þátttöku.

Verkefni:

- uploader profiles
- trusted uploader status
- club/team pages
- public categories
- weekly collections
- share-first UX
- polls/reactions
- comments or moderated discussion
- report clip button

### Phase 4: Commercial layer

Markmið: gera vöruna tekjuhæfa.

Verkefni:

- sponsorship placements
- branded collections
- analytics reports
- campaign tracking
- partner exports
- media kit metrics

## Pitch narrative

### Opening

Dr. Football er þegar með stærsta samtalið um fótbolta á Íslandi. Goalzone getur orðið sjónræna lagið ofan á það samtal.

### Problem

Fótboltaklippur eru dreifðar, réttindastaða er óskýr og local augnablik týnast.

### Solution

Goalzone safnar klippum á einn stað, flokkar þær rétt, gerir þær deilanlegar og tengir þær við umræðu.

### Why now

Fótboltaumræða er sífellt meira video-driven. Fólk vill ekki bara heyra um markið, það vill sjá það, senda það og rífast um það.

### Why Dr. Football

Dr. Football hefur röddina, samfélagið og traustið. Goalzone gefur þeim vöru sem breytir umræðu í platform.

### Moat

Samþykktir innsendendur, editorial flokkun, local community, réttindavæn birting og tenging við stærsta fótboltasamtal landsins.

## Demo checklist fyrir kynningu

Fyrir kynningu þarf að geta sýnt:

- forsíðu með GOALZONE brandi
- aðalklippu sem spilar á síðunni
- síun eftir Ísland / Enska / CL / Stjörnurnar
- staka klippu með share link
- innskráningu
- umsókn sem uploader
- samþykktan uploader senda inn klippu
- admin yfirferð
- admin breytir flokkun og umræðuspurningu
- admin samþykkir
- klippa birtist opinberlega
- réttindastöðu á official/embedded/user-generated content
- analytics mock eða grunn dashboard

## Tæknileg forgangsröðun næst

1. Bæta við `/h/[id]` klippusíðu.
2. Bæta við rights fields í database.
3. Bæta við source type: user_upload, official_upload, youtube_embed, vimeo_embed, tiktok_embed, external_link.
4. Bæta við editorial fields: discussion_prompt, featured, featured_order, episode_url, article_url.
5. Bæta við partner role.
6. Bæta við partner/admin dashboard með search og filters.
7. Bæta við analytics counters.
8. Bæta við takedown/unpublish action.
9. Bæta við terms og uploader checkbox.
10. Búa til pitch demo content.

## Áhætta

### Réttindi

Stærsta áhættan er að birta efni sem Goalzone má ekki spila.

Mótvægisaðgerðir:

- rights_status á hverri klippu
- default pending
- official partner workflow
- external-link-only mode
- takedown flow
- audit log

### Gæði innsendinga

Community uploads geta verið misjöfn.

Mótvægisaðgerðir:

- samþykktir uploaders
- admin moderation
- trusted uploader status
- skýr flokkun

### Of flókið admin

Miðill notar þetta ekki ef bakendinn er of tæknilegur.

Mótvægisaðgerðir:

- partner-simple mode
- preview first
- required fields fá og skýr
- advanced fields falin undir "meira"

## Heimildir til að staðfesta réttindasamtal

Þessar heimildir eru ekki lögfræðilegt mat, en gagnlegar fyrir undirbúning:

- Premier League broadcast deals 2025-2028: https://www.premierleague.com/en/news/3703577
- Viaplay UEFA club competition rights 2024-2027: https://www.viaplaygroup.com/en/newsroom/press-releases/viaplay-group-show-uefa-club-competitions-five-nordic-countries-2239037

Réttindastaða þarf alltaf að vera staðfest beint við viðkomandi rétthafa áður en slíkt efni er birt sem hluti af commercial vöru.
