// Catalogue of short dialogue scenarios played by the landing-page chat demo.
// Each scenario is a self-contained mini-conversation (3–5 steps): the bot
// speaks, the learner picks an answer, the bot reacts. Texts are bilingual
// (en/uk) and live inline here — these aren't UI strings, they're content
// for the auto-playing demo, so we don't route them through i18n locales.
//
// The chat demo shuffles this list at mount and walks through it without
// repeats; once exhausted it re-shuffles. To add a scenario, append a new
// entry below — keep `pick` valid (index into `opts`) and bot replies short
// enough to fit one phone-screen bubble.

export type LocalizedString = { en: string; uk: string }

export type ChatStep =
  | { kind: 'bot'; text: LocalizedString }
  | { kind: 'choices'; opts: LocalizedString[]; pick: number }

export interface ChatScenario {
  id: string
  /** Character name shown in the chat header. */
  name: LocalizedString
  /** Status line under the name (e.g. "online", "HR Lead"). */
  status: LocalizedString
  steps: ChatStep[]
}

// Tiny helper so the long literal below stays readable.
const L = (en: string, uk: string): LocalizedString => ({ en, uk })

export const chatScenarios: ChatScenario[] = [
  // ─── Onboarding ────────────────────────────────────────────────────────────
  {
    id: 'onboarding-welcome',
    name: L('Ksiu', 'Ксюша'),
    status: L('online', 'онлайн'),
    steps: [
      { kind: 'bot', text: L("Hi! I'm Ksiu. Ready for a 2-minute onboarding?", 'Привіт! Я Ксюша. Готові до 2-хвилинного онбордингу?') },
      { kind: 'choices', opts: [L("Let's do it", 'Поїхали'), L('What will we cover?', 'Що будемо проходити?')], pick: 0 },
      { kind: 'bot', text: L('Great. Where do you log your work hours?', 'Чудово. Де ви фіксуєте робочі години?') },
      { kind: 'choices', opts: [L('In the HR portal', 'У HR-порталі'), L('By email', 'Електронною поштою')], pick: 0 },
      { kind: 'bot', text: L("Spot on. You're a natural at this — see you inside!", 'Саме так. У вас чудово виходить — до зустрічі всередині!') },
    ],
  },
  {
    id: 'onboarding-time-off',
    name: L('Anna', 'Аня'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L('Quick check — how do you request a day off?', 'Швидке питання — як замовити відгул?') },
      { kind: 'choices', opts: [L('Submit in the HR portal', 'Заявка в HR-порталі'), L('Just message my lead', 'Просто написати керівнику')], pick: 0 },
      { kind: 'bot', text: L('Right. Your lead approves it from the same portal.', 'Так. Керівник підтверджує її там же.') },
    ],
  },
  {
    id: 'onboarding-expenses',
    name: L('Ksiu', 'Ксюша'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L('You bought a keyboard for work. What now?', 'Ви купили клавіатуру для роботи. Що далі?') },
      { kind: 'choices', opts: [L('Upload the receipt to Finance', 'Завантажити чек у Finance'), L('Wait for someone to ask', 'Чекати, поки запитають')], pick: 0 },
      { kind: 'bot', text: L('Exactly — reimbursement runs every Friday.', 'Точно — компенсації йдуть щоп’ятниці.') },
    ],
  },
  {
    id: 'onboarding-team',
    name: L('Ksiu', 'Ксюша'),
    status: L('online', 'онлайн'),
    steps: [
      { kind: 'bot', text: L("Let's meet your team. Want intros now or later?", 'Знайомимось з командою. Зараз чи пізніше?') },
      { kind: 'choices', opts: [L('Now, please', 'Зараз, будь ласка'), L('After lunch', 'Після обіду')], pick: 0 },
      { kind: 'bot', text: L("Cool — I'll bring them into a quick huddle.", 'Окей — зберу їх у короткий huddle.') },
    ],
  },
  {
    id: 'onboarding-first-project',
    name: L('Ksiu', 'Ксюша'),
    status: L('Tech Lead', 'Тимлід') ,
    steps: [
      { kind: 'bot', text: L('Your first ticket is ready. Pick a starting point.', 'Ваше перше завдання готове. Звідки почнемо?') },
      { kind: 'choices', opts: [L('Read the codebase tour', 'Почитати огляд кодової бази'), L('Jump straight in', 'Одразу до коду')], pick: 0 },
      { kind: 'bot', text: L('Smart — the tour saves a day of guesswork.', 'Розумно — огляд економить день здогадок.') },
    ],
  },
  {
    id: 'onboarding-tooling',
    name: L('Dmytro', 'Дмитро'),
    status: L('Tech Lead', 'Тимлід'),
    steps: [
      { kind: 'bot', text: L('Need access to the staging environment?', 'Потрібен доступ до staging?') },
      { kind: 'choices', opts: [L('Yes, please', 'Так, будь ласка'), L("I'll figure it out", 'Розберуся сам')], pick: 0 },
      { kind: 'bot', text: L("I'll provision SSO and ping you in 5.", 'Налаштую SSO і напишу за 5 хвилин.') },
    ],
  },
  {
    id: 'onboarding-mentor',
    name: L('Maksym', 'Максим'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L('Would you like a buddy for the first month?', 'Хочете бадді на перший місяць?') },
      { kind: 'choices', opts: [L('Yes — really helpful', 'Так — це дуже допоможе'), L('Maybe later', 'Можливо пізніше')], pick: 0 },
      { kind: 'bot', text: L("I'll match you tomorrow. Coffee usually breaks the ice.", 'Підберу завтра. Кава зазвичай зближує.') },
    ],
  },
  {
    id: 'onboarding-conduct',
    name: L('Anna', 'Аня'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L('Last bit: any questions on the Code of Conduct?', 'Останнє: запитання щодо Кодексу поведінки?') },
      { kind: 'choices', opts: [L('All clear', 'Усе зрозуміло'), L("I'll re-read it", 'Перечитаю ще раз')], pick: 0 },
      { kind: 'bot', text: L("Perfect. Welcome aboard — you're set!", 'Чудово. Ласкаво просимо — ви у складі!') },
    ],
  },

  // ─── Sales ─────────────────────────────────────────────────────────────────
  {
    id: 'sales-price-objection',
    name: L('Ksiu', 'Ксюша'),
    status: L('Sales Coach', 'Тренерка продажів'),
    steps: [
      { kind: 'bot', text: L('Client says "it’s too expensive." Your move?', 'Клієнт каже «дорого». Що відповідаєте?') },
      { kind: 'choices', opts: [L('Ask what they compared it to', 'Запитати, з чим порівнюють'), L('Offer a discount', 'Запропонувати знижку')], pick: 0 },
      { kind: 'bot', text: L('Yes — anchor before discounting, always.', 'Так — спочатку прояснити контекст, потім — знижки.') },
    ],
  },
  {
    id: 'sales-discovery',
    name: L('Betty', 'Беті'),
    status: L('Sales Coach', 'Тренерка продажів'),
    steps: [
      { kind: 'bot', text: L('Best opening question in a discovery call?', 'Найкраще питання на discovery-дзвінку?') },
      { kind: 'choices', opts: [L('"What does success look like for you?"', '«Як виглядає для вас успіх?»'), L('"Want to see a demo?"', '«Покажу демо?»')], pick: 0 },
      { kind: 'bot', text: L('Right. Outcome > features, every time.', 'Так. Результати важливіші за фічі — завжди.') },
    ],
  },
  {
    id: 'sales-followup',
    name: L('Betty', 'Беті'),
    status: L('Sales Coach', 'Тренерка продажів'),
    steps: [
      { kind: 'bot', text: L('When do you follow up after a warm demo?', 'Коли робите follow-up після «теплого» демо?') },
      { kind: 'choices', opts: [L('Within 24 hours', 'Протягом 24 годин'), L('Next week', 'На наступному тижні')], pick: 0 },
      { kind: 'bot', text: L('Within a day — momentum is fuel.', 'Протягом доби — імпульс це паливо.') },
    ],
  },
  {
    id: 'sales-stakeholders',
    name: L('Betty', 'Беті'),
    status: L('Sales Coach', 'Тренерка продажів'),
    steps: [
      { kind: 'bot', text: L('Champion loves you but legal hasn’t weighed in. Next step?', 'Champion за вас, але юристи мовчать. Далі?') },
      { kind: 'choices', opts: [L('Map every stakeholder now', 'Замапити всіх stakeholder-ів'), L('Push for the signature', 'Тиснути на підпис')], pick: 0 },
      { kind: 'bot', text: L('Mapping wins deals — surprises kill them.', 'Мапа стейкхолдерів виграє угоди, сюрпризи — вбивають.') },
    ],
  },
  {
    id: 'sales-renewal',
    name: L('Betty', 'Беті'),
    status: L('Sales Coach', 'Тренерка продажів'),
    steps: [
      { kind: 'bot', text: L('Renewal in 30 days. Best signal of risk?', 'Renewal через 30 днів. Найкращий сигнал ризику?') },
      { kind: 'choices', opts: [L('Drop in product usage', 'Падіння використання продукту'), L('Tone of last email', 'Тон останнього листа')], pick: 0 },
      { kind: 'bot', text: L("Usage data doesn't lie. Always check it first.", 'Дані не брешуть. Завжди спочатку дивимось на них.') },
    ],
  },

  // ─── Customer support ─────────────────────────────────────────────────────
  {
    id: 'cs-password',
    name: L('Ksiu', 'Ксюша'),
    status: L('CX Mentor', 'Менторка CX'),
    steps: [
      { kind: 'bot', text: L('Customer locked out. They\'re frustrated. Open with…', 'Клієнт не може зайти. Він нервує. Починаємо з…') },
      { kind: 'choices', opts: [L('Acknowledge the frustration', 'Визнаємо емоції'), L('Send the reset link', 'Шлемо лінк скидання')], pick: 0 },
      { kind: 'bot', text: L('Empathy first — fix follows immediately.', 'Спершу емпатія — потім одразу рішення.') },
    ],
  },
  {
    id: 'cs-billing',
    name: L('Anna', 'Аня'),
    status: L('CX Mentor', 'Менторка CX'),
    steps: [
      { kind: 'bot', text: L('Duplicate charge on the account. What do you say?', 'Подвійне списання. Як відповідаємо?') },
      { kind: 'choices', opts: [L("I'll refund right now and confirm by email", 'Поверну зараз і підтверджу листом'), L('Need to check with Finance', 'Маю перевірити з фінансами')], pick: 0 },
      { kind: 'bot', text: L('Action beats apology. Confirmation closes the loop.', 'Дія важливіша за вибачення. Підтвердження — закриває коло.') },
    ],
  },
  {
    id: 'cs-feature-request',
    name: L('Ivan', 'Іван'),
    status: L('CX Mentor', 'Менторка CX'),
    steps: [
      { kind: 'bot', text: L('User asks for a feature we won\'t build. Reply?', 'Користувач просить фічу, яку ми не зробимо. Відповідь?') },
      { kind: 'choices', opts: [L("Thank them, share why, suggest a workaround", 'Подякувати, пояснити чому, підказати workaround'), L('Promise to "look into it"', 'Пообіцяти «розглянути»')], pick: 0 },
      { kind: 'bot', text: L('Honest > vague. Customers respect clarity.', 'Чесність > туманність. Клієнти цінують ясність.') },
    ],
  },
  {
    id: 'cs-angry',
    name: L('Anna', 'Аня'),
    status: L('CX Mentor', 'Менторка CX'),
    steps: [
      { kind: 'bot', text: L('Customer is shouting. First priority?', 'Клієнт кричить. Найперший крок?') },
      { kind: 'choices', opts: [L('Stay calm, let them finish', 'Зберігати спокій, дати договорити'), L('Interrupt with the solution', 'Перебити рішенням')], pick: 0 },
      { kind: 'bot', text: L('Listen, then act. People de-escalate when heard.', 'Послухати, потім діяти. Люди заспокоюються, коли їх чують.') },
    ],
  },
  {
    id: 'cs-handoff',
    name: L('Ivan', 'Іван'),
    status: L('CX Mentor', 'Менторка CX'),
    steps: [
      { kind: 'bot', text: L('You need to escalate. What do you give the next agent?', 'Треба ескалейтнути. Що передаєте колезі?') },
      { kind: 'choices', opts: [L('Full context + what was tried', 'Повний контекст + що пробували'), L('Just the ticket ID', 'Лише ID тікета')], pick: 0 },
      { kind: 'bot', text: L('Context saves the customer from repeating themselves.', 'Контекст рятує клієнта від повторювань.') },
    ],
  },

  // ─── IT support ───────────────────────────────────────────────────────────
  {
    id: 'it-vpn',
    name: L('Nazar', 'Назар'),
    status: L('IT', 'IT'),
    steps: [
      { kind: 'bot', text: L("VPN won't connect. First thing you check?", 'VPN не конектиться. Що перевіряємо першим?') },
      { kind: 'choices', opts: [L('Internet works at all?', 'Чи взагалі є інтернет?'), L('Reinstall the VPN client', 'Перевстановити VPN-клієнт')], pick: 0 },
      { kind: 'bot', text: L('Always test the simpler layer first.', 'Завжди спершу перевіряємо нижчий рівень.') },
    ],
  },
  {
    id: 'it-laptop',
    name: L('Nazar', 'Назар'),
    status: L('IT', 'IT'),
    steps: [
      { kind: 'bot', text: L('Laptop is slow. Step one?', 'Ноутбук гальмує. Крок 1?') },
      { kind: 'choices', opts: [L('Reboot and check pending updates', 'Ребут + апдейти'), L('Order a new one', 'Замовити новий')], pick: 0 },
      { kind: 'bot', text: L('Reboot fixes more than people admit.', 'Ребут лікує більше, ніж люди визнають.') },
    ],
  },
  {
    id: 'it-software',
    name: L('Nazar', 'Назар'),
    status: L('IT', 'IT'),
    steps: [
      { kind: 'bot', text: L('Need new software. Approved path?', 'Треба нове ПЗ. Правильний шлях?') },
      { kind: 'choices', opts: [L('Request via the IT catalog', 'Запит через IT-каталог'), L('Download from any site', 'Завантажити звідки завгодно')], pick: 0 },
      { kind: 'bot', text: L('Catalog = licensed and security-checked.', 'Каталог = ліцензовано та перевірено безпекою.') },
    ],
  },
  {
    id: 'it-lost-device',
    name: L('Ksiu', 'Ксюша'),
    status: L('IT', 'IT'),
    steps: [
      { kind: 'bot', text: L("Lost your laptop. What's first?", 'Загубили ноутбук. Що першим?') },
      { kind: 'choices', opts: [L('Report to IT immediately', 'Одразу повідомити IT'), L('Search for it tomorrow', 'Пошукати завтра')], pick: 0 },
      { kind: 'bot', text: L("We'll wipe it remotely. Minutes matter.", 'Зробимо віддалене стирання. Хвилини мають значення.') },
    ],
  },

  // ─── HR ───────────────────────────────────────────────────────────────────
  {
    id: 'hr-vacation',
    name: L('Ivan', 'Іван'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L('Planning vacation. How far ahead do you tell your lead?', 'Плануєте відпустку. Наскільки заздалегідь кажете керівнику?') },
      { kind: 'choices', opts: [L('At least two weeks', 'Щонайменше за 2 тижні'), L('The day before', 'За день до')], pick: 0 },
      { kind: 'bot', text: L('Two weeks lets the team plan coverage.', 'Два тижні дають команді спланувати підміну.') },
    ],
  },
  {
    id: 'hr-sick',
    name: L('Anna', 'Аня'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L("Sick this morning. What's right?", 'Захворіли зранку. Як правильно?') },
      { kind: 'choices', opts: [L('Message your lead + log in the portal', 'Повідомити керівника + позначити у порталі'), L('Just rest, sort it later', 'Просто відпочити, розберемось пізніше')], pick: 0 },
      { kind: 'bot', text: L('Quick ping today saves a chase tomorrow.', 'Швидке повідомлення сьогодні економить пошуки завтра.') },
    ],
  },
  {
    id: 'hr-1on1',
    name: L('Ksiu', 'Ксюша'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L('Best topic for a 1:1 with your manager?', 'Найкраща тема для 1:1 з керівником?') },
      { kind: 'choices', opts: [L("What's blocking you", 'Що вас блокує'), L('Office snack supply', 'Запас снеків у офісі')], pick: 0 },
      { kind: 'bot', text: L('Unblocking you is literally their job.', 'Розблокувати вас — буквально їхня робота.') },
    ],
  },
  {
    id: 'hr-feedback',
    name: L('Serhii', 'Сергій'),
    status: L('HR Lead', 'Керівниця HR'),
    steps: [
      { kind: 'bot', text: L('Peer feedback — when does it land best?', 'Peer feedback — коли він найкраще «заходить»?') },
      { kind: 'choices', opts: [L('Soon after the moment', 'Невдовзі після ситуації'), L('Once a year in review', 'Раз на рік на review')], pick: 0 },
      { kind: 'bot', text: L('Fresh + specific. That\'s the recipe.', 'Свіже + конкретне. Ось рецепт.') },
    ],
  },

  // ─── Security awareness ───────────────────────────────────────────────────
  {
    id: 'sec-phishing',
    name: L('Ksiu', 'Ксюша'),
    status: L('Security', 'Безпека'),
    steps: [
      { kind: 'bot', text: L('Email from "CEO": "wire $5k now, urgent." You…?', 'Лист від «CEO»: «терміново переказати $5k». Ви…?') },
      { kind: 'choices', opts: [L('Report it as phishing', 'Поскаржитись як на фішинг'), L('Wire it just in case', 'На всяк випадок — переказати')], pick: 0 },
      { kind: 'bot', text: L('Urgency + money = always verify out-of-band.', 'Терміновість + гроші = завжди перевіряємо іншим каналом.') },
    ],
  },
  {
    id: 'sec-password',
    name: L('Serhii', 'Сергій'),
    status: L('Security', 'Безпека'),
    steps: [
      { kind: 'bot', text: L('Best place to store a strong password?', 'Найкраще місце для надійного пароля?') },
      { kind: 'choices', opts: [L('A password manager', 'У парольному менеджері'), L('A sticky note', 'На стікері')], pick: 0 },
      { kind: 'bot', text: L('Manager = strong, unique, autofill safely.', 'Менеджер = надійні, унікальні, авто-fill без ризику.') },
    ],
  },
  {
    id: 'sec-usb',
    name: L('Serhii', 'Сергій'),
    status: L('Security', 'Безпека'),
    steps: [
      { kind: 'bot', text: L('You find a USB in the parking lot. Do you…', 'Знайшли USB на парковці. Ви…') },
      { kind: 'choices', opts: [L('Hand it to IT, unopened', 'Передаєте IT, не відкривши'), L('Plug it in to find the owner', 'Підключаєте, щоб знайти власника')], pick: 0 },
      { kind: 'bot', text: L('Classic bait. IT will handle it safely.', 'Класична наживка. IT обробить безпечно.') },
    ],
  },
  {
    id: 'sec-public-wifi',
    name: L('Serhii', 'Сергій'),
    status: L('Security', 'Безпека'),
    steps: [
      { kind: 'bot', text: L('Working from a café. Safe to log into the admin panel?', 'Працюєте з кафе. Безпечно зайти в адмінку?') },
      { kind: 'choices', opts: [L('Only over the company VPN', 'Лише через корпоративний VPN'), L('Sure, on open Wi-Fi', 'Так, на відкритому Wi-Fi')], pick: 0 },
      { kind: 'bot', text: L('VPN turns the café into your office.', 'VPN перетворює кафе на ваш офіс.') },
    ],
  },
  {
    id: 'sec-screen-lock',
    name: L('Serhii', 'Сергій'),
    status: L('Security', 'Безпека'),
    steps: [
      { kind: 'bot', text: L('Leaving the desk for 30 seconds — lock or no?', 'Відходите на 30 секунд — лочити чи ні?') },
      { kind: 'choices', opts: [L('Lock. Always.', 'Лочити. Завжди.'), L('Too short to bother', 'Замало, щоб морочитись')], pick: 0 },
      { kind: 'bot', text: L('30 seconds is enough for someone to act.', '30 секунд — досить, щоб хтось встиг.') },
    ],
  },

  // ─── Soft skills ──────────────────────────────────────────────────────────
  {
    id: 'soft-saying-no',
    name: L('Ksiu', 'Ксюша'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L("Plate is full and a new request lands. You…?", 'Завдань вже забагато, прилітає нове. Ви…?') },
      { kind: 'choices', opts: [L('Negotiate priorities with your lead', 'Узгоджуєте пріоритети з керівником'), L("Say yes and hope", 'Кажете так і сподіваєтесь')], pick: 0 },
      { kind: 'bot', text: L('"Yes" without trade-offs becomes a missed deadline.', '«Так» без trade-off перетворюється на зриви.') },
    ],
  },
  {
    id: 'soft-listening',
    name: L('Kuzia', 'Кузя'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('Strongest sign of active listening?', 'Найсильніша ознака активного слухання?') },
      { kind: 'choices', opts: [L('Paraphrasing back', 'Перефразування'), L('Nodding a lot', 'Багато кивати')], pick: 0 },
      { kind: 'bot', text: L('Paraphrase proves understanding. Nods don\'t.', 'Перефразування показує розуміння. Кивки — ні.') },
    ],
  },
  {
    id: 'soft-meeting',
    name: L('Kuzia', 'Кузя'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('Meeting drifts off-topic. Your move?', 'Зустріч уходить у бік. Ваш хід?') },
      { kind: 'choices', opts: [L('"Great point — let\'s park it"', '«Гарна думка — паркуємо її»'), L('Wait and hope it returns', 'Чекаємо й сподіваємось')], pick: 0 },
      { kind: 'bot', text: L('Park & return. The agenda thanks you.', 'Park & return. Agenda дякує вам.') },
    ],
  },
  {
    id: 'soft-disagree',
    name: L('Ivan', 'Іван'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('You disagree with a teammate in a review. How?', 'Не згодні з колегою на review. Як?') },
      { kind: 'choices', opts: [L('Critique the work, not the person', 'Критикуємо роботу, не людину'), L('Soften everything to nothing', 'Все згладити до нуля')], pick: 0 },
      { kind: 'bot', text: L("Direct + kind. That's the standard.", 'Прямо + по-доброму. Це стандарт.') },
    ],
  },
  {
    id: 'soft-async',
    name: L('Ivan', 'Іван'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('Async message vs quick call — when do you call?', 'Async-повідомлення чи дзвінок — коли дзвоните?') },
      { kind: 'choices', opts: [L('When 5+ messages can\'t resolve it', 'Коли 5+ повідомлень не вирішують'), L('Whenever I feel like it', 'Коли захочеться')], pick: 0 },
      { kind: 'bot', text: L('Default async, escalate when stuck.', 'За замовчуванням — async, ескалюємо коли застрягли.') },
    ],
  },

  // ─── Leadership ───────────────────────────────────────────────────────────
  {
    id: 'lead-delegation',
    name: L('Ksiu', 'Ксюша'),
    status: L('Engineering Mgr', 'Менеджер інженерії'),
    steps: [
      { kind: 'bot', text: L('Delegating a project. What do you share first?', 'Делегуєте проект. Що ділите першим?') },
      { kind: 'choices', opts: [L('The desired outcome', 'Бажаний результат'), L('Step-by-step instructions', 'Покрокові інструкції')], pick: 0 },
      { kind: 'bot', text: L('Outcome > tasks. Ownership grows from there.', 'Результат > задачі. Ownership росте звідти.') },
    ],
  },
  {
    id: 'lead-feedback',
    name: L('Maksym', 'Максим'),
    status: L('Engineering Mgr', 'Менеджер інженерії'),
    steps: [
      { kind: 'bot', text: L('Giving tough feedback. Best opener?', 'Жорсткий feedback. Найкращий вступ?') },
      { kind: 'choices', opts: [L('"I want this to land well — open?"', '«Хочу, щоб це зайшло — окей?»'), L('"You always do this…"', '«Ти завжди так робиш…»')], pick: 0 },
      { kind: 'bot', text: L('Permission softens the signal, not the message.', 'Дозвіл пом’якшує сигнал, не суть.') },
    ],
  },
  {
    id: 'lead-burnout',
    name: L('Maksym', 'Максим'),
    status: L('Engineering Mgr', 'Менеджер інженерії'),
    steps: [
      { kind: 'bot', text: L('Direct report looks burnt out. First step?', 'Колега виглядає вигорілим. Перший крок?') },
      { kind: 'choices', opts: [L('Private 1:1, no agenda', 'Приватний 1:1, без порядку'), L('Add it to next sprint review', 'Додати до sprint review')], pick: 0 },
      { kind: 'bot', text: L('Quiet space first. Solutions follow.', 'Спершу — тиха зустріч. Рішення йдуть далі.') },
    ],
  },
  {
    id: 'lead-onboarding',
    name: L('Maksym', 'Максим'),
    status: L('Engineering Mgr', 'Менеджер інженерії'),
    steps: [
      { kind: 'bot', text: L('New hire, day 1. What\'s the single best gift?', 'Нова людина, day 1. Найкращий «подарунок»?') },
      { kind: 'choices', opts: [L('A clear first task with someone to ask', 'Зрозуміла перша задача + хто допоможе'), L('Read all the wikis', 'Перечитати всі wikis')], pick: 0 },
      { kind: 'bot', text: L('Small win + a buddy beats reading marathons.', 'Маленька перемога + бадді — краще ніж марафон читання.') },
    ],
  },

  // ─── Compliance ───────────────────────────────────────────────────────────
  {
    id: 'comp-confidential',
    name: L('Ksiu', 'Ксюша'),
    status: L('Compliance', 'Комплаєнс'),
    steps: [
      { kind: 'bot', text: L('Sharing a confidential doc with a vendor. What\'s required?', 'Ділимось конфіденційним документом з вендором. Що потрібно?') },
      { kind: 'choices', opts: [L('A signed NDA first', 'Спочатку підписаний NDA'), L("Just trust them", 'Просто довіряємо')], pick: 0 },
      { kind: 'bot', text: L('NDA = boundary on paper. Always first.', 'NDA = межа на папері. Завжди спочатку.') },
    ],
  },
  {
    id: 'comp-gdpr',
    name: L('Betty', 'Беті'),
    status: L('Compliance', 'Комплаєнс'),
    steps: [
      { kind: 'bot', text: L('A user asks to delete their data. Deadline?', 'Користувач просить видалити дані. Дедлайн?') },
      { kind: 'choices', opts: [L('Within 30 days (GDPR)', 'Протягом 30 днів (GDPR)'), L('Whenever it\'s convenient', 'Коли буде зручно')], pick: 0 },
      { kind: 'bot', text: L('30 days is the law. Track it.', '30 днів — це закон. Тримаємо в трекері.') },
    ],
  },
  {
    id: 'comp-data',
    name: L('Serhii', 'Сергій'),
    status: L('Compliance', 'Комплаєнс'),
    steps: [
      { kind: 'bot', text: L('Storing customer data. Where do PII fields live?', 'Зберігаємо дані клієнтів. Де живуть PII-поля?') },
      { kind: 'choices', opts: [L('Approved, encrypted store only', 'Тільки в схваленому шифрованому сховищі'), L('Wherever it\'s fastest', 'Де швидше')], pick: 0 },
      { kind: 'bot', text: L('Speed matters. Trust matters more.', 'Швидкість важлива. Довіра — важливіша.') },
    ],
  },

  // ─── Conflict + collaboration ─────────────────────────────────────────────
  {
    id: 'collab-missed-deadline',
    name: L('Ksiu', 'Ксюша'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('You\'ll miss a deadline by 2 days. Tell who, when?', 'Зриваєте дедлайн на 2 дні. Кому й коли кажете?') },
      { kind: 'choices', opts: [L('Stakeholders, as soon as you know', 'Стейкхолдерам — щойно дізналися'), L('On the deadline day', 'У день дедлайну')], pick: 0 },
      { kind: 'bot', text: L('Early news = options. Late news = problems.', 'Рання звістка — варіанти. Пізня — проблеми.') },
    ],
  },
  {
    id: 'collab-handover',
    name: L('Kuzia', 'Кузя'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('Handing a task over. Best artifact?', 'Передаєте задачу. Найкращий «артефакт»?') },
      { kind: 'choices', opts: [L('A short doc: goal, status, open questions', 'Короткий док: ціль, статус, відкриті питання'), L('A 30-minute call only', 'Лише 30-хвилинний дзвінок')], pick: 0 },
      { kind: 'bot', text: L('Doc + call beats either alone.', 'Док + дзвінок — краще, ніж кожне окремо.') },
    ],
  },
  {
    id: 'collab-disagree-up',
    name: L('Ksiu', 'Ксюша'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('You think the boss is wrong. Where do you raise it?', 'Думаєте, що бос не правий. Де піднімаєте?') },
      { kind: 'choices', opts: [L('Privately, with evidence', 'Приватно, з аргументами'), L('In the next big meeting', 'На наступній великій зустрічі')], pick: 0 },
      { kind: 'bot', text: L('Disagree privately, commit publicly.', 'Не згоджуємось приватно — підтримуємо публічно.') },
    ],
  },

  // ─── Product / engineering ────────────────────────────────────────────────
  {
    id: 'eng-bug-triage',
    name: L('Dmytro', 'Дмитро'),
    status: L('Tech Lead', 'Тимлід'),
    steps: [
      { kind: 'bot', text: L('Two bugs: one for 1 user, one for 1000. Which first?', 'Два баги: один на 1 юзера, інший на 1000. Який першим?') },
      { kind: 'choices', opts: [L('1000 — impact wins', '1000 — пріоритет за impact'), L('1 — already complaining', '1 — вже скаржиться')], pick: 0 },
      { kind: 'bot', text: L('Volume matters; squeaky wheel is a trap.', 'Масштаб важливий; «найгучніший» — це пастка.') },
    ],
  },
  {
    id: 'eng-code-review',
    name: L('Dmytro', 'Дмитро'),
    status: L('Tech Lead', 'Тимлід'),
    steps: [
      { kind: 'bot', text: L('PR is huge. How do you review it well?', 'PR величезний. Як його якісно ревьюнути?') },
      { kind: 'choices', opts: [L('Ask the author to split it', 'Попросити автора розбити'), L('Skim and approve to be nice', 'Прогорнути й заапрувити «по-доброму»')], pick: 0 },
      { kind: 'bot', text: L('Smaller PRs = better code + faster reviews.', 'Малі PR = краще код + швидший review.') },
    ],
  },
  {
    id: 'eng-incident',
    name: L('Dmytro', 'Дмитро'),
    status: L('Tech Lead', 'Тимлід'),
    steps: [
      { kind: 'bot', text: L('Production is down. First channel?', 'Production лежить. Перший канал?') },
      { kind: 'choices', opts: [L('Incident channel + status page', 'Incident channel + status page'), L('DM your manager', 'Особисте повідомлення менеджеру')], pick: 0 },
      { kind: 'bot', text: L('Public + structured. The team rallies fast.', 'Публічно + структуровано. Команда збирається швидко.') },
    ],
  },
  {
    id: 'eng-tradeoffs',
    name: L('Dmytro', 'Дмитро'),
    status: L('Tech Lead', 'Тимлід'),
    steps: [
      { kind: 'bot', text: L("Feature: ship Friday or polish until Monday?", 'Фіча: реліз у пʼятницю чи допилити до понеділка?') },
      { kind: 'choices', opts: [L("Ship Monday — Fridays burn people", 'У понеділок — пʼятниця палить людей'), L('Friday — never miss a date', 'У пʼятницю — ніколи не зриваємо дату')], pick: 0 },
      { kind: 'bot', text: L("Calm releases beat heroic Fridays.", 'Спокійні релізи кращі за «героїчні» пʼятниці.') },
    ],
  },

  // ─── Finance + ops ────────────────────────────────────────────────────────
  {
    id: 'fin-invoice',
    name: L('Ksiu', 'Ксюша'),
    status: L('Finance', 'Фінанси'),
    steps: [
      { kind: 'bot', text: L('Vendor invoice differs from the agreed price. You…?', 'Інвойс відрізняється від домовленої ціни. Ви…?') },
      { kind: 'choices', opts: [L('Hold + ask for a correction', 'Затримати + попросити корекцію'), L('Pay quickly to keep them happy', 'Заплатити швидко, щоб не сваритись')], pick: 0 },
      { kind: 'bot', text: L('Process > politeness. Document the fix.', 'Процес > ввічливість. Документуємо коректування.') },
    ],
  },
  {
    id: 'ops-process',
    name: L('Maksym', 'Максим'),
    status: L('Ops', 'Операції'),
    steps: [
      { kind: 'bot', text: L('Same problem keeps coming back. Best fix?', 'Та сама проблема повертається. Найкраще рішення?') },
      { kind: 'choices', opts: [L('Find the root cause + add a guardrail', 'Знайти root cause + додати guardrail'), L('Patch it each time', 'Латати щоразу')], pick: 0 },
      { kind: 'bot', text: L('Patches stack up. Guardrails compound.', 'Латки накопичуються. Guardrails — множаться у користі.') },
    ],
  },
  {
    id: 'ops-meeting',
    name: L('Kuzia', 'Кузя'),
    status: L('Ops', 'Операції'),
    steps: [
      { kind: 'bot', text: L('Recurring meeting feels useless. Your move?', 'Регулярна зустріч відчувається непотрібною. Ваш хід?') },
      { kind: 'choices', opts: [L('Propose async + a clear owner', 'Запропонувати async + чіткого owner'), L('Just keep showing up', 'Просто далі ходити')], pick: 0 },
      { kind: 'bot', text: L('Calendars love being challenged.', 'Календарі обожнюють виклик.') },
    ],
  },

  // ─── Recruitment ──────────────────────────────────────────────────────────
  {
    id: 'rec-interview',
    name: L('Ksiu', 'Ксюша'),
    status: L('Recruiter', 'Рекрутерка'),
    steps: [
      { kind: 'bot', text: L('In an interview — best opening?', 'На інтервʼю — найкращий старт?') },
      { kind: 'choices', opts: [L('"What\'s the day-to-day like?"', '«Як виглядає типовий день?»'), L('"Tell me about the company"', '«Розкажіть про компанію»')], pick: 0 },
      { kind: 'bot', text: L('Specific beats generic. Always.', 'Конкретне краще за загальне. Завжди.') },
    ],
  },
  {
    id: 'rec-rejection',
    name: L('Anna', 'Аня'),
    status: L('Recruiter', 'Рекрутерка'),
    steps: [
      { kind: 'bot', text: L('Rejecting a candidate — what do you include?', 'Відмовляєте кандидату — що додаєте?') },
      { kind: 'choices', opts: [L('A real reason + thanks', 'Реальну причину + подяку'), L('A vague form letter', 'Туманний шаблонний лист')], pick: 0 },
      { kind: 'bot', text: L("Kindness today is the talent brand tomorrow.", 'Сьогоднішня доброта — завтрашній talent brand.') },
    ],
  },

  // ─── Lighthearted (still on-topic, just fun) ─────────────────────────────
  {
    id: 'fun-coffee',
    name: L('Coffee bot', 'Кавобот'),
    status: L('beep', 'біп'),
    steps: [
      { kind: 'bot', text: L('Beep. Calibrating you. Coffee or tea?', 'Біп. Калібрую вас. Кава чи чай?') },
      { kind: 'choices', opts: [L('Coffee. Now.', 'Каву. Негайно.'), L('Tea, with kindness', 'Чай, з добротою')], pick: 0 },
      { kind: 'bot', text: L('Initiating productivity protocol ☕', 'Запускаю протокол продуктивності ☕') },
    ],
  },
  {
    id: 'fun-tabs-spaces',
    name: L('Ksiu', 'Ксюша'),
    status: L('Tech Lead', 'Тимлід'),
    steps: [
      { kind: 'bot', text: L('The ancient question: tabs or spaces?', 'Одвічне питання: tabs чи spaces?') },
      { kind: 'choices', opts: [L('Whatever the linter says', 'Що скаже лінтер'), L('Civil war, here we come', 'Громадянська війна, ось і ми')], pick: 0 },
      { kind: 'bot', text: L('Wise. Diplomacy 1, holy wars 0.', 'Мудро. Дипломатія 1, holy wars 0.') },
    ],
  },
  {
    id: 'fun-standup',
    name: L('Kuzia', 'Кузя'),
    status: L('Scrum Master', 'Scrum Master'),
    steps: [
      { kind: 'bot', text: L('Standup tip: best length per person?', 'Standup-порада: оптимальна тривалість на людину?') },
      { kind: 'choices', opts: [L('Under a minute', 'До хвилини'), L('A full TED talk', 'Повноцінний TED talk')], pick: 0 },
      { kind: 'bot', text: L('TED is paid. Standups aren\'t. 😄', 'TED — платно. Standup — ні. 😄') },
    ],
  },
  {
    id: 'fun-emoji',
    name: L('Nazar', 'Назар'),
    status: L('HR', 'HR'),
    steps: [
      { kind: 'bot', text: L('Approving a PR — best emoji?', 'Approve на PR — найкраще emoji?') },
      { kind: 'choices', opts: [L('🚀', '🚀'), L('🐢', '🐢')], pick: 0 },
      { kind: 'bot', text: L('🚀 says "ship it." 🐢 says "we\'ll talk."', '🚀 значить «релізимо». 🐢 значить «треба поговорити».') },
    ],
  },
  {
    id: 'fun-pineapple',
    name: L('Nazar', 'Назар'),
    status: L('Team Dinner', 'Командна вечеря'),
    steps: [
      { kind: 'bot', text: L('Hot vote: pineapple on pizza for the team dinner?', 'Гаряче голосування: ананас на піцу на командну вечерю?') },
      { kind: 'choices', opts: [L('Order it on the side', 'Замовити окремо'), L('Start a holy war', 'Розпочати holy war')], pick: 0 },
      { kind: 'bot', text: L('Diplomacy saves dinners. 🍕', 'Дипломатія рятує вечері. 🍕') },
    ],
  },
  {
    id: 'fun-office-pet',
    name: L('Ksiu', 'Ксюша'),
    status: L('Office Vibe', 'Офісний vibe'),
    steps: [
      { kind: 'bot', text: L('Office mascot: dog or cat?', 'Маскот офісу: собака чи кіт?') },
      { kind: 'choices', opts: [L('Both. We negotiate.', 'Обидва. Домовимось.'), L('Goldfish — low drama', 'Золота рибка — без драм')], pick: 0 },
      { kind: 'bot', text: L('"Both" is the right answer to most office polls.', '«Обидва» — правильна відповідь у більшості опитувань офісу.') },
    ],
  },
  {
    id: 'fun-friday',
    name: L('Ksiu', 'Ксюша'),
    status: L('Manager', 'Менеджер'),
    steps: [
      { kind: 'bot', text: L('It\'s 4:55 PM Friday. A "tiny" request lands.', '16:55, пʼятниця. Прилітає «маленький» запит.') },
      { kind: 'choices', opts: [L('"Logged. First thing Monday."', '«Записав. Першим у понеділок.»'), L('Open the laptop, sigh deeply', 'Відкрити ноут, важко зітхнути')], pick: 0 },
      { kind: 'bot', text: L('Mondays exist for a reason. 😌', 'Понеділки існують не просто так. 😌') },
    ],
  },
  {
    id: 'fun-wifi',
    name: L('Nazar', 'Назар'),
    status: L('IT', 'IT'),
    steps: [
      { kind: 'bot', text: L('Wi-Fi is mysteriously down. Step one?', 'Wi-Fi загадково впав. Крок 1?') },
      { kind: 'choices', opts: [L("Turn it off and on again", 'Вимкнути й увімкнути'), L('Blame the calendar', 'Звинуватити календар')], pick: 0 },
      { kind: 'bot', text: L('The ancient art. Works ~80% of the time.', 'Древнє мистецтво. Працює у ~80% випадків.') },
    ],
  },
  {
    id: 'fun-meeting-could-be-email',
    name: L('Ksiu', 'Ксюша'),
    status: L('Coach', 'Коуч'),
    steps: [
      { kind: 'bot', text: L('"This meeting could\'ve been an email." Reply?', '«Цю зустріч можна було б листом». Відповідь?') },
      { kind: 'choices', opts: [L('Suggest async next time', 'Запропонувати async наступного разу'), L('Stare into the camera', 'Дивитись у камеру мовчки')], pick: 0 },
      { kind: 'bot', text: L('Async is a love language for calendars.', 'Async — це мова любові для календарів.') },
    ],
  },
]
