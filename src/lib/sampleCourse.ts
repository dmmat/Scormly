import type { Block, Course, Lesson } from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
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
): Block {
  return { id: id('block'), type, settings: { spacing: 'normal' }, data } as Block
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
      block('heading', { level: 1, text: tr(L('Spot the phish', 'Розпізнай фішинг')) }),
      block('paragraph', {
        html: p(
          L(
            'Nine out of ten cyberattacks start with an email. In the next <strong>15 minutes</strong> you will learn to recognise phishing, react calmly when something looks wrong, and protect yourself and your team.',
            'Дев’ять із десяти кібератак починаються з листа. За наступні <strong>15 хвилин</strong> ви навчитеся розпізнавати фішинг, спокійно реагувати на підозрілі повідомлення та захищати себе й команду.',
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
      block('heading', { level: 2, text: tr(L('What you will learn', 'Чого ви навчитеся')) }),
      block('list', {
        ordered: false,
        items: [
          tr(L('The five red flags of a phishing message', 'П’ять тривожних ознак фішингового повідомлення')),
          tr(L('How phishing looks in email, SMS and phone calls', 'Як виглядає фішинг у пошті, SMS і дзвінках')),
          tr(L('What to do in the first minutes after a suspicious click', 'Що робити в перші хвилини після підозрілого кліку')),
        ],
      }),
      block('courseOutline', { title: tr(L('Course outline', 'Зміст курсу')), numbered: true }),
      block('continue', { mode: 'unrestricted', label: tr(L('Let’s start', 'Почнімо')) }),
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
            x: 91,
            y: 29,
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
      block('heading', { level: 2, text: tr(L('Key terms', 'Ключові терміни')) }),
      block('flashcards', {
        cards: [
          { id: id('card'), front: tr(L('Phishing', 'Фішинг')), back: tr(L('A fake message that tricks you into revealing data or installing malware.', 'Фальшиве повідомлення, яке змушує вас розкрити дані чи встановити шкідливу програму.')) },
          { id: id('card'), front: tr(L('Spear phishing', 'Цільовий фішинг')), back: tr(L('Phishing tailored to one person, using details about their job or life.', 'Фішинг, підлаштований під конкретну людину з деталями про її роботу чи життя.')) },
          { id: id('card'), front: tr(L('Spoofing', 'Спуфінг')), back: tr(L('Faking a sender name, address or phone number to look trustworthy.', 'Підробка імені, адреси чи номера відправника, щоб викликати довіру.')) },
          { id: id('card'), front: 'MFA', back: tr(L('Multi-factor authentication: a second proof of identity that stops most stolen-password attacks.', 'Багатофакторна автентифікація: другий доказ особи, що зупиняє більшість атак з украденим паролем.')) },
        ],
      }),
      block('continue', { mode: 'unrestricted', label: tr(L('Continue', 'Далі')) }),
    ],
  }

  // ── Lesson 3: Practice ────────────────────────────────────────────────────
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
      block('table', {
        header: true,
        rows: [
          [tr(L('Do', 'Робіть')), tr(L('Don’t', 'Не робіть'))],
          [tr(L('Hover over links before clicking', 'Наводьте курсор на посилання перед кліком')), tr(L('Open unexpected attachments', 'Відкривати неочікувані вкладення'))],
          [tr(L('Verify requests through a known channel', 'Перевіряти запити через відомий канал')), tr(L('Share passwords or one-time codes', 'Повідомляти паролі чи одноразові коди'))],
          [tr(L('Turn on MFA everywhere', 'Вмикати MFA всюди')), tr(L('Let urgency rush your decision', 'Піддаватися тиску терміновості'))],
        ],
      }),
      block('quote', {
        text: tr(L('Amateurs hack systems; professionals hack people.', 'Аматори зламують системи, професіонали — людей.')),
        author: 'Bruce Schneier',
      }),
      block('continue', { mode: 'unrestricted', label: tr(L('To the final test', 'До фінального тесту')) }),
    ],
  }

  // ── Lesson 4: Final test ──────────────────────────────────────────────────
  const catSafe = id('cat')
  const catPhish = id('cat')
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
      block('heading', { level: 2, text: tr(L('Check yourself', 'Перевірте себе')) }),
      block('paragraph', {
        html: p(L('Pass with 80% or more to complete the course. Your score is reported to the LMS.', 'Наберіть 80% або більше, щоб завершити курс. Ваш результат передається в LMS.')),
      }),
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
        ],
      }),
    ],
  }

  return {
    id: 'sample-course',
    title: tr(L('Spot the phish: security basics in 15 minutes', 'Розпізнай фішинг: основи безпеки за 15 хвилин')),
    description: tr(
      L(
        'A short sample course made with Scormly: interactive hotspots, a chat scenario, exercises and a scored final test.',
        'Короткий приклад курсу, створений у Scormly: інтерактивне зображення, чат-сценарій, вправи та фінальний тест з оцінюванням.',
      ),
    ),
    theme: 'ocean',
    settings: {
      ...DEFAULT_COURSE_SETTINGS,
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
