import type { Block, BlockBackground, Course, Lesson } from '../types/course'
import { DEFAULT_COURSE_SETTINGS } from '../types/course'
import { avatarArt, coverArt, flagSlide, inboxArt, reportButtonArt, textFile } from './sampleArt'
import type { Language } from '../i18n/types'
import { SAMPLE_ASSETS } from './sampleAssets'

// Built-in sample course ("Spot the phish"), opened from the landing page and the
// welcome screen so visitors can explore a complete course without creating a
// project. It is author content, not UI chrome, so the copy lives here as
// inline { en, uk, fr, es, de } entries (like the landing chat scenarios) and the
// whole course is generated in one language.

type Text = { en: string; uk: string; fr: string; es: string; de: string }
const L = (en: string, uk: string, fr: string, es: string, de: string): Text => ({ en, uk, fr, es, de })

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
<text x="400" y="54" fill="#e5e7eb" font-size="16" text-anchor="middle">${x(L('Inbox', 'Вхідні', 'Boîte de réception', 'Bandeja de entrada', 'Posteingang'))}</text>
<text x="56" y="108" fill="#6b7280" font-size="16">${x(L('From:', 'Від:', 'De :', 'De:', 'Von:'))}</text>
<text x="120" y="108" fill="#111827" font-size="16">IT Support &lt;security@micros0ft-help.co&gt;</text>
<text x="56" y="146" fill="#6b7280" font-size="16">${x(L('Subject:', 'Тема:', 'Objet :', 'Asunto:', 'Betreff:'))}</text>
<text x="136" y="146" fill="#b91c1c" font-size="17" font-weight="bold">${x(L('URGENT: your account will be locked in 24 hours!', 'ТЕРМІНОВО: ваш акаунт заблокують за 24 години!', 'URGENT : votre compte sera bloqué dans 24 heures !', 'URGENTE: ¡su cuenta se bloqueará en 24 horas!', 'DRINGEND: Ihr Konto wird in 24 Stunden gesperrt!'))}</text>
<line x1="56" y1="170" x2="744" y2="170" stroke="#e5e7eb"/>
<text x="56" y="212" fill="#111827" font-size="17">${x(L('Dear user,', 'Шановний користувачу,', 'Cher utilisateur,', 'Estimado usuario:', 'Sehr geehrter Nutzer,'))}</text>
<text x="56" y="246" fill="#374151" font-size="16">${x(L('We detected unusual activity. Confirm your password right now', 'Ми виявили підозрілу активність. Негайно підтвердьте пароль,', 'Nous avons détecté une activité inhabituelle. Confirmez votre mot de passe', 'Hemos detectado actividad inusual. Confirme su contraseña ahora mismo', 'wir haben ungewöhnliche Aktivitäten festgestellt. Bestätigen Sie jetzt sofort Ihr Passwort,'))}</text>
<text x="56" y="272" fill="#374151" font-size="16">${x(L('or you will lose access to all your files.', 'інакше ви втратите доступ до всіх файлів.', 'immédiatement, sinon vous perdrez l’accès à tous vos fichiers.', 'o perderá el acceso a todos sus archivos.', 'sonst verlieren Sie den Zugriff auf alle Ihre Dateien.'))}</text>
<rect x="56" y="300" width="240" height="48" rx="8" fill="#2563eb"/>
<text x="176" y="330" fill="#fff" font-size="17" font-weight="bold" text-anchor="middle">${x(L('Verify account', 'Підтвердити акаунт', 'Vérifier mon compte', 'Verificar cuenta', 'Konto bestätigen'))}</text>
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
<text x="400" y="54" fill="#e5e7eb" font-size="16" text-anchor="middle">${x(L('Inbox', 'Вхідні', 'Boîte de réception', 'Bandeja de entrada', 'Posteingang'))}</text>
<text x="56" y="108" fill="#6b7280" font-size="16">${x(L('From:', 'Від:', 'De :', 'De:', 'Von:'))}</text>
<text x="120" y="108" fill="#111827" font-size="16">${x(L('IT Service Desk', 'ІТ-підтримка', 'Assistance informatique', 'Asistencia informática', 'IT-Servicedesk'))} &lt;servicedesk@yourcompany.com&gt;</text>
<text x="56" y="146" fill="#6b7280" font-size="16">${x(L('Subject:', 'Тема:', 'Objet :', 'Asunto:', 'Betreff:'))}</text>
<text x="136" y="146" fill="#111827" font-size="17" font-weight="bold">${x(L('Planned email maintenance on Saturday', 'Планові роботи з поштою в суботу', 'Maintenance prévue de la messagerie samedi', 'Mantenimiento programado del correo el sábado', 'Geplante E-Mail-Wartung am Samstag'))}</text>
<line x1="56" y1="170" x2="744" y2="170" stroke="#e5e7eb"/>
<text x="56" y="212" fill="#111827" font-size="17">${x(L('Hi Anna,', 'Привіт, Анно!', 'Bonjour Anna,', 'Hola, Anna:', 'Hallo Anna,'))}</text>
<text x="56" y="246" fill="#374151" font-size="16">${x(L('Email may be unavailable on Saturday from 9:00 to 11:00.', 'У суботу з 9:00 до 11:00 пошта може бути недоступна.', 'La messagerie pourra être indisponible samedi de 9 h à 11 h.', 'El correo podría no estar disponible el sábado de 9:00 a 11:00.', 'Am Samstag von 9:00 bis 11:00 Uhr kann E-Mail nicht verfügbar sein.'))}</text>
<text x="56" y="272" fill="#374151" font-size="16">${x(L('You don’t need to do anything.', 'Від вас нічого не потрібно.', 'Vous n’avez rien à faire.', 'No tienes que hacer nada.', 'Sie müssen nichts tun.'))}</text>
<rect x="56" y="300" width="460" height="48" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
<text x="76" y="330" fill="#166534" font-size="16">${x(L('Questions? Call the service desk: ext. 1234', 'Питання? Дзвоніть у підтримку: внутр. 1234', 'Une question ? Appelez l’assistance : poste 1234', '¿Dudas? Llama a asistencia: ext. 1234', 'Fragen? Rufen Sie den Servicedesk an: Tel. 1234'))}</text>
<text x="56" y="420" fill="#9ca3af" font-size="14">${x(L('— IT Service Desk', '— ІТ-підтримка', '— Assistance informatique', '— Asistencia informática', '— IT-Servicedesk'))}</text>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Display names vs. real addresses (a rich-text table in lesson 2). Two
// columns, the verdict under each address, so it reads on a phone too.
function addressTable(tr: (t: Text) => string): string {
  const row = (name: Text, address: string, verdict: Text) =>
    `<tr><td>${tr(name)}</td><td>${address}<br><em>${tr(verdict)}</em></td></tr>`
  return `<table class="rt-table rt-table-stripes"><thead><tr><th scope="col">${tr(L('Display name', 'Ім’я відправника', 'Nom affiché', 'Nombre mostrado', 'Anzeigename'))}</th><th scope="col">${tr(L('Real address', 'Справжня адреса', 'Adresse réelle', 'Dirección real', 'Echte Adresse'))}</th></tr></thead><tbody>${[
    row(L('IT Support', 'ІТ-підтримка', 'Support informatique', 'Soporte informático', 'IT-Support'), 'security@micros0ft-help.co', L('❌ A zero instead of “o”', '❌ Нуль замість «o»', '❌ Un zéro à la place du « o »', '❌ Un cero en lugar de la “o”', '❌ Eine Null statt „o“')),
    row(L('PayPal', 'PayPal', 'PayPal', 'PayPal', 'PayPal'), 'service@paypa1-secure.net', L('❌ “1” instead of “l”', '❌ «1» замість «l»', '❌ « 1 » à la place du « l »', '❌ “1” en lugar de “l”', '❌ „1“ statt „l“')),
    row(L('Anna Kovalenko, CEO', 'Анна Коваленко, CEO', 'Anna Kovalenko, PDG', 'Anna Kovalenko, CEO', 'Anna Kovalenko, CEO'), 'anna.k.ceo@gmail.com', L('❌ A personal mailbox', '❌ Особиста скринька', '❌ Une adresse personnelle', '❌ Una cuenta personal', '❌ Ein privates Postfach')),
    row(L('IT Service Desk', 'ІТ-підтримка', 'Assistance informatique', 'Asistencia informática', 'IT-Servicedesk'), 'servicedesk@yourcompany.com', L('✅ Your company’s domain', '✅ Домен вашої компанії', '✅ Le domaine de votre entreprise', '✅ El dominio de tu empresa', '✅ Die Domain Ihres Unternehmens')),
  ].join('')}</tbody></table>`
}

// "Link detective", a Widget (html) block for lesson 2: the learner clicks the
// part of a web address that shows who really owns the site. Plain HTML / CSS /
// JS on the Scormly kit (sc-* classes, --sc-* tokens), so it follows the course
// theme — a showcase of what authors can build in the block.
function linkDetectiveHtml(tr: (t: Text) => string, lang: Language): string {
  type Part = { kind: 'scheme' | 'sub' | 'sep' | 'owner' | 'path'; text: string }
  const scheme: Part = { kind: 'scheme', text: 'https://' }
  const dot: Part = { kind: 'sep', text: '.' }
  const sub = (text: string): Part => ({ kind: 'sub', text })
  const owner = (text: string): Part => ({ kind: 'owner', text })
  const path = (text: string): Part => ({ kind: 'path', text })
  const rounds = [
    {
      brand: 'PayPal',
      safe: true,
      parts: [scheme, sub('www'), dot, owner('paypal.com'), path('/signin')],
      explain: tr(L(
        'It sits right before the first “/”, so this really is PayPal. “www” is just a prefix.',
        'Він стоїть просто перед першою «/», тож це справді PayPal. «www» — лише префікс.',
        'Il se trouve juste avant le premier « / » : c’est donc bien PayPal. « www » n’est qu’un préfixe.',
        'Está justo antes de la primera “/”, así que de verdad es PayPal. “www” es solo un prefijo.',
        'Sie steht direkt vor dem ersten „/“, also ist das wirklich PayPal. „www“ ist nur ein Präfix.',
      )),
    },
    {
      brand: 'PayPal',
      safe: false,
      parts: [scheme, sub('paypal.com'), dot, owner('secure-login.net'), path('/verify')],
      explain: tr(L(
        '“paypal.com” on the left is only a disguise: whoever owns secure-login.net can write anything there.',
        '«paypal.com» ліворуч — лише маска: хто володіє secure-login.net, може написати там будь-що.',
        '« paypal.com » à gauche n’est qu’un déguisement : le propriétaire de secure-login.net peut y écrire ce qu’il veut.',
        '“paypal.com” a la izquierda es solo un disfraz: el dueño de secure-login.net puede escribir ahí lo que quiera.',
        '„paypal.com“ links ist nur eine Tarnung: Wem secure-login.net gehört, der kann dort schreiben, was er will.',
      )),
    },
    {
      brand: 'Microsoft',
      safe: false,
      parts: [scheme, owner('micros0ft-help.co'), path('/login')],
      explain: tr(L(
        'A zero instead of “o” — and not Microsoft’s domain at all. Look-alike names are a classic trick.',
        'Нуль замість «o» — і це зовсім не домен Microsoft. Схожі назви — класичний прийом.',
        'Un zéro à la place du « o » — et ce n’est pas du tout le domaine de Microsoft. Les noms ressemblants sont un grand classique.',
        'Un cero en lugar de la “o”, y ni siquiera es el dominio de Microsoft. Los nombres parecidos son un truco clásico.',
        'Eine Null statt „o“ — und gar nicht die Domain von Microsoft. Ähnlich klingende Namen sind ein klassischer Trick.',
      )),
    },
    {
      brand: 'Google',
      safe: true,
      parts: [scheme, sub('accounts'), dot, owner('google.com'), path('/signin/v2')],
      explain: tr(L(
        '“accounts” is a subdomain Google made itself. This one is genuine.',
        '«accounts» — піддомен, який створив сам Google. Цей сайт справжній.',
        '« accounts » est un sous-domaine créé par Google lui-même. Ce site est authentique.',
        '“accounts” es un subdominio creado por el propio Google. Este sitio es auténtico.',
        '„accounts“ ist eine Subdomain, die Google selbst angelegt hat. Diese hier ist echt.',
      )),
    },
    {
      brand: tr(L('YourBank', 'ВашБанк', 'VotreBanque', 'TuBanco', 'IhreBank')),
      safe: false,
      parts: [scheme, sub('yourbank'), dot, owner('com-secure.info'), path('/login')],
      explain: tr(L(
        'Tricky: the dash glues “com-secure” into a new name, so the owner is not your bank.',
        'Хитро: дефіс склеює «com-secure» в нову назву, тож власник — зовсім не ваш банк.',
        'Piège : le tiret soude « com-secure » en un nouveau nom ; le propriétaire n’est donc pas votre banque.',
        'Con trampa: el guion une “com-secure” en un nombre nuevo, así que el dueño no es tu banco.',
        'Heimtückisch: Der Bindestrich verklebt „com-secure“ zu einem neuen Namen, der Inhaber ist also nicht Ihre Bank.',
      )),
    },
  ]
  const s = {
    step: tr(L('Link {n} of {total}', 'Посилання {n} з {total}', 'Lien {n} sur {total}', 'Enlace {n} de {total}', 'Link {n} von {total}')),
    ask: tr(L(
      'Who really owns this site? Click that part of the address.',
      'Кому насправді належить цей сайт? Клацніть цю частину адреси.',
      'À qui appartient vraiment ce site ? Cliquez sur cette partie de l’adresse.',
      '¿De quién es realmente este sitio? Haz clic en esa parte de la dirección.',
      'Wem gehört diese Seite wirklich? Klicken Sie auf diesen Teil der Adresse.',
    )),
    bar: tr(L('Address bar', 'Адресний рядок', 'Barre d’adresse', 'Barra de direcciones', 'Adressleiste')),
    signIn: tr(L('Sign in to your account', 'Увійдіть в акаунт', 'Connectez-vous à votre compte', 'Inicia sesión en tu cuenta', 'Bei Ihrem Konto anmelden')),
    email: tr(L('Email', 'Пошта', 'E-mail', 'Correo electrónico', 'E-Mail')),
    password: tr(L('Password', 'Пароль', 'Mot de passe', 'Contraseña', 'Passwort')),
    login: tr(L('Log in', 'Увійти', 'Se connecter', 'Iniciar sesión', 'Anmelden')),
    right: tr(L('✅ Right!', '✅ Так!', '✅ Exact !', '✅ ¡Correcto!', '✅ Richtig!')),
    wrong: tr(L('❌ Not quite.', '❌ Не зовсім.', '❌ Pas tout à fait.', '❌ No del todo.', '❌ Nicht ganz.')),
    why: {
      scheme: tr(L(
        'https:// only means the connection is encrypted — phishing sites have the padlock too.',
        'https:// означає лише, що з’єднання зашифроване, — фішингові сайти теж мають замочок.',
        'https:// indique seulement que la connexion est chiffrée — les sites d’hameçonnage ont eux aussi le cadenas.',
        'https:// solo indica que la conexión está cifrada: los sitios de phishing también tienen el candado.',
        'https:// bedeutet nur, dass die Verbindung verschlüsselt ist — Phishing-Seiten haben auch das Schloss.',
      )),
      sub: tr(L(
        'That part sits left of the owner, and the owner can put anything there.',
        'Ця частина стоїть ліворуч від власника, а власник може написати там будь-що.',
        'Cette partie se trouve à gauche du propriétaire, qui peut y mettre ce qu’il veut.',
        'Esa parte está a la izquierda del dueño, y el dueño puede poner ahí lo que quiera.',
        'Dieser Teil steht links vom Inhaber, und der Inhaber kann dort alles eintragen.',
      )),
      path: tr(L(
        'Everything after the first “/” is just a page on the site — its owner can name it anything.',
        'Усе після першої «/» — лише сторінка на сайті, і власник може назвати її як завгодно.',
        'Tout ce qui suit le premier « / » n’est qu’une page du site — son propriétaire peut la nommer comme il veut.',
        'Todo lo que va después de la primera “/” es solo una página del sitio: su dueño puede llamarla como quiera.',
        'Alles nach dem ersten „/“ ist nur eine Seite auf der Website — ihr Inhaber kann sie beliebig nennen.',
      )),
    },
    owner: tr(L('The site belongs to {owner}.', 'Сайт належить {owner}.', 'Le site appartient à {owner}.', 'El sitio pertenece a {owner}.', 'Die Seite gehört {owner}.')),
    safe: tr(L('Genuine', 'Справжній', 'Authentique', 'Auténtico', 'Echt')),
    phish: tr(L('Phishing', 'Фішинг', 'Hameçonnage', 'Phishing', 'Phishing')),
    next: tr(L('Next link →', 'Наступне посилання →', 'Lien suivant →', 'Siguiente enlace →', 'Nächster Link →')),
    finish: tr(L('See my result', 'Мій результат', 'Voir mon résultat', 'Ver mi resultado', 'Mein Ergebnis ansehen')),
    endTitle: tr(L(
      'You found {score} of {total} owners',
      'Ви знайшли {score} з {total} власників',
      'Vous avez trouvé {score} propriétaires sur {total}',
      'Has encontrado {score} de {total} dueños',
      'Sie haben {score} von {total} Inhabern gefunden',
    )),
    endAll: tr(L(
      'Perfect — no link can fool you.',
      'Бездоганно — вас не обдурить жодне посилання.',
      'Parfait — aucun lien ne peut vous tromper.',
      'Perfecto: ningún enlace puede engañarte.',
      'Perfekt — kein Link kann Sie täuschen.',
    )),
    endSome: tr(L(
      'Good start! Play again and read each address from the first “/” leftwards.',
      'Непоганий початок! Зіграйте ще раз і читайте кожну адресу від першої «/» ліворуч.',
      'Bon début ! Rejouez et lisez chaque adresse à partir du premier « / », vers la gauche.',
      '¡Buen comienzo! Juega otra vez y lee cada dirección desde la primera “/” hacia la izquierda.',
      'Guter Anfang! Spielen Sie noch einmal und lesen Sie jede Adresse vom ersten „/“ nach links.',
    )),
    rule: tr(L(
      'Rule of thumb: find the first single “/” after https://. The last two words before it — like paypal.com — are the real owner. Anything further left can be made up.',
      'Правило: знайдіть першу одинарну «/» після https://. Останні два слова перед нею — як-от paypal.com — і є справжнім власником. Усе, що лівіше, можна вигадати.',
      'Règle pratique : repérez le premier « / » isolé après https://. Les deux derniers mots qui le précèdent — par exemple paypal.com — désignent le vrai propriétaire. Tout ce qui se trouve plus à gauche peut être inventé.',
      'Regla práctica: busca la primera “/” suelta después de https://. Las dos últimas palabras que hay antes, como paypal.com, son el dueño real. Todo lo que queda más a la izquierda puede ser inventado.',
      'Faustregel: Suchen Sie das erste einzelne „/“ nach https://. Die letzten zwei Wörter davor — wie paypal.com — sind der wahre Inhaber. Alles weiter links lässt sich beliebig erfinden.',
    )),
    again: tr(L('Play again', 'Зіграти ще раз', 'Rejouer', 'Jugar otra vez', 'Nochmal spielen')),
  }
  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  .ld { max-width: 640px; margin: 0 auto; }
  .ld-top { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
  .ld-top h3 { margin: 0; font-size: 1.05rem; outline: none; }
  .ld-dots { display: flex; gap: 6px; }
  .ld-dots span { width: 10px; height: 10px; border-radius: 50%; background: var(--sc-border); transition: background 0.2s, transform 0.2s; }
  .ld-dots .is-now { background: var(--sc-accent); transform: scale(1.3); }
  .ld-dots .is-ok { background: var(--sc-success); }
  .ld-dots .is-bad { background: var(--sc-error); }
  .ld-ask { margin: 0.25rem 0 0.9rem; color: var(--sc-muted); }
  .ld-browser { overflow: hidden; background: var(--sc-surface); border: 1px solid var(--sc-border); border-radius: 14px; box-shadow: 0 18px 40px -28px rgb(15 23 42 / 0.55); }
  .ld-chrome { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.7rem; background: #f1f5f9; border-bottom: 1px solid var(--sc-border); }
  .ld-lights { display: flex; flex: none; gap: 5px; }
  .ld-lights i { width: 10px; height: 10px; border-radius: 50%; background: #f87171; }
  .ld-lights i:nth-child(2) { background: #fbbf24; }
  .ld-lights i:nth-child(3) { background: #34d399; }
  .ld-bar { display: flex; flex: 1; align-items: center; gap: 0.45rem; min-width: 0; padding: 0.3rem 0.8rem; background: #fff; border: 1px solid var(--sc-border); border-radius: 1.1rem; }
  .ld-bar svg { flex: none; color: var(--sc-muted); }
  .ld-url { min-width: 0; font: 600 15px/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; overflow-wrap: anywhere; }
  .ld-sep { color: var(--sc-muted); }
  .ld-part { margin: 0; padding: 0 2px; font: inherit; color: var(--sc-text); background: none; border: 0; border-bottom: 2px dashed color-mix(in srgb, var(--sc-accent) 60%, transparent); border-radius: 4px 4px 0 0; cursor: pointer; overflow-wrap: anywhere; transition: background 0.15s; }
  .ld-part:hover:not(:disabled) { background: var(--sc-accent-soft); }
  .ld-part:disabled { color: var(--sc-muted); border-bottom-color: transparent; cursor: default; }
  .ld-part.is-owner { color: #166534; background: #dcfce7; border-bottom: 2px solid #16a34a; animation: ld-pop 0.4s ease-out; }
  .ld-part.is-wrong { color: #991b1b; background: #fee2e2; text-decoration: line-through; animation: ld-shake 0.4s; }
  .ld-page { position: relative; display: grid; justify-items: start; gap: 0.55rem; min-height: 200px; padding: 1.4rem 1.5rem 1.6rem; }
  .ld-brand { font-family: var(--sc-heading-font); font-size: 1.5rem; font-weight: 800; color: var(--sc-heading); }
  .ld-sub { margin-bottom: 0.2rem; font-size: 0.9rem; color: var(--sc-muted); }
  .ld-field, .ld-login { width: min(260px, 100%); padding: 0.45rem 0.7rem; font-size: 0.9rem; border-radius: min(var(--sc-radius), 0.5rem); }
  .ld-field { color: #6b7280; border: 1px solid #d1d5db; }
  .ld-login { font-weight: 700; text-align: center; color: #fff; background: #475569; }
  .ld-stamp { position: absolute; top: 50%; right: 1.25rem; padding: 0.3rem 0.9rem; font-size: 1.35rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: rgb(255 255 255 / 0.9); border: 3px solid currentColor; border-radius: 8px; opacity: 0; transform: translateY(-50%) rotate(-12deg) scale(1.6); pointer-events: none; }
  .ld-stamp.is-on { opacity: 1; transform: translateY(-50%) rotate(-12deg) scale(1); transition: opacity 0.2s, transform 0.35s cubic-bezier(0.2, 1.5, 0.4, 1); }
  .ld-stamp.is-safe, .ld-verdict.is-safe { color: #166534; }
  .ld-stamp.is-phish, .ld-verdict.is-phish { color: #991b1b; }
  .ld-fb { margin-top: 1rem; padding: 1rem 1.15rem; background: var(--sc-surface); border: 1px solid var(--sc-border); border-left: 5px solid var(--sc-success); border-radius: calc(min(var(--sc-radius), 1rem) + 4px); }
  .ld-fb.is-bad { border-left-color: var(--sc-error); }
  .ld-fb-head { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin: 0 0 0.35rem; font-size: 1.05rem; }
  .ld-verdict { padding: 0.1rem 0.6rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: #dcfce7; border-radius: 999px; }
  .ld-verdict.is-phish { background: #fee2e2; }
  .ld-fb p:last-of-type { margin-bottom: 0.9rem; }
  .ld-emoji { margin-bottom: 0.5rem; font-size: 2.75rem; line-height: 1; }
  .ld-end .sc-progress { max-width: 280px; margin: 0.75rem auto 1rem; }
  .ld-end h3 { outline: none; }
  .ld-rule { margin: 1rem 0 1.25rem; text-align: left; }
  .ld-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @keyframes ld-pop { 40% { transform: scale(1.12); } }
  @keyframes ld-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  @media (max-width: 420px) { .ld-lights { display: none; } .ld-page { padding-inline: 1rem; } }
  @media (prefers-reduced-motion: reduce) { .ld-part, .ld-stamp.is-on { animation: none; transition: none; } }
</style>
</head>
<body>
<div class="ld">
  <div id="game">
    <div class="ld-top">
      <h3 id="step" tabindex="-1"></h3>
      <div id="dots" class="ld-dots" aria-hidden="true"></div>
    </div>
    <p class="ld-ask">${esc(s.ask)}</p>
    <div class="ld-browser">
      <div class="ld-chrome">
        <span class="ld-lights" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="ld-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          <div id="url" class="ld-url" role="group" aria-label="${esc(s.bar)}"></div>
        </div>
      </div>
      <div class="ld-page" aria-hidden="true">
        <div id="brand" class="ld-brand"></div>
        <div class="ld-sub">${esc(s.signIn)}</div>
        <div class="ld-field">${esc(s.email)}</div>
        <div class="ld-field">${esc(s.password)}</div>
        <div class="ld-login">${esc(s.login)}</div>
        <div id="stamp" class="ld-stamp"></div>
      </div>
    </div>
    <div id="fb" class="ld-fb" hidden>
      <p class="ld-fb-head"><strong id="fb-title"></strong><span id="verdict" class="ld-verdict"></span></p>
      <p id="fb-text"></p>
      <button id="next" type="button" class="sc-btn"></button>
    </div>
  </div>
  <div id="end" class="ld-end sc-card sc-center" hidden>
    <div class="ld-emoji" aria-hidden="true">🕵️</div>
    <h3 id="end-title" tabindex="-1"></h3>
    <div class="sc-progress" aria-hidden="true"><span id="end-bar"></span></div>
    <p id="end-text"></p>
    <p class="sc-note ld-rule">${esc(s.rule)}</p>
    <button id="again" type="button" class="sc-btn-secondary">${esc(s.again)}</button>
  </div>
  <p id="live" class="ld-sr" role="status" aria-live="polite"></p>
</div>
<script>
(function () {
  var S = ${json(s)};
  var R = ${json(rounds)};
  var i = 0, results = [], answered = false;
  function $(id) { return document.getElementById(id); }
  function fmt(text, vars) {
    for (var k in vars) text = text.split('{' + k + '}').join(vars[k]);
    return text;
  }
  function focus(el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }

  function dots() {
    var box = $('dots');
    box.textContent = '';
    R.forEach(function (_, k) {
      var d = document.createElement('span');
      d.className = k < results.length ? (results[k] ? 'is-ok' : 'is-bad') : k === i ? 'is-now' : '';
      box.appendChild(d);
    });
  }

  function show(moveFocus) {
    var r = R[i];
    answered = false;
    $('step').textContent = fmt(S.step, { n: i + 1, total: R.length });
    $('brand').textContent = r.brand;
    $('stamp').className = 'ld-stamp';
    $('fb').hidden = true;
    $('live').textContent = '';
    var url = $('url');
    url.textContent = '';
    r.parts.forEach(function (p) {
      var el = document.createElement(p.kind === 'sep' ? 'span' : 'button');
      el.textContent = p.text;
      if (p.kind === 'sep') el.className = 'ld-sep';
      else {
        el.type = 'button';
        el.className = 'ld-part';
        el.addEventListener('click', function () { pick(p, el); });
      }
      url.appendChild(el);
    });
    dots();
    if (moveFocus) focus($('step'));
  }

  function pick(p, btn) {
    if (answered) return;
    answered = true;
    var r = R[i], ok = p.kind === 'owner', owner = '';
    results.push(ok);
    var nodes = $('url').children;
    r.parts.forEach(function (q, k) {
      if (q.kind === 'sep') return;
      nodes[k].disabled = true;
      if (q.kind === 'owner') { nodes[k].className += ' is-owner'; owner = q.text; }
    });
    if (!ok) btn.className += ' is-wrong';
    var verdict = r.safe ? S.safe : S.phish, tone = r.safe ? 'is-safe' : 'is-phish';
    $('stamp').textContent = verdict;
    $('stamp').className = 'ld-stamp is-on ' + tone;
    $('fb').className = 'ld-fb' + (ok ? '' : ' is-bad');
    $('fb-title').textContent = ok ? S.right : S.wrong;
    $('verdict').textContent = verdict;
    $('verdict').className = 'ld-verdict ' + tone;
    var text = (ok ? '' : S.why[p.kind] + ' ') + fmt(S.owner, { owner: owner }) + ' ' + r.explain;
    $('fb-text').textContent = text;
    $('next').textContent = i === R.length - 1 ? S.finish : S.next;
    $('fb').hidden = false;
    $('live').textContent = $('fb-title').textContent + ' ' + verdict + '. ' + text;
    dots();
    focus($('next'));
  }

  function finish() {
    var score = results.filter(Boolean).length;
    $('game').hidden = true;
    $('end').hidden = false;
    $('live').textContent = '';
    $('end-title').textContent = fmt(S.endTitle, { score: score, total: R.length });
    $('end-bar').style.width = Math.round((score / R.length) * 100) + '%';
    $('end-text').textContent = score === R.length ? S.endAll : S.endSome;
    focus($('end-title'));
  }

  $('next').addEventListener('click', function () {
    if (i < R.length - 1) { i++; show(true); } else finish();
  });
  $('again').addEventListener('click', function () {
    i = 0;
    results = [];
    $('end').hidden = true;
    $('game').hidden = false;
    show(true);
  });
  show(false);
})();
</script>
</body>
</html>
`
}

export function makeSampleCourse(lang: Language): Course {
  seq = 0
  const tr = (t: Text) => t[lang]
  const p = (t: Text) => `<p>${tr(t)}</p>`

  const dilemma = { start: id('node'), bad: id('node'), check: id('node'), ask: id('node') }

  // ── Lesson 1: Welcome ─────────────────────────────────────────────────────
  const welcome: Lesson = {
    id: id('lesson'),
    title: tr(L('Welcome', 'Вітаємо', 'Bienvenue', 'Bienvenida', 'Willkommen')),
    status: 'published',
    blocks: [
      block('quote', {
        variant: 'statement',
        text: tr(L(
          'Nine out of ten cyberattacks start with an email.',
          'Дев’ять із десяти кібератак починаються з листа.',
          'Neuf cyberattaques sur dix commencent par un e-mail.',
          'Nueve de cada diez ciberataques empiezan con un correo.',
          'Neun von zehn Cyberangriffen beginnen mit einer E-Mail.',
        )),
        author: '',
      }, 'soft', 'spacious'),
      block('imageText', {
        layout: 'left',
        src: inboxArt({
          inbox: tr(L('Inbox', 'Вхідні', 'Boîte de réception', 'Bandeja de entrada', 'Posteingang')),
          mails: [
            tr(L('Team lunch on Friday', 'Обід команди в п’ятницю', 'Déjeuner d’équipe vendredi', 'Almuerzo de equipo el viernes', 'Teamlunch am Freitag')),
            tr(L('URGENT: verify your account!', 'ТЕРМІНОВО: підтвердьте акаунт!', 'URGENT : vérifiez votre compte !', 'URGENTE: ¡verifique su cuenta!', 'DRINGEND: Konto bestätigen!')),
            tr(L('Q3 report — final draft', 'Звіт за III квартал — фінал', 'Rapport T3 — version finale', 'Informe T3 — versión final', 'Q3-Bericht — Endfassung')),
          ],
        }),
        alt: tr(L(
          'An inbox where one urgent email is highlighted as suspicious',
          'Поштова скринька, де один терміновий лист позначено як підозрілий',
          'Une boîte de réception où un e-mail urgent est signalé comme suspect',
          'Una bandeja de entrada con un correo urgente resaltado como sospechoso',
          'Ein Posteingang, in dem eine dringende E-Mail als verdächtig markiert ist',
        )),
        html: p(
          L(
            'In the next <strong>15 minutes</strong> you will learn to recognise phishing, react calmly when something looks wrong, and protect yourself and your team.',
            'За наступні <strong>15 хвилин</strong> ви навчитеся розпізнавати фішинг, спокійно реагувати на підозрілі повідомлення та захищати себе й команду.',
            'Dans les <strong>15 minutes</strong> qui viennent, vous apprendrez à reconnaître l’hameçonnage (phishing), à réagir calmement face à un message douteux et à vous protéger, vous et votre équipe.',
            'En los próximos <strong>15 minutos</strong> aprenderás a reconocer el phishing, a reaccionar con calma cuando algo no encaja y a protegerte a ti y a tu equipo.',
            'In den nächsten <strong>15 Minuten</strong> lernen Sie, Phishing zu erkennen, ruhig zu reagieren, wenn etwas nicht stimmt, und sich und Ihr Team zu schützen.',
          ),
        ),
      }),
      block('note', {
        variant: 'note',
        text: tr(
          L(
            'This is a sample course made in Scormly. Click “Preview” to take it as a learner, edit any block, or export it as a SCORM package for your LMS.',
            'Це приклад курсу, створений у Scormly. Натисніть «Перегляд», щоб пройти його як слухач, змініть будь-який блок або експортуйте його як SCORM-пакет для вашої LMS.',
            'Ceci est un exemple de cours créé avec Scormly. Cliquez sur « Aperçu » pour le suivre comme un apprenant, modifiez n’importe quel bloc ou exportez-le en paquet SCORM pour votre LMS.',
            'Este es un curso de ejemplo creado con Scormly. Haz clic en “Vista previa” para hacerlo como un alumno, edita cualquier bloque o expórtalo como paquete SCORM para tu LMS.',
            'Dies ist ein Beispielkurs, erstellt mit Scormly. Klicken Sie auf „Vorschau“, um ihn als Lernende zu durchlaufen, einen beliebigen Block zu bearbeiten oder ihn als SCORM-Paket für Ihr LMS zu exportieren.',
          ),
        ),
      }),
      block('heading', { level: 2, text: tr(L('What you will learn', 'Чого ви навчитеся', 'Ce que vous allez apprendre', 'Qué vas a aprender', 'Das lernen Sie')) }, 'dark'),
      block('list', {
        ordered: true,
        items: [
          tr(L(
            'The five red flags of a phishing message',
            'П’ять тривожних ознак фішингового повідомлення',
            'Les cinq signaux d’alerte d’un message d’hameçonnage',
            'Las cinco señales de alerta de un mensaje de phishing',
            'Die fünf Warnsignale einer Phishing-Nachricht',
          )),
          tr(L(
            'How phishing looks in email, SMS and phone calls',
            'Як виглядає фішинг у пошті, SMS і дзвінках',
            'À quoi ressemble l’hameçonnage par e-mail, par SMS et par téléphone',
            'Cómo es el phishing por correo, SMS y teléfono',
            'Wie Phishing in E-Mails, SMS und Anrufen aussieht',
          )),
          tr(L(
            'What to do in the first minutes after a suspicious click',
            'Що робити в перші хвилини після підозрілого кліку',
            'Que faire dans les premières minutes après un clic suspect',
            'Qué hacer en los primeros minutos tras un clic sospechoso',
            'Was in den ersten Minuten nach einem verdächtigen Klick zu tun ist',
          )),
        ],
      }, 'dark'),
      block('quote', {
        variant: 'card',
        text: tr(L(
          'After this course our team reported three real phishing attempts in the first week — before anyone clicked.',
          'Після цього курсу наша команда вже за перший тиждень повідомила про три справжні фішингові спроби — ще до того, як хтось клікнув.',
          'Après ce cours, notre équipe a signalé trois vraies tentatives d’hameçonnage dès la première semaine — avant que quiconque ne clique.',
          'Después de este curso, nuestro equipo denunció tres intentos reales de phishing en la primera semana, antes de que nadie hiciera clic.',
          'Nach diesem Kurs hat unser Team in der ersten Woche drei echte Phishing-Versuche gemeldet — bevor jemand geklickt hat.',
        )),
        author: tr(L('Maria Lopez', 'Марія Левченко', 'Marie Lambert', 'María López', 'Maria Lopez')),
        role: tr(L('Head of IT Security', 'Керівниця з ІТ-безпеки', 'Responsable de la sécurité informatique', 'Responsable de seguridad informática', 'Leiterin IT-Sicherheit')),
        image: avatarArt(tr(L('ML', 'МЛ', 'ML', 'ML', 'ML'))),
      }, 'muted'),
      block('heading', { level: 2, text: tr(L('Your first dilemma', 'Ваша перша дилема', 'Votre premier dilemme', 'Tu primer dilema', 'Ihr erstes Dilemma')) }),
      block('paragraph', {
        html: p(L(
          'Meet Ksenia from HR. Choose what you would do.',
          'Знайомтеся: Ксюша з HR. Оберіть, як би ви вчинили.',
          'Faites la connaissance de Ksenia, des RH. Choisissez ce que vous feriez.',
          'Te presento a Ksenia, de RR. HH. Elige qué harías.',
          'Das ist Ksenia aus dem HR. Wählen Sie, was Sie tun würden.',
        )),
      }),
      block('scenario', {
        characterImages: {},
        sceneImages: SAMPLE_ASSETS.ksiuScene,
        background: SAMPLE_ASSETS.background,
        characterName: tr(L('Ksenia, HR', 'Ксюша, HR', 'Ksenia, RH', 'Ksenia, RR. HH.', 'Ksenia, HR')),
        layout: 'scene',
        startNodeId: dilemma.start,
        nodes: [
          {
            id: dilemma.start,
            emotion: 'neutral',
            text: tr(L(
              'Welcome aboard! One question before we begin: a “colleague” emails you a link and asks you to log in to a new portal today. What do you do?',
              'Вітаю в команді! Одне запитання перед початком: «колега» надсилає вам посилання й просить сьогодні увійти до нового порталу. Що ви робите?',
              'Bienvenue à bord ! Une question avant de commencer : un « collègue » vous envoie un lien et vous demande de vous connecter aujourd’hui à un nouveau portail. Que faites-vous ?',
              '¡Bienvenido a bordo! Una pregunta antes de empezar: un “compañero” te envía un enlace y te pide que hoy inicies sesión en un portal nuevo. ¿Qué haces?',
              'Willkommen an Bord! Eine Frage vorab: Ein „Kollege“ schickt Ihnen einen Link und bittet Sie, sich heute in einem neuen Portal anzumelden. Was tun Sie?',
            )),
            choices: [
              { id: id('choice'), text: tr(L('Click the link and log in, it’s probably fine', 'Перейти за посиланням і увійти, мабуть, усе гаразд', 'Cliquer sur le lien et me connecter, ça doit être bon', 'Hacer clic en el enlace e iniciar sesión, seguro que está bien', 'Auf den Link klicken und anmelden, wird schon passen')), nextNodeId: dilemma.bad },
              { id: id('choice'), text: tr(L('Check the sender’s address and the link first', 'Спершу перевірити адресу відправника й посилання', 'Vérifier d’abord l’adresse de l’expéditeur et le lien', 'Comprobar primero la dirección del remitente y el enlace', 'Zuerst Absenderadresse und Link prüfen')), nextNodeId: dilemma.check },
              { id: id('choice'), text: tr(L('Ask the colleague on another channel', 'Запитати колегу в іншому каналі', 'Demander au collègue par un autre canal', 'Preguntar al compañero por otro canal', 'Den Kollegen über einen anderen Kanal fragen')), nextNodeId: dilemma.ask },
            ],
          },
          {
            id: dilemma.bad,
            emotion: 'concerned',
            text: tr(L(
              'Careful! Unexpected links are the classic way attackers collect passwords. This course shows how to spot them.',
              'Обережно! Несподівані посилання — класичний спосіб викрасти паролі. Цей курс покаже, як їх розпізнавати.',
              'Attention ! Les liens inattendus sont le moyen classique de voler des mots de passe. Ce cours vous apprend à les repérer.',
              '¡Cuidado! Los enlaces inesperados son la forma clásica de robar contraseñas. Este curso te enseña a detectarlos.',
              'Vorsicht! Unerwartete Links sind der klassische Weg, Passwörter zu stehlen. Dieser Kurs zeigt, wie man sie erkennt.',
            )),
            choices: [],
          },
          {
            id: dilemma.check,
            emotion: 'happy',
            text: tr(L(
              'Exactly! Checking the sender and the link before you click is the first habit this course builds.',
              'Саме так! Перевірити відправника й посилання перед кліком — перша звичка, яку формує цей курс.',
              'Exactement ! Vérifier l’expéditeur et le lien avant de cliquer est la première habitude que ce cours construit.',
              '¡Exacto! Comprobar el remitente y el enlace antes de hacer clic es el primer hábito que construye este curso.',
              'Genau! Absender und Link zu prüfen, bevor man klickt, ist die erste Gewohnheit, die dieser Kurs aufbaut.',
            )),
            choices: [],
          },
          {
            id: dilemma.ask,
            emotion: 'happy',
            text: tr(L(
              'Great instinct! Confirming through another channel is the safest move.',
              'Чудова інтуїція! Підтвердити в іншому каналі — найбезпечніший крок.',
              'Bon réflexe ! Confirmer par un autre canal est la démarche la plus sûre.',
              '¡Buen instinto! Confirmarlo por otro canal es la jugada más segura.',
              'Guter Instinkt! Über einen anderen Kanal nachzufragen ist der sicherste Weg.',
            )),
            choices: [],
          },
        ],
      }),
      block('courseOutline', { title: tr(L('Course outline', 'Зміст курсу', 'Sommaire du cours', 'Índice del curso', 'Kursübersicht')), numbered: true }),
    ],
  }

  // ── Lesson 2: Anatomy of a phishing email ─────────────────────────────────
  const anatomy: Lesson = {
    id: id('lesson'),
    title: tr(L('Anatomy of a phishing email', 'Анатомія фішингового листа', 'Anatomie d’un e-mail d’hameçonnage', 'Anatomía de un correo de phishing', 'Anatomie einer Phishing-E-Mail')),
    status: 'published',
    blocks: [
      block('heading', { level: 2, text: tr(L('Find the red flags', 'Знайдіть тривожні ознаки', 'Repérez les signaux d’alerte', 'Encuentra las señales de alerta', 'Die Warnsignale finden')) }),
      block('paragraph', {
        variant: 'lead',
        html: p(
          L(
            'This email landed in your inbox this morning. Click each marker to see what gives it away.',
            'Цей лист прийшов вам сьогодні зранку. Натисніть на кожну позначку, щоб побачити, що його видає.',
            'Cet e-mail est arrivé dans votre boîte de réception ce matin. Cliquez sur chaque repère pour voir ce qui le trahit.',
            'Este correo ha llegado a tu bandeja de entrada esta mañana. Haz clic en cada marcador para ver qué lo delata.',
            'Diese E-Mail ist heute Morgen in Ihrem Posteingang gelandet. Klicken Sie auf jede Markierung, um zu sehen, woran man sie erkennt.',
          ),
        ),
      }),
      block('hotspot', {
        src: phishingEmailSvg(tr),
        alt: tr(L(
          'A suspicious email asking to verify an account',
          'Підозрілий лист із проханням підтвердити акаунт',
          'Un e-mail suspect demandant de vérifier un compte',
          'Un correo sospechoso que pide verificar una cuenta',
          'Eine verdächtige E-Mail, die zur Bestätigung eines Kontos auffordert',
        )),
        hotspots: [
          {
            id: id('hs'),
            x: 91,
            y: 21,
            title: tr(L('Look-alike sender', 'Підроблений відправник', 'Expéditeur imité', 'Remitente falso', 'Ähnlich aussehender Absender')),
            text: tr(L(
              '“micros0ft-help.co” uses a zero instead of the letter “o” and is not the company’s real domain.',
              '«micros0ft-help.co» містить нуль замість літери «o» і не є справжнім доменом компанії.',
              '« micros0ft-help.co » contient un zéro à la place de la lettre « o » et n’est pas le vrai domaine de l’entreprise.',
              '“micros0ft-help.co” lleva un cero en lugar de la letra “o” y no es el dominio real de la empresa.',
              '„micros0ft-help.co“ verwendet eine Null statt des Buchstabens „o“ und ist nicht die echte Domain des Unternehmens.',
            )),
          },
          {
            id: id('hs'),
            x: 77,
            y: 30,
            title: tr(L('Pressure and urgency', 'Тиск і терміновість', 'Pression et urgence', 'Presión y urgencia', 'Druck und Dringlichkeit')),
            text: tr(L(
              'Deadlines and threats are designed to make you act before you think.',
              'Дедлайни й погрози мають змусити вас діяти, не подумавши.',
              'Les délais et les menaces sont là pour vous faire agir avant de réfléchir.',
              'Los plazos y las amenazas buscan que actúes antes de pensar.',
              'Fristen und Drohungen sollen Sie handeln lassen, bevor Sie denken.',
            )),
          },
          {
            id: id('hs'),
            x: 91,
            y: 42,
            title: tr(L('Generic greeting', 'Безособове звертання', 'Formule impersonnelle', 'Saludo genérico', 'Unpersönliche Anrede')),
            text: tr(L(
              'Real services usually address you by name.',
              'Справжні сервіси зазвичай звертаються до вас на ім’я.',
              'Les vrais services s’adressent généralement à vous par votre nom.',
              'Los servicios reales suelen dirigirse a ti por tu nombre.',
              'Echte Dienste sprechen Sie meist mit Namen an.',
            )),
          },
          {
            id: id('hs'),
            x: 41,
            y: 65,
            title: tr(L('Hidden link', 'Прихований лінк', 'Lien masqué', 'Enlace oculto', 'Versteckter Link')),
            text: tr(L(
              'Hover before you click: the button leads to a fake login page, not the real site.',
              'Наведіть курсор, перш ніж клікати: кнопка веде на фальшиву сторінку входу, а не на справжній сайт.',
              'Survolez avant de cliquer : le bouton mène à une fausse page de connexion, pas au vrai site.',
              'Pasa el cursor antes de hacer clic: el botón lleva a una página de inicio de sesión falsa, no al sitio real.',
              'Mit der Maus darüberfahren, bevor Sie klicken: Die Schaltfläche führt zu einer gefälschten Anmeldeseite, nicht zur echten Seite.',
            )),
          },
          {
            id: id('hs'),
            x: 38,
            y: 83,
            title: tr(L('Unexpected attachment', 'Неочікуване вкладення', 'Pièce jointe inattendue', 'Adjunto inesperado', 'Unerwarteter Anhang')),
            text: tr(L(
              'An archive you never asked for may contain malware. Never open it.',
              'Архів, якого ви не чекали, може містити шкідливу програму. Ніколи не відкривайте його.',
              'Une archive que vous n’avez jamais demandée peut contenir un logiciel malveillant. Ne l’ouvrez jamais.',
              'Un archivo comprimido que no has pedido puede contener malware. No lo abras nunca.',
              'Ein Archiv, das Sie nie angefordert haben, kann Schadsoftware enthalten. Niemals öffnen.',
            )),
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Fake or real?', 'Підробка чи справжній?', 'Faux ou authentique ?', '¿Falso o auténtico?', 'Fälschung oder echt?')) }),
      block('paragraph', {
        html: p(L(
          'Drag the slider to compare the phishing email with a genuine message from your IT team.',
          'Потягніть повзунок, щоб порівняти фішинговий лист зі справжнім повідомленням від вашої ІТ-служби.',
          'Faites glisser le curseur pour comparer l’e-mail d’hameçonnage avec un vrai message de votre service informatique.',
          'Arrastra el control deslizante para comparar el correo de phishing con un mensaje auténtico de tu equipo de TI.',
          'Ziehen Sie den Regler, um die Phishing-E-Mail mit einer echten Nachricht Ihres IT-Teams zu vergleichen.',
        )),
      }),
      block('beforeAfter', {
        before: phishingEmailSvg(tr),
        beforeAlt: tr(L(
          'The phishing email: look-alike sender, an urgent threat and a “Verify account” button',
          'Фішинговий лист: підроблений відправник, термінова погроза й кнопка «Підтвердити акаунт»',
          'L’e-mail d’hameçonnage : expéditeur imité, menace urgente et bouton « Vérifier mon compte »',
          'El correo de phishing: remitente falso, una amenaza urgente y un botón “Verificar cuenta”',
          'Die Phishing-E-Mail: ähnlich aussehender Absender, eine dringende Drohung und eine Schaltfläche „Konto bestätigen“',
        )),
        beforeLabel: tr(L('Phishing', 'Фішинг', 'Hameçonnage', 'Phishing', 'Phishing')),
        after: genuineEmailSvg(tr),
        afterAlt: tr(L(
          'The genuine email: the company’s own domain, a greeting by name, no links and no attachment',
          'Справжній лист: домен компанії, звертання на ім’я, без посилань і вкладень',
          'L’e-mail authentique : le domaine de l’entreprise, une salutation nominative, ni lien ni pièce jointe',
          'El correo auténtico: el dominio de la empresa, un saludo con tu nombre, sin enlaces ni adjuntos',
          'Die echte E-Mail: die eigene Domain des Unternehmens, Anrede mit Namen, keine Links und kein Anhang',
        )),
        afterLabel: tr(L('Genuine', 'Справжній', 'Authentique', 'Auténtico', 'Echt')),
      }),
      block('continue', { mode: 'unrestricted', label: tr(L('Continue', 'Продовжити', 'Continuer', 'Continuar', 'Weiter')) }),
      block('heading', { level: 2, text: tr(L('Four red flags to remember', 'Чотири ознаки, які варто запам’ятати', 'Quatre signaux d’alerte à retenir', 'Cuatro señales de alerta para recordar', 'Vier Warnsignale zum Merken')) }),
      block('gallery', {
        layout: 'carousel',
        images: [
          {
            src: flagSlide(
              1,
              tr(L('Urgency', 'Терміновість', 'Urgence', 'Urgencia', 'Dringlichkeit')),
              tr(L(
                '“Act now or lose access” — pressure is the attacker’s favourite tool.',
                '«Дійте негайно, або втратите доступ» — тиск є улюбленим інструментом зловмисника.',
                '« Agissez maintenant ou perdez l’accès » : la pression est l’outil favori des attaquants.',
                '“Actúa ya o perderás el acceso”: la presión es la herramienta favorita del atacante.',
                '„Jetzt handeln, sonst verlieren Sie den Zugriff“ — Druck ist das Lieblingswerkzeug der Angreifer.',
              )),
              'clock',
            ),
            alt: tr(L('Red flag 1: urgency', 'Ознака 1: терміновість', 'Signal d’alerte 1 : l’urgence', 'Señal de alerta 1: urgencia', 'Warnsignal 1: Dringlichkeit')),
            caption: tr(L(
              'Real services give you time. Slow down when a message rushes you.',
              'Справжні сервіси дають вам час. Сповільніться, коли лист вас квапить.',
              'Les vrais services vous laissent du temps. Ralentissez quand un message vous presse.',
              'Los servicios reales te dan tiempo. Frena cuando un mensaje te apremia.',
              'Echte Dienste lassen Ihnen Zeit. Werden Sie langsamer, wenn eine Nachricht Sie hetzt.',
            )),
          },
          {
            src: flagSlide(
              2,
              tr(L('Look-alike senders', 'Схожі адреси', 'Expéditeurs imités', 'Remitentes falsos', 'Ähnlich aussehende Absender')),
              tr(L(
                'micros0ft-help.co is not microsoft.com. Read the domain letter by letter.',
                'micros0ft-help.co — це не microsoft.com. Читайте домен по літері.',
                'micros0ft-help.co n’est pas microsoft.com. Lisez le domaine lettre par lettre.',
                'micros0ft-help.co no es microsoft.com. Lee el dominio letra por letra.',
                'micros0ft-help.co ist nicht microsoft.com. Lesen Sie die Domain Buchstabe für Buchstabe.',
              )),
              'at',
            ),
            alt: tr(L(
              'Red flag 2: look-alike sender addresses',
              'Ознака 2: підроблені адреси відправників',
              'Signal d’alerte 2 : les adresses d’expéditeur imitées',
              'Señal de alerta 2: direcciones de remitente falsas',
              'Warnsignal 2: ähnlich aussehende Absenderadressen',
            )),
            caption: tr(L(
              'Check the address, not just the display name.',
              'Перевіряйте адресу, а не лише ім’я відправника.',
              'Vérifiez l’adresse, pas seulement le nom affiché.',
              'Comprueba la dirección, no solo el nombre mostrado.',
              'Prüfen Sie die Adresse, nicht nur den Anzeigenamen.',
            )),
          },
          {
            src: flagSlide(
              3,
              tr(L('Surprise attachments', 'Несподівані вкладення', 'Pièces inattendues', 'Adjuntos inesperados', 'Überraschende Anhänge')),
              tr(L(
                'Invoices, “scans” and archives you never asked for can carry malware.',
                'Рахунки, «скани» й архіви, яких ви не чекали, можуть містити шкідливе ПЗ.',
                'Factures, « scans » et archives non sollicités peuvent cacher un logiciel malveillant.',
                'Facturas, “escaneos” y archivos que no has pedido pueden traer malware.',
                'Rechnungen, „Scans“ und Archive, die Sie nie angefordert haben, können Schadsoftware enthalten.',
              )),
              'clip',
            ),
            alt: tr(L(
              'Red flag 3: unexpected attachments',
              'Ознака 3: неочікувані вкладення',
              'Signal d’alerte 3 : les pièces jointes inattendues',
              'Señal de alerta 3: adjuntos inesperados',
              'Warnsignal 3: unerwartete Anhänge',
            )),
            caption: tr(L(
              'Not expecting a file? Confirm with the sender another way.',
              'Не чекали файл? Уточніть у відправника іншим способом.',
              'Vous n’attendiez pas de fichier ? Vérifiez auprès de l’expéditeur par un autre moyen.',
              '¿No esperabas un archivo? Confírmalo con el remitente por otra vía.',
              'Keine Datei erwartet? Bestätigen Sie es beim Absender auf anderem Weg.',
            )),
          },
          {
            src: flagSlide(
              4,
              tr(L('Password requests', 'Запит пароля', 'Mot de passe demandé', 'Piden tu contraseña', 'Passwortanfragen')),
              tr(L(
                'No real IT team, bank or colleague will ever ask for your password or code.',
                'Жодна справжня ІТ-служба, банк чи колега не питатиме ваш пароль чи код.',
                'Aucun vrai service informatique, banque ou collègue ne vous demandera votre mot de passe ni un code.',
                'Ningún equipo de TI, banco o compañero de verdad te pedirá tu contraseña ni un código.',
                'Kein echtes IT-Team, keine Bank und kein Kollege wird Sie jemals nach Ihrem Passwort oder Code fragen.',
              )),
              'key',
            ),
            alt: tr(L(
              'Red flag 4: requests for passwords or codes',
              'Ознака 4: прохання назвати пароль чи код',
              'Signal d’alerte 4 : les demandes de mot de passe ou de code',
              'Señal de alerta 4: te piden contraseñas o códigos',
              'Warnsignal 4: Anfragen nach Passwörtern oder Codes',
            )),
            caption: tr(L(
              'A password request is a phishing attempt — always.',
              'Прохання назвати пароль — це завжди фішинг.',
              'Une demande de mot de passe est une tentative d’hameçonnage. Toujours.',
              'Si te piden la contraseña, es un intento de phishing. Siempre.',
              'Eine Passwortanfrage ist ein Phishing-Versuch — immer.',
            )),
          },
        ],
      }),
      block('paragraph', {
        html:
          p(L(
            '<strong>Read the address, not the name.</strong> A display name can say anything:',
            '<strong>Читайте адресу, а не ім’я.</strong> Ім’я відправника може бути будь-яким:',
            '<strong>Lisez l’adresse, pas le nom.</strong> Un nom affiché peut dire n’importe quoi :',
            '<strong>Lee la dirección, no el nombre.</strong> El nombre mostrado puede decir cualquier cosa:',
            '<strong>Lesen Sie die Adresse, nicht den Namen.</strong> Ein Anzeigename kann alles Mögliche behaupten:',
          )) + addressTable(tr),
      }),
      block('heading', { level: 2, text: tr(L('Who really owns the link?', 'Кому насправді належить посилання?', 'À qui appartient vraiment le lien ?', '¿De quién es realmente el enlace?', 'Wem gehört der Link wirklich?')) }),
      block('html', {
        source: 'code',
        code: linkDetectiveHtml(tr, lang),
        src: '',
        title: tr(L(
          'Link detective: who really owns the site?',
          'Детектив посилань: кому насправді належить сайт?',
          'Détective de liens : à qui appartient vraiment le site ?',
          'Detective de enlaces: ¿de quién es realmente el sitio?',
          'Link-Detektiv: Wem gehört die Seite wirklich?',
        )),
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
            '<strong>Les attaquants comptent sur l’habitude.</strong> Les quelques secondes passées à vérifier un expéditeur ou un lien sont votre meilleur outil de sécurité.',
            '<strong>Los atacantes cuentan con la costumbre.</strong> Los pocos segundos que dedicas a comprobar un remitente o un enlace son tu mejor herramienta de seguridad.',
            '<strong>Angreifer setzen auf Gewohnheit.</strong> Die paar Sekunden, die Sie mit der Prüfung eines Absenders oder Links verbringen, sind Ihr bestes Sicherheitswerkzeug.',
          )),
        },
      },
      block('heading', { level: 2, text: tr(L('Phishing is not only email', 'Фішинг — це не лише пошта', 'L’hameçonnage ne passe pas que par l’e-mail', 'El phishing no es solo correo', 'Phishing gibt es nicht nur per E-Mail')) }),
      block('tabs', {
        tabs: [
          {
            id: id('tab'),
            title: tr(L('Email', 'Пошта', 'E-mail', 'Correo', 'E-Mail')),
            html: p(L(
              'The classic: fake invoices, password resets and “shared documents” that lead to a login page controlled by attackers.',
              'Класика: фальшиві рахунки, скидання пароля та «спільні документи», що ведуть на сторінку входу, яку контролюють зловмисники.',
              'Le grand classique : fausses factures, réinitialisations de mot de passe et « documents partagés » qui mènent à une page de connexion contrôlée par les attaquants.',
              'El clásico: facturas falsas, restablecimientos de contraseña y “documentos compartidos” que llevan a una página de inicio de sesión controlada por los atacantes.',
              'Der Klassiker: gefälschte Rechnungen, Passwort-Resets und „geteilte Dokumente“, die zu einer von Angreifern kontrollierten Anmeldeseite führen.',
            )),
          },
          {
            id: id('tab'),
            title: tr(L('SMS (smishing)', 'SMS (смішинг)', 'SMS (smishing)', 'SMS (smishing)', 'SMS (Smishing)')),
            html: p(L(
              '“Your parcel is on hold, pay 1.99 to release it.” Short links in text messages hide where they really go.',
              '«Вашу посилку затримано, сплатіть 1,99, щоб її отримати». Короткі посилання в SMS приховують, куди вони насправді ведуть.',
              '« Votre colis est en attente, payez 1,99 pour le débloquer. » Les liens raccourcis des SMS cachent leur véritable destination.',
              '“Tu paquete está retenido, paga 1,99 para liberarlo”. Los enlaces cortos de los SMS ocultan adónde llevan en realidad.',
              '„Ihr Paket wird zurückgehalten, zahlen Sie 1,99, um es freizugeben.“ Kurzlinks in Textnachrichten verbergen, wohin sie wirklich führen.',
            )),
          },
          {
            id: id('tab'),
            title: tr(L('Calls (vishing)', 'Дзвінки (вішинг)', 'Appels (vishing)', 'Llamadas (vishing)', 'Anrufe (Vishing)')),
            html: p(L(
              'A caller pretending to be your bank or IT desk asks for a one-time code. No real support will ever ask for it.',
              'Людина, що видає себе за банк чи ІТ-підтримку, просить одноразовий код. Справжня підтримка ніколи його не питає.',
              'Quelqu’un se fait passer pour votre banque ou le support informatique et vous demande un code à usage unique. Aucun vrai support ne vous le demandera jamais.',
              'Alguien que se hace pasar por tu banco o por soporte informático te pide un código de un solo uso. Ningún soporte de verdad te lo pedirá jamás.',
              'Ein Anrufer, der sich als Ihre Bank oder der IT-Support ausgibt, fragt nach einem Einmalcode. Kein echter Support fragt jemals danach.',
            )),
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('When something looks off', 'Коли щось здається підозрілим', 'Quand quelque chose vous semble louche', 'Cuando algo no encaja', 'Wenn etwas nicht stimmt')) }),
      block('process', {
        layout: 'chevrons',
        steps: [
          { id: id('step'), title: tr(L('Stop', 'Зупиніться', 'Arrêtez-vous', 'Detente', 'Stopp')), text: tr(L('Don’t click, reply or open attachments.', 'Не клікайте, не відповідайте й не відкривайте вкладення.', 'Ne cliquez pas, ne répondez pas, n’ouvrez aucune pièce jointe.', 'No hagas clic, no respondas ni abras adjuntos.', 'Nicht klicken, antworten oder Anhänge öffnen.')) },
          { id: id('step'), title: tr(L('Check', 'Перевірте', 'Vérifiez', 'Comprueba', 'Prüfen')), text: tr(L('Read the sender’s address and hover over links.', 'Прочитайте адресу відправника й наведіть курсор на посилання.', 'Lisez l’adresse de l’expéditeur et survolez les liens.', 'Lee la dirección del remitente y pasa el cursor sobre los enlaces.', 'Absenderadresse lesen und mit der Maus über Links fahren.')) },
          { id: id('step'), title: tr(L('Report', 'Повідомте', 'Signalez', 'Denuncia', 'Melden')), text: tr(L('Use “Report phishing” or tell your security team.', 'Натисніть «Повідомити про фішинг» або напишіть службі безпеки.', 'Utilisez « Signaler l’hameçonnage » ou prévenez votre équipe de sécurité.', 'Usa “Denunciar phishing” o avisa a tu equipo de seguridad.', '„Phishing melden“ nutzen oder Ihr Sicherheitsteam informieren.')) },
          { id: id('step'), title: tr(L('Delete', 'Видаліть', 'Supprimez', 'Elimina', 'Löschen')), text: tr(L('Remove the email once it’s reported.', 'Видаліть лист, коли про нього повідомили.', 'Supprimez l’e-mail une fois qu’il est signalé.', 'Borra el correo una vez denunciado.', 'Die E-Mail entfernen, sobald sie gemeldet ist.')) },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Key terms', 'Ключові терміни', 'Termes clés', 'Términos clave', 'Schlüsselbegriffe')) }),
      block('flashcards', {
        cards: [
          { id: id('card'), front: tr(L('Phishing', 'Фішинг', 'Hameçonnage (phishing)', 'Phishing', 'Phishing')), back: tr(L('A fake message that tricks you into revealing data or installing malware.', 'Фальшиве повідомлення, яке змушує вас розкрити дані чи встановити шкідливу програму.', 'Un faux message qui vous pousse à divulguer des données ou à installer un logiciel malveillant.', 'Un mensaje falso que te engaña para que reveles datos o instales malware.', 'Eine gefälschte Nachricht, die Sie dazu bringt, Daten preiszugeben oder Schadsoftware zu installieren.')) },
          { id: id('card'), front: tr(L('Spear phishing', 'Цільовий фішинг', 'Hameçonnage ciblé', 'Phishing dirigido', 'Spear-Phishing')), back: tr(L('Phishing tailored to one person, using details about their job or life.', 'Фішинг, підлаштований під конкретну людину з деталями про її роботу чи життя.', 'Un hameçonnage taillé sur mesure pour une personne, à partir de détails sur son travail ou sa vie.', 'Phishing hecho a medida para una persona, con detalles de su trabajo o de su vida.', 'Auf eine einzelne Person zugeschnittenes Phishing, das Details zu ihrem Beruf oder Leben nutzt.')) },
          { id: id('card'), front: tr(L('Spoofing', 'Спуфінг', 'Usurpation (spoofing)', 'Suplantación (spoofing)', 'Spoofing')), back: tr(L('Faking a sender name, address or phone number to look trustworthy.', 'Підробка імені, адреси чи номера відправника, щоб викликати довіру.', 'Falsifier un nom d’expéditeur, une adresse ou un numéro de téléphone pour inspirer confiance.', 'Falsificar el nombre, la dirección o el número del remitente para parecer de confianza.', 'Das Fälschen eines Absendernamens, einer Adresse oder Telefonnummer, um vertrauenswürdig zu wirken.')) },
          { id: id('card'), front: 'MFA', back: tr(L('Multi-factor authentication: a second proof of identity that stops most stolen-password attacks.', 'Багатофакторна автентифікація: другий доказ особи, що зупиняє більшість атак з украденим паролем.', 'Authentification multifacteur : une seconde preuve d’identité qui bloque la plupart des attaques par mot de passe volé.', 'Autenticación multifactor: una segunda prueba de identidad que frena la mayoría de los ataques con contraseñas robadas.', 'Multi-Faktor-Authentifizierung: ein zweiter Identitätsnachweis, der die meisten Angriffe mit gestohlenen Passwörtern stoppt.')) },
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
    title: tr(L('Practice: a message from “IT”', 'Практика: повідомлення від «ІТ»', 'Pratique : un message du « service informatique »', 'Práctica: un mensaje de “informática”', 'Übung: eine Nachricht von der „IT“')),
    status: 'published',
    blocks: [
      block('heading', { level: 2, text: tr(L('A chat you did not expect', 'Неочікуваний чат', 'Une discussion inattendue', 'Un chat que no esperabas', 'Ein unerwarteter Chat')) }),
      block('paragraph', {
        html: p(L(
          'Someone from “IT support” messages you in the work chat. Choose your replies.',
          'Хтось із «ІТ-підтримки» пише вам у робочий чат. Оберіть свої відповіді.',
          'Quelqu’un du « support informatique » vous écrit sur la messagerie de l’entreprise. Choisissez vos réponses.',
          'Alguien de “soporte informático” te escribe por el chat del trabajo. Elige tus respuestas.',
          'Jemand vom „IT-Support“ schreibt Ihnen im Arbeitschat. Wählen Sie Ihre Antworten.',
        )),
      }),
      block('scenario', {
        characterImages: SAMPLE_ASSETS.dmytroBust,
        userAvatar: SAMPLE_ASSETS.learner,
        characterName: tr(L('Dmytro, IT support', 'Дмитро, ІТ-підтримка', 'Dmytro, support informatique', 'Dmytro, soporte informático', 'Dmytro, IT-Support')),
        layout: 'chat',
        startNodeId: n.start,
        nodes: [
          {
            id: n.start,
            emotion: 'neutral',
            text: tr(L(
              'Hi! We are migrating mailboxes today. I need your password to move your mail, it will take 2 minutes 🙂',
              'Привіт! Сьогодні переносимо поштові скриньки. Мені потрібен ваш пароль, щоб перенести пошту, це 2 хвилини 🙂',
              'Bonjour ! Nous migrons les boîtes mail aujourd’hui. J’ai besoin de votre mot de passe pour transférer vos messages, ça prendra 2 minutes 🙂',
              '¡Hola! Hoy estamos migrando los buzones de correo. Necesito tu contraseña para mover tus mensajes, son 2 minutos 🙂',
              'Hallo! Wir migrieren heute die Postfächer. Ich brauche Ihr Passwort, um Ihre E-Mails zu verschieben, es dauert 2 Minuten 🙂',
            )),
            choices: [
              { id: id('choice'), text: tr(L('Sure, it’s Summer2026!', 'Звісно, ось він: Summer2026!', 'Bien sûr, c’est Summer2026!', 'Claro, es Summer2026!', 'Klar, es lautet Summer2026!')), nextNodeId: n.bad, setEmotion: 'happy' },
              { id: id('choice'), text: tr(L('IT never asks for passwords. Can I call the service desk to confirm?', 'ІТ ніколи не питає паролів. Можна я перетелефоную на гарячу лінію, щоб перевірити?', 'Le service informatique ne demande jamais de mot de passe. Puis-je appeler l’assistance pour vérifier ?', 'Informática nunca pide contraseñas. ¿Puedo llamar a asistencia para confirmarlo?', 'Die IT fragt nie nach Passwörtern. Kann ich den Servicedesk anrufen, um das zu bestätigen?')), nextNodeId: n.verify, setEmotion: 'concerned' },
              { id: id('choice'), text: tr(L('Why do you need it?', 'А навіщо він вам?', 'Pourquoi en avez-vous besoin ?', '¿Para qué la necesitas?', 'Warum brauchen Sie es?')), nextNodeId: n.pwd },
            ],
          },
          {
            id: n.pwd,
            emotion: 'concerned',
            text: tr(L(
              'It’s urgent, your mailbox will be deleted tonight if we don’t move it. Please hurry!',
              'Це терміново: якщо не перенесемо, сьогодні ввечері скриньку видалять. Будь ласка, швидше!',
              'C’est urgent : votre boîte mail sera supprimée ce soir si nous ne la transférons pas. Faites vite, s’il vous plaît !',
              'Es urgente: si no lo movemos, tu buzón se eliminará esta noche. ¡Rápido, por favor!',
              'Es ist dringend, Ihr Postfach wird heute Nacht gelöscht, wenn wir es nicht verschieben. Bitte beeilen Sie sich!',
            )),
            choices: [
              { id: id('choice'), text: tr(L('OK, here it is…', 'Гаразд, ось він…', 'D’accord, le voici…', 'De acuerdo, aquí la tienes…', 'OK, hier ist es …')), nextNodeId: n.bad },
              { id: id('choice'), text: tr(L('Pressure is a red flag. I’ll check with the service desk first.', 'Тиск — це тривожна ознака. Спершу перевірю на гарячій лінії.', 'La pression est un signal d’alerte. Je vérifie d’abord auprès de l’assistance.', 'La presión es una señal de alerta. Antes lo consulto con asistencia.', 'Druck ist ein Warnsignal. Ich frage erst beim Servicedesk nach.')), nextNodeId: n.verify },
            ],
          },
          {
            id: n.verify,
            emotion: 'concerned',
            text: tr(L('Uh… never mind, I’ll do it later.', 'Е-е… та нічого, зроблю пізніше.', 'Euh… laissez tomber, je le ferai plus tard.', 'Eh… déjalo, ya lo haré más tarde.', 'Äh … egal, ich mache das später.')),
            choices: [
              { id: id('choice'), text: tr(L('Report the chat to security', 'Повідомити про чат службі безпеки', 'Signaler la conversation à la sécurité', 'Denunciar el chat a seguridad', 'Den Chat der Sicherheit melden')), nextNodeId: n.good, setEmotion: 'happy' },
            ],
          },
          {
            id: n.good,
            emotion: 'happy',
            text: tr(L(
              '✅ Well done! You refused to share a password, verified through an official channel and reported the attempt.',
              '✅ Чудово! Ви не поділилися паролем, перевірили через офіційний канал і повідомили про спробу.',
              '✅ Bravo ! Vous avez refusé de communiquer votre mot de passe, vérifié par un canal officiel et signalé la tentative.',
              '✅ ¡Bien hecho! Te has negado a dar la contraseña, lo has verificado por un canal oficial y has denunciado el intento.',
              '✅ Gut gemacht! Sie haben das Passwort nicht preisgegeben, über einen offiziellen Kanal nachgefragt und den Versuch gemeldet.',
            )),
            choices: [],
          },
          {
            id: n.bad,
            emotion: 'neutral',
            text: tr(L(
              '❌ Thanks! (The attacker now has your password.) Real IT will never ask for it — change it right away and report the chat.',
              '❌ Дякую! (Тепер зловмисник має ваш пароль.) Справжнє ІТ ніколи його не питає — негайно змініть пароль і повідомте про чат.',
              '❌ Merci ! (L’attaquant a maintenant votre mot de passe.) Le vrai service informatique ne vous le demandera jamais — changez-le immédiatement et signalez la conversation.',
              '❌ ¡Gracias! (Ahora el atacante tiene tu contraseña.) El equipo de TI de verdad nunca te la pedirá: cámbiala enseguida y denuncia el chat.',
              '❌ Danke! (Der Angreifer hat jetzt Ihr Passwort.) Die echte IT fragt nie danach — ändern Sie es sofort und melden Sie den Chat.',
            )),
            choices: [],
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Warm-up before the test', 'Розминка перед тестом', 'Échauffement avant le test', 'Calentamiento antes de la prueba', 'Aufwärmen vor dem Test')) }),
      block('ordering', {
        mode: 'categories',
        prompt: tr(L('Sort the messages: safe or phishing?', 'Розсортуйте повідомлення: безпечне чи фішинг?', 'Classez les messages : sûr ou hameçonnage ?', 'Clasifica los mensajes: ¿seguro o phishing?', 'Sortieren Sie die Nachrichten: sicher oder Phishing?')),
        categories: [
          { id: catSafe, title: tr(L('Looks safe', 'Схоже на безпечне', 'Semble sûr', 'Parece seguro', 'Wirkt sicher')) },
          { id: catPhish, title: tr(L('Phishing', 'Фішинг', 'Hameçonnage', 'Phishing', 'Phishing')) },
        ],
        items: [
          { id: id('item'), categoryId: catPhish, text: tr(L('“Your parcel is on hold — pay 1.99 via this link”', '«Посилку затримано — сплатіть 1,99 за посиланням»', '« Votre colis est en attente — payez 1,99 via ce lien »', '“Tu paquete está retenido: paga 1,99 en este enlace”', '„Ihr Paket wird zurückgehalten — zahlen Sie 1,99 über diesen Link“')) },
          { id: id('item'), categoryId: catSafe, text: tr(L('A meeting invite from your manager for a meeting you discussed', 'Запрошення від керівника на зустріч, про яку ви домовлялися', 'Une invitation de votre responsable à une réunion dont vous aviez parlé', 'Una invitación de tu responsable a una reunión que ya tenías prevista', 'Eine Meeting-Einladung Ihrer Führungskraft für ein Meeting, das Sie besprochen haben')) },
          { id: id('item'), categoryId: catPhish, text: tr(L('“CEO” asks you to buy gift cards urgently and keep it secret', '«Директор» просить терміново купити подарункові картки й нікому не казати', 'Le « PDG » vous demande d’acheter d’urgence des cartes cadeaux et de garder le secret', 'El “CEO” te pide que compres tarjetas de regalo con urgencia y que lo mantengas en secreto', 'Der „CEO“ bittet Sie, dringend Geschenkkarten zu kaufen und es geheim zu halten')) },
          { id: id('item'), categoryId: catSafe, text: tr(L('A password-reset email right after you clicked “Forgot password”', 'Лист для скидання пароля одразу після того, як ви натиснули «Забули пароль»', 'Un e-mail de réinitialisation reçu juste après avoir cliqué sur « Mot de passe oublié »', 'Un correo para restablecer la contraseña justo después de hacer clic en “He olvidado mi contraseña”', 'Eine E-Mail zum Zurücksetzen des Passworts direkt nach Ihrem Klick auf „Passwort vergessen“')) },
          { id: id('item'), categoryId: catPhish, text: tr(L('“Unusual sign-in detected, confirm your password here”', '«Виявлено незвичний вхід, підтвердьте пароль тут»', '« Connexion inhabituelle détectée, confirmez votre mot de passe ici »', '“Inicio de sesión inusual detectado, confirma tu contraseña aquí”', '„Ungewöhnliche Anmeldung erkannt, bestätigen Sie hier Ihr Passwort“')) },
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
            'Les attaquants créent un sentiment d’[urgence] pour vous faire agir sans réfléchir. Avant de cliquer, [survolez] le lien pour voir où il mène. Activer la [MFA] vous protège même si votre mot de passe est volé.',
            'Los atacantes crean una sensación de [urgencia] para que actúes sin pensar. Antes de hacer clic, [pasa el cursor] sobre el enlace para ver adónde lleva. Activar la [MFA] te protege incluso si te roban la contraseña.',
            'Angreifer erzeugen ein Gefühl von [Dringlichkeit], damit Sie ohne Nachdenken handeln. Fahren Sie vor dem Klicken mit der Maus [darüber], um zu sehen, wohin ein Link führt. Das Aktivieren von [MFA] schützt Sie auch dann, wenn Ihr Passwort gestohlen wird.',
          ),
        ),
        passingScore: 80,
        showAnswers: true,
      }),
      // Blocking: opens once both exercises above are answered.
      block('continue', { mode: 'restricted', label: tr(L('Continue', 'Продовжити', 'Continuer', 'Continuar', 'Weiter')) }),
      block('heading', { level: 2, text: tr(L('Clicked a bad link? Act fast', 'Клікнули на підозріле посилання? Дійте швидко', 'Vous avez cliqué sur un lien douteux ? Agissez vite', '¿Has hecho clic en un enlace malicioso? Actúa rápido', 'Schlechten Link angeklickt? Schnell handeln')) }),
      block('timeline', {
        layout: 'stepper',
        items: [
          { id: id('tl'), label: tr(L('Step 1', 'Крок 1', 'Étape 1', 'Paso 1', 'Schritt 1')), title: tr(L('Disconnect', 'Від’єднайтеся', 'Déconnectez-vous', 'Desconéctate', 'Trennen')), text: tr(L('Close the page and don’t enter anything else. If a file was downloaded, disconnect from the network.', 'Закрийте сторінку й нічого більше не вводьте. Якщо завантажився файл — від’єднайтеся від мережі.', 'Fermez la page et ne saisissez plus rien. Si un fichier a été téléchargé, déconnectez-vous du réseau.', 'Cierra la página y no introduzcas nada más. Si se ha descargado un archivo, desconéctate de la red.', 'Schließen Sie die Seite und geben Sie nichts weiter ein. Wurde eine Datei heruntergeladen, trennen Sie die Netzwerkverbindung.')) },
          { id: id('tl'), label: tr(L('Step 2', 'Крок 2', 'Étape 2', 'Paso 2', 'Schritt 2')), title: tr(L('Change your password', 'Змініть пароль', 'Changez votre mot de passe', 'Cambia tu contraseña', 'Passwort ändern')), text: tr(L('From a trusted device, change the password and sign out of all sessions.', 'З довіреного пристрою змініть пароль і вийдіть з усіх сеансів.', 'Depuis un appareil de confiance, changez le mot de passe et fermez toutes les sessions.', 'Desde un dispositivo de confianza, cambia la contraseña y cierra todas las sesiones.', 'Ändern Sie das Passwort von einem vertrauenswürdigen Gerät aus und melden Sie sich von allen Sitzungen ab.')) },
          { id: id('tl'), label: tr(L('Step 3', 'Крок 3', 'Étape 3', 'Paso 3', 'Schritt 3')), title: tr(L('Report it', 'Повідомте', 'Signalez-le', 'Avisa', 'Melden')), text: tr(L('Tell your security team right away. Speed matters more than embarrassment.', 'Одразу повідомте службу безпеки. Швидкість важливіша за незручність.', 'Prévenez tout de suite votre équipe de sécurité. La rapidité compte plus que la gêne.', 'Avisa enseguida a tu equipo de seguridad. La rapidez importa más que la vergüenza.', 'Informieren Sie sofort Ihr Sicherheitsteam. Schnelligkeit zählt mehr als Peinlichkeit.')) },
          { id: id('tl'), label: tr(L('Step 4', 'Крок 4', 'Étape 4', 'Paso 4', 'Schritt 4')), title: tr(L('Watch for activity', 'Стежте за активністю', 'Surveillez l’activité', 'Vigila la actividad', 'Auf Aktivitäten achten')), text: tr(L('Check your account and bank statements for anything unusual over the next weeks.', 'Кілька тижнів перевіряйте акаунт і банківські виписки на незвичні операції.', 'Dans les semaines qui suivent, vérifiez que rien d’inhabituel n’apparaît sur votre compte ni sur vos relevés bancaires.', 'Durante las próximas semanas, revisa tu cuenta y tus extractos bancarios por si hay algo inusual.', 'Prüfen Sie Ihr Konto und Ihre Kontoauszüge in den nächsten Wochen auf Ungewöhnliches.')) },
        ],
      }),
      block('note', {
        variant: 'success',
        text: tr(L(
          'Key point: reporting fast matters more than feeling embarrassed — security teams would rather get ten false alarms than miss one real attack.',
          'Головне: швидко повідомити важливіше за незручність — служба безпеки радше отримає десять хибних тривог, ніж пропустить одну справжню атаку.',
          'À retenir : signaler vite compte plus que la gêne — les équipes de sécurité préfèrent dix fausses alertes à une vraie attaque manquée.',
          'Lo esencial: avisar rápido importa más que la vergüenza. Los equipos de seguridad prefieren diez falsas alarmas a que se les escape un ataque real.',
          'Kernpunkt: Schnell zu melden ist wichtiger, als sich zu schämen — Sicherheitsteams erhalten lieber zehn Fehlalarme, als einen echten Angriff zu verpassen.',
        )),
      }),
      block('heading', { level: 2, text: tr(L('How to report a phishing email', 'Як повідомити про фішинговий лист', 'Comment signaler un e-mail d’hameçonnage', 'Cómo denunciar un correo de phishing', 'So melden Sie eine Phishing-E-Mail')) }),
      block('steps', {
        layout: 'list',
        steps: [
          {
            id: id('step'),
            title: tr(L('Don’t interact', 'Нічого не робіть із листом', 'N’interagissez pas', 'No interactúes', 'Nicht reagieren')),
            html: p(L(
              'Don’t reply, click links or open attachments — not even “just to check”.',
              'Не відповідайте, не клікайте посилання й не відкривайте вкладення — навіть «просто перевірити».',
              'Ne répondez pas, ne cliquez sur aucun lien, n’ouvrez aucune pièce jointe — même « juste pour vérifier ».',
              'No respondas, no hagas clic en los enlaces ni abras los adjuntos, ni siquiera “solo para comprobar”.',
              'Nicht antworten, keine Links anklicken, keine Anhänge öffnen — auch nicht „nur zum Prüfen“.',
            )),
          },
          {
            id: id('step'),
            title: tr(L('Use the Report button', 'Натисніть «Повідомити»', 'Utilisez le bouton Signaler', 'Usa el botón Denunciar', 'Die Schaltfläche „Melden“ nutzen')),
            html: p(L(
              'In your mail app choose <strong>Report → Phishing</strong>. No such button? Forward the email as an attachment to <a href="mailto:security@yourcompany.com" target="_blank" rel="noopener noreferrer">security@yourcompany.com</a>.',
              'У поштовій програмі оберіть <strong>Повідомити → Фішинг</strong>. Немає такої кнопки? Перешліть лист як вкладення на <a href="mailto:security@yourcompany.com" target="_blank" rel="noopener noreferrer">security@yourcompany.com</a>.',
              'Dans votre messagerie, choisissez <strong>Signaler → Hameçonnage</strong>. Pas de bouton de ce type ? Transférez l’e-mail en pièce jointe à <a href="mailto:security@yourcompany.com" target="_blank" rel="noopener noreferrer">security@yourcompany.com</a>.',
              'En tu aplicación de correo, elige <strong>Denunciar → Phishing</strong>. ¿No tienes ese botón? Reenvía el correo como archivo adjunto a <a href="mailto:security@yourcompany.com" target="_blank" rel="noopener noreferrer">security@yourcompany.com</a>.',
              'Wählen Sie in Ihrer Mail-App <strong>Melden → Phishing</strong>. Keine solche Schaltfläche? Leiten Sie die E-Mail als Anhang an <a href="mailto:security@yourcompany.com" target="_blank" rel="noopener noreferrer">security@yourcompany.com</a> weiter.',
            )),
            src: reportButtonArt({
              reply: tr(L('Reply', 'Відповісти', 'Répondre', 'Responder', 'Antworten')),
              forward: tr(L('Forward', 'Переслати', 'Transférer', 'Reenviar', 'Weiterleiten')),
              report: tr(L('Report phishing', 'Повідомити про фішинг', 'Signaler l’hameçonnage', 'Denunciar phishing', 'Phishing melden')),
            }),
            alt: tr(L(
              'A mail toolbar with the “Report phishing” button highlighted',
              'Панель пошти з виділеною кнопкою «Повідомити про фішинг»',
              'Une barre d’outils de messagerie avec le bouton « Signaler l’hameçonnage » mis en évidence',
              'Una barra de herramientas de correo con el botón “Denunciar phishing” resaltado',
              'Eine Mail-Symbolleiste mit hervorgehobener Schaltfläche „Phishing melden“',
            )),
          },
          {
            id: id('step'),
            title: tr(L('Delete it', 'Видаліть лист', 'Supprimez-le', 'Elimínalo', 'Löschen')),
            html: p(L(
              'Once it’s reported, delete the email — and empty it from Deleted items too.',
              'Коли повідомили, видаліть лист — і з папки «Видалені» теж.',
              'Une fois l’e-mail signalé, supprimez-le — et videz-le aussi des Éléments supprimés.',
              'Una vez denunciado, elimina el correo y bórralo también de Elementos eliminados.',
              'Löschen Sie die E-Mail, sobald sie gemeldet ist — und leeren Sie auch den Ordner „Gelöschte Elemente“.',
            )),
          },
        ],
      }),
      block('comparison', {
        columns: [
          {
            id: id('col'),
            title: tr(L('Do', 'Робіть', 'À faire', 'Qué hacer', 'Tun')),
            tone: 'pro',
            items: [
              tr(L('Hover over links before clicking', 'Наводьте курсор на посилання перед кліком', 'Survoler les liens avant de cliquer', 'Pasar el cursor sobre los enlaces antes de hacer clic', 'Vor dem Klicken mit der Maus über Links fahren')),
              tr(L('Verify requests through a known channel', 'Перевіряйте запити через відомий канал', 'Vérifier les demandes par un canal connu', 'Verificar las peticiones por un canal conocido', 'Anfragen über einen bekannten Kanal prüfen')),
              tr(L('Turn on MFA everywhere', 'Вмикайте MFA всюди', 'Activer la MFA partout', 'Activar la MFA en todas partes', 'MFA überall aktivieren')),
            ],
          },
          {
            id: id('col'),
            title: tr(L('Don’t', 'Не робіть', 'À éviter', 'Qué no hacer', 'Lassen')),
            tone: 'con',
            items: [
              tr(L('Open unexpected attachments', 'Не відкривайте неочікувані вкладення', 'Ouvrir des pièces jointes inattendues', 'Abrir adjuntos inesperados', 'Unerwartete Anhänge öffnen')),
              tr(L('Share passwords or one-time codes', 'Не повідомляйте паролі чи одноразові коди', 'Communiquer des mots de passe ou des codes à usage unique', 'Compartir contraseñas o códigos de un solo uso', 'Passwörter oder Einmalcodes weitergeben')),
              tr(L('Let urgency rush your decision', 'Не піддавайтеся тиску терміновості', 'Laisser l’urgence précipiter votre décision', 'Dejar que la urgencia precipite tu decisión', 'Dringlichkeit Ihre Entscheidung hetzen lassen')),
            ],
          },
        ],
      }),
      block('heading', { level: 2, text: tr(L('Your turn', 'Ваша черга', 'À vous de jouer', 'Tu turno', 'Sie sind dran')) }),
      block('reflection', {
        prompt: tr(L(
          'Think of the last message that made you hesitate. What gave it away — or what would you check now before clicking?',
          'Згадайте останнє повідомлення, яке вас насторожило. Що його видало — або що б ви перевірили тепер, перш ніж клікнути?',
          'Pensez au dernier message qui vous a fait hésiter. Qu’est-ce qui l’a trahi — ou que vérifieriez-vous aujourd’hui avant de cliquer ?',
          'Piensa en el último mensaje que te hizo dudar. ¿Qué lo delató? ¿O qué comprobarías ahora antes de hacer clic?',
          'Denken Sie an die letzte Nachricht, bei der Sie gezögert haben. Woran war sie erkennbar — oder was würden Sie jetzt vor dem Klicken prüfen?',
        )),
        sample: tr(L(
          'For example: “An SMS said my parcel was on hold and asked for a small fee. I wasn’t expecting a delivery and the link was a short URL. Now I’d open the courier’s app myself instead of the link — and report the message.”',
          'Наприклад: «SMS писало, що мою посилку затримано, і просило сплатити невелику суму. Я не чекав(-ла) доставки, а посилання було скороченим. Тепер я сам(-а) відкрию застосунок перевізника замість посилання — і повідомлю про це SMS».',
          'Par exemple : « Un SMS disait que mon colis était en attente et réclamait de petits frais. Je n’attendais aucune livraison et le lien était une URL raccourcie. Aujourd’hui, j’ouvrirais moi-même l’application du transporteur au lieu de suivre le lien — et je signalerais le message. »',
          'Por ejemplo: “Un SMS decía que mi paquete estaba retenido y me pedía un pequeño pago. No esperaba ninguna entrega y el enlace era una URL acortada. Ahora abriría yo la aplicación de la empresa de mensajería en lugar del enlace, y denunciaría el mensaje”.',
          'Zum Beispiel: „Eine SMS sagte, mein Paket werde zurückgehalten, und verlangte eine kleine Gebühr. Ich erwartete keine Lieferung, und der Link war eine Kurz-URL. Jetzt würde ich die App des Paketdienstes selbst öffnen statt den Link — und die Nachricht melden.“',
        )),
      }),
      block('quote', {
        variant: 'statement',
        text: tr(L(
          'Amateurs hack systems; professionals hack people.',
          'Аматори зламують системи, професіонали — людей.',
          'Les amateurs piratent les systèmes ; les professionnels piratent les gens.',
          'Los aficionados hackean sistemas; los profesionales hackean personas.',
          'Amateure hacken Systeme; Profis hacken Menschen.',
        )),
        author: 'Bruce Schneier',
      }, 'gradient', 'spacious', 'full'),
      block('attachment', {
        title: tr(L('Take it with you', 'Візьміть із собою', 'À emporter', 'Llévatelo', 'Zum Mitnehmen')),
        files: [
          {
            id: id('file'),
            name: tr(L('phishing-checklist.txt', 'чекліст-фішинг.txt', 'checklist-hameconnage.txt', 'lista-phishing.txt', 'phishing-checkliste.txt')),
            src: textFile(tr(L(
              'PHISHING CHECKLIST\n\n[ ] Is the sender address exactly right?\n[ ] Does the message rush or threaten me?\n[ ] Was I expecting this link or file?\n[ ] Does it ask for a password or a code?\n[ ] When in doubt: verify through a known channel and report it.\n',
              'ЧЕКЛІСТ: ФІШИНГ\n\n[ ] Адреса відправника точно правильна?\n[ ] Лист мене квапить чи погрожує?\n[ ] Я чекав(-ла) це посилання чи файл?\n[ ] Мене просять пароль чи код?\n[ ] Якщо сумніваєтеся: перевірте через відомий канал і повідомте.\n',
              'CHECKLIST ANTI-HAMEÇONNAGE\n\n[ ] L’adresse de l’expéditeur est-elle exactement la bonne ?\n[ ] Le message me presse-t-il ou me menace-t-il ?\n[ ] Est-ce que j’attendais ce lien ou ce fichier ?\n[ ] Me demande-t-on un mot de passe ou un code ?\n[ ] En cas de doute : vérifier par un canal connu et signaler.\n',
              'LISTA DE COMPROBACIÓN: PHISHING\n\n[ ] ¿La dirección del remitente es exactamente la correcta?\n[ ] ¿El mensaje me apremia o me amenaza?\n[ ] ¿Esperaba este enlace o este archivo?\n[ ] ¿Me pide una contraseña o un código?\n[ ] En caso de duda: verificar por un canal conocido y denunciarlo.\n',
              'PHISHING-CHECKLISTE\n\n[ ] Stimmt die Absenderadresse exakt?\n[ ] Hetzt oder bedroht mich die Nachricht?\n[ ] Habe ich diesen Link oder diese Datei erwartet?\n[ ] Wird ein Passwort oder ein Code verlangt?\n[ ] Im Zweifel: über einen bekannten Kanal prüfen und melden.\n',
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
    title: tr(L('Final test', 'Фінальний тест', 'Test final', 'Prueba final', 'Abschlusstest')),
    status: 'published',
    blocks: [
      block('divider', { style: 'label', label: tr(L('Final test', 'Фінальний тест', 'Test final', 'Prueba final', 'Abschlusstest')) }),
      block('heading', { level: 2, text: tr(L('Check yourself', 'Перевірте себе', 'Testez vos connaissances', 'Ponte a prueba', 'Testen Sie sich')), align: 'center' }),
      block('paragraph', {
        html: p(L(
          'Pass with 80% or more to complete the course. Your score is reported to the LMS.',
          'Наберіть 80% або більше, щоб завершити курс. Ваш результат передається в LMS.',
          'Obtenez 80 % ou plus pour terminer le cours. Votre score est transmis au LMS.',
          'Consigue un 80 % o más para completar el curso. Tu puntuación se envía al LMS.',
          'Mit 80 % oder mehr bestehen Sie den Kurs. Ihr Ergebnis wird an das LMS übermittelt.',
        )),
      }),
      block('quiz', {
        passingScore: 80,
        showAnswers: true,
        questions: [
          {
            id: id('q'),
            type: 'single',
            prompt: tr(L(
              'Your “bank” calls and asks for the one-time code you just received. What do you do?',
              'Вам телефонує «банк» і просить щойно отриманий одноразовий код. Що ви робите?',
              'Votre « banque » vous appelle et vous demande le code à usage unique que vous venez de recevoir. Que faites-vous ?',
              'Tu “banco” te llama y te pide el código de un solo uso que acabas de recibir. ¿Qué haces?',
              'Ihre „Bank“ ruft an und fragt nach dem Einmalcode, den Sie gerade erhalten haben. Was tun Sie?',
            )),
            options: [
              opt(
                L('Read the code out — they called me, so it’s the bank', 'Диктую код — вони ж самі подзвонили, отже це банк', 'Je dicte le code — c’est eux qui m’ont appelé, donc c’est la banque', 'Les dicto el código: me han llamado ellos, así que es el banco', 'Den Code vorlesen — die haben mich angerufen, also ist es die Bank'),
                false,
                L('Anyone can fake a caller ID.', 'Номер абонента легко підробити.', 'N’importe qui peut falsifier un numéro d’appelant.', 'Cualquiera puede falsificar el número que aparece en la llamada.', 'Jeder kann eine Anruferkennung fälschen.'),
              ),
              opt(
                L('Hang up and call the number on the back of my card', 'Кладу слухавку й телефоную за номером на звороті картки', 'Je raccroche et j’appelle le numéro au dos de ma carte', 'Cuelgo y llamo al número que aparece en el reverso de mi tarjeta', 'Auflegen und die Nummer auf der Rückseite meiner Karte anrufen'),
                true,
                L('Right: verify through a channel you trust.', 'Так: перевіряйте через канал, якому довіряєте.', 'Exact : vérifiez par un canal de confiance.', 'Correcto: verifica por un canal de confianza.', 'Richtig: über einen Kanal prüfen, dem Sie vertrauen.'),
              ),
              opt(L('Send the code by SMS instead', 'Надсилаю код через SMS', 'J’envoie plutôt le code par SMS', 'Mejor les envío el código por SMS', 'Den Code stattdessen per SMS senden'), false),
            ],
          },
          {
            id: id('q'),
            type: 'multiple',
            prompt: tr(L(
              'Which of these are red flags? Select all that apply.',
              'Що з цього є тривожними ознаками? Оберіть усі правильні варіанти.',
              'Lesquels de ces éléments sont des signaux d’alerte ? Sélectionnez toutes les bonnes réponses.',
              '¿Cuáles de estas son señales de alerta? Selecciona todas las correctas.',
              'Welche davon sind Warnsignale? Wählen Sie alle zutreffenden aus.',
            )),
            options: [
              opt(L('A sender domain with a typo', 'Домен відправника з помилкою', 'Un domaine d’expéditeur avec une faute de frappe', 'Un dominio del remitente con un error tipográfico', 'Eine Absenderdomain mit Tippfehler'), true),
              opt(L('A threat to close your account today', 'Погроза сьогодні ж закрити акаунт', 'Une menace de fermer votre compte aujourd’hui', 'Una amenaza de cerrar tu cuenta hoy mismo', 'Die Drohung, Ihr Konto heute zu schließen'), true),
              opt(L('Your name spelled correctly', 'Правильно написане ваше ім’я', 'Votre nom correctement orthographié', 'Tu nombre escrito correctamente', 'Ihr Name ist korrekt geschrieben'), false),
              opt(L('A request for your password', 'Прохання назвати пароль', 'Une demande de mot de passe', 'Una petición de tu contraseña', 'Eine Aufforderung zur Preisgabe Ihres Passworts'), true),
            ],
          },
          {
            id: id('q'),
            type: 'matching',
            prompt: tr(L('Match each attack to its channel.', 'Зіставте атаку з її каналом.', 'Associez chaque attaque à son canal.', 'Relaciona cada ataque con su canal.', 'Ordnen Sie jeden Angriff seinem Kanal zu.')),
            pairs: [
              { id: id('pair'), left: tr(L('Phishing', 'Фішинг', 'Hameçonnage', 'Phishing', 'Phishing')), right: tr(L('Email', 'Пошта', 'E-mail', 'Correo', 'E-Mail')) },
              { id: id('pair'), left: tr(L('Smishing', 'Смішинг', 'Smishing', 'Smishing', 'Smishing')), right: 'SMS' },
              { id: id('pair'), left: tr(L('Vishing', 'Вішинг', 'Vishing', 'Vishing', 'Vishing')), right: tr(L('Phone call', 'Телефонний дзвінок', 'Appel téléphonique', 'Llamada telefónica', 'Telefonanruf')) },
            ],
          },
          {
            id: id('q'),
            type: 'fillBlanks',
            mode: 'select',
            prompt: tr(L('Complete the rules.', 'Доповніть правила.', 'Complétez les règles.', 'Completa las reglas.', 'Vervollständigen Sie die Regeln.')),
            text: tr(
              L(
                'Your bank or IT will never ask for your [password] or a one-time [code]. If a message rushes you, [verify] it through a channel you trust.',
                'Банк чи ІТ ніколи не попросять ваш [пароль] чи одноразовий [код]. Якщо лист вас квапить, [перевірте] його через канал, якому довіряєте.',
                'Votre banque ou le service informatique ne vous demanderont jamais votre [mot de passe] ni un [code] à usage unique. Si un message vous presse, [vérifiez]-le par un canal de confiance.',
                'Tu banco o el equipo de TI nunca te pedirán tu [contraseña] ni un [código] de un solo uso. Si un mensaje te apremia, [verifícalo] por un canal de confianza.',
                'Ihre Bank oder IT fragt niemals nach Ihrem [Passwort] oder einem Einmal-[Code]. Wenn eine Nachricht Sie hetzt, [prüfen] Sie sie über einen Kanal, dem Sie vertrauen.',
              ),
            ),
          },
          {
            id: id('q'),
            type: 'sequence',
            prompt: tr(L(
              'A suspicious email arrives. Put your steps in order.',
              'Надійшов підозрілий лист. Розставте свої дії по порядку.',
              'Vous recevez un e-mail suspect. Remettez vos actions dans l’ordre.',
              'Llega un correo sospechoso. Ordena tus pasos.',
              'Eine verdächtige E-Mail trifft ein. Bringen Sie Ihre Schritte in die richtige Reihenfolge.',
            )),
            items: [
              { id: id('item'), text: tr(L('Don’t click links or open attachments', 'Не клікайте посилання й не відкривайте вкладення', 'Ne cliquer sur aucun lien et n’ouvrir aucune pièce jointe', 'No hacer clic en los enlaces ni abrir los adjuntos', 'Keine Links anklicken und keine Anhänge öffnen')) },
              { id: id('item'), text: tr(L('Check the sender’s address', 'Перевірте адресу відправника', 'Vérifier l’adresse de l’expéditeur', 'Comprobar la dirección del remitente', 'Die Absenderadresse prüfen')) },
              { id: id('item'), text: tr(L('Report it to your security team', 'Повідомте службу безпеки', 'Le signaler à l’équipe de sécurité', 'Avisar al equipo de seguridad', 'Dem Sicherheitsteam melden')) },
              { id: id('item'), text: tr(L('Delete the email', 'Видаліть лист', 'Supprimer l’e-mail', 'Eliminar el correo', 'Die E-Mail löschen')) },
            ],
          },
        ],
      }),
    ],
  }

  return {
    id: 'sample-course',
    title: tr(L(
      'Spot the phish: security basics in 15 minutes',
      'Розпізнай фішинг: основи безпеки за 15 хвилин',
      'Repérer l’hameçonnage : les bases de la sécurité en 15 minutes',
      'Detecta el phishing: seguridad básica en 15 minutos',
      'Phishing erkennen: Sicherheitsgrundlagen in 15 Minuten',
    )),
    description: tr(
      L(
        'A short sample course made with Scormly: interactive hotspots, a before / after slider, a custom “link detective” widget, a process diagram, a chat scenario, exercises, a reflection and a scored final test.',
        'Короткий приклад курсу, створений у Scormly: інтерактивне зображення, слайдер «до / після», власний віджет «Детектив посилань», схема процесу, чат-сценарій, вправи, рефлексія та фінальний тест з оцінюванням.',
        'Un court exemple de cours créé avec Scormly : zones cliquables interactives, curseur avant / après, widget sur mesure « Détective de liens », schéma de processus, scénario de chat, exercices, réflexion et test final noté.',
        'Un breve curso de ejemplo creado con Scormly: zonas interactivas, un control deslizante de antes / después, un widget a medida “Detective de enlaces”, un diagrama de proceso, un escenario de chat, ejercicios, una reflexión y una prueba final con puntuación.',
        'Ein kurzer Beispielkurs, erstellt mit Scormly: interaktive Hotspots, ein Vorher-nachher-Regler, ein eigenes „Link-Detektiv“-Widget, ein Prozessdiagramm, ein Chat-Szenario, Übungen, eine Reflexion und ein bewerteter Abschlusstest.',
      ),
    ),
    theme: 'ocean',
    coverImage: coverArt(),
    intro: {
      enabled: true,
      layout: 'cover',
      eyebrow: tr(L('Security basics · 15 min', 'Основи безпеки · 15 хв', 'Bases de la sécurité · 15 min', 'Seguridad básica · 15 min', 'Sicherheitsgrundlagen · 15 Min.')),
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
          'Bravo ! Vous savez maintenant repérer l’hameçonnage et y réagir. Restez vigilant — et partagez ce que vous avez appris avec votre équipe.',
          '¡Buen trabajo! Ya sabes detectar el phishing y cómo actuar. Mantente alerta y comparte lo aprendido con tu equipo.',
          'Gut gemacht! Sie wissen jetzt, wie man Phishing erkennt und damit umgeht. Bleiben Sie wachsam — und geben Sie Ihr Wissen an Ihr Team weiter.',
        ),
      ),
    },
    lessons: [welcome, anatomy, practice, test],
  }
}
