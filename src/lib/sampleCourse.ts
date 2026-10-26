import type { Block, BlockBackground, Course, Lesson } from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
import { avatarArt, coverArt, flagSlide, inboxArt, reportButtonArt, textFile } from './sampleArt'
import type { Language } from '../i18n/types'

// Built-in sample course ("Spot the phish"), opened from the landing page and the
// welcome screen so visitors can explore a complete course without creating a
// project. It is author content, not UI chrome, so the copy lives here as
// inline { en, uk } pairs (like the landing chat scenarios) and the whole
// course is generated in one language.

type Text = { en: string; uk: string }
const L = (en: string, uk: string): Text => ({ en, uk })

let seq = 0
const id = (prefix: string) => `${prefix}-sample-${++seq}`

function block<T extends Block['type']>(
  type: T,
  data: Extract<Block, { type: T }>['data'],
  background?: BlockBackground,
  spacing: Block['settings']['spacing'] = 'normal',
  width?: 'full',
): Block {
  const settings = { spacing, ...(background ? { background } : {}), ...(width ? { width } : {}) }
  return { id: id('block'), type, settings, data } as Block
}

// Mock email for the hotspot block, drawn as an inline SVG so the sample needs
// no asset files and exports as-is.
function phishingEmailSvg(tr: (t: Text) => string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const x = (t: Text) => esc(tr(t))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" font-family="Arial, sans-serif">
<rect width="800" height="500" rx="16" fill="#f3f4f6"/>
<rect x="24" y="24" width="752" height="452" rx="12" fill="#fff" stroke="#e5e7eb"/>
<rect x="24" y="24" width="752" height="48" rx="12" fill="#1f2937"/>
<circle cx="52" cy="48" r="7" fill="#f87171"/><circle cx="74" cy="48" r="7" fill="#fbbf24"/><circle cx="96" cy="48" r="7" fill="#34d399"/>
<text x="400" y="54" fill="#e5e7eb" font-size="16" text-anchor="middle">${x(L('Inbox', 'Вхідні'))}</text>
<text x="56" y="108" fill="#6b7280" font-size="16">${x(L('From:', 'Від:'))}</text>
<text x="120" y="108" fill="#111827" font-size="16">IT Support &lt;security@micros0ft-help.co&gt;</text>
<text x="56" y="146" fill="#6b7280" font-size="16">${x(L('Subject:', 'Тема:'))}</text>
<text x="136" y="146" fill="#b91c1c" font-size="17" font-weight="bold">${x(L('URGENT: your account will be locked in 24 hours!', 'ТЕРМІНОВО: ваш акаунт заблокують за 24 години!'))}</text>
<line x1="56" y1="170" x2="744" y2="170" stroke="#e5e7eb"/>
<text x="56" y="212" fill="#111827" font-size="17">${x(L('Dear user,', 'Шановний користувачу,'))}</text>
<text x="56" y="246" fill="#374151" font-size="16">${x(L('We detected unusual activity. Confirm your password right now', 'Ми виявили підозрілу активність. Негайно підтвердьте пароль,'))}</text>
<text x="56" y="272" fill="#374151" font-size="16">${x(L('or you will lose access to all your files.', 'інакше ви втратите доступ до всіх файлів.'))}</text>
<rect x="56" y="300" width="240" height="48" rx="8" fill="#2563eb"/>
<text x="176" y="330" fill="#fff" font-size="17" font-weight="bold" text-anchor="middle">${x(L('Verify account', 'Підтвердити акаунт'))}</text>
<text x="352" y="330" fill="#9ca3af" font-size="13">http://micros0ft-help.co/login</text>
<rect x="56" y="392" width="220" height="48" rx="8" fill="#f9fafb" stroke="#d1d5db"/>
<text x="76" y="422" fill="#374151" font-size="16">📎 invoice_2026.zip</text>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// The genuine counterpart of the phishing email, in the same frame, for the
// before / after slider: real domain, a name, no threat, no link, no file.
function genuineEmailSvg(tr: (t: Text) => string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const x = (t: Text) => esc(tr(t))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" font-family="Arial, sans-serif">
<rect width="800" height="500" rx="16" fill="#f3f4f6"/>
<rect x="24" y="24" width="752" height="452" rx="12" fill="#fff" stroke="#e5e7eb"/>
<rect x="24" y="24" width="752" height="48" rx="12" fill="#1f2937"/>
<circle cx="52" cy="48" r="7" fill="#f87171"/><circle cx="74" cy="48" r="7" fill="#fbbf24"/><circle cx="96" cy="48" r="7" fill="#34d399"/>
<text x="400" y="54" fill="#e5e7eb" font-size="16" text-anchor="middle">${x(L('Inbox', 'Вхідні'))}</text>
<text x="56" y="108" fill="#6b7280" font-size="16">${x(L('From:', 'Від:'))}</text>
<text x="120" y="108" fill="#111827" font-size="16">${x(L('IT Service Desk', 'ІТ-підтримка'))} &lt;servicedesk@yourcompany.com&gt;</text>
<text x="56" y="146" fill="#6b7280" font-size="16">${x(L('Subject:', 'Тема:'))}</text>
<text x="136" y="146" fill="#111827" font-size="17" font-weight="bold">${x(L('Planned email maintenance on Saturday', 'Планові роботи з поштою в суботу'))}</text>
<line x1="56" y1="170" x2="744" y2="170" stroke="#e5e7eb"/>
<text x="56" y="212" fill="#111827" font-size="17">${x(L('Hi Anna,', 'Привіт, Анно!'))}</text>
<text x="56" y="246" fill="#374151" font-size="16">${x(L('Email may be unavailable on Saturday from 9:00 to 11:00.', 'У суботу з 9:00 до 11:00 пошта може бути недоступна.'))}</text>
<text x="56" y="272" fill="#374151" font-size="16">${x(L('You don’t need to do anything.', 'Від вас нічого не потрібно.'))}</text>
<rect x="56" y="300" width="460" height="48" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
<text x="76" y="330" fill="#166534" font-size="16">${x(L('Questions? Call the service desk: ext. 1234', 'Питання? Дзвоніть у підтримку: внутр. 1234'))}</text>
<text x="56" y="420" fill="#9ca3af" font-size="14">${x(L('— IT Service Desk', '— ІТ-підтримка'))}</text>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Display names vs. real addresses (a rich-text table in lesson 2). Two
// columns, the verdict under each address, so it reads on a phone too.
function addressTable(tr: (t: Text) => string): string {
  const row = (name: Text, address: string, verdict: Text) =>
    `<tr><td>${tr(name)}</td><td>${address}<br><em>${tr(verdict)}</em></td></tr>`
  return `<table class="rt-table rt-table-stripes"><thead><tr><th scope="col">${tr(L('Display name', 'Ім’я відправника'))}</th><th scope="col">${tr(L('Real address', 'Справжня адреса'))}</th></tr></thead><tbody>${[
    row(L('IT Support', 'ІТ-підтримка'), 'security@micros0ft-help.co', L('❌ A zero instead of “o”', '❌ Нуль замість «o»')),
    row(L('PayPal', 'PayPal'), 'service@paypa1-secure.net', L('❌ “1” instead of “l”', '❌ «1» замість «l»')),
    row(L('Anna Kovalenko, CEO', 'Анна Коваленко, CEO'), 'anna.k.ceo@gmail.com', L('❌ A personal mailbox', '❌ Особиста скринька')),
    row(L('IT Service Desk', 'ІТ-підтримка'), 'servicedesk@yourcompany.com', L('✅ Your company’s domain', '✅ Домен вашої компанії')),
  ].join('')}</tbody></table>`
}

export function makeSampleCourse(lang: Language): Course {
  seq = 0
  const tr = (t: Text) => t[lang]
  const p = (t: Text) => `<p>${tr(t)}</p>`

  // ── Lesson 1: Welcome ─────────────────────────────────────────────────────
  const welcome: Lesson = {
    id: id('lesson'),
    title: tr(L('Welcome', 'Вітаємо')),
    status: 'published',
    blocks: [
      block('quote', {
        variant: 'statement',
        text: tr(L('Nine out of ten cyberattacks start with an email.', 'Дев’ять із десяти кібератак починаються з листа.')),
        author: '',
      }, 'soft', 'spacious'),
      block('imageText', {
        layout: 'left',
        src: inboxArt({
          inbox: tr(L('Inbox', 'Вхідні')),
          mails: [
            tr(L('Team lunch on Friday', 'Обід команди в п’ятницю')),
            tr(L('URGENT: verify your account!', 'ТЕРМІНОВО: підтвердьте акаунт!')),
            tr(L('Q3 report — final draft', 'Звіт за III квартал — фінал')),
          ],
        }),
        alt: tr(L('An inbox where one urgent email is highlighted as suspicious', 'Поштова скринька, де один терміновий лист позначено як підозрілий')),
        html: p(
          L(
            'In the next <strong>15 minutes</strong> you will learn to recognise phishing, react calmly when something looks wrong, and protect yourself and your team.',
            'За наступні <strong>15 хвилин</strong> ви навчитеся розпізнавати фішинг, спокійно реагувати на підозрілі повідомлення та захищати себе й команду.',
          ),
        ),
      }),
      block('note', {
        variant: 'note',
        text: tr(
          L(
            'This is a sample course made in Scormly. Click “Preview” to take it as a learner, edit any block, or export it as a SCORM package for your LMS.',
            'Це приклад курсу, створений у Scormly. Натисніть «Перегляд», щоб пройти його як слухач, змініть будь-який блок або експортуйте його як SCORM-пакет для вашої LMS.',
          ),
        ),
      }),
      block('heading', { level: 2, text: tr(L('What you will learn', 'Чого ви навчитеся')) }, 'dark'),
      block('list', {
        ordered: true,
        items: [
          tr(L('The five red flags of a phishing message', 'П’ять тривожних ознак фішингового повідомлення')),
          tr(L('How phishing looks in email, SMS and phone calls', 'Як виглядає фішинг у пошті, SMS і дзвінках')),
          tr(L('What to do in the first minutes after a suspicious click', 'Що робити в перші хвилини після підозрілого кліку')),
        ],
      }, 'dark'),
      block('quote', {
        variant: 'card',
        text: tr(L(
          'After this course our team reported three real phishing attempts in the first week — before anyone clicked.',
          'Після цього курсу наша команда вже за перший тиждень повідомила про три справжні фішингові спроби — ще до того, як хтось клікнув.',
        )),
        author: tr(L('Maria Lopez', 'Марія Левченко')),
        role: tr(L('Head of IT Security', 'Керівниця з ІТ-безпеки')),
        image: avatarArt(tr(L('ML', 'МЛ'))),
      }, 'muted'),
      block('courseOutline', { title: tr(L('Course outline', 'Зміст курсу')), numbered: true }),
    ],
  }

  // ── Lesson 2: Anatomy of a phishing email ─────────────────────────────────
  const anatomy: Lesson = {
    id: id('lesson'),
    title: tr(L('Anatomy of a phishing email', 'Анатомія фішингового листа')),
    status: 'published',
    blocks: [
      block('heading', { level: 2, text: tr(L('Find the red flags', 'Знайдіть тривожні ознаки')) }),
      block('paragraph', {
        variant: 'lead',
        html: p(
          L(
            'This email landed in your inbox this morning. Click each marker to see what gives it away.',
            'Цей лист прийшов вам сьогодні зранку. Натисніть на кожну позначку, щоб побачити, що його видає.',
          ),
        ),
      }),
      block('hotspot', {
        src: phishingEmailSvg(tr),
        alt: tr(L('A suspicious email asking to verify an account', 'Підозрілий лист із проханням підтвердити акаунт')),
        hotspots: [
          {
            id: id('hs'),
            x: 91,
            y: 21,
            title: tr(L('Look-alike sender', 'Підроблений відправник')),
            text: tr(L('“micros0ft-help.co” uses a zero instead of the letter “o” and is not the company’s real domain.', '«micros0ft-help.co» містить нуль замість літери «o» і не є справжнім доменом компанії.')),
          },
          {
            id: id('hs'),
            x: 77,
            y: 30,
            title: tr(L('Pressure and urgency', 'Тиск і терміновість')),
            text: tr(L('Deadlines and threats are designed to make you act before you think.', 'Дедлайни й погрози мають змусити вас діяти, не подумавши.')),
          },
          {
            id: id('hs'),
            x: 91,
            y: 42,
            title: tr(L('Generic greeting', 'Безособове звертання')),
            text: tr(L('Real services usually address you by name.', 'Справжні сервіси зазвичай звертаються до вас на ім’я.')),
          },
          {
            id: id('hs'),
            x: 41,
            y: 65,
            title: tr(L('Hidden link', 'Прихований лінк')),
            text: tr(L('Hover before you click: the button leads to a fake login page, not the real site.', 'Наведіть курсор, перш ніж клікати: кнопка веде на фальшиву сторінку входу, а не на справжній сайт.')),
          },
          {
            id: id('hs'),
            x: 38,
            y: 83,
            title: tr(L('Unexpected attachment', 'Неочікуване вкладення')),
            text: tr(L('An archive you never asked for may contain malware. Never open it.', 'Архів, якого ви не чекали, може містити шкідливу програму. Ніколи не відкривайте його.')),
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Fake or real?', 'Підробка чи справжній?')) }),
      block('paragraph', {
        html: p(L(
          'Drag the slider to compare the phishing email with a genuine message from your IT team.',
          'Потягніть повзунок, щоб порівняти фішинговий лист зі справжнім повідомленням від вашої ІТ-служби.',
        )),
      }),
      block('beforeAfter', {
        before: phishingEmailSvg(tr),
        beforeAlt: tr(L('The phishing email: look-alike sender, an urgent threat and a “Verify account” button', 'Фішинговий лист: підроблений відправник, термінова погроза й кнопка «Підтвердити акаунт»')),
        beforeLabel: tr(L('Phishing', 'Фішинг')),
        after: genuineEmailSvg(tr),
        afterAlt: tr(L('The genuine email: the company’s own domain, a greeting by name, no links and no attachment', 'Справжній лист: домен компанії, звертання на ім’я, без посилань і вкладень')),
        afterLabel: tr(L('Genuine', 'Справжній')),
      }),
      block('continue', { mode: 'unrestricted', label: tr(L('Continue', 'Продовжити')) }),
      block('heading', { level: 2, text: tr(L('Four red flags to remember', 'Чотири ознаки, які варто запам’ятати')) }),
      block('gallery', {
        layout: 'carousel',
        images: [
          {
            src: flagSlide(1, tr(L('Urgency', 'Терміновість')), tr(L('“Act now or lose access” — pressure is the attacker’s favourite tool.', '«Дійте негайно, або втратите доступ» — тиск є улюбленим інструментом зловмисника.')), 'clock'),
            alt: tr(L('Red flag 1: urgency', 'Ознака 1: терміновість')),
            caption: tr(L('Real services give you time. Slow down when a message rushes you.', 'Справжні сервіси дають вам час. Сповільніться, коли лист вас квапить.')),
          },
          {
            src: flagSlide(2, tr(L('Look-alike senders', 'Схожі адреси')), tr(L('micros0ft-help.co is not microsoft.com. Read the domain letter by letter.', 'micros0ft-help.co — це не microsoft.com. Читайте домен по літері.')), 'at'),
            alt: tr(L('Red flag 2: look-alike sender addresses', 'Ознака 2: підроблені адреси відправників')),
            caption: tr(L('Check the address, not just the display name.', 'Перевіряйте адресу, а не лише ім’я відправника.')),
          },
          {
            src: flagSlide(3, tr(L('Surprise attachments', 'Несподівані вкладення')), tr(L('Invoices, “scans” and archives you never asked for can carry malware.', 'Рахунки, «скани» й архіви, яких ви не чекали, можуть містити шкідливе ПЗ.')), 'clip'),
            alt: tr(L('Red flag 3: unexpected attachments', 'Ознака 3: неочікувані вкладення')),
            caption: tr(L('Not expecting a file? Confirm with the sender another way.', 'Не чекали файл? Уточніть у відправника іншим способом.')),
          },
          {
            src: flagSlide(4, tr(L('Password requests', 'Запит пароля')), tr(L('No real IT team, bank or colleague will ever ask for your password or code.', 'Жодна справжня ІТ-служба, банк чи колега не питатиме ваш пароль чи код.')), 'key'),
            alt: tr(L('Red flag 4: requests for passwords or codes', 'Ознака 4: прохання назвати пароль чи код')),
            caption: tr(L('A password request is a phishing attempt — always.', 'Прохання назвати пароль — це завжди фішинг.')),
          },
        ],
      }),
      block('paragraph', {
        html:
          p(L(
            '<strong>Read the address, not the name.</strong> A display name can say anything:',
            '<strong>Читайте адресу, а не ім’я.</strong> Ім’я відправника може бути будь-яким:',
          )) + addressTable(tr),
      }),
      {
        id: id('block'),
        type: 'paragraph',
        settings: { spacing: 'spacious', background: 'image', backgroundImage: coverArt(), width: 'full' },
        data: {
          variant: 'lead',
          html: p(L(
            '<strong>Attackers count on habit.</strong> The few seconds you spend checking a sender or a link are the best security tool you have.',
            '<strong>Зловмисники розраховують на звичку.</strong> Кілька секунд, щоб перевірити відправника чи посилання, — найкращий інструмент безпеки, який у вас є.',
          )),
        },
      },
      block('heading', { level: 2, text: tr(L('Phishing is not only email', 'Фішинг — це не лише пошта')) }),
      block('tabs', {
        tabs: [
          {
            id: id('tab'),
            title: tr(L('Email', 'Пошта')),
            html: p(L('The classic: fake invoices, password resets and “shared documents” that lead to a login page controlled by attackers.', 'Класика: фальшиві рахунки, скидання пароля та «спільні документи», що ведуть на сторінку входу, яку контролюють зловмисники.')),
          },
          {
            id: id('tab'),
            title: tr(L('SMS (smishing)', 'SMS (смішинг)')),
            html: p(L('“Your parcel is on hold, pay 1.99 to release it.” Short links in text messages hide where they really go.', '«Вашу посилку затримано, сплатіть 1,99, щоб її отримати». Короткі посилання в SMS приховують, куди вони насправді ведуть.')),
          },
          {
            id: id('tab'),
            title: tr(L('Calls (vishing)', 'Дзвінки (вішинг)')),
            html: p(L('A caller pretending to be your bank or IT desk asks for a one-time code. No real support will ever ask for it.', 'Людина, що видає себе за банк чи ІТ-підтримку, просить одноразовий код. Справжня підтримка ніколи його не питає.')),
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('When something looks off', 'Коли щось здається підозрілим')) }),
      block('process', {
        layout: 'chevrons',
        steps: [
          { id: id('step'), title: tr(L('Stop', 'Зупиніться')), text: tr(L('Don’t click, reply or open attachments.', 'Не клікайте, не відповідайте й не відкривайте вкладення.')) },
          { id: id('step'), title: tr(L('Check', 'Перевірте')), text: tr(L('Read the sender’s address and hover over links.', 'Прочитайте адресу відправника й наведіть курсор на посилання.')) },
          { id: id('step'), title: tr(L('Report', 'Повідомте')), text: tr(L('Use “Report phishing” or tell your security team.', 'Натисніть «Повідомити про фішинг» або напишіть службі безпеки.')) },
          { id: id('step'), title: tr(L('Delete', 'Видаліть')), text: tr(L('Remove the email once it’s reported.', 'Видаліть лист, коли про нього повідомили.')) },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Key terms', 'Ключові терміни')) }),
      block('flashcards', {
        cards: [
          { id: id('card'), front: tr(L('Phishing', 'Фішинг')), back: tr(L('A fake message that tricks you into revealing data or installing malware.', 'Фальшиве повідомлення, яке змушує вас розкрити дані чи встановити шкідливу програму.')) },
          { id: id('card'), front: tr(L('Spear phishing', 'Цільовий фішинг')), back: tr(L('Phishing tailored to one person, using details about their job or life.', 'Фішинг, підлаштований під конкретну людину з деталями про її роботу чи життя.')) },
          { id: id('card'), front: tr(L('Spoofing', 'Спуфінг')), back: tr(L('Faking a sender name, address or phone number to look trustworthy.', 'Підробка імені, адреси чи номера відправника, щоб викликати довіру.')) },
          { id: id('card'), front: 'MFA', back: tr(L('Multi-factor authentication: a second proof of identity that stops most stolen-password attacks.', 'Багатофакторна автентифікація: другий доказ особи, що зупиняє більшість атак з украденим паролем.')) },
        ],
      }),
    ],
  }

  // ── Lesson 3: Practice ────────────────────────────────────────────────────
  const catSafe = id('cat')
  const catPhish = id('cat')
  const n = { start: id('node'), pwd: id('node'), verify: id('node'), good: id('node'), bad: id('node') }
  const practice: Lesson = {
    id: id('lesson'),
    title: tr(L('Practice: a message from “IT”', 'Практика: повідомлення від «ІТ»')),
    status: 'published',
    blocks: [
      block('heading', { level: 2, text: tr(L('A chat you did not expect', 'Неочікуваний чат')) }),
      block('paragraph', {
        html: p(L('Someone from “IT support” messages you in the work chat. Choose your replies.', 'Хтось із «ІТ-підтримки» пише вам у робочий чат. Оберіть свої відповіді.')),
      }),
      block('scenario', {
        characterImages: {},
        characterName: tr(L('Alex, IT support', 'Олекс, ІТ-підтримка')),
        layout: 'chat',
        startNodeId: n.start,
        nodes: [
          {
            id: n.start,
            emotion: 'neutral',
            text: tr(L('Hi! We are migrating mailboxes today. I need your password to move your mail, it will take 2 minutes 🙂', 'Привіт! Сьогодні переносимо поштові скриньки. Мені потрібен ваш пароль, щоб перенести пошту, це 2 хвилини 🙂')),
            choices: [
              { id: id('choice'), text: tr(L('Sure, it’s Summer2026!', 'Звісно, ось він: Summer2026!')), nextNodeId: n.bad, setEmotion: 'happy' },
              { id: id('choice'), text: tr(L('IT never asks for passwords. Can I call the service desk to confirm?', 'ІТ ніколи не питає паролів. Можна я перетелефоную на гарячу лінію, щоб перевірити?')), nextNodeId: n.verify, setEmotion: 'concerned' },
              { id: id('choice'), text: tr(L('Why do you need it?', 'А навіщо він вам?')), nextNodeId: n.pwd },
            ],
          },
          {
            id: n.pwd,
            emotion: 'concerned',
            text: tr(L('It’s urgent, your mailbox will be deleted tonight if we don’t move it. Please hurry!', 'Це терміново: якщо не перенесемо, сьогодні ввечері скриньку видалять. Будь ласка, швидше!')),
            choices: [
              { id: id('choice'), text: tr(L('OK, here it is…', 'Гаразд, ось він…')), nextNodeId: n.bad },
              { id: id('choice'), text: tr(L('Pressure is a red flag. I’ll check with the service desk first.', 'Тиск — це тривожна ознака. Спершу перевірю на гарячій лінії.')), nextNodeId: n.verify },
            ],
          },
          {
            id: n.verify,
            emotion: 'concerned',
            text: tr(L('Uh… never mind, I’ll do it later.', 'Е-е… та нічого, зроблю пізніше.')),
            choices: [
              { id: id('choice'), text: tr(L('Report the chat to security', 'Повідомити про чат службі безпеки')), nextNodeId: n.good, setEmotion: 'happy' },
            ],
          },
          {
            id: n.good,
            emotion: 'happy',
            text: tr(L('✅ Well done! You refused to share a password, verified through an official channel and reported the attempt.', '✅ Чудово! Ви не поділилися паролем, перевірили через офіційний канал і повідомили про спробу.')),
            choices: [],
          },
          {
            id: n.bad,
            emotion: 'neutral',
            text: tr(L('❌ Thanks! (The attacker now has your password.) Real IT will never ask for it — change it right away and report the chat.', '❌ Дякую! (Тепер зловмисник має ваш пароль.) Справжнє ІТ ніколи його не питає — негайно змініть пароль і повідомте про чат.')),
            choices: [],
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Warm-up before the test', 'Розминка перед тестом')) }),
      block('ordering', {
        mode: 'categories',
        prompt: tr(L('Sort the messages: safe or phishing?', 'Розсортуйте повідомлення: безпечне чи фішинг?')),
        categories: [
          { id: catSafe, title: tr(L('Looks safe', 'Схоже на безпечне')) },
          { id: catPhish, title: tr(L('Phishing', 'Фішинг')) },
        ],
        items: [
          { id: id('item'), categoryId: catPhish, text: tr(L('“Your parcel is on hold — pay 1.99 via this link”', '«Посилку затримано — сплатіть 1,99 за посиланням»')) },
          { id: id('item'), categoryId: catSafe, text: tr(L('A meeting invite from your manager for a meeting you discussed', 'Запрошення від керівника на зустріч, про яку ви домовлялися')) },
          { id: id('item'), categoryId: catPhish, text: tr(L('“CEO” asks you to buy gift cards urgently and keep it secret', '«Директор» просить терміново купити подарункові картки й нікому не казати')) },
          { id: id('item'), categoryId: catSafe, text: tr(L('A password-reset email right after you clicked “Forgot password”', 'Лист для скидання пароля одразу після того, як ви натиснули «Забули пароль»')) },
          { id: id('item'), categoryId: catPhish, text: tr(L('“Unusual sign-in detected, confirm your password here”', '«Виявлено незвичний вхід, підтвердьте пароль тут»')) },
        ],
        passingScore: 80,
        showAnswers: true,
      }),
      block('fillBlanks', {
        mode: 'select',
        text: tr(
          L(
            'Attackers create a sense of [urgency] so you act without thinking. Before clicking, [hover] over a link to see where it goes. Turning on [MFA] protects you even if your password is stolen.',
            'Зловмисники створюють відчуття [терміновості], щоб ви діяли не думаючи. Перед кліком [наведіть курсор] на посилання, щоб побачити, куди воно веде. Увімкнена [MFA] захищає навіть тоді, коли пароль украли.',
          ),
        ),
        passingScore: 80,
        showAnswers: true,
      }),
      // Blocking: opens once both exercises above are answered.
      block('continue', { mode: 'restricted', label: tr(L('Continue', 'Продовжити')) }),
      block('heading', { level: 2, text: tr(L('Clicked a bad link? Act fast', 'Клікнули на підозріле посилання? Дійте швидко')) }),
      block('timeline', {
        layout: 'stepper',
        items: [
          { id: id('tl'), label: tr(L('Step 1', 'Крок 1')), title: tr(L('Disconnect', 'Від’єднайтеся')), text: tr(L('Close the page and don’t enter anything else. If a file was downloaded, disconnect from the network.', 'Закрийте сторінку й нічого більше не вводьте. Якщо завантажився файл — від’єднайтеся від мережі.')) },
          { id: id('tl'), label: tr(L('Step 2', 'Крок 2')), title: tr(L('Change your password', 'Змініть пароль')), text: tr(L('From a trusted device, change the password and sign out of all sessions.', 'З довіреного пристрою змініть пароль і вийдіть з усіх сеансів.')) },
          { id: id('tl'), label: tr(L('Step 3', 'Крок 3')), title: tr(L('Report it', 'Повідомте')), text: tr(L('Tell your security team right away. Speed matters more than embarrassment.', 'Одразу повідомте службу безпеки. Швидкість важливіша за незручність.')) },
          { id: id('tl'), label: tr(L('Step 4', 'Крок 4')), title: tr(L('Watch for activity', 'Стежте за активністю')), text: tr(L('Check your account and bank statements for anything unusual over the next weeks.', 'Кілька тижнів перевіряйте акаунт і банківські виписки на незвичні операції.')) },
        ],
      }),
      block('note', {
        variant: 'success',
        text: tr(L('Key point: reporting fast matters more than feeling embarrassed — security teams would rather get ten false alarms than miss one real attack.', 'Головне: швидко повідомити важливіше за незручність — служба безпеки радше отримає десять хибних тривог, ніж пропустить одну справжню атаку.')),
      }),
      block('heading', { level: 2, text: tr(L('How to report a phishing email', 'Як повідомити про фішинговий лист')) }),
      block('steps', {
        layout: 'list',
        steps: [
          {
            id: id('step'),
            title: tr(L('Don’t interact', 'Нічого не робіть із листом')),
            html: p(L('Don’t reply, click links or open attachments — not even “just to check”.', 'Не відповідайте, не клікайте посилання й не відкривайте вкладення — навіть «просто перевірити».')),
          },
          {
            id: id('step'),
            title: tr(L('Use the Report button', 'Натисніть «Повідомити»')),
            html: p(L(
              'In your mail app choose <strong>Report → Phishing</strong>. No such button? Forward the email as an attachment to <a href="mailto:security@yourcompany.com" target="_blank" rel="noopener noreferrer">security@yourcompany.com</a>.',
              'У поштовій програмі оберіть <strong>Повідомити → Фішинг</strong>. Немає такої кнопки? Перешліть лист як вкладення на <a href="mailto:security@yourcompany.com" target="_blank" rel="noopener noreferrer">security@yourcompany.com</a>.',
            )),
            src: reportButtonArt({
              reply: tr(L('Reply', 'Відповісти')),
              forward: tr(L('Forward', 'Переслати')),
              report: tr(L('Report phishing', 'Повідомити про фішинг')),
            }),
            alt: tr(L('A mail toolbar with the “Report phishing” button highlighted', 'Панель пошти з виділеною кнопкою «Повідомити про фішинг»')),
          },
          {
            id: id('step'),
            title: tr(L('Delete it', 'Видаліть лист')),
            html: p(L('Once it’s reported, delete the email — and empty it from Deleted items too.', 'Коли повідомили, видаліть лист — і з папки «Видалені» теж.')),
          },
        ],
      }),
      block('comparison', {
        columns: [
          {
            id: id('col'),
            title: tr(L('Do', 'Робіть')),
            tone: 'pro',
            items: [
              tr(L('Hover over links before clicking', 'Наводьте курсор на посилання перед кліком')),
              tr(L('Verify requests through a known channel', 'Перевіряйте запити через відомий канал')),
              tr(L('Turn on MFA everywhere', 'Вмикайте MFA всюди')),
            ],
          },
          {
            id: id('col'),
            title: tr(L('Don’t', 'Не робіть')),
            tone: 'con',
            items: [
              tr(L('Open unexpected attachments', 'Не відкривайте неочікувані вкладення')),
              tr(L('Share passwords or one-time codes', 'Не повідомляйте паролі чи одноразові коди')),
              tr(L('Let urgency rush your decision', 'Не піддавайтеся тиску терміновості')),
            ],
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Your turn', 'Ваша черга')) }),
      block('reflection', {
        prompt: tr(L(
          'Think of the last message that made you hesitate. What gave it away — or what would you check now before clicking?',
          'Згадайте останнє повідомлення, яке вас насторожило. Що його видало — або що б ви перевірили тепер, перш ніж клікнути?',
        )),
        sample: tr(L(
          'For example: “An SMS said my parcel was on hold and asked for a small fee. I wasn’t expecting a delivery and the link was a short URL. Now I’d open the courier’s app myself instead of the link — and report the message.”',
          'Наприклад: «SMS писало, що мою посилку затримано, і просило сплатити невелику суму. Я не чекав(-ла) доставки, а посилання було скороченим. Тепер я сам(-а) відкрию застосунок перевізника замість посилання — і повідомлю про це SMS».',
        )),
      }),
      block('quote', {
        variant: 'statement',
        text: tr(L('Amateurs hack systems; professionals hack people.', 'Аматори зламують системи, професіонали — людей.')),
        author: 'Bruce Schneier',
      }, 'gradient', 'spacious', 'full'),
      block('attachment', {
        title: tr(L('Take it with you', 'Візьміть із собою')),
        files: [
          {
            id: id('file'),
            name: tr(L('phishing-checklist.txt', 'чекліст-фішинг.txt')),
            src: textFile(tr(L(
              'PHISHING CHECKLIST\n\n[ ] Is the sender address exactly right?\n[ ] Does the message rush or threaten me?\n[ ] Was I expecting this link or file?\n[ ] Does it ask for a password or a code?\n[ ] When in doubt: verify through a known channel and report it.\n',
              'ЧЕКЛІСТ: ФІШИНГ\n\n[ ] Адреса відправника точно правильна?\n[ ] Лист мене квапить чи погрожує?\n[ ] Я чекав(-ла) це посилання чи файл?\n[ ] Мене просять пароль чи код?\n[ ] Якщо сумніваєтеся: перевірте через відомий канал і повідомте.\n',
            ))),
            size: 260,
          },
        ],
      }, 'muted'),
    ],
  }

  // ── Lesson 4: Final test ──────────────────────────────────────────────────
  const opt = (text: Text, correct: boolean, feedback?: Text) => ({
    id: id('opt'),
    text: tr(text),
    correct,
    ...(feedback ? { feedback: tr(feedback) } : {}),
  })
  const test: Lesson = {
    id: id('lesson'),
    title: tr(L('Final test', 'Фінальний тест')),
    status: 'published',
    blocks: [
      block('divider', { style: 'label', label: tr(L('Final test', 'Фінальний тест')) }),
      block('heading', { level: 2, text: tr(L('Check yourself', 'Перевірте себе')), align: 'center' }),
      block('paragraph', {
        html: p(L('Pass with 80% or more to complete the course. Your score is reported to the LMS.', 'Наберіть 80% або більше, щоб завершити курс. Ваш результат передається в LMS.')),
      }),
      block('quiz', {
        passingScore: 80,
        showAnswers: true,
        questions: [
          {
            id: id('q'),
            type: 'single',
            prompt: tr(L('Your “bank” calls and asks for the one-time code you just received. What do you do?', 'Вам телефонує «банк» і просить щойно отриманий одноразовий код. Що ви робите?')),
            options: [
              opt(L('Read the code out — they called me, so it’s the bank', 'Диктую код — вони ж самі подзвонили, отже це банк'), false, L('Anyone can fake a caller ID.', 'Номер абонента легко підробити.')),
              opt(L('Hang up and call the number on the back of my card', 'Кладу слухавку й телефоную за номером на звороті картки'), true, L('Right: verify through a channel you trust.', 'Так: перевіряйте через канал, якому довіряєте.')),
              opt(L('Send the code by SMS instead', 'Надсилаю код через SMS'), false),
            ],
          },
          {
            id: id('q'),
            type: 'multiple',
            prompt: tr(L('Which of these are red flags? Select all that apply.', 'Що з цього є тривожними ознаками? Оберіть усі правильні варіанти.')),
            options: [
              opt(L('A sender domain with a typo', 'Домен відправника з помилкою'), true),
              opt(L('A threat to close your account today', 'Погроза сьогодні ж закрити акаунт'), true),
              opt(L('Your name spelled correctly', 'Правильно написане ваше ім’я'), false),
              opt(L('A request for your password', 'Прохання назвати пароль'), true),
            ],
          },
          {
            id: id('q'),
            type: 'matching',
            prompt: tr(L('Match each attack to its channel.', 'Зіставте атаку з її каналом.')),
            pairs: [
              { id: id('pair'), left: tr(L('Phishing', 'Фішинг')), right: tr(L('Email', 'Пошта')) },
              { id: id('pair'), left: tr(L('Smishing', 'Смішинг')), right: 'SMS' },
              { id: id('pair'), left: tr(L('Vishing', 'Вішинг')), right: tr(L('Phone call', 'Телефонний дзвінок')) },
            ],
          },
          {
            id: id('q'),
            type: 'fillBlanks',
            mode: 'select',
            prompt: tr(L('Complete the rules.', 'Доповніть правила.')),
            text: tr(
              L(
                'Your bank or IT will never ask for your [password] or a one-time [code]. If a message rushes you, [verify] it through a channel you trust.',
                'Банк чи ІТ ніколи не попросять ваш [пароль] чи одноразовий [код]. Якщо лист вас квапить, [перевірте] його через канал, якому довіряєте.',
              ),
            ),
          },
          {
            id: id('q'),
            type: 'sequence',
            prompt: tr(L('A suspicious email arrives. Put your steps in order.', 'Надійшов підозрілий лист. Розставте свої дії по порядку.')),
            items: [
              { id: id('item'), text: tr(L('Don’t click links or open attachments', 'Не клікайте посилання й не відкривайте вкладення')) },
              { id: id('item'), text: tr(L('Check the sender’s address', 'Перевірте адресу відправника')) },
              { id: id('item'), text: tr(L('Report it to your security team', 'Повідомте службу безпеки')) },
              { id: id('item'), text: tr(L('Delete the email', 'Видаліть лист')) },
            ],
          },
        ],
      }),
    ],
  }

  return {
    id: 'sample-course',
    title: tr(L('Spot the phish: security basics in 15 minutes', 'Розпізнай фішинг: основи безпеки за 15 хвилин')),
    description: tr(
      L(
        'A short sample course made with Scormly: interactive hotspots, a before / after slider, a process diagram, a chat scenario, exercises, a reflection and a scored final test.',
        'Короткий приклад курсу, створений у Scormly: інтерактивне зображення, слайдер «до / після», схема процесу, чат-сценарій, вправи, рефлексія та фінальний тест з оцінюванням.',
      ),
    ),
    theme: 'ocean',
    coverImage: coverArt(),
    intro: {
      enabled: true,
      layout: 'cover',
      eyebrow: tr(L('Security basics · 15 min', 'Основи безпеки · 15 хв')),
      showOutline: true,
    },
    settings: {
      ...DEFAULT_COURSE_SETTINGS,
      contentLanguage: lang,
      blockAnimation: 'slide',
      lessonTransition: 'slide',
      finishMessage: tr(
        L(
          'Great job! You now know how to spot and handle phishing. Stay alert — and share what you learned with your team.',
          'Чудова робота! Тепер ви знаєте, як розпізнати фішинг і що робити. Будьте пильні — і поділіться знаннями з командою.',
        ),
      ),
    },
    lessons: [welcome, anatomy, practice, test],
  }
}
