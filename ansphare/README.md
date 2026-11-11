# Ansphare — галерея дизайна и анимаций для повторения с Claude

Снимок [ansphare.com](https://ansphare.com) на 11.11.2026: **267 коротких видео** с дизайном (моушн, UI, веб, иллюстрация, 3D, брендинг, печать). Каждое можно отдать Claude, чтобы он повторил его кодом.

- [`catalog.json`](catalog.json) — все 267 работ как данные: название, раздел, автор, пост в X, прямая ссылка на видео, страница на inspora.design.
- [`method.md`](method.md) — как повторить любое видео из каталога с Claude (своими словами, бесплатно).

Видео принадлежат авторам (указаны и залинкованы). В репозиторий видео не копируются — только ссылки.

## Что за сайт

- **Ansphare, Inc.**, контакт contact@ansphare.com. Обещают 300+ дизайн-систем (DESIGN.md брендов: Apple, BMW, Tesla, Spotify, Stripe, Notion, GitHub, Airbnb, Uber), 120+ Claude Skills и 1200+ промптов. На деле на сайте открыта только галерея видео; страниц дизайн-систем и навыков нет (404).
- Разделы-фильтры: All, Illustration, 3D, Web, Motion, Branding, Print, Product. Работы взяты с [inspora.design](https://www.inspora.design) (ссылки «View»).
- Генератор DESIGN.md: вставляешь URL сайта → сервис читает HTML/CSS → файл с цветами, шрифтами, отступами, скруглениями и компонентами, который можно дать Claude. Тот же результат даёт просьба к Claude «сделай DESIGN.md по этому сайту».
- Кнопка **Prompt** — платная (подписка через Polar, вход через Supabase). Отдаёт файл `<имя>-skill.md` и команду `npx @ansphare/cli@latest add <имя> --creator="…"`.
- **Важно:** этот «промпт» — один общий шаблон для всех видео, без описания конкретной работы: «скачай видео → посмотри ffprobe → нарежь кадры ffmpeg (1 кадр в 2 с) → сделай React-компонент на Framer Motion + Tailwind + TypeScript». Платить за него смысла мало — то же самое описано в [`method.md`](method.md).
- Docs: поддерживаются npm / pnpm / yarn / bun; агенты — Claude, Cursor, ChatGPT, Gemini. «Skill V39» — по приглашениям. Submit (прислать работу) — только подписчикам.
- Возврат денег: 7 дней с покупки, если сервисом почти не пользовались; заявка на почту, рассмотрение 3–5 рабочих дней, деньги 5–10 дней. Отмена подписки — с конца оплаченного периода.

## Каталог

[Моушн (118)](#motion) · [Продукт / UI (60)](#product) · [Веб (46)](#web) · [Иллюстрация (26)](#illustration) · [3D (7)](#3d) · [Брендинг (7)](#branding) · [Печать (3)](#print)

<a id="motion"></a>
### Моушн — Motion (118)

| # | Работа | Автор | Видео |
|---|---|---|---|
| 5 | [delete account](https://www.inspora.design/posts/delete-account) | [@kshvbgde](https://x.com/kshvbgde/status/2117502283894362219) | [mp4](https://cdn.ansphare.com/Motion/keshav/delete_account/video.mp4) |
| 9 | [Kayaks on the water](https://www.inspora.design/posts/kayaks-on-the-water) | [@insporadesign](https://x.com/insporadesign/status/2114735861283668004) | [mp4](https://cdn.ansphare.com/Motion/Lagan_Bansal_⁂/Kayaks_on_the_water/video.mp4) |
| 41 | [Morph.](https://www.inspora.design/posts/morph-shap) | [@acream_1](https://x.com/acream_1/status/2096218045140398541) | [mp4](https://cdn.ansphare.com/Motion/Acream/Morph/video.mp4) |
| 42 | [Follower Count](https://www.inspora.design/posts/follower-count) | [@AdityaSur11](https://x.com/AdityaSur11/status/2094991203997774303) | [mp4](https://cdn.ansphare.com/Motion/Adi/Follower_Count/video.mp4) |
| 43 | [Components N3XT](https://www.inspora.design/posts/components-n3xt) | [@adriankuleszo](https://x.com/adriankuleszo/status/2088966530977738926) | [mp4](https://cdn.ansphare.com/Motion/Adrian/Components_N3XT/video.mp4) |
| 44 | [glowing loader](https://www.inspora.design/posts/glowing-loader) | [@sir_hsn](https://x.com/sir_hsn/status/2104474465317118390) | [mp4](https://cdn.ansphare.com/Motion/Alhasan_Husni_🍉/glowing_loader/video.mp4) |
| 45 | [This iPhone Duo animation](https://www.inspora.design/posts/iphone-duo) | [@avstorm](https://x.com/avstorm/status/2097747002285072533) | [mp4](https://cdn.ansphare.com/Motion/Andreas_Storm/This_iPhone_Duo_animation/video.mp4) |
| 46 | [Tap Get Invoice](https://www.inspora.design/posts/tap-get-invoice) | [@movindesign_](https://x.com/movindesign_/status/2101688131854483939) | [mp4](https://cdn.ansphare.com/Motion/Ankur/Tap_Get_Invoice/video.mp4) |
| 47 | [fluid tooltip animation](https://www.inspora.design/posts/fluid-tooltip-animation) | [@Anthony99_s](https://x.com/Anthony99_s/status/2114869597577023821) | [mp4](https://cdn.ansphare.com/Motion/Anthony_Lorenzo/fluid_tooltip_animation/video.mp4) |
| 48 | [voice model](https://www.inspora.design/posts/voice-model) | [@studiobakers](https://x.com/studiobakers/status/2105646091064791283) | [mp4](https://cdn.ansphare.com/Motion/Bakers_Studio/voice_model/video.mp4) |
| 49 | [3D gradient cards](https://www.inspora.design/posts/3d-gradient-cards) | [@basit_designs](https://x.com/basit_designs/status/2099771881159098710) | [mp4](https://cdn.ansphare.com/Motion/Basit_A._Khan/3D_gradient_cards/video.mp4) |
| 50 | [AI visual platform](https://www.inspora.design/posts/ai-visual-platform) | [@insporadesign](https://x.com/insporadesign/status/2109630810634547339) | [mp4](https://cdn.ansphare.com/Motion/Basit_A._Khan/AI_visual_platform/video.mp4) |
| 51 | [Experimental visual cards](https://www.inspora.design/posts/experimental-visual-cards) | [@basit_designs](https://x.com/basit_designs/status/2111783629336785222) | [mp4](https://cdn.ansphare.com/Motion/Basit_A._Khan/Experimental_visual_cards/video.mp4) |
| 52 | [glowing blue orb](https://www.inspora.design/posts/glowing-blue-orb) | [@basit_designs](https://x.com/basit_designs/status/1972956640220729731) | [mp4](https://cdn.ansphare.com/Motion/Basit_A._Khan/glowing_blue_orb/video.mp4) |
| 53 | [Mobile Gradient UI](https://www.inspora.design/posts/mobile-gradient) | [@basit_designs](https://x.com/basit_designs/status/2096283130844029227) | [mp4](https://cdn.ansphare.com/Motion/Basit_A._Khan/Mobile_Gradient_UI/video.mp4) |
| 54 | [UI cards](https://www.inspora.design/posts/ui-cards) | [@basit_designs](https://x.com/basit_designs/status/2114733820155134045) | [mp4](https://cdn.ansphare.com/Motion/Basit_A._Khan/UI_cards/video.mp4) |
| 55 | [Stamp Shader](https://www.inspora.design/posts/stamp-shader) | [@loficosmos1](https://x.com/loficosmos1/status/2099656245200191690) | [mp4](https://cdn.ansphare.com/Motion/Bill_(Yiqi)_Guo/Stamp_Shader/video.mp4) |
| 56 | [liquid metal](https://www.inspora.design/posts/iquid-metal) | [@BrettFromDJ](https://x.com/BrettFromDJ/status/2002114751078543846) | [mp4](https://cdn.ansphare.com/Motion/Brett/liquid_metal/video.mp4) |
| 57 | [Liquid metal button](https://www.inspora.design/posts/1-36) | [@BrettFromDJ](https://x.com/BrettFromDJ/status/2010781802382966950) | [mp4](https://cdn.ansphare.com/Motion/Brett/Liquid_metal_button/video.mp4) |
| 58 | [Dynamic Island Streak](https://www.inspora.design/posts/dynamic-island-streak) | [@calebwu_](https://x.com/calebwu_/status/2035377140024115308) | [mp4](https://cdn.ansphare.com/Motion/Caleb_Wu/Dynamic_Island_Streak/video.mp4) |
| 59 | [Toggle to premium plans](https://www.inspora.design/posts/1-20) | [@Designownow_](https://x.com/Designownow_/status/1905697958676582844) | [mp4](https://cdn.ansphare.com/Motion/Camden/Toggle_to_premium_plans/video.mp4) |
| 60 | [Portfolio Boarding Pass](https://www.inspora.design/posts/1-55) | [@cameronmoll](https://x.com/cameronmoll/status/2093333082912829808) | [mp4](https://cdn.ansphare.com/Motion/Cameron_Moll/Portfolio_Boarding_Pass/video.mp4) |
| 61 | [Smooth scroll with lens refraction.](https://www.inspora.design/posts/1-27) | [@colton__tollett](https://x.com/colton__tollett/status/2054175507181093201) | [mp4](https://cdn.ansphare.com/Motion/ColtonTollett/Smooth_scroll_with_lens_refraction/video.mp4) |
| 62 | [interactive folder cards](https://www.inspora.design/posts/interactive-folder-cards) | [@damienghader](https://x.com/damienghader/status/2117636269123469538) | [mp4](https://cdn.ansphare.com/Motion/damien/interactive_folder_cards/video.mp4) |
| 63 | [boarding pass printer](https://www.inspora.design/posts/boarding-pass-printer) | [@heydamir](https://x.com/heydamir/status/2094779813072363554) | [mp4](https://cdn.ansphare.com/Motion/Damir_Sokolovsky/boarding_pass_printer/video.mp4) |
| 64 | [color text in Notes](https://www.inspora.design/posts/color-text-in-notes) | [@heydamir](https://x.com/heydamir/status/2106779932659470606) | [mp4](https://cdn.ansphare.com/Motion/Damir_Sokolovsky/color_text_in_Notes/video.mp4) |
| 65 | [ticket stub](https://www.inspora.design/posts/ticket-stub) | [@darel023](https://x.com/darel023/status/2100915999956480403) | [mp4](https://cdn.ansphare.com/Motion/Daryl_Patigas/ticket_stub/video.mp4) |
| 66 | [File upload card](https://www.inspora.design/posts/file-upload-card) | [@dawoodui](https://x.com/dawoodui/status/1969430346845340148) | [mp4](https://cdn.ansphare.com/Motion/Dawood/File_upload_card/video.mp4) |
| 67 | [dropdown interaction](https://www.inspora.design/posts/1-54) | [@dejvdesign](https://x.com/dejvdesign/status/2092547295950618961) | [mp4](https://cdn.ansphare.com/Motion/DejvDesign/dropdown_interaction/video.mp4) |
| 68 | [bankitoxae frozen card](https://www.inspora.design/posts/bankito-frozen-card) | [@tyka_dominik](https://x.com/tyka_dominik/status/2053774403373068355) | [mp4](https://cdn.ansphare.com/Motion/Dominik_Tyka/bankitoxae_frozen_card/video.mp4) |
| 69 | [Ringwriter](https://www.inspora.design/posts/1-60) | [@edo_lunardi](https://x.com/edo_lunardi/status/2079129478630977948) | [mp4](https://cdn.ansphare.com/Motion/Edo/Ringwriter/video.mp4) |
| 70 | [apple style level components](https://www.inspora.design/posts/apple-style-level-components) | [@eliakuratli](https://x.com/eliakuratli/status/2104932927478042762) | [mp4](https://cdn.ansphare.com/Motion/Elia/apple_style_level_components/video.mp4) |
| 71 | [Literal file tree 🌳](https://www.inspora.design/posts/literal-file-tree) | [@FinnoTaylor](https://x.com/FinnoTaylor/status/2112286571999428676) | [mp4](https://cdn.ansphare.com/Motion/Finn_Taylor/Literal_file_tree_🌳/video.mp4) |
| 72 | [compressing images](https://www.inspora.design/posts/compressing-images) | [@gabriell_lab](https://x.com/gabriell_lab/status/2111073963719684163) | [mp4](https://cdn.ansphare.com/Motion/Gabriel/compressing_images/video.mp4) |
| 73 | [flying dropdown menu](https://www.inspora.design/posts/flying-dropdown-menu) | [@vanjek](https://x.com/vanjek/status/2107120208964116634) | [mp4](https://cdn.ansphare.com/Motion/George/flying_dropdown_menu/video.mp4) |
| 74 | [Orb  interaction](https://www.inspora.design/posts/orb-interation) | [@vanjek](https://x.com/vanjek/status/2090399194096005618) | [mp4](https://cdn.ansphare.com/Motion/George/Orb__interaction/video.mp4) |
| 75 | [Grok Bot can talk now](https://www.inspora.design/posts/grok-bot-can-talk-now) | [@bot](https://x.com/bot/status/2100659463569170779) | [mp4](https://cdn.ansphare.com/Motion/Grok_Bot/Grok_Bot_can_talk_now/video.mp4) |
| 76 | [We're making Grok Bot more widely available.](https://www.inspora.design/posts/1-23) | [@bot](https://x.com/bot/status/2090852881373311369) | [mp4](https://cdn.ansphare.com/Motion/Grok_Bot/We're_making_Grok_Bot_more_widely_available/video.mp4) |
| 77 | [angry sliders](https://www.inspora.design/posts/angry-sliders) | [@ggsimm](https://x.com/ggsimm/status/2099497518627184949) | [mp4](https://cdn.ansphare.com/Motion/gsimone/angry_sliders/video.mp4) |
| 78 | [Airport matrix time](https://www.inspora.design/posts/airport-matrix-time) | [@itshassco](https://x.com/itshassco/status/2106761271282737292) | [mp4](https://cdn.ansphare.com/Motion/HASSCOxa9/Airport_matrix_time/video.mp4) |
| 79 | [Watch face](https://www.inspora.design/posts/1-39) | [@itshassco](https://x.com/itshassco/status/2091467742209552818) | [mp4](https://cdn.ansphare.com/Motion/HASSCOxa9/Watch_face/video.mp4) |
| 80 | [mesh gradients](https://www.inspora.design/posts/mesh-gradients) | [@eyexayuh](https://x.com/eyexayuh/status/2107517313943564771) | [mp4](https://cdn.ansphare.com/Motion/Isaiah/mesh_gradients/video.mp4) |
| 81 | [Metal effect](https://www.inspora.design/posts/metal-effect) | [@Jakubantalik](https://x.com/Jakubantalik/status/2110761365681873237) | [mp4](https://cdn.ansphare.com/Motion/Jakub_Antalik/Metal_effect/video.mp4) |
| 82 | [Voice effect](https://www.inspora.design/posts/voice-effect) | [@Jakubantalik](https://x.com/Jakubantalik/status/2100620796796502264) | [mp4](https://cdn.ansphare.com/Motion/Jakub_Antalik/Voice_effect/video.mp4) |
| 83 | [Liquid metal button](https://www.inspora.design/posts/1-31) | [@tojawuzik](https://x.com/tojawuzik/status/2030958608112902316) | [mp4](https://cdn.ansphare.com/Motion/Jakub_Wuzik/Liquid_metal_button/video.mp4) |
| 84 | [Glass shader](https://www.inspora.design/posts/1-12) | [@jmtrivedi](https://x.com/jmtrivedi/status/1986572630292631861) | [mp4](https://cdn.ansphare.com/Motion/Janum_Trivedi/Glass_shader/video.mp4) |
| 85 | [wavy carousel](https://www.inspora.design/posts/1-22) | [@jmtrivedi](https://x.com/jmtrivedi/status/2000678707137036637) | [mp4](https://cdn.ansphare.com/Motion/Janum_Trivedi/wavy_carousel/video.mp4) |
| 86 | [Print Receipt](https://www.inspora.design/posts/1-35) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2056007595400527987) | [mp4](https://cdn.ansphare.com/Motion/Jeet/Print_Receipt/video.mp4) |
| 87 | [folder interaction](https://www.inspora.design/posts/folder-interaction) | [@shedsgns](https://x.com/shedsgns/status/2101668953567199247) | [mp4](https://cdn.ansphare.com/Motion/Juliette/folder_interaction/video.mp4) |
| 88 | [Paper fold animation](https://www.inspora.design/posts/paper-fold-animation) | [@justinwiese](https://x.com/justinwiese/status/2111102276379275282) | [mp4](https://cdn.ansphare.com/Motion/Justin/Paper_fold_animation/video.mp4) |
| 90 | [hypnotizing UI](https://www.inspora.design/posts/hypnotizing-ui) | [@k_grajeda](https://x.com/k_grajeda/status/2008640405886382541) | [mp4](https://cdn.ansphare.com/Motion/Kevin_Grajeda/hypnotizing_UI/video.mp4) |
| 91 | [Dynamic Island pixel-art horse](https://www.inspora.design/posts/dynamic-island-pixel-art-horse) | [@krispuckett](https://x.com/krispuckett/status/2103342411581882811) | [mp4](https://cdn.ansphare.com/Motion/Kris_Puckett/Dynamic_Island_pixel-art_horse/video.mp4) |
| 92 | [The Lord of Horses.](https://www.inspora.design/posts/the-lord-of-horses) | [@krispuckett](https://x.com/krispuckett/status/2102779394645459363) | [mp4](https://cdn.ansphare.com/Motion/Kris_Puckett/The_Lord_of_Horses/video.mp4) |
| 93 | [LookAway iOS](https://www.inspora.design/posts/lookaway-ios) | [@kushsolitary](https://x.com/kushsolitary/status/1941905197279920211) | [mp4](https://cdn.ansphare.com/Motion/kush/LookAway_iOS/video.mp4) |
| 95 | [ghost pass](https://www.inspora.design/posts/ghost-pass) | [@lochieaxon](https://x.com/lochieaxon/status/2098484382935949553) | [mp4](https://cdn.ansphare.com/Motion/lochie/ghost_pass/video.mp4) |
| 96 | [Eleven v4](https://www.inspora.design/posts/eleven-v4) | [@lorenzodossi](https://x.com/lorenzodossi/status/2104614174206939180) | [mp4](https://cdn.ansphare.com/Motion/Lorenzo_Dossi/Eleven_v4/video.mp4) |
| 97 | [3D interactive cassette-tape](https://www.inspora.design/posts/3d-interactive-cassette-tape) | [@louis_bcqt](https://x.com/louis_bcqt/status/2103456252298953188) | [mp4](https://cdn.ansphare.com/Motion/LOUIS/3D_interactive_cassette-tape/video.mp4) |
| 98 | [Cartridge portfolio](https://www.inspora.design/posts/cartridge-portfolio) | [@mamuso](https://x.com/mamuso/status/2097364642800787532) | [mp4](https://cdn.ansphare.com/Motion/Manuel_Muxf1oz_Solera/Cartridge_portfolio/video.mp4) |
| 99 | [Fluid liquid card carousel.](https://www.inspora.design/posts/fluid-liquid-card-carousel) | [@MarceloDesignX](https://x.com/MarceloDesignX/status/2105079940232122481) | [mp4](https://cdn.ansphare.com/Motion/Marcelo_Design_X/Fluid_liquid_card_carousel/video.mp4) |
| 100 | [Portfolio site idea](https://www.inspora.design/posts/portfolio-site-idea) | [@Markbuschn](https://x.com/Markbuschn/status/2117253652616298978) | [mp4](https://cdn.ansphare.com/Motion/Mark_Busch/Portfolio_site_idea/video.mp4) |
| 101 | [Component Anatomy](https://www.inspora.design/posts/component-anatomy) | [@MSchwaibold](https://x.com/MSchwaibold/status/2097463320521445446) | [mp4](https://cdn.ansphare.com/Motion/Marvin_Schwaibold/Component_Anatomy/video.mp4) |
| 102 | [generating UI using GPT-6 Astra](https://www.inspora.design/posts/gpt-6-astra) | [@MSchwaibold](https://x.com/MSchwaibold/status/2096059496812716307) | [mp4](https://cdn.ansphare.com/Motion/Marvin_Schwaibold/generating_UI_using_GPT-6_Astra/video.mp4) |
| 103 | [crumpled piece of paper](https://www.inspora.design/posts/crumpled-piece-of-paper) | [@Matthias_Oel](https://x.com/Matthias_Oel/status/2112182514286825716) | [mp4](https://cdn.ansphare.com/Motion/Matt/crumpled_piece_of_paper/video.mp4) |
| 104 | [club playing cards](https://www.inspora.design/posts/club-playing-cards) | [@MaelieLusson](https://x.com/MaelieLusson/status/2103254707536069117) | [mp4](https://cdn.ansphare.com/Motion/Maxeblie/club_playing_cards/video.mp4) |
| 105 | [Window controlled Dark mode](https://www.inspora.design/posts/1-61) | [@mjbarton_](https://x.com/mjbarton_/status/2093354383379399012) | [mp4](https://cdn.ansphare.com/Motion/mikey/Window_controlled_Dark_mode/video.mp4) |
| 106 | [Tiny animated SVG](https://www.inspora.design/posts/tiny-animated-svg) | [@bbssppllvv](https://x.com/bbssppllvv/status/2104747296671883312) | [mp4](https://cdn.ansphare.com/Motion/Mike_Bespalov/Tiny_animated_SVG/video.mp4) |
| 107 | [AI ends motion hiring.](https://www.inspora.design/posts/ai-ends-motion-hiring) | [@uxmiles](https://x.com/uxmiles/status/2104962333936353601) | [mp4](https://cdn.ansphare.com/Motion/Miles/AI_ends_motion_hiring/video.mp4) |
| 108 | [WOS Island Animations](https://www.inspora.design/posts/wos-island-animations) | [@murattenil](https://x.com/murattenil/status/2104628145458675789) | [mp4](https://cdn.ansphare.com/Motion/Murat/WOS_Island_Animations/video.mp4) |
| 109 | [Playful bottom nav](https://www.inspora.design/posts/playful-bottom-nav) | [@malikyoloo](https://x.com/malikyoloo/status/2112045568168255889) | [mp4](https://cdn.ansphare.com/Motion/M_A_L/Playful_bottom_nav/video.mp4) |
| 110 | [interaction collection layout](https://www.inspora.design/posts/collection-layout) | [@nickpylll](https://x.com/nickpylll/status/1791439663187570886) | [mp4](https://cdn.ansphare.com/Motion/Nick_Pyl/interaction_collection_layout/video.mp4) |
| 111 | [multi-action button](https://www.inspora.design/posts/multi-action-button) | [@nickpylll](https://x.com/nickpylll/status/1975480622773875178) | [mp4](https://cdn.ansphare.com/Motion/Nick_Pyl/multi-action_button/video.mp4) |
| 112 | [Moving mountains](https://www.inspora.design/posts/moving-mountains) | [@nicforey](https://x.com/nicforey/status/2117330727909883967) | [mp4](https://cdn.ansphare.com/Motion/nico/Moving_mountains/video.mp4) |
| 113 | [DESSN welcome envelope](https://www.inspora.design/posts/dessn-welcome-envelope) | [@eminimnim](https://x.com/eminimnim/status/2102147385237389413) | [mp4](https://cdn.ansphare.com/Motion/nim/DESSN_welcome_envelope/video.mp4) |
| 114 | [invite code interaction](https://www.inspora.design/posts/invite-code-interaction) | [@nitishkmrk](https://x.com/nitishkmrk/status/2103061978680086905) | [mp4](https://cdn.ansphare.com/Motion/Nitish_Khagwal/invite_code_interaction/video.mp4) |
| 115 | [spreadsheet UI](https://www.inspora.design/posts/spreadsheet-ui) | [@Nomandsign](https://x.com/Nomandsign/status/2117712985804484770) | [mp4](https://cdn.ansphare.com/Motion/Noman/spreadsheet_UI/video.mp4) |
| 116 | [Spider-Man web dropdown](https://www.inspora.design/posts/1-24) | [@nurpraditya](https://x.com/nurpraditya/status/2091155383230529703) | [mp4](https://cdn.ansphare.com/Motion/Nur_Praditya/Spider-Man_web_dropdown/video.mp4) |
| 117 | [A country picker](https://www.inspora.design/posts/1-41) | [@ozzyxs1a](https://x.com/ozzyxs1a/status/2074723991835566303) | [mp4](https://cdn.ansphare.com/Motion/ozzy/A_country_picker/video.mp4) |
| 118 | [galaxy brain effort slider](https://www.inspora.design/posts/galaxy-brain-effort-slider) | [@ozzyxs1a](https://x.com/ozzyxs1a/status/2107523169649389677) | [mp4](https://cdn.ansphare.com/Motion/ozzy/galaxy_brain_effort_slider/video.mp4) |
| 119 | [progress bars](https://www.inspora.design/posts/progress-bars) | [@ozzyxs1a](https://x.com/ozzyxs1a/status/2096799298243445098) | [mp4](https://cdn.ansphare.com/Motion/ozzy/progress_bars/video.mp4) |
| 120 | [Discord and Liveblocks UI cards](https://www.inspora.design/posts/discord-and-liveblocks-ui-cards) | [@oguzyagizkara](https://x.com/oguzyagizkara/status/2112524525917143529) | [mp4](https://cdn.ansphare.com/Motion/Oğuz_Yağız_Kara/Discord_and_Liveblocks_UI_cards/video.mp4) |
| 121 | [progress bar animation](https://www.inspora.design/posts/progress-bar-animation) | [@kippe07](https://x.com/kippe07/status/2105216988855542196) | [mp4](https://cdn.ansphare.com/Motion/Petar_Cirkovic/progress_bar_animation/video.mp4) |
| 122 | [Sidebar sub menu](https://www.inspora.design/posts/1-38) | [@ThatsPranav](https://x.com/ThatsPranav/status/2091478053025468727) | [mp4](https://cdn.ansphare.com/Motion/Pranav_Patel/Sidebar_sub_menu/video.mp4) |
| 123 | [github Contribution Graph](https://www.inspora.design/posts/github-contribution-graph) | [@Pratyusshmd](https://x.com/Pratyusshmd/status/2116803580011429957) | [mp4](https://cdn.ansphare.com/Motion/Pratyush/github_Contribution_Graph/video.mp4) |
| 124 | [ASCII cards](https://www.inspora.design/posts/ascii-cards) | [@praveenisomer](https://x.com/praveenisomer/status/2092222962153697540) | [mp4](https://cdn.ansphare.com/Motion/Praveen_Kumar/ASCII_cards/video.mp4) |
| 125 | [Dither and Ascii card](https://www.inspora.design/posts/dither-and-ascii-card) | [@praveenisomer](https://x.com/praveenisomer/status/2105983637615526301) | [mp4](https://cdn.ansphare.com/Motion/Praveen_Kumar/Dither_and_Ascii_card/video.mp4) |
| 126 | [Dither Cards](https://www.inspora.design/posts/dither-cards) | [@praveenisomer](https://x.com/praveenisomer/status/2094387224574108054) | [mp4](https://cdn.ansphare.com/Motion/Praveen_Kumar/Dither_Cards/video.mp4) |
| 127 | [Payment plans](https://www.inspora.design/posts/1-51) | [@piyushkacha75](https://x.com/piyushkacha75/status/1953676339292029231) | [mp4](https://cdn.ansphare.com/Motion/Praveen_Kumar/Payment_plans/video.mp4) |
| 128 | [Genres filter](https://www.inspora.design/posts/genres-filter) | [@proskuaaa](https://x.com/proskuaaa/status/2084153539568492917) | [mp4](https://cdn.ansphare.com/Motion/prosku.a/Genres_filter/video.mp4) |
| 129 | [voice note / interaction](https://www.inspora.design/posts/1-47) | [@proskuaaa](https://x.com/proskuaaa/status/1955133897265541567) | [mp4](https://cdn.ansphare.com/Motion/prosku.a/voice_note__interaction/video.mp4) |
| 130 | [Photo download UI design.](https://www.inspora.design/posts/photo-download-ui-design) | [@RaminNasibov](https://x.com/RaminNasibov/status/2115540373762150529) | [mp4](https://cdn.ansphare.com/Motion/Ramin_Nasibov/Photo_download_UI_design/video.mp4) |
| 131 | [Emotion Shader](https://www.inspora.design/posts/1-43) | [@raul_dronca](https://x.com/raul_dronca/status/2023027178477355308) | [mp4](https://cdn.ansphare.com/Motion/Raul/Emotion_Shader/video.mp4) |
| 132 | [macOS Folder Icon Timeline](https://www.inspora.design/posts/folder-icon-timeline) | [@raul_dronca](https://x.com/raul_dronca/status/2102715944938418349) | [mp4](https://cdn.ansphare.com/Motion/Raul/macOS_Folder_Icon_Timeline/video.mp4) |
| 133 | [photos folders](https://www.inspora.design/posts/photo-folders) | [@raul_dronca](https://x.com/raul_dronca/status/2094833092171100390) | [mp4](https://cdn.ansphare.com/Motion/Raul/photos_folders/video.mp4) |
| 134 | [Shader Dial](https://www.inspora.design/posts/shader-dial) | [@raul_dronca](https://x.com/raul_dronca/status/2097258328292249947) | [mp4](https://cdn.ansphare.com/Motion/Raul/Shader_Dial/video.mp4) |
| 135 | [Shader Stamps](https://www.inspora.design/posts/1-14) | [@raul_dronca](https://x.com/raul_dronca/status/2090037588639744306) | [mp4](https://cdn.ansphare.com/Motion/Raul/Shader_Stamps/video.mp4) |
| 136 | [Speed Slider](https://www.inspora.design/posts/1-29) | [@raul_dronca](https://x.com/raul_dronca/status/2090786420411547686) | [mp4](https://cdn.ansphare.com/Motion/Raul/Speed_Slider/video.mp4) |
| 137 | [Thanos snap ticket](https://www.inspora.design/posts/thanos-snap-ticket) | [@rehanxahmed](https://x.com/rehanxahmed/status/2103826960686436759) | [mp4](https://cdn.ansphare.com/Motion/Rehan_Ahmed/Thanos_snap_ticket/video.mp4) |
| 138 | [App review](https://www.inspora.design/posts/app-review) | [@RobSwish](https://x.com/RobSwish/status/2099231722449641749) | [mp4](https://cdn.ansphare.com/Motion/Rob_Swift/App_review/video.mp4) |
| 139 | [Bleep App](https://www.inspora.design/posts/bleep-app) | [@rnmp](https://x.com/rnmp/status/2095497037408039366) | [mp4](https://cdn.ansphare.com/Motion/Rolando/Bleep_App/video.mp4) |
| 140 | [Event Swatch](https://www.inspora.design/posts/1-45) | [@artntek](https://x.com/artntek/status/2092361432251703541) | [mp4](https://cdn.ansphare.com/Motion/sam/Event_Swatch/video.mp4) |
| 141 | [fluid illumination](https://www.inspora.design/posts/fluid-illumination) | [@sashabirukoff](https://x.com/sashabirukoff/status/2105335164532355314) | [mp4](https://cdn.ansphare.com/Motion/sasha_birukoff/fluid_illumination/video.mp4) |
| 142 | [composer mockup](https://www.inspora.design/posts/composer-mockup) | [@SebCornelius](https://x.com/SebCornelius/status/2101052847940943918) | [mp4](https://cdn.ansphare.com/Motion/Seb_Cornelius/composer_mockup/video.mp4) |
| 143 | [heart rate tracker](https://www.inspora.design/posts/heart-rate-tracker) | [@serhandesign](https://x.com/serhandesign/status/2118018677840712138) | [mp4](https://cdn.ansphare.com/Motion/Serhan_Baydı/heart_rate_tracker/video.mp4) |
| 144 | [X post cards](https://www.inspora.design/posts/x-post-cards) | [@zzzzshawn](https://x.com/zzzzshawn/status/2109648259644014721) | [mp4](https://cdn.ansphare.com/Motion/shawn/X_post_cards/video.mp4) |
| 145 | [black hole.mp4](https://www.inspora.design/posts/black-hole-mp4) | [@buildwithsid](https://x.com/buildwithsid/status/2112492064336388249) | [mp4](https://cdn.ansphare.com/Motion/siddharth/black_hole.mp4/video.mp4) |
| 146 | [Data Collect](https://www.inspora.design/posts/data-collect) | [@slavakornilov](https://x.com/slavakornilov/status/2079295477510468068) | [mp4](https://cdn.ansphare.com/Motion/Slava/Data_Collect/video.mp4) |
| 147 | [3D paid stamp](https://www.inspora.design/posts/paid-stamp) | [@SolutionB2u](https://x.com/SolutionB2u/status/2099695046178083303) | [mp4](https://cdn.ansphare.com/Motion/solutionb/3D_paid_stamp/video.mp4) |
| 148 | [shark ascii animation](https://www.inspora.design/posts/shark-ascii-animation) | [@stackedlol](https://x.com/stackedlol/status/2112257760628986188) | [mp4](https://cdn.ansphare.com/Motion/stacked/shark_ascii_animation/video.mp4) |
| 149 | [Animated code input.](https://www.inspora.design/posts/animated-code-input) | [@sucodeee](https://x.com/sucodeee/status/2107420636113191248) | [mp4](https://cdn.ansphare.com/Motion/sucodee/Animated_code_input/video.mp4) |
| 150 | [glyphblue](https://www.inspora.design/posts/glyphblue) | [@sucodeee](https://x.com/sucodeee/status/2117597519882424697) | [mp4](https://cdn.ansphare.com/Motion/sucodee/glyphblue/video.mp4) |
| 151 | [Grid Reveal animation](https://www.inspora.design/posts/1-46) | [@SwamiMalode](https://x.com/SwamiMalode/status/2092578177092931724) | [mp4](https://cdn.ansphare.com/Motion/Swami/Grid_Reveal_animation/video.mp4) |
| 152 | [navbar component](https://www.inspora.design/posts/gooey-navbar-component) | [@SwamiMalode](https://x.com/SwamiMalode/status/2094065656648134690) | [mp4](https://cdn.ansphare.com/Motion/Swami/navbar_component/video.mp4) |
| 153 | [AI keychain.](https://www.inspora.design/posts/ai-keychain) | [@premiumtantan](https://x.com/premiumtantan/status/2105090941690454255) | [mp4](https://cdn.ansphare.com/Motion/Txe2n_Txe2n_Nguyễn/AI_keychain/video.mp4) |
| 154 | [HEIC File Upload](https://www.inspora.design/posts/heic-file-upload) | [@yanhladchenko](https://x.com/yanhladchenko/status/2092915788206211251) | [mp4](https://cdn.ansphare.com/Motion/Yan_Hladchenko/HEIC_File_Upload/video.mp4) |
| 155 | [order-status card](https://www.inspora.design/posts/order-status-card) | [@zahragr8r](https://x.com/zahragr8r/status/2104058418223034382) | [mp4](https://cdn.ansphare.com/Motion/Zahra/order-status_card/video.mp4) |
| 156 | [elemental cards.](https://www.inspora.design/posts/elemental-cards) | [@kaolti](https://x.com/kaolti/status/2110322552841056689) | [mp4](https://cdn.ansphare.com/Motion/Zsolt_Kacso/elemental_cards/video.mp4) |
| 157 | [icons for iPhone Duo](https://www.inspora.design/posts/icons-for-iphone-duo) | [@helvetiica](https://x.com/helvetiica/status/2097763549489586342) | [mp4](https://cdn.ansphare.com/Motion/˗ˏˋ_Vinoth_Ragunathan_ˊˎ˗/icons_for_iPhone_Duo/video.mp4) |
| 158 | [Onboarding](https://www.inspora.design/posts/onboarding) | [@LgyLight](https://x.com/LgyLight/status/2102044194122666257) | [mp4](https://cdn.ansphare.com/Motion/三秋十李_Sergio/Onboarding/video.mp4) |

<a id="product"></a>
### Продукт / UI — Product (60)

| # | Работа | Автор | Видео |
|---|---|---|---|
| 162 | [letters to strangers](https://www.inspora.design/posts/letters-to-strangers) | [@azhassan_](https://x.com/azhassan_/status/2117274280991846539) | [mp4](https://cdn.ansphare.com/Product/A._Hassan/letters_to_strangers/video.mp4) |
| 163 | [Task Card](https://www.inspora.design/posts/task-card) | [@adriankuleszo](https://x.com/adriankuleszo/status/2094402386383208575) | [mp4](https://cdn.ansphare.com/Product/Adrian/Task_Card/video.mp4) |
| 164 | [AI prompt bar](https://www.inspora.design/posts/ai-prompt-bar) | [@socoloffalex](https://x.com/socoloffalex/status/2096575723142099027) | [mp4](https://cdn.ansphare.com/Product/Alex_Socoloff/AI_prompt_bar/video.mp4) |
| 165 | [Blurry Pioneer interfaces](https://www.inspora.design/posts/blurry-pioneer-interfaces) | [@studiobakers](https://x.com/studiobakers/status/2104517724508684299) | [mp4](https://cdn.ansphare.com/Product/Bakers_Studio/Blurry_Pioneer_interfaces/video.mp4) |
| 166 | [glass circle with a gradient](https://www.inspora.design/posts/glass-circle-with-a-gradient) | [@studiobakers](https://x.com/studiobakers/status/2101986043469652277) | [mp4](https://cdn.ansphare.com/Product/Bakers_Studio/glass_circle_with_a_gradient/video.mp4) |
| 167 | [Pick your Plan](https://www.inspora.design/posts/pick-your-plan) | [@basit_designs](https://x.com/basit_designs/status/2060761601893118387) | [mp4](https://cdn.ansphare.com/Product/Basit_A._Khan/Pick_your_Plan/video.mp4) |
| 168 | [data security UI](https://www.inspora.design/posts/data-security-ui) | [@thebatukara](https://x.com/thebatukara/status/2115763764050243716) | [mp4](https://cdn.ansphare.com/Product/Batuhan_Kara/data_security_UI/video.mp4) |
| 169 | [AI agent dashboard](https://www.inspora.design/posts/ai-agent-dashboard) | [@BenceRedmond](https://x.com/BenceRedmond/status/2109721669849755906) | [mp4](https://cdn.ansphare.com/Product/Bence_Redmond/AI_agent_dashboard/video.mp4) |
| 170 | [card details microinteraction](https://www.inspora.design/posts/1-34) | [@bodya_zhk](https://x.com/bodya_zhk/status/2090854247604638145) | [mp4](https://cdn.ansphare.com/Product/Bogdan/card_details_microinteraction/video.mp4) |
| 171 | [pill buttons](https://www.inspora.design/posts/pill-buttons) | [@wherescz](https://x.com/wherescz/status/2100473433897222224) | [mp4](https://cdn.ansphare.com/Product/cz/pill_buttons/video.mp4) |
| 172 | [Folders UI](https://www.inspora.design/posts/folders-ui) | [@david_visuals_](https://x.com/david_visuals_/status/2110699870600515737) | [mp4](https://cdn.ansphare.com/Product/David/Folders_UI/video.mp4) |
| 173 | [glass slider experiment](https://www.inspora.design/posts/glass-slider-experiment) | [@imsethidev](https://x.com/imsethidev/status/2114653215405072875) | [mp4](https://cdn.ansphare.com/Product/Dev/glass_slider_experiment/video.mp4) |
| 174 | [a file-management dashboard](https://www.inspora.design/posts/file-management-dashboard) | [@UI_Farhan](https://x.com/UI_Farhan/status/2094339072378761342) | [mp4](https://cdn.ansphare.com/Product/Farhan/a_file-management_dashboard/video.mp4) |
| 175 | [onboarding screen](https://www.inspora.design/posts/onboarding-screen) | [@FarzadGodarz](https://x.com/FarzadGodarz/status/2096601915807187433) | [mp4](https://cdn.ansphare.com/Product/Farzad_Godarz/onboarding_screen/video.mp4) |
| 176 | [travel app](https://www.inspora.design/posts/travel-app) | [@FarzadGodarz](https://x.com/FarzadGodarz/status/2099157798307180785) | [mp4](https://cdn.ansphare.com/Product/Farzad_Godarz/travel_app/video.mp4) |
| 177 | [AI scheduler](https://www.inspora.design/posts/ai-scheduler) | [@fayazara](https://x.com/fayazara/status/2104915749206896758) | [mp4](https://cdn.ansphare.com/Product/Fayaz_Ahmed/AI_scheduler/video.mp4) |
| 178 | [Chat component interaction](https://www.inspora.design/posts/chat-component-interaction) | [@flohoeller](https://x.com/flohoeller/status/2102660458658582913) | [mp4](https://cdn.ansphare.com/Product/Flo/Chat_component_interaction/video.mp4) |
| 179 | [Project card component](https://www.inspora.design/posts/project-card-component) | [@flohoeller](https://x.com/flohoeller/status/2109230261858656727) | [mp4](https://cdn.ansphare.com/Product/Flo/Project_card_component/video.mp4) |
| 180 | [Usage meter component](https://www.inspora.design/posts/usage-meter-component) | [@flohoeller](https://x.com/flohoeller/status/2108496176643551672) | [mp4](https://cdn.ansphare.com/Product/Flo/Usage_meter_component/video.mp4) |
| 181 | [downloading an invoice](https://www.inspora.design/posts/downloading-an-invoice) | [@gabriell_lab](https://x.com/gabriell_lab/status/2106368592786698733) | [mp4](https://cdn.ansphare.com/Product/Gabriel/downloading_an_invoice/video.mp4) |
| 182 | [Dropdown Component](https://www.inspora.design/posts/dropdown-component) | [@gabriell_lab](https://x.com/gabriell_lab/status/2086065082279079968) | [mp4](https://cdn.ansphare.com/Product/Gabriel/Dropdown_Component/video.mp4) |
| 183 | [payment links](https://www.inspora.design/posts/payment-links) | [@gabriell_lab](https://x.com/gabriell_lab/status/2102017214316441868) | [mp4](https://cdn.ansphare.com/Product/Gabriel/payment_links/video.mp4) |
| 184 | [Sidebar Active State](https://www.inspora.design/posts/sidebar-active-state) | [@heyimgustavo](https://x.com/heyimgustavo/status/2098497808512745559) | [mp4](https://cdn.ansphare.com/Product/Gustavo/Sidebar_Active_State/video.mp4) |
| 185 | [Agent Handoff](https://www.inspora.design/posts/1-48) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2086804226777420177) | [mp4](https://cdn.ansphare.com/Product/Jeet/Agent_Handoff/video.mp4) |
| 186 | [Agent Plan](https://www.inspora.design/posts/agent-plan) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2051294751694192794) | [mp4](https://cdn.ansphare.com/Product/Jeet/Agent_Plan/video.mp4) |
| 187 | [Coding agent](https://www.inspora.design/posts/coding-agent) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2049115937677447621) | [mp4](https://cdn.ansphare.com/Product/Jeet/Coding_agent/video.mp4) |
| 188 | [Date Range Picker](https://www.inspora.design/posts/1-30) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2085725970720591984) | [mp4](https://cdn.ansphare.com/Product/Jeet/Date_Range_Picker/video.mp4) |
| 189 | [Deploy Pipeline](https://www.inspora.design/posts/deploy-pipeline) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2060358955273195958) | [mp4](https://cdn.ansphare.com/Product/Jeet/Deploy_Pipeline/video.mp4) |
| 190 | [Meeting Finder](https://www.inspora.design/posts/1-44) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2084627211257339954) | [mp4](https://cdn.ansphare.com/Product/Jeet/Meeting_Finder/video.mp4) |
| 191 | [Mini calendar](https://www.inspora.design/posts/1-58) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2051643988910973241) | [mp4](https://cdn.ansphare.com/Product/Jeet/Mini_calendar/video.mp4) |
| 192 | [RAG Pipeline](https://www.inspora.design/posts/rag-pipeline) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2095507715556831429) | [mp4](https://cdn.ansphare.com/Product/Jeet/RAG_Pipeline/video.mp4) |
| 193 | [Sandbox Boot Sequence](https://www.inspora.design/posts/sandbox-boot-sequence) | [@jeetnirnejak](https://x.com/jeetnirnejak/status/2056358774320054469) | [mp4](https://cdn.ansphare.com/Product/Jeet/Sandbox_Boot_Sequence/video.mp4) |
| 194 | [agent dashboard](https://www.inspora.design/posts/agent-dashboard) | [@barret_jessy](https://x.com/barret_jessy/status/2110037849676656660) | [mp4](https://cdn.ansphare.com/Product/Jessy_Barret/agent_dashboard/video.mp4) |
| 195 | [a calendar booking page](https://www.inspora.design/posts/a-calendar-booking-page) | [@jonsouyang](https://x.com/jonsouyang/status/2105001165960466617) | [mp4](https://cdn.ansphare.com/Product/Jonathan_Ouyang/a_calendar_booking_page/video.mp4) |
| 196 | [Tracking cards](https://www.inspora.design/posts/tracking-cards) | [@JulienRenvoye](https://x.com/JulienRenvoye/status/2098075859055772158) | [mp4](https://cdn.ansphare.com/Product/Julien/Tracking_cards/video.mp4) |
| 197 | [AI Agent Approval Cards](https://www.inspora.design/posts/1-37) | [@kvnkld](https://x.com/kvnkld/status/2091872121857437849) | [mp4](https://cdn.ansphare.com/Product/Kevin/AI_Agent_Approval_Cards/video.mp4) |
| 198 | [Morphing braille loader](https://www.inspora.design/posts/1-42) | [@kianbazza](https://x.com/kianbazza/status/2023881894920937728) | [mp4](https://cdn.ansphare.com/Product/kian_bazza/Morphing_braille_loader/video.mp4) |
| 199 | [Look Away preview](https://www.inspora.design/posts/look-away-preview) | [@kushsolitary](https://x.com/kushsolitary/status/1988585065266168148) | [mp4](https://cdn.ansphare.com/Product/kush/Look_Away_preview/video.mp4) |
| 200 | [Soft glass workspace picker.](https://www.inspora.design/posts/soft-glass-workspace-picker) | [@kylethacker](https://x.com/kylethacker/status/2106909046880244165) | [mp4](https://cdn.ansphare.com/Product/Kyle_Thacker/Soft_glass_workspace_picker/video.mp4) |
| 201 | [Quiet overlapping clocks](https://www.inspora.design/posts/quiet-overlapping-clocks) | [@tweetbylokki](https://x.com/tweetbylokki/status/2104270096851939804) | [mp4](https://cdn.ansphare.com/Product/Lokki/Quiet_overlapping_clocks/video.mp4) |
| 202 | [theme for Claude Code](https://www.inspora.design/posts/theme-for-claude-code) | [@handsher_NGU](https://x.com/handsher_NGU/status/2115618341675319417) | [mp4](https://cdn.ansphare.com/Product/Marko_Vineli/theme_for_Claude_Code/video.mp4) |
| 203 | [Model router](https://www.inspora.design/posts/model-router) | [@disarto_max](https://x.com/disarto_max/status/2106420376548815238) | [mp4](https://cdn.ansphare.com/Product/Maxim_Kuznetsov/Model_router/video.mp4) |
| 204 | [Support analytics](https://www.inspora.design/posts/support-analytics) | [@disarto_max](https://x.com/disarto_max/status/2099609107787337930) | [mp4](https://cdn.ansphare.com/Product/Maxim_Kuznetsov/Support_analytics/video.mp4) |
| 205 | [Session progress and recovery timeline](https://www.inspora.design/posts/session-progress-and-recovery-timeline) | [@ShohanUIX](https://x.com/ShohanUIX/status/2100619974125424683) | [mp4](https://cdn.ansphare.com/Product/Md_Shohanur_Rahman/Session_progress_and_recovery_timeline/video.mp4) |
| 206 | [Artistic fintech UI](https://www.inspora.design/posts/artistic-fintech) | [@MoizArshi29](https://x.com/MoizArshi29/status/2100228031113793717) | [mp4](https://cdn.ansphare.com/Product/Moiz_Arshi/Artistic_fintech_UI/video.mp4) |
| 207 | [document signature](https://www.inspora.design/posts/document-signature) | [@nickpylll](https://x.com/nickpylll/status/1830533429697392656) | [mp4](https://cdn.ansphare.com/Product/Nick_Pyl/document_signature/video.mp4) |
| 208 | [onboarding flow](https://www.inspora.design/posts/onboarding-flow) | [@nickpylll](https://x.com/nickpylll/status/1949745464338784725) | [mp4](https://cdn.ansphare.com/Product/Nick_Pyl/onboarding_flow/video.mp4) |
| 209 | [audience data](https://www.inspora.design/posts/audience-data) | [@moguzbulbul](https://x.com/moguzbulbul/status/2102770266506232308) | [mp4](https://cdn.ansphare.com/Product/Oğuz_B/audience_data/video.mp4) |
| 210 | [Sticky-note app](https://www.inspora.design/posts/sticky-note-app) | [@rehanxahmed](https://x.com/rehanxahmed/status/2104103142766076328) | [mp4](https://cdn.ansphare.com/Product/Rehan_Ahmed/Sticky-note_app/video.mp4) |
| 211 | [morphing nav bar](https://www.inspora.design/posts/morphing-nav) | [@renzobianchi_](https://x.com/renzobianchi_/status/2097400239162351924) | [mp4](https://cdn.ansphare.com/Product/Renzo_Bianchi/morphing_nav_bar/video.mp4) |
| 212 | [orbloom](https://www.inspora.design/posts/orb-loom) | [@rickybharti](https://x.com/rickybharti/status/2097293882153177142) | [mp4](https://cdn.ansphare.com/Product/Ricky/orbloom/video.mp4) |
| 213 | [analytics dashboard](https://www.inspora.design/posts/1-17) | [@_heyrico](https://x.com/_heyrico/status/2007060067250794909) | [mp4](https://cdn.ansphare.com/Product/rico/analytics_dashboard/video.mp4) |
| 214 | [Crypto payment app](https://www.inspora.design/posts/crypto-payment-app) | [@Hollysem](https://x.com/Hollysem/status/2109628383156170792) | [mp4](https://cdn.ansphare.com/Product/Sergei_Semenov/Crypto_payment_app/video.mp4) |
| 215 | [Plasma app](https://www.inspora.design/posts/plasma-app) | [@Hollysem](https://x.com/Hollysem/status/2112523746489798727) | [mp4](https://cdn.ansphare.com/Product/Sergei_Semenov/Plasma_app/video.mp4) |
| 216 | [Agent cards](https://www.inspora.design/posts/agent-cards) | [@0xSphere](https://x.com/0xSphere/status/2103092784026591293) | [mp4](https://cdn.ansphare.com/Product/Studio_Sphere/Agent_cards/video.mp4) |
| 217 | [Temperature as a material.](https://www.inspora.design/posts/temperature-as-a-material) | [@0xsphere](https://x.com/0xsphere/status/2099830589759307973) | [mp4](https://cdn.ansphare.com/Product/Studio_Sphere/Temperature_as_a_material/video.mp4) |
| 218 | [Hook sidebar](https://www.inspora.design/posts/hook-sidebar) | [@SwamiMalode](https://x.com/SwamiMalode/status/2094788685254570117) | [mp4](https://cdn.ansphare.com/Product/Swami/Hook_sidebar/video.mp4) |
| 219 | [Product comps](https://www.inspora.design/posts/product-comps) | [@Swaraj524](https://x.com/Swaraj524/status/2049471785780048097) | [mp4](https://cdn.ansphare.com/Product/Swaraj/Product_comps/video.mp4) |
| 220 | [Paperclip interaction](https://www.inspora.design/posts/paperclip-interaction) | [@SyadySyarief](https://x.com/SyadySyarief/status/2102974323745337845) | [mp4](https://cdn.ansphare.com/Product/Syady/Paperclip_interaction/video.mp4) |
| 221 | [Time for different time zones](https://www.inspora.design/posts/time-zones) | [@tar_uniqueee](https://x.com/tar_uniqueee/status/2084571288866050111) | [mp4](https://cdn.ansphare.com/Product/Taras/Time_for_different_time_zones/video.mp4) |

<a id="web"></a>
### Веб — Web (46)

| # | Работа | Автор | Видео |
|---|---|---|---|
| 3 | [Shark on vacation](https://www.inspora.design/posts/shark-on-vacation) | [@handsher_NGU](https://x.com/handsher_NGU/status/2114499451918197060) | [mp4](https://cdn.ansphare.com/Web/Marko_Vineli/Shark_on_vacation/video.mp4) |
| 4 | [Footer](https://www.inspora.design/posts/sticker-footer) | [@oiharshit](https://x.com/oiharshit/status/2096219209550455207) | [mp4](https://cdn.ansphare.com/Web/Harshit/Footer/video.mp4) |
| 222 | [interactive footer](https://www.inspora.design/posts/interactive-footer) | [@AdityaSur11](https://x.com/AdityaSur11/status/2096948017819701605) | [mp4](https://cdn.ansphare.com/Web/Adi/interactive_footer/video.mp4) |
| 223 | [Footer design animated](https://www.inspora.design/posts/footer-design-animated) | [@AlfiFromToasty](https://x.com/AlfiFromToasty/status/2117693388749443320) | [mp4](https://cdn.ansphare.com/Web/Alfi/Footer_design_animated/video.mp4) |
| 224 | [footer train animation](https://www.inspora.design/posts/train-animation) | [@alimdesigner_](https://x.com/alimdesigner_/status/2097580771334893836) | [mp4](https://cdn.ansphare.com/Web/Alim_Joldaspayev/footer_train_animation/video.mp4) |
| 225 | [new portfolio](https://www.inspora.design/posts/new-portfolio) | [@alimdesigner_](https://x.com/alimdesigner_/status/2106381720421609816) | [mp4](https://cdn.ansphare.com/Web/Alim_Joldaspayev/new_portfolio/video.mp4) |
| 226 | [QED landing page](https://www.inspora.design/posts/qed-landing-page) | [@alimdesigner_](https://x.com/alimdesigner_/status/2107101222662750621) | [mp4](https://cdn.ansphare.com/Web/Alim_Joldaspayev/QED_landing_page/video.mp4) |
| 227 | [Portfolio Gameboy](https://www.inspora.design/posts/portfolio-gameboy) | [@Angaisb_](https://x.com/Angaisb_/status/2095964361105789424) | [mp4](https://cdn.ansphare.com/Web/Angel_🌼/Portfolio_Gameboy/video.mp4) |
| 228 | [interactive UI components](https://www.inspora.design/posts/interactive-ui-components) | [@anishfn](https://x.com/anishfn/status/2107893629775995329) | [mp4](https://cdn.ansphare.com/Web/anish/interactive_UI_components/video.mp4) |
| 229 | [folder component](https://www.inspora.design/posts/1-13) | [@designbyaron](https://x.com/designbyaron/status/2090104101954609315) | [mp4](https://cdn.ansphare.com/Web/aron/folder_component/video.mp4) |
| 230 | [Brand story cards](https://www.inspora.design/posts/1-21) | [@basit_designs](https://x.com/basit_designs/status/2090722001132650986) | [mp4](https://cdn.ansphare.com/Web/Basit_A._Khan/Brand_story_cards/video.mp4) |
| 231 | [glossy orb animation](https://www.inspora.design/posts/1-53) | [@basit_designs](https://x.com/basit_designs/status/2091835143522840732) | [mp4](https://cdn.ansphare.com/Web/Basit_A._Khan/glossy_orb_animation/video.mp4) |
| 232 | [portfolio page](https://www.inspora.design/posts/portfolio-page) | [@basit_designs](https://x.com/basit_designs/status/2095435397828628584) | [mp4](https://cdn.ansphare.com/Web/Basit_A._Khan/portfolio_page/video.mp4) |
| 233 | [A lightweight portfolio](https://www.inspora.design/posts/a-lightweight-portfolio) | [@cyze_dev](https://x.com/cyze_dev/status/2105719967328919792) | [mp4](https://cdn.ansphare.com/Web/Blake/A_lightweight_portfolio/video.mp4) |
| 234 | [portfolio website](https://www.inspora.design/posts/portfolio-website) | [@cambreedesigns](https://x.com/cambreedesigns/status/2104999693113766152) | [mp4](https://cdn.ansphare.com/Web/Cambree_Bernkopf/portfolio_website/video.mp4) |
| 235 | [DayDream Studio](https://www.inspora.design/posts/daydream-studio) | [@david_visuals_](https://x.com/david_visuals_/status/2111061900704280833) | [mp4](https://cdn.ansphare.com/Web/David/DayDream_Studio/video.mp4) |
| 236 | [Team section](https://www.inspora.design/posts/1-25) | [@dawood_adib](https://x.com/dawood_adib/status/2090437307761328634) | [mp4](https://cdn.ansphare.com/Web/Dawood/Team_section/video.mp4) |
| 237 | [glassmorphism animation](https://www.inspora.design/posts/glassmorphism-animation) | [@DesignGabor](https://x.com/DesignGabor/status/1866183848704250245) | [mp4](https://cdn.ansphare.com/Web/Design.Gabor/glassmorphism_animation/video.mp4) |
| 238 | [Wafer page](https://www.inspora.design/posts/wafer-page) | [@kazarov_d](https://x.com/kazarov_d/status/2094551144613736669) | [mp4](https://cdn.ansphare.com/Web/Dima_Kazarov/Wafer_page/video.mp4) |
| 239 | [404 page](https://www.inspora.design/posts/404-page) | [@elayadesigns](https://x.com/elayadesigns/status/2083074199225291169) | [mp4](https://cdn.ansphare.com/Web/elaya/404_page/video.mp4) |
| 240 | [Scenic Footer Section](https://www.inspora.design/posts/scenic-footer-section) | [@elayadesigns](https://x.com/elayadesigns/status/2101943446789673427) | [mp4](https://cdn.ansphare.com/Web/elaya/Scenic_Footer_Section/video.mp4) |
| 241 | [Mega Menu Animation](https://www.inspora.design/posts/mega-menu) | [@gabriell_lab](https://x.com/gabriell_lab/status/2094055275233694034) | [mp4](https://cdn.ansphare.com/Web/Gabriel/Mega_Menu_Animation/video.mp4) |
| 242 | [infinite faq](https://www.inspora.design/posts/infinite-faq) | [@heyimgustavo](https://x.com/heyimgustavo/status/2100728786694136224) | [mp4](https://cdn.ansphare.com/Web/Gustavo/infinite_faq/video.mp4) |
| 243 | [Sign-Up page](https://www.inspora.design/posts/1-19) | [@coleHardik](https://x.com/coleHardik/status/2088237355153215551) | [mp4](https://cdn.ansphare.com/Web/Hardik/Sign-Up_page/video.mp4) |
| 245 | [Hanging Team component](https://www.inspora.design/posts/hanging-team-component) | [@hayriyeakguller](https://x.com/hayriyeakguller/status/2109612639231856876) | [mp4](https://cdn.ansphare.com/Web/Hayriye/Hanging_Team_component/video.mp4) |
| 246 | [Liquid glass](https://www.inspora.design/posts/liquid-glass) | [@jesse_vermeulen](https://x.com/jesse_vermeulen/status/2068672515077992636) | [mp4](https://cdn.ansphare.com/Web/Jesse/Liquid_glass/video.mp4) |
| 247 | [Portfolio hero](https://www.inspora.design/posts/portfolio-hero) | [@jiju_bui](https://x.com/jiju_bui/status/2107245208752844801) | [mp4](https://cdn.ansphare.com/Web/joanna/Portfolio_hero/video.mp4) |
| 248 | [404 page](https://www.inspora.design/posts/1-57) | [@dqnamo](https://x.com/dqnamo/status/2092620583293075867) | [mp4](https://cdn.ansphare.com/Web/JP/404_page/video.mp4) |
| 249 | [Hero section](https://www.inspora.design/posts/hero-section) | [@loseva_pro](https://x.com/loseva_pro/status/2023416480759705888) | [mp4](https://cdn.ansphare.com/Web/Kate_Loseva/Hero_section/video.mp4) |
| 250 | [3D website with Claude Code](https://www.inspora.design/posts/3d-website-with-claude-code) | [@marina_uiux](https://x.com/marina_uiux/status/2115447175400276149) | [mp4](https://cdn.ansphare.com/Web/Marina_Budarina/3D_website_with_Claude_Code/video.mp4) |
| 252 | [A bento card](https://www.inspora.design/posts/1-40) | [@disarto_max](https://x.com/disarto_max/status/1979225796515410373) | [mp4](https://cdn.ansphare.com/Web/Maxim_Kuznetsov/A_bento_card/video.mp4) |
| 253 | [onboarding modal](https://www.inspora.design/posts/1-50) | [@disarto_max](https://x.com/disarto_max/status/1982495605890105583) | [mp4](https://cdn.ansphare.com/Web/Maxim_Kuznetsov/onboarding_modal/video.mp4) |
| 254 | [feature menu](https://www.inspora.design/posts/feature-menu) | [@mona_biasia](https://x.com/mona_biasia/status/2098014279928861047) | [mp4](https://cdn.ansphare.com/Web/Mona/feature_menu/video.mp4) |
| 255 | [waitlist screen](https://www.inspora.design/posts/1-18) | [@nachidesigner](https://x.com/nachidesigner/status/2070211796607344948) | [mp4](https://cdn.ansphare.com/Web/Nachi/waitlist_screen/video.mp4) |
| 256 | [New personal website.](https://www.inspora.design/posts/new-personal-website) | [@neel_saswade](https://x.com/neel_saswade/status/2107527126668939409) | [mp4](https://cdn.ansphare.com/Web/neel/New_personal_website/video.mp4) |
| 257 | [Hero section](https://www.inspora.design/posts/1-33) | [@neropursue](https://x.com/neropursue/status/2091795477717045265) | [mp4](https://cdn.ansphare.com/Web/Nero/Hero_section/video.mp4) |
| 258 | [404 page](https://www.inspora.design/posts/404-page-2) | [@ozzyxs1a](https://x.com/ozzyxs1a/status/2077833605305307494) | [mp4](https://cdn.ansphare.com/Web/ozzy/404_page/video.mp4) |
| 259 | [portfolio](https://www.inspora.design/posts/portfolio) | [@moguzbulbul](https://x.com/moguzbulbul/status/2102422579558400042) | [mp4](https://cdn.ansphare.com/Web/Oğuz_B/portfolio/video.mp4) |
| 260 | [Bento cards.](https://www.inspora.design/posts/bento-cards) | [@emblemo](https://x.com/emblemo/status/2095421153716158947) | [mp4](https://cdn.ansphare.com/Web/Pawel_Olek/Bento_cards/video.mp4) |
| 261 | [footer section](https://www.inspora.design/posts/footer-section) | [@PranavOriginals](https://x.com/PranavOriginals/status/2105346116388868364) | [mp4](https://cdn.ansphare.com/Web/Pranav/footer_section/video.mp4) |
| 262 | [3D animated cards](https://www.inspora.design/posts/3d-animated-cards) | [@praveenisomer](https://x.com/praveenisomer/status/2078472355723264480) | [mp4](https://cdn.ansphare.com/Web/Praveen_Kumar/3D_animated_cards/video.mp4) |
| 263 | [beveled cards](https://www.inspora.design/posts/beveled-cards) | [@RachitThakur146](https://x.com/RachitThakur146/status/2096551196832248195) | [mp4](https://cdn.ansphare.com/Web/Rachit_Thakur/beveled_cards/video.mp4) |
| 264 | [personal site](https://www.inspora.design/posts/personal-site) | [@samfcheng](https://x.com/samfcheng/status/2104993779510047203) | [mp4](https://cdn.ansphare.com/Web/Sam_Cheng/personal_site/video.mp4) |
| 265 | [Melon Jelly](https://www.inspora.design/posts/melon-jelly) | [@threejs](https://x.com/threejs/status/2104422906281525621) | [mp4](https://cdn.ansphare.com/Web/Three.js/Melon_Jelly/video.mp4) |
| 266 | [horse racing](https://www.inspora.design/posts/horse-racing) | [@UXzadriel](https://x.com/UXzadriel/status/2115004293933842666) | [mp4](https://cdn.ansphare.com/Web/zadriel/horse_racing/video.mp4) |
| 267 | [Interactive cards.](https://www.inspora.design/posts/interactive-cards) | [@kaolti](https://x.com/kaolti/status/2101335516360647104) | [mp4](https://cdn.ansphare.com/Web/Zsolt_Kacso/Interactive_cards/video.mp4) |

<a id="illustration"></a>
### Иллюстрация — Illustration (26)

| # | Работа | Автор | Видео |
|---|---|---|---|
| 1 | [I want to run again](https://www.inspora.design/posts/i-want-to-run-again) | [@cemhah](https://x.com/cemhah/status/2104656179070923129) | [mp4](https://cdn.ansphare.com/Illustration/cem_hasimi/I_want_to_run_again/video.mp4) |
| 16 | [realistic button](https://www.inspora.design/posts/realistic-button) | [@unrootdesign](https://x.com/unrootdesign/status/2095546630313304351) | [mp4](https://cdn.ansphare.com/Illustration/Adam/realistic_button/video.mp4) |
| 17 | [progressive blur](https://www.inspora.design/posts/progressive-blur) | [@alex_barashkov](https://x.com/alex_barashkov/status/2112171007465103548) | [mp4](https://cdn.ansphare.com/Illustration/Alex_Barashkov/progressive_blur/video.mp4) |
| 18 | [iPhone Duo](https://www.inspora.design/posts/iphone-duo-bar-icons) | [@avstorm](https://x.com/avstorm/status/2097767264510464002) | [mp4](https://cdn.ansphare.com/Illustration/Andreas_Storm/iPhone_Duo/video.mp4) |
| 19 | [sheep grazing grass](https://www.inspora.design/posts/sheep-grazing-grass) | [@AreadneMaria](https://x.com/AreadneMaria/status/2114898325451444419) | [mp4](https://cdn.ansphare.com/Illustration/areadne/sheep_grazing_grass/video.mp4) |
| 20 | [Liquid metal](https://www.inspora.design/posts/liquid-metal) | [@basit_designs](https://x.com/basit_designs/status/2004996999511466125) | [mp4](https://cdn.ansphare.com/Illustration/Basit_A._Khan/Liquid_metal/video.mp4) |
| 21 | [Dark mode toggle](https://www.inspora.design/posts/1-16) | [@Designownow_](https://x.com/Designownow_/status/1914336241446998492) | [mp4](https://cdn.ansphare.com/Illustration/Camden/Dark_mode_toggle/video.mp4) |
| 22 | [Enter the Unknown](https://www.inspora.design/posts/enter-the-unknown) | [@cemhah](https://x.com/cemhah/status/1725922786466525660) | [mp4](https://cdn.ansphare.com/Illustration/cem_hasimi/Enter_the_Unknown/video.mp4) |
| 23 | [I want to run again](https://www.inspora.design/posts/i-want-to-run-again) | [@cemhah](https://x.com/cemhah/status/2104656179070923129) | [mp4](https://cdn.ansphare.com/Illustration/cem_hasimi/I_want_to_run_again/video.mp4) |
| 24 | [medicine to my soul](https://www.inspora.design/posts/medicine-to-my-soul) | [@cemhah](https://x.com/cemhah/status/1807826314339987963) | [mp4](https://cdn.ansphare.com/Illustration/cem_hasimi/medicine_to_my_soul/video.mp4) |
| 25 | [run to the hills](https://www.inspora.design/posts/run-to-the-hills) | [@cemhah](https://x.com/cemhah/status/1977119489809625273) | [mp4](https://cdn.ansphare.com/Illustration/cem_hasimi/run_to_the_hills/video.mp4) |
| 26 | [Time to move on](https://www.inspora.design/posts/time-to-move-on) | [@cemhah](https://x.com/cemhah/status/2108641052815229301) | [mp4](https://cdn.ansphare.com/Illustration/cem_hasimi/Time_to_move_on/video.mp4) |
| 27 | [Pro membership card](https://www.inspora.design/posts/pro-membership-card) | [@craftworkdesign](https://x.com/craftworkdesign/status/2105643365383700505) | [mp4](https://cdn.ansphare.com/Illustration/Craftwork/Pro_membership_card/video.mp4) |
| 28 | [platinum Visa card](https://www.inspora.design/posts/platinum-visa-card) | [@shedsgns](https://x.com/shedsgns/status/2112973721011208264) | [mp4](https://cdn.ansphare.com/Illustration/Juliette/platinum_Visa_card/video.mp4) |
| 29 | [hairlines v0.2](https://www.inspora.design/posts/hairlines-v2) | [@lucasmarkes__](https://x.com/lucasmarkes__/status/2106502812498632707) | [mp4](https://cdn.ansphare.com/Illustration/Lucas/hairlines_v0.2/video.mp4) |
| 30 | [Liquid Glass](https://www.inspora.design/posts/1-28) | [@LynelDesign](https://x.com/LynelDesign/status/2084208630388388084) | [mp4](https://cdn.ansphare.com/Illustration/Lynel/Liquid_Glass/video.mp4) |
| 31 | [Mechanical keyboard for iphone](https://www.inspora.design/posts/1-32) | [@LynelDesign](https://x.com/LynelDesign/status/2090669607564828950) | [mp4](https://cdn.ansphare.com/Illustration/Lynel/Mechanical_keyboard_for_iphone/video.mp4) |
| 32 | [pigeon online](https://www.inspora.design/posts/pigeon-online) | [@maiko_pixel](https://x.com/maiko_pixel/status/2068283828356124711) | [mp4](https://cdn.ansphare.com/Illustration/MAIKO/pigeon_online/video.mp4) |
| 33 | [holographic card](https://www.inspora.design/posts/holographic-card) | [@matiNotFound](https://x.com/matiNotFound/status/2101004423438688296) | [mp4](https://cdn.ansphare.com/Illustration/Matias_🧉/holographic_card/video.mp4) |
| 34 | [chasing](https://www.inspora.design/posts/chasing) | [@hi_personality](https://x.com/hi_personality/status/2117011977658876093) | [mp4](https://cdn.ansphare.com/Illustration/Personality/chasing/video.mp4) |
| 35 | [grassland special](https://www.inspora.design/posts/grassland-special) | [@hi_personality](https://x.com/hi_personality/status/2115567493565825244) | [mp4](https://cdn.ansphare.com/Illustration/Personality/grassland_special/video.mp4) |
| 36 | [isometric AI computer](https://www.inspora.design/posts/isometric-ai-computer) | [@wheresryan22](https://x.com/wheresryan22/status/2106476722463900105) | [mp4](https://cdn.ansphare.com/Illustration/R/isometric_AI_computer/video.mp4) |
| 37 | [curved browser tabs](https://www.inspora.design/posts/1-52) | [@Ryan__Stephen](https://x.com/Ryan__Stephen/status/1907802257992618039) | [mp4](https://cdn.ansphare.com/Illustration/Ryan_Stephen/curved_browser_tabs/video.mp4) |
| 38 | [Subtle text scale effect.](https://www.inspora.design/posts/subtle-text-scale-effect) | [@zzzzshawn](https://x.com/zzzzshawn/status/2111001941677617197) | [mp4](https://cdn.ansphare.com/Illustration/shawn/Subtle_text_scale_effect/video.mp4) |
| 39 | [I will survive](https://www.inspora.design/posts/i-will-survive) | [@YUDHO_XYZ](https://x.com/YUDHO_XYZ/status/2105926694607704136) | [mp4](https://cdn.ansphare.com/Illustration/YUDHO/I_will_survive/video.mp4) |
| 40 | [glass recorder](https://www.inspora.design/posts/glass-recorder) | [@kaolti](https://x.com/kaolti/status/2111575997359513751) | [mp4](https://cdn.ansphare.com/Illustration/Zsolt_Kacso/glass_recorder/video.mp4) |

<a id="3d"></a>
### 3D — 3D (7)

| # | Работа | Автор | Видео |
|---|---|---|---|
| 2 | [holo 3D card effect](https://www.inspora.design/posts/holo-3d-card-effect) | [@ann_nnng](https://x.com/ann_nnng/status/2108122086569136417) | [mp4](https://cdn.ansphare.com/3D/Ann_Nguyen/holo_3D_card_effect/video.mp4) |
| 6 | [Unlocking keypad](https://www.inspora.design/posts/unlocking-keypad) | [@reijowrites](https://x.com/reijowrites/status/1877426335104041031) | [mp4](https://cdn.ansphare.com/3D/Reijo🌻/Unlocking_keypad/video.mp4) |
| 7 | [Small plays - Basketball](https://www.inspora.design/posts/small-plays-basketball) | [@zzzzshawn](https://x.com/zzzzshawn/status/2111546123546661289) | [mp4](https://cdn.ansphare.com/3D/shawn/Small_plays_-_Basketball/video.mp4) |
| 8 | [Isometric keyboard](https://www.inspora.design/posts/isometric-keyboard) | [@vansh1029](https://x.com/vansh1029/status/2107110007653421324) | [mp4](https://cdn.ansphare.com/3D/Vansh/Isometric_keyboard/video.mp4) |
| 89 | [mechanical macropad](https://www.inspora.design/posts/mechanical-macropad) | [@skirano](https://x.com/skirano/status/2095595932335170031) | [mp4](https://cdn.ansphare.com/3D/Pietro_Schirano/mechanical_macropad/video.mp4) |
| 244 | [A highlighter marker](https://www.inspora.design/posts/1-11) | [@msllrs](https://x.com/msllrs/status/2089341415536922890) | [mp4](https://cdn.ansphare.com/3D/matt/A_highlighter_marker/video.mp4) |
| 251 | [pixel-art farm](https://www.inspora.design/posts/pixel-art-farm) | [@daniildesigns](https://x.com/daniildesigns/status/2117571497665663044) | [mp4](https://cdn.ansphare.com/3D/Daniil_Ch/pixel-art_farm/video.mp4) |

<a id="branding"></a>
### Брендинг — Branding (7)

| # | Работа | Автор | Видео |
|---|---|---|---|
| 10 | [anthropomorphic brand character.](https://www.inspora.design/posts/anthropomorphic-brand-character) | [@socoloffalex](https://x.com/socoloffalex/status/2104791084891001290) | [mp4](https://cdn.ansphare.com/Branding/Alex_Socoloff/anthropomorphic_brand_character/video.mp4) |
| 11 | [App icon concepts](https://www.inspora.design/posts/1-49) | [@dmiiiitrii](https://x.com/dmiiiitrii/status/2066491158164045957) | [mp4](https://cdn.ansphare.com/Branding/Dmitri/App_icon_concepts/video.mp4) |
| 12 | [Bencho logo](https://www.inspora.design/posts/bencho-logo) | [@cabralorenzo](https://x.com/cabralorenzo/status/2095922411103301786) | [mp4](https://cdn.ansphare.com/Branding/Lorenzo_Cabra/Bencho_logo/video.mp4) |
| 13 | [New Calendly logo](https://www.inspora.design/posts/1-15) | [@mikesmith187](https://x.com/mikesmith187/status/2090171747668799618) | [mp4](https://cdn.ansphare.com/Branding/Mike_Smith/New_Calendly_logo/video.mp4) |
| 14 | [Personal brand — motion exploration](https://www.inspora.design/posts/motion-exploration) | [@iamnotsrc](https://x.com/iamnotsrc/status/1939014685069553830) | [mp4](https://cdn.ansphare.com/Branding/src/Personal_brand_—_motion_exploration/video.mp4) |
| 15 | [Visual Exploration](https://www.inspora.design/posts/1-visualexploration) | [@yahyavision](https://x.com/yahyavision/status/2074553659736596921) | [mp4](https://cdn.ansphare.com/Branding/yahyavision/Visual_Exploration/video.mp4) |
| 94 | [Handmade icons](https://www.inspora.design/posts/handmade-icons) | [@alex_barashkov](https://x.com/alex_barashkov/status/2103144303254024253) | [mp4](https://cdn.ansphare.com/Branding/Alex_Barashkov/Handmade_icons/video.mp4) |

<a id="print"></a>
### Печать — Print (3)

| # | Работа | Автор | Видео |
|---|---|---|---|
| 159 | [postage stamps](https://www.inspora.design/posts/postage-stamps) | [@mightbe_dg](https://x.com/mightbe_dg/status/2112551917545205793) | [mp4](https://cdn.ansphare.com/Print/Dhruv_Gupta/postage_stamps/video.mp4) |
| 160 | [Quartr x Meta Earnings](https://www.inspora.design/posts/quartr-meta) | [@haris_chc](https://x.com/haris_chc/status/2082562040485314722) | [mp4](https://cdn.ansphare.com/Print/haris_chc/Quartr_x_Meta_Earnings/video.mp4) |
| 161 | [Vintage stamp collage](https://www.inspora.design/posts/vintage-stamp-collage) | [@jenny_wen](https://x.com/jenny_wen/status/2101815817444729049) | [mp4](https://cdn.ansphare.com/Print/jenny_wen/Vintage_stamp_collage/video.mp4) |
