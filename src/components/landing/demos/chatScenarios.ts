// Catalogue of short dialogue scenarios played by the landing-page chat demo.
// Each scenario is a self-contained mini-conversation (3–5 steps): the bot
// speaks, the learner picks an answer, the bot reacts. Texts come in four
// languages (en/uk/fr/es) and live inline here — these aren't UI strings,
// they're content for the auto-playing demo, so we don't route them through
// i18n locales.
//
// The chat demo shuffles this list at mount and walks through it without
// repeats; once exhausted it re-shuffles. To add a scenario, append a new
// entry below — keep `pick` valid (index into `opts`) and bot replies short
// enough to fit one phone-screen bubble.

export type LocalizedString = { en: string; uk: string; fr: string; es: string }

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
const L = (en: string, uk: string, fr: string, es: string): LocalizedString => ({ en, uk, fr, es })

export const chatScenarios: ChatScenario[] = [
  // ─── Onboarding ────────────────────────────────────────────────────────────
  {
    id: 'onboarding-welcome',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('online', 'онлайн', 'en ligne', 'en línea'),
    steps: [
      { kind: 'bot', text: L("Hi! I'm Ksiu. Ready for a 2-minute onboarding?", 'Привіт! Я Ксюша. Готові до 2-хвилинного онбордингу?', 'Bonjour ! Moi, c’est Ksiu. On se lance dans un onboarding de 2 minutes ?', '¡Hola! Soy Ksiu. ¿Te animas a un onboarding de 2 minutos?') },
      { kind: 'choices', opts: [L("Let's do it", 'Поїхали', 'C’est parti', 'Vamos allá'), L('What will we cover?', 'Що будемо проходити?', 'On va voir quoi ?', '¿Qué vamos a ver?')], pick: 0 },
      { kind: 'bot', text: L('Great. Where do you log your work hours?', 'Чудово. Де ви фіксуєте робочі години?', 'Super. Où saisissez-vous vos heures de travail ?', 'Genial. ¿Dónde registras tus horas de trabajo?') },
      { kind: 'choices', opts: [L('In the HR portal', 'У HR-порталі', 'Sur le portail RH', 'En el portal de RR. HH.'), L('By email', 'Електронною поштою', 'Par e-mail', 'Por correo')], pick: 0 },
      { kind: 'bot', text: L("Spot on. You're a natural at this — see you inside!", 'Саме так. У вас чудово виходить — до зустрічі всередині!', 'Exactement. Vous avez ça dans le sang — à tout de suite !', 'Exacto. Se te da genial — ¡nos vemos dentro!') },
    ],
  },
  {
    id: 'onboarding-time-off',
    name: L('Anna', 'Аня', 'Anna', 'Anna'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L('Quick check — how do you request a day off?', 'Швидке питання — як замовити відгул?', 'Petite question — comment poser un jour de congé ?', 'Pregunta rápida — ¿cómo pides un día libre?') },
      { kind: 'choices', opts: [L('Submit in the HR portal', 'Заявка в HR-порталі', 'Demande sur le portail RH', 'Lo solicito en el portal de RR. HH.'), L('Just message my lead', 'Просто написати керівнику', 'Un message à mon manager', 'Le escribo a mi responsable')], pick: 0 },
      { kind: 'bot', text: L('Right. Your lead approves it from the same portal.', 'Так. Керівник підтверджує її там же.', 'Oui. Votre manager la valide sur ce même portail.', 'Eso es. Tu responsable lo aprueba en el mismo portal.') },
    ],
  },
  {
    id: 'onboarding-expenses',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L('You bought a keyboard for work. What now?', 'Ви купили клавіатуру для роботи. Що далі?', 'Vous avez acheté un clavier pour le travail. Et ensuite ?', 'Compraste un teclado para el trabajo. ¿Y ahora?') },
      { kind: 'choices', opts: [L('Upload the receipt to Finance', 'Завантажити чек у Finance', 'Envoyer le reçu à la compta', 'Subir el recibo a Finanzas'), L('Wait for someone to ask', 'Чекати, поки запитають', 'Attendre qu’on me le demande', 'Esperar a que me lo pidan')], pick: 0 },
      { kind: 'bot', text: L('Exactly — reimbursement runs every Friday.', 'Точно — компенсації йдуть щоп’ятниці.', 'Exactement — les remboursements partent chaque vendredi.', 'Exacto — los reembolsos salen cada viernes.') },
    ],
  },
  {
    id: 'onboarding-team',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('online', 'онлайн', 'en ligne', 'en línea'),
    steps: [
      { kind: 'bot', text: L("Let's meet your team. Want intros now or later?", 'Знайомимось з командою. Зараз чи пізніше?', 'Je vous présente l’équipe. Maintenant ou plus tard ?', 'Te presento al equipo. ¿Ahora o más tarde?') },
      { kind: 'choices', opts: [L('Now, please', 'Зараз, будь ласка', 'Maintenant, volontiers', 'Ahora, por favor'), L('After lunch', 'Після обіду', 'Après le déjeuner', 'Después de comer')], pick: 0 },
      { kind: 'bot', text: L("Cool — I'll bring them into a quick huddle.", 'Окей — зберу їх у короткий huddle.', 'Parfait — je les réunis pour un point express.', 'Genial — los junto en una llamada rápida.') },
    ],
  },
  {
    id: 'onboarding-first-project',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Tech Lead', 'Тимлід', 'Tech Lead', 'Tech Lead') ,
    steps: [
      { kind: 'bot', text: L('Your first ticket is ready. Pick a starting point.', 'Ваше перше завдання готове. Звідки почнемо?', 'Votre premier ticket est prêt. Par où commencer ?', 'Tu primer ticket está listo. ¿Por dónde empiezas?') },
      { kind: 'choices', opts: [L('Read the codebase tour', 'Почитати огляд кодової бази', 'Lire la visite guidée du code', 'Leer el recorrido por el código'), L('Jump straight in', 'Одразу до коду', 'Foncer tête baissée', 'Lanzarme de cabeza')], pick: 0 },
      { kind: 'bot', text: L('Smart — the tour saves a day of guesswork.', 'Розумно — огляд економить день здогадок.', 'Bien vu — la visite évite une journée à tâtonner.', 'Bien pensado — el recorrido te ahorra un día de adivinanzas.') },
    ],
  },
  {
    id: 'onboarding-tooling',
    name: L('Dmytro', 'Дмитро', 'Dmytro', 'Dmytro'),
    status: L('Tech Lead', 'Тимлід', 'Tech Lead', 'Tech Lead'),
    steps: [
      { kind: 'bot', text: L('Need access to the staging environment?', 'Потрібен доступ до staging?', 'Besoin d’un accès à l’environnement de staging ?', '¿Necesitas acceso al entorno de staging?') },
      { kind: 'choices', opts: [L('Yes, please', 'Так, будь ласка', 'Oui, volontiers', 'Sí, por favor'), L("I'll figure it out", 'Розберуся сам', 'Je vais me débrouiller', 'Ya me las arreglo')], pick: 0 },
      { kind: 'bot', text: L("I'll provision SSO and ping you in 5.", 'Налаштую SSO і напишу за 5 хвилин.', 'Je configure le SSO et je vous fais signe dans 5 min.', 'Configuro el SSO y te aviso en 5 minutos.') },
    ],
  },
  {
    id: 'onboarding-mentor',
    name: L('Maksym', 'Максим', 'Maksym', 'Maksym'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L('Would you like a buddy for the first month?', 'Хочете бадді на перший місяць?', 'Un binôme pour votre premier mois, ça vous dit ?', '¿Te gustaría tener un buddy el primer mes?') },
      { kind: 'choices', opts: [L('Yes — really helpful', 'Так — це дуже допоможе', 'Oui — ça m’aiderait beaucoup', 'Sí — me ayudaría mucho'), L('Maybe later', 'Можливо пізніше', 'Peut-être plus tard', 'Quizá más adelante')], pick: 0 },
      { kind: 'bot', text: L("I'll match you tomorrow. Coffee usually breaks the ice.", 'Підберу завтра. Кава зазвичай зближує.', 'Je vous trouve quelqu’un demain. Un café, et la glace est brisée.', 'Mañana te lo asigno. Un café suele romper el hielo.') },
    ],
  },
  {
    id: 'onboarding-conduct',
    name: L('Anna', 'Аня', 'Anna', 'Anna'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L('Last bit: any questions on the Code of Conduct?', 'Останнє: запитання щодо Кодексу поведінки?', 'Dernier point : des questions sur le code de conduite ?', 'Lo último: ¿alguna duda sobre el código de conducta?') },
      { kind: 'choices', opts: [L('All clear', 'Усе зрозуміло', 'Tout est clair', 'Todo claro'), L("I'll re-read it", 'Перечитаю ще раз', 'Je vais le relire', 'Lo voy a releer')], pick: 0 },
      { kind: 'bot', text: L("Perfect. Welcome aboard — you're set!", 'Чудово. Ласкаво просимо — ви у складі!', 'Parfait. Bienvenue à bord — tout est prêt !', 'Perfecto. Te damos la bienvenida — ¡todo listo!') },
    ],
  },

  // ─── Sales ─────────────────────────────────────────────────────────────────
  {
    id: 'sales-price-objection',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Sales Coach', 'Тренерка продажів', 'Coach commercial', 'Coach de ventas'),
    steps: [
      { kind: 'bot', text: L('Client says "it’s too expensive." Your move?', 'Клієнт каже «дорого». Що відповідаєте?', 'Le client dit : « C’est trop cher. » Votre réponse ?', 'El cliente dice: “Es muy caro”. ¿Qué haces?') },
      { kind: 'choices', opts: [L('Ask what they compared it to', 'Запитати, з чим порівнюють', 'Demander à quoi il compare', 'Preguntar con qué lo compara'), L('Offer a discount', 'Запропонувати знижку', 'Proposer une remise', 'Ofrecer un descuento')], pick: 0 },
      { kind: 'bot', text: L('Yes — anchor before discounting, always.', 'Так — спочатку прояснити контекст, потім — знижки.', 'Oui — on pose le cadre avant de parler remise, toujours.', 'Sí — primero el contexto, luego el descuento. Siempre.') },
    ],
  },
  {
    id: 'sales-discovery',
    name: L('Betty', 'Беті', 'Betty', 'Betty'),
    status: L('Sales Coach', 'Тренерка продажів', 'Coach commercial', 'Coach de ventas'),
    steps: [
      { kind: 'bot', text: L('Best opening question in a discovery call?', 'Найкраще питання на discovery-дзвінку?', 'La meilleure question pour ouvrir un appel de découverte ?', '¿La mejor pregunta para abrir una llamada de descubrimiento?') },
      { kind: 'choices', opts: [L('"What does success look like for you?"', '«Як виглядає для вас успіх?»', '« À quoi ressemble la réussite pour vous ? »', '“¿Qué sería un éxito para ti?”'), L('"Want to see a demo?"', '«Покажу демо?»', '« Je vous montre une démo ? »', '“¿Te enseño una demo?”')], pick: 0 },
      { kind: 'bot', text: L('Right. Outcome > features, every time.', 'Так. Результати важливіші за фічі — завжди.', 'Oui. Résultats > fonctionnalités, à tous les coups.', 'Eso. Resultados > funciones, siempre.') },
    ],
  },
  {
    id: 'sales-followup',
    name: L('Betty', 'Беті', 'Betty', 'Betty'),
    status: L('Sales Coach', 'Тренерка продажів', 'Coach commercial', 'Coach de ventas'),
    steps: [
      { kind: 'bot', text: L('When do you follow up after a warm demo?', 'Коли робите follow-up після «теплого» демо?', 'Après une démo réussie, vous relancez quand ?', 'Tras una buena demo, ¿cuándo haces el seguimiento?') },
      { kind: 'choices', opts: [L('Within 24 hours', 'Протягом 24 годин', 'Sous 24 heures', 'En menos de 24 horas'), L('Next week', 'На наступному тижні', 'La semaine prochaine', 'La semana que viene')], pick: 0 },
      { kind: 'bot', text: L('Within a day — momentum is fuel.', 'Протягом доби — імпульс це паливо.', 'Dans la journée — on bat le fer tant qu’il est chaud.', 'En un día — el impulso es tu gasolina.') },
    ],
  },
  {
    id: 'sales-stakeholders',
    name: L('Betty', 'Беті', 'Betty', 'Betty'),
    status: L('Sales Coach', 'Тренерка продажів', 'Coach commercial', 'Coach de ventas'),
    steps: [
      { kind: 'bot', text: L('Champion loves you but legal hasn’t weighed in. Next step?', 'Champion за вас, але юристи мовчать. Далі?', 'Votre champion est conquis, mais le juridique n’a rien dit. Et maintenant ?', 'Tu champion está encantado, pero Legal aún no opina. ¿Siguiente paso?') },
      { kind: 'choices', opts: [L('Map every stakeholder now', 'Замапити всіх stakeholder-ів', 'Cartographier toutes les parties prenantes', 'Mapear ya a todos los implicados'), L('Push for the signature', 'Тиснути на підпис', 'Pousser pour la signature', 'Presionar para la firma')], pick: 0 },
      { kind: 'bot', text: L('Mapping wins deals — surprises kill them.', 'Мапа стейкхолдерів виграє угоди, сюрпризи — вбивають.', 'Cartographier fait gagner des deals — les surprises les tuent.', 'Mapear gana acuerdos — las sorpresas los matan.') },
    ],
  },
  {
    id: 'sales-renewal',
    name: L('Betty', 'Беті', 'Betty', 'Betty'),
    status: L('Sales Coach', 'Тренерка продажів', 'Coach commercial', 'Coach de ventas'),
    steps: [
      { kind: 'bot', text: L('Renewal in 30 days. Best signal of risk?', 'Renewal через 30 днів. Найкращий сигнал ризику?', 'Renouvellement dans 30 jours. Le meilleur signal de risque ?', 'Renovación en 30 días. ¿La mejor señal de riesgo?') },
      { kind: 'choices', opts: [L('Drop in product usage', 'Падіння використання продукту', 'Une baisse d’utilisation du produit', 'Una caída en el uso del producto'), L('Tone of last email', 'Тон останнього листа', 'Le ton du dernier e-mail', 'El tono del último correo')], pick: 0 },
      { kind: 'bot', text: L("Usage data doesn't lie. Always check it first.", 'Дані не брешуть. Завжди спочатку дивимось на них.', 'Les données d’usage ne mentent pas. Regardez-les en premier.', 'Los datos de uso no mienten. Míralos siempre primero.') },
    ],
  },

  // ─── Customer support ─────────────────────────────────────────────────────
  {
    id: 'cs-password',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('CX Mentor', 'Менторка CX', 'Mentor CX', 'Mentor de CX'),
    steps: [
      { kind: 'bot', text: L('Customer locked out. They\'re frustrated. Open with…', 'Клієнт не може зайти. Він нервує. Починаємо з…', 'Un client n’arrive plus à se connecter. Il est agacé. On commence par…', 'Un cliente no puede entrar. Está frustrado. Empiezas por…') },
      { kind: 'choices', opts: [L('Acknowledge the frustration', 'Визнаємо емоції', 'Reconnaître son agacement', 'Reconocer su frustración'), L('Send the reset link', 'Шлемо лінк скидання', 'Envoyer le lien de réinitialisation', 'Enviar el enlace de restablecimiento')], pick: 0 },
      { kind: 'bot', text: L('Empathy first — fix follows immediately.', 'Спершу емпатія — потім одразу рішення.', 'L’empathie d’abord — la solution suit aussitôt.', 'Primero la empatía — la solución llega enseguida.') },
    ],
  },
  {
    id: 'cs-billing',
    name: L('Anna', 'Аня', 'Anna', 'Anna'),
    status: L('CX Mentor', 'Менторка CX', 'Mentor CX', 'Mentor de CX'),
    steps: [
      { kind: 'bot', text: L('Duplicate charge on the account. What do you say?', 'Подвійне списання. Як відповідаємо?', 'Double prélèvement sur le compte. Vous dites quoi ?', 'Cobro duplicado en la cuenta. ¿Qué dices?') },
      { kind: 'choices', opts: [L("I'll refund right now and confirm by email", 'Поверну зараз і підтверджу листом', 'Je rembourse tout de suite et je confirme par e-mail', 'Lo reembolso ahora y lo confirmo por correo'), L('Need to check with Finance', 'Маю перевірити з фінансами', 'Je dois voir avec la compta', 'Tengo que consultarlo con Finanzas')], pick: 0 },
      { kind: 'bot', text: L('Action beats apology. Confirmation closes the loop.', 'Дія важливіша за вибачення. Підтвердження — закриває коло.', 'Agir vaut mieux que s’excuser. La confirmation boucle la boucle.', 'Actuar vale más que disculparse. La confirmación cierra el círculo.') },
    ],
  },
  {
    id: 'cs-feature-request',
    name: L('Ivan', 'Іван', 'Ivan', 'Ivan'),
    status: L('CX Mentor', 'Менторка CX', 'Mentor CX', 'Mentor de CX'),
    steps: [
      { kind: 'bot', text: L('User asks for a feature we won\'t build. Reply?', 'Користувач просить фічу, яку ми не зробимо. Відповідь?', 'Un utilisateur demande une fonction qu’on ne fera pas. Vous répondez ?', 'Un usuario pide una función que no haremos. ¿Qué respondes?') },
      { kind: 'choices', opts: [L("Thank them, share why, suggest a workaround", 'Подякувати, пояснити чому, підказати workaround', 'Remercier, expliquer pourquoi, proposer une alternative', 'Agradecer, explicar por qué y sugerir una alternativa'), L('Promise to "look into it"', 'Пообіцяти «розглянути»', 'Promettre d’« y réfléchir »', 'Prometer que “lo miraremos”')], pick: 0 },
      { kind: 'bot', text: L('Honest > vague. Customers respect clarity.', 'Чесність > туманність. Клієнти цінують ясність.', 'Franchise > flou. Les clients apprécient la clarté.', 'Sinceridad > vaguedad. Los clientes valoran la claridad.') },
    ],
  },
  {
    id: 'cs-angry',
    name: L('Anna', 'Аня', 'Anna', 'Anna'),
    status: L('CX Mentor', 'Менторка CX', 'Mentor CX', 'Mentor de CX'),
    steps: [
      { kind: 'bot', text: L('Customer is shouting. First priority?', 'Клієнт кричить. Найперший крок?', 'Le client hausse le ton. La priorité ?', 'El cliente está gritando. ¿Qué es lo primero?') },
      { kind: 'choices', opts: [L('Stay calm, let them finish', 'Зберігати спокій, дати договорити', 'Rester calme, le laisser finir', 'Mantener la calma y dejarle terminar'), L('Interrupt with the solution', 'Перебити рішенням', 'Le couper avec la solution', 'Interrumpir con la solución')], pick: 0 },
      { kind: 'bot', text: L('Listen, then act. People de-escalate when heard.', 'Послухати, потім діяти. Люди заспокоюються, коли їх чують.', 'Écouter, puis agir. On se calme quand on se sent entendu.', 'Escucha y luego actúa. La gente se calma cuando se siente escuchada.') },
    ],
  },
  {
    id: 'cs-handoff',
    name: L('Ivan', 'Іван', 'Ivan', 'Ivan'),
    status: L('CX Mentor', 'Менторка CX', 'Mentor CX', 'Mentor de CX'),
    steps: [
      { kind: 'bot', text: L('You need to escalate. What do you give the next agent?', 'Треба ескалейтнути. Що передаєте колезі?', 'Il faut escalader. Que transmettez-vous au collègue suivant ?', 'Toca escalar el caso. ¿Qué le pasas a tu compañero?') },
      { kind: 'choices', opts: [L('Full context + what was tried', 'Повний контекст + що пробували', 'Tout le contexte + ce qui a été tenté', 'Todo el contexto + lo que ya se probó'), L('Just the ticket ID', 'Лише ID тікета', 'Juste le numéro du ticket', 'Solo el ID del ticket')], pick: 0 },
      { kind: 'bot', text: L('Context saves the customer from repeating themselves.', 'Контекст рятує клієнта від повторювань.', 'Le contexte évite au client de tout répéter.', 'El contexto evita que el cliente tenga que repetirlo todo.') },
    ],
  },

  // ─── IT support ───────────────────────────────────────────────────────────
  {
    id: 'it-vpn',
    name: L('Nazar', 'Назар', 'Nazar', 'Nazar'),
    status: L('IT', 'IT', 'IT', 'IT'),
    steps: [
      { kind: 'bot', text: L("VPN won't connect. First thing you check?", 'VPN не конектиться. Що перевіряємо першим?', 'Le VPN ne se connecte pas. Vous vérifiez quoi d’abord ?', 'La VPN no conecta. ¿Qué revisas primero?') },
      { kind: 'choices', opts: [L('Internet works at all?', 'Чи взагалі є інтернет?', 'Internet fonctionne, déjà ?', '¿Hay internet siquiera?'), L('Reinstall the VPN client', 'Перевстановити VPN-клієнт', 'Réinstaller le client VPN', 'Reinstalar el cliente VPN')], pick: 0 },
      { kind: 'bot', text: L('Always test the simpler layer first.', 'Завжди спершу перевіряємо нижчий рівень.', 'On teste toujours le plus simple d’abord.', 'Siempre se prueba primero lo más simple.') },
    ],
  },
  {
    id: 'it-laptop',
    name: L('Nazar', 'Назар', 'Nazar', 'Nazar'),
    status: L('IT', 'IT', 'IT', 'IT'),
    steps: [
      { kind: 'bot', text: L('Laptop is slow. Step one?', 'Ноутбук гальмує. Крок 1?', 'L’ordinateur rame. Première étape ?', 'El portátil va lento. ¿Primer paso?') },
      { kind: 'choices', opts: [L('Reboot and check pending updates', 'Ребут + апдейти', 'Redémarrer et vérifier les mises à jour', 'Reiniciar y revisar las actualizaciones'), L('Order a new one', 'Замовити новий', 'En commander un neuf', 'Pedir uno nuevo')], pick: 0 },
      { kind: 'bot', text: L('Reboot fixes more than people admit.', 'Ребут лікує більше, ніж люди визнають.', 'Redémarrer règle plus de choses qu’on ne l’avoue.', 'Reiniciar arregla más de lo que la gente admite.') },
    ],
  },
  {
    id: 'it-software',
    name: L('Nazar', 'Назар', 'Nazar', 'Nazar'),
    status: L('IT', 'IT', 'IT', 'IT'),
    steps: [
      { kind: 'bot', text: L('Need new software. Approved path?', 'Треба нове ПЗ. Правильний шлях?', 'Besoin d’un nouveau logiciel. La bonne démarche ?', 'Necesitas un software nuevo. ¿La vía correcta?') },
      { kind: 'choices', opts: [L('Request via the IT catalog', 'Запит через IT-каталог', 'Demande via le catalogue IT', 'Pedirlo en el catálogo de IT'), L('Download from any site', 'Завантажити звідки завгодно', 'Le télécharger n’importe où', 'Descargarlo de cualquier web')], pick: 0 },
      { kind: 'bot', text: L('Catalog = licensed and security-checked.', 'Каталог = ліцензовано та перевірено безпекою.', 'Catalogue = sous licence et validé par la sécurité.', 'Catálogo = con licencia y revisado por seguridad.') },
    ],
  },
  {
    id: 'it-lost-device',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('IT', 'IT', 'IT', 'IT'),
    steps: [
      { kind: 'bot', text: L("Lost your laptop. What's first?", 'Загубили ноутбук. Що першим?', 'Ordinateur perdu. Premier réflexe ?', 'Perdiste el portátil. ¿Qué es lo primero?') },
      { kind: 'choices', opts: [L('Report to IT immediately', 'Одразу повідомити IT', 'Prévenir l’IT immédiatement', 'Avisar a IT de inmediato'), L('Search for it tomorrow', 'Пошукати завтра', 'Le chercher demain', 'Buscarlo mañana')], pick: 0 },
      { kind: 'bot', text: L("We'll wipe it remotely. Minutes matter.", 'Зробимо віддалене стирання. Хвилини мають значення.', 'On l’efface à distance. Chaque minute compte.', 'Lo borramos en remoto. Cada minuto cuenta.') },
    ],
  },

  // ─── HR ───────────────────────────────────────────────────────────────────
  {
    id: 'hr-vacation',
    name: L('Ivan', 'Іван', 'Ivan', 'Ivan'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L('Planning vacation. How far ahead do you tell your lead?', 'Плануєте відпустку. Наскільки заздалегідь кажете керівнику?', 'Des congés en vue. Vous prévenez votre manager combien de temps avant ?', 'Planeas vacaciones. ¿Con cuánta antelación avisas a tu responsable?') },
      { kind: 'choices', opts: [L('At least two weeks', 'Щонайменше за 2 тижні', 'Au moins deux semaines', 'Al menos dos semanas'), L('The day before', 'За день до', 'La veille', 'El día anterior')], pick: 0 },
      { kind: 'bot', text: L('Two weeks lets the team plan coverage.', 'Два тижні дають команді спланувати підміну.', 'Deux semaines, et l’équipe a le temps de s’organiser.', 'Con dos semanas, el equipo puede organizar la cobertura.') },
    ],
  },
  {
    id: 'hr-sick',
    name: L('Anna', 'Аня', 'Anna', 'Anna'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L("Sick this morning. What's right?", 'Захворіли зранку. Як правильно?', 'Malade ce matin. La bonne marche à suivre ?', 'Amaneces con fiebre. ¿Qué es lo correcto?') },
      { kind: 'choices', opts: [L('Message your lead + log in the portal', 'Повідомити керівника + позначити у порталі', 'Prévenir mon manager + le noter sur le portail', 'Avisar a mi responsable + registrarlo en el portal'), L('Just rest, sort it later', 'Просто відпочити, розберемось пізніше', 'Me reposer, on verra plus tard', 'Descansar y ya lo arreglaré')], pick: 0 },
      { kind: 'bot', text: L('Quick ping today saves a chase tomorrow.', 'Швидке повідомлення сьогодні економить пошуки завтра.', 'Un petit message aujourd’hui évite qu’on vous cherche demain.', 'Un aviso rápido hoy evita que te busquen mañana.') },
    ],
  },
  {
    id: 'hr-1on1',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L('Best topic for a 1:1 with your manager?', 'Найкраща тема для 1:1 з керівником?', 'Le meilleur sujet pour un 1:1 avec votre manager ?', '¿El mejor tema para un 1:1 con tu responsable?') },
      { kind: 'choices', opts: [L("What's blocking you", 'Що вас блокує', 'Ce qui vous bloque', 'Lo que te bloquea'), L('Office snack supply', 'Запас снеків у офісі', 'Le stock de snacks du bureau', 'Los snacks de la oficina')], pick: 0 },
      { kind: 'bot', text: L('Unblocking you is literally their job.', 'Розблокувати вас — буквально їхня робота.', 'Vous débloquer, c’est littéralement son travail.', 'Desbloquearte es, literalmente, su trabajo.') },
    ],
  },
  {
    id: 'hr-feedback',
    name: L('Serhii', 'Сергій', 'Serhii', 'Serhii'),
    status: L('HR Lead', 'Керівниця HR', 'Responsable RH', 'Responsable de RR. HH.'),
    steps: [
      { kind: 'bot', text: L('Peer feedback — when does it land best?', 'Peer feedback — коли він найкраще «заходить»?', 'Le feedback entre collègues — quand passe-t-il le mieux ?', 'Feedback entre compañeros — ¿cuándo cala mejor?') },
      { kind: 'choices', opts: [L('Soon after the moment', 'Невдовзі після ситуації', 'Peu après la situation', 'Poco después del momento'), L('Once a year in review', 'Раз на рік на review', 'Une fois par an, à l’entretien annuel', 'Una vez al año, en la evaluación')], pick: 0 },
      { kind: 'bot', text: L('Fresh + specific. That\'s the recipe.', 'Свіже + конкретне. Ось рецепт.', 'À chaud + précis. Voilà la recette.', 'Reciente + concreto. Esa es la receta.') },
    ],
  },

  // ─── Security awareness ───────────────────────────────────────────────────
  {
    id: 'sec-phishing',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Security', 'Безпека', 'Sécurité', 'Seguridad'),
    steps: [
      { kind: 'bot', text: L('Email from "CEO": "wire $5k now, urgent." You…?', 'Лист від «CEO»: «терміново переказати $5k». Ви…?', 'E-mail du « PDG » : « Virez 5 000 $ tout de suite, urgent. » Vous… ?', 'Correo del “CEO”: “Transfiere 5000 $ ya, es urgente”. ¿Tú…?') },
      { kind: 'choices', opts: [L('Report it as phishing', 'Поскаржитись як на фішинг', 'Je le signale comme phishing', 'Lo reporto como phishing'), L('Wire it just in case', 'На всяк випадок — переказати', 'Je fais le virement, au cas où', 'Lo transfiero, por si acaso')], pick: 0 },
      { kind: 'bot', text: L('Urgency + money = always verify out-of-band.', 'Терміновість + гроші = завжди перевіряємо іншим каналом.', 'Urgence + argent = on vérifie toujours par un autre canal.', 'Urgencia + dinero = verifica siempre por otro canal.') },
    ],
  },
  {
    id: 'sec-password',
    name: L('Serhii', 'Сергій', 'Serhii', 'Serhii'),
    status: L('Security', 'Безпека', 'Sécurité', 'Seguridad'),
    steps: [
      { kind: 'bot', text: L('Best place to store a strong password?', 'Найкраще місце для надійного пароля?', 'Le meilleur endroit pour garder un mot de passe solide ?', '¿El mejor sitio para guardar una contraseña segura?') },
      { kind: 'choices', opts: [L('A password manager', 'У парольному менеджері', 'Un gestionnaire de mots de passe', 'Un gestor de contraseñas'), L('A sticky note', 'На стікері', 'Un Post-it', 'Una nota adhesiva')], pick: 0 },
      { kind: 'bot', text: L('Manager = strong, unique, autofill safely.', 'Менеджер = надійні, унікальні, авто-fill без ризику.', 'Gestionnaire = mots de passe solides, uniques, saisis sans risque.', 'Gestor = seguras, únicas y con autocompletado sin riesgo.') },
    ],
  },
  {
    id: 'sec-usb',
    name: L('Serhii', 'Сергій', 'Serhii', 'Serhii'),
    status: L('Security', 'Безпека', 'Sécurité', 'Seguridad'),
    steps: [
      { kind: 'bot', text: L('You find a USB in the parking lot. Do you…', 'Знайшли USB на парковці. Ви…', 'Vous trouvez une clé USB sur le parking. Vous…', 'Encuentras un USB en el estacionamiento. Tú…') },
      { kind: 'choices', opts: [L('Hand it to IT, unopened', 'Передаєте IT, не відкривши', 'La remettez à l’IT, sans l’ouvrir', 'Se lo das a IT, sin abrirlo'), L('Plug it in to find the owner', 'Підключаєте, щоб знайти власника', 'La branchez pour retrouver son propriétaire', 'Lo conectas para encontrar al dueño')], pick: 0 },
      { kind: 'bot', text: L('Classic bait. IT will handle it safely.', 'Класична наживка. IT обробить безпечно.', 'Appât classique. L’IT s’en occupe en toute sécurité.', 'Cebo clásico. IT se encarga de forma segura.') },
    ],
  },
  {
    id: 'sec-public-wifi',
    name: L('Serhii', 'Сергій', 'Serhii', 'Serhii'),
    status: L('Security', 'Безпека', 'Sécurité', 'Seguridad'),
    steps: [
      { kind: 'bot', text: L('Working from a café. Safe to log into the admin panel?', 'Працюєте з кафе. Безпечно зайти в адмінку?', 'Vous travaillez depuis un café. Ouvrir le panneau d’admin, c’est sûr ?', 'Trabajas desde una cafetería. ¿Es seguro entrar al panel de administración?') },
      { kind: 'choices', opts: [L('Only over the company VPN', 'Лише через корпоративний VPN', 'Uniquement via le VPN de l’entreprise', 'Solo con la VPN de la empresa'), L('Sure, on open Wi-Fi', 'Так, на відкритому Wi-Fi', 'Bien sûr, sur le Wi-Fi public', 'Claro, con el Wi-Fi abierto')], pick: 0 },
      { kind: 'bot', text: L('VPN turns the café into your office.', 'VPN перетворює кафе на ваш офіс.', 'Le VPN transforme le café en bureau.', 'La VPN convierte la cafetería en tu oficina.') },
    ],
  },
  {
    id: 'sec-screen-lock',
    name: L('Serhii', 'Сергій', 'Serhii', 'Serhii'),
    status: L('Security', 'Безпека', 'Sécurité', 'Seguridad'),
    steps: [
      { kind: 'bot', text: L('Leaving the desk for 30 seconds — lock or no?', 'Відходите на 30 секунд — лочити чи ні?', 'Vous quittez votre poste 30 secondes — on verrouille ou pas ?', 'Dejas tu mesa 30 segundos — ¿bloqueas o no?') },
      { kind: 'choices', opts: [L('Lock. Always.', 'Лочити. Завжди.', 'On verrouille. Toujours.', 'Bloqueo. Siempre.'), L('Too short to bother', 'Замало, щоб морочитись', 'Trop court pour s’embêter', 'Es muy poco, no vale la pena')], pick: 0 },
      { kind: 'bot', text: L('30 seconds is enough for someone to act.', '30 секунд — досить, щоб хтось встиг.', '30 secondes, c’est assez pour que quelqu’un en profite.', '30 segundos bastan para que alguien actúe.') },
    ],
  },

  // ─── Soft skills ──────────────────────────────────────────────────────────
  {
    id: 'soft-saying-no',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L("Plate is full and a new request lands. You…?", 'Завдань вже забагато, прилітає нове. Ви…?', 'Vous êtes sous l’eau et une nouvelle demande arrive. Vous… ?', 'Tienes la agenda llena y llega otra petición. ¿Tú…?') },
      { kind: 'choices', opts: [L('Negotiate priorities with your lead', 'Узгоджуєте пріоритети з керівником', 'Je revois les priorités avec mon manager', 'Negocio las prioridades con mi responsable'), L("Say yes and hope", 'Кажете так і сподіваєтесь', 'Je dis oui et je croise les doigts', 'Digo que sí y cruzo los dedos')], pick: 0 },
      { kind: 'bot', text: L('"Yes" without trade-offs becomes a missed deadline.', '«Так» без trade-off перетворюється на зриви.', 'Un « oui » sans arbitrage devient une échéance manquée.', 'Un “sí” sin renuncias acaba en un plazo incumplido.') },
    ],
  },
  {
    id: 'soft-listening',
    name: L('Kuzia', 'Кузя', 'Kuzia', 'Kuzia'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('Strongest sign of active listening?', 'Найсильніша ознака активного слухання?', 'Le signe le plus net d’une écoute active ?', '¿La señal más clara de escucha activa?') },
      { kind: 'choices', opts: [L('Paraphrasing back', 'Перефразування', 'Reformuler', 'Parafrasear'), L('Nodding a lot', 'Багато кивати', 'Hocher beaucoup la tête', 'Asentir mucho')], pick: 0 },
      { kind: 'bot', text: L('Paraphrase proves understanding. Nods don\'t.', 'Перефразування показує розуміння. Кивки — ні.', 'Reformuler prouve qu’on a compris. Hocher la tête, non.', 'Parafrasear demuestra que entendiste. Asentir, no.') },
    ],
  },
  {
    id: 'soft-meeting',
    name: L('Kuzia', 'Кузя', 'Kuzia', 'Kuzia'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('Meeting drifts off-topic. Your move?', 'Зустріч уходить у бік. Ваш хід?', 'La réunion part dans tous les sens. Que faites-vous ?', 'La reunión se va por las ramas. ¿Qué haces?') },
      { kind: 'choices', opts: [L('"Great point — let\'s park it"', '«Гарна думка — паркуємо її»', '« Bonne remarque — on la garde pour plus tard »', '“Buen punto — lo dejamos para luego”'), L('Wait and hope it returns', 'Чекаємо й сподіваємось', 'Attendre que ça revienne tout seul', 'Esperar a que vuelva sola')], pick: 0 },
      { kind: 'bot', text: L('Park & return. The agenda thanks you.', 'Park & return. Agenda дякує вам.', 'On note, on y revient. L’ordre du jour vous dit merci.', 'Se anota y se retoma. El orden del día te lo agradece.') },
    ],
  },
  {
    id: 'soft-disagree',
    name: L('Ivan', 'Іван', 'Ivan', 'Ivan'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('You disagree with a teammate in a review. How?', 'Не згодні з колегою на review. Як?', 'Vous n’êtes pas d’accord avec un collègue en revue. Comment faire ?', 'No estás de acuerdo con un compañero en una revisión. ¿Cómo lo haces?') },
      { kind: 'choices', opts: [L('Critique the work, not the person', 'Критикуємо роботу, не людину', 'Critiquer le travail, pas la personne', 'Criticar el trabajo, no a la persona'), L('Soften everything to nothing', 'Все згладити до нуля', 'Tout adoucir jusqu’à ne rien dire', 'Suavizarlo todo hasta no decir nada')], pick: 0 },
      { kind: 'bot', text: L("Direct + kind. That's the standard.", 'Прямо + по-доброму. Це стандарт.', 'Direct + bienveillant. C’est la règle.', 'Directo + amable. Ese es el estándar.') },
    ],
  },
  {
    id: 'soft-async',
    name: L('Ivan', 'Іван', 'Ivan', 'Ivan'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('Async message vs quick call — when do you call?', 'Async-повідомлення чи дзвінок — коли дзвоните?', 'Message asynchrone ou appel rapide — quand appelez-vous ?', 'Mensaje asíncrono o llamada rápida — ¿cuándo llamas?') },
      { kind: 'choices', opts: [L('When 5+ messages can\'t resolve it', 'Коли 5+ повідомлень не вирішують', 'Quand 5 messages ou plus n’y suffisent pas', 'Cuando 5 mensajes o más no lo resuelven'), L('Whenever I feel like it', 'Коли захочеться', 'Quand j’en ai envie', 'Cuando tengo ganas')], pick: 0 },
      { kind: 'bot', text: L('Default async, escalate when stuck.', 'За замовчуванням — async, ескалюємо коли застрягли.', 'Asynchrone par défaut, appel quand ça coince.', 'Asíncrono por defecto; llama cuando te atasques.') },
    ],
  },

  // ─── Leadership ───────────────────────────────────────────────────────────
  {
    id: 'lead-delegation',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Engineering Mgr', 'Менеджер інженерії', 'Engineering Manager', 'Engineering Manager'),
    steps: [
      { kind: 'bot', text: L('Delegating a project. What do you share first?', 'Делегуєте проект. Що ділите першим?', 'Vous déléguez un projet. Que partagez-vous en premier ?', 'Delegas un proyecto. ¿Qué compartes primero?') },
      { kind: 'choices', opts: [L('The desired outcome', 'Бажаний результат', 'Le résultat attendu', 'El resultado esperado'), L('Step-by-step instructions', 'Покрокові інструкції', 'Des instructions pas à pas', 'Instrucciones paso a paso')], pick: 0 },
      { kind: 'bot', text: L('Outcome > tasks. Ownership grows from there.', 'Результат > задачі. Ownership росте звідти.', 'Résultat > tâches. C’est là que naît l’autonomie.', 'Resultado > tareas. De ahí nace la responsabilidad.') },
    ],
  },
  {
    id: 'lead-feedback',
    name: L('Maksym', 'Максим', 'Maksym', 'Maksym'),
    status: L('Engineering Mgr', 'Менеджер інженерії', 'Engineering Manager', 'Engineering Manager'),
    steps: [
      { kind: 'bot', text: L('Giving tough feedback. Best opener?', 'Жорсткий feedback. Найкращий вступ?', 'Un feedback difficile à donner. La meilleure entrée en matière ?', 'Toca dar un feedback difícil. ¿La mejor forma de empezar?') },
      { kind: 'choices', opts: [L('"I want this to land well — open?"', '«Хочу, щоб це зайшло — окей?»', '« J’aimerais que ce soit bien reçu — on en parle ? »', '“Quiero que esto te sirva — ¿lo hablamos?”'), L('"You always do this…"', '«Ти завжди так робиш…»', '« Vous faites toujours ça… »', '“Siempre haces lo mismo…”')], pick: 0 },
      { kind: 'bot', text: L('Permission softens the signal, not the message.', 'Дозвіл пом’якшує сигнал, не суть.', 'Demander la permission adoucit le ton, pas le message.', 'Pedir permiso suaviza el tono, no el mensaje.') },
    ],
  },
  {
    id: 'lead-burnout',
    name: L('Maksym', 'Максим', 'Maksym', 'Maksym'),
    status: L('Engineering Mgr', 'Менеджер інженерії', 'Engineering Manager', 'Engineering Manager'),
    steps: [
      { kind: 'bot', text: L('Direct report looks burnt out. First step?', 'Колега виглядає вигорілим. Перший крок?', 'Un membre de votre équipe semble épuisé. Première étape ?', 'Alguien de tu equipo parece agotado. ¿Primer paso?') },
      { kind: 'choices', opts: [L('Private 1:1, no agenda', 'Приватний 1:1, без порядку', 'Un 1:1 en privé, sans ordre du jour', 'Un 1:1 en privado, sin agenda'), L('Add it to next sprint review', 'Додати до sprint review', 'L’ajouter à la prochaine revue de sprint', 'Añadirlo a la próxima sprint review')], pick: 0 },
      { kind: 'bot', text: L('Quiet space first. Solutions follow.', 'Спершу — тиха зустріч. Рішення йдуть далі.', 'D’abord un moment au calme. Les solutions viennent après.', 'Primero, un espacio tranquilo. Las soluciones vienen después.') },
    ],
  },
  {
    id: 'lead-onboarding',
    name: L('Maksym', 'Максим', 'Maksym', 'Maksym'),
    status: L('Engineering Mgr', 'Менеджер інженерії', 'Engineering Manager', 'Engineering Manager'),
    steps: [
      { kind: 'bot', text: L('New hire, day 1. What\'s the single best gift?', 'Нова людина, day 1. Найкращий «подарунок»?', 'Nouvelle recrue, jour 1. Le plus beau cadeau à lui faire ?', 'Nueva incorporación, día 1. ¿Cuál es el mejor regalo?') },
      { kind: 'choices', opts: [L('A clear first task with someone to ask', 'Зрозуміла перша задача + хто допоможе', 'Une première tâche claire et quelqu’un à qui demander', 'Una primera tarea clara y alguien a quien preguntar'), L('Read all the wikis', 'Перечитати всі wikis', 'Lire tous les wikis', 'Leerse todas las wikis')], pick: 0 },
      { kind: 'bot', text: L('Small win + a buddy beats reading marathons.', 'Маленька перемога + бадді — краще ніж марафон читання.', 'Une petite victoire + un binôme valent mieux qu’un marathon de lecture.', 'Un pequeño logro + un buddy ganan a cualquier maratón de lectura.') },
    ],
  },

  // ─── Compliance ───────────────────────────────────────────────────────────
  {
    id: 'comp-confidential',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Compliance', 'Комплаєнс', 'Conformité', 'Cumplimiento'),
    steps: [
      { kind: 'bot', text: L('Sharing a confidential doc with a vendor. What\'s required?', 'Ділимось конфіденційним документом з вендором. Що потрібно?', 'Vous partagez un document confidentiel avec un prestataire. Que faut-il ?', 'Vas a compartir un documento confidencial con un proveedor. ¿Qué hace falta?') },
      { kind: 'choices', opts: [L('A signed NDA first', 'Спочатку підписаний NDA', 'D’abord un NDA signé', 'Primero, un NDA firmado'), L("Just trust them", 'Просто довіряємо', 'Lui faire confiance, tout simplement', 'Confiar en él y ya')], pick: 0 },
      { kind: 'bot', text: L('NDA = boundary on paper. Always first.', 'NDA = межа на папері. Завжди спочатку.', 'NDA = une limite noir sur blanc. Toujours en premier.', 'NDA = un límite por escrito. Siempre primero.') },
    ],
  },
  {
    id: 'comp-gdpr',
    name: L('Betty', 'Беті', 'Betty', 'Betty'),
    status: L('Compliance', 'Комплаєнс', 'Conformité', 'Cumplimiento'),
    steps: [
      { kind: 'bot', text: L('A user asks to delete their data. Deadline?', 'Користувач просить видалити дані. Дедлайн?', 'Un utilisateur demande la suppression de ses données. Le délai ?', 'Un usuario pide borrar sus datos. ¿Plazo?') },
      { kind: 'choices', opts: [L('Within 30 days (GDPR)', 'Протягом 30 днів (GDPR)', 'Sous 30 jours (RGPD)', 'En 30 días (RGPD)'), L('Whenever it\'s convenient', 'Коли буде зручно', 'Quand ça nous arrange', 'Cuando nos venga bien')], pick: 0 },
      { kind: 'bot', text: L('30 days is the law. Track it.', '30 днів — це закон. Тримаємо в трекері.', '30 jours, c’est la loi. Suivez le délai.', '30 días: es la ley. Lleva el control.') },
    ],
  },
  {
    id: 'comp-data',
    name: L('Serhii', 'Сергій', 'Serhii', 'Serhii'),
    status: L('Compliance', 'Комплаєнс', 'Conformité', 'Cumplimiento'),
    steps: [
      { kind: 'bot', text: L('Storing customer data. Where do PII fields live?', 'Зберігаємо дані клієнтів. Де живуть PII-поля?', 'On stocke des données clients. Où vont les données personnelles ?', 'Guardamos datos de clientes. ¿Dónde van los datos personales?') },
      { kind: 'choices', opts: [L('Approved, encrypted store only', 'Тільки в схваленому шифрованому сховищі', 'Uniquement dans un espace approuvé et chiffré', 'Solo en un almacén aprobado y cifrado'), L('Wherever it\'s fastest', 'Де швидше', 'Là où c’est le plus rapide', 'Donde sea más rápido')], pick: 0 },
      { kind: 'bot', text: L('Speed matters. Trust matters more.', 'Швидкість важлива. Довіра — важливіша.', 'La vitesse compte. La confiance encore plus.', 'La rapidez importa. La confianza, más.') },
    ],
  },

  // ─── Conflict + collaboration ─────────────────────────────────────────────
  {
    id: 'collab-missed-deadline',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('You\'ll miss a deadline by 2 days. Tell who, when?', 'Зриваєте дедлайн на 2 дні. Кому й коли кажете?', 'Vous aurez 2 jours de retard. Vous prévenez qui, et quand ?', 'Vas a retrasarte 2 días. ¿A quién avisas y cuándo?') },
      { kind: 'choices', opts: [L('Stakeholders, as soon as you know', 'Стейкхолдерам — щойно дізналися', 'Les parties prenantes, dès que je le sais', 'A los implicados, en cuanto lo sé'), L('On the deadline day', 'У день дедлайну', 'Le jour de l’échéance', 'El día de la entrega')], pick: 0 },
      { kind: 'bot', text: L('Early news = options. Late news = problems.', 'Рання звістка — варіанти. Пізня — проблеми.', 'Prévenir tôt = des options. Prévenir tard = des problèmes.', 'Avisar pronto = opciones. Avisar tarde = problemas.') },
    ],
  },
  {
    id: 'collab-handover',
    name: L('Kuzia', 'Кузя', 'Kuzia', 'Kuzia'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('Handing a task over. Best artifact?', 'Передаєте задачу. Найкращий «артефакт»?', 'Vous passez la main sur une tâche. Le meilleur support ?', 'Traspasas una tarea. ¿El mejor formato?') },
      { kind: 'choices', opts: [L('A short doc: goal, status, open questions', 'Короткий док: ціль, статус, відкриті питання', 'Un doc court : objectif, état, questions ouvertes', 'Un doc breve: objetivo, estado y dudas abiertas'), L('A 30-minute call only', 'Лише 30-хвилинний дзвінок', 'Juste un appel de 30 minutes', 'Solo una llamada de 30 minutos')], pick: 0 },
      { kind: 'bot', text: L('Doc + call beats either alone.', 'Док + дзвінок — краще, ніж кожне окремо.', 'Doc + appel, c’est mieux que l’un sans l’autre.', 'Doc + llamada es mejor que cualquiera por separado.') },
    ],
  },
  {
    id: 'collab-disagree-up',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('You think the boss is wrong. Where do you raise it?', 'Думаєте, що бос не правий. Де піднімаєте?', 'Vous pensez que votre chef se trompe. Où le dites-vous ?', 'Crees que tu jefe se equivoca. ¿Dónde lo planteas?') },
      { kind: 'choices', opts: [L('Privately, with evidence', 'Приватно, з аргументами', 'En privé, preuves à l’appui', 'En privado, con datos'), L('In the next big meeting', 'На наступній великій зустрічі', 'À la prochaine grande réunion', 'En la próxima gran reunión')], pick: 0 },
      { kind: 'bot', text: L('Disagree privately, commit publicly.', 'Не згоджуємось приватно — підтримуємо публічно.', 'Désaccord en privé, soutien en public.', 'Discrepa en privado, apoya en público.') },
    ],
  },

  // ─── Product / engineering ────────────────────────────────────────────────
  {
    id: 'eng-bug-triage',
    name: L('Dmytro', 'Дмитро', 'Dmytro', 'Dmytro'),
    status: L('Tech Lead', 'Тимлід', 'Tech Lead', 'Tech Lead'),
    steps: [
      { kind: 'bot', text: L('Two bugs: one for 1 user, one for 1000. Which first?', 'Два баги: один на 1 юзера, інший на 1000. Який першим?', 'Deux bugs : l’un touche 1 utilisateur, l’autre 1 000. Lequel d’abord ?', 'Dos bugs: uno afecta a 1 usuario y otro a 1000. ¿Cuál va primero?') },
      { kind: 'choices', opts: [L('1000 — impact wins', '1000 — пріоритет за impact', '1 000 — l’impact prime', '1000 — manda el impacto'), L('1 — already complaining', '1 — вже скаржиться', '1 — il se plaint déjà', '1 — ya se está quejando')], pick: 0 },
      { kind: 'bot', text: L('Volume matters; squeaky wheel is a trap.', 'Масштаб важливий; «найгучніший» — це пастка.', 'Le volume compte ; céder à qui crie le plus fort est un piège.', 'El volumen importa; hacer caso al que más grita es una trampa.') },
    ],
  },
  {
    id: 'eng-code-review',
    name: L('Dmytro', 'Дмитро', 'Dmytro', 'Dmytro'),
    status: L('Tech Lead', 'Тимлід', 'Tech Lead', 'Tech Lead'),
    steps: [
      { kind: 'bot', text: L('PR is huge. How do you review it well?', 'PR величезний. Як його якісно ревьюнути?', 'La PR est énorme. Comment bien la relire ?', 'La PR es enorme. ¿Cómo la revisas bien?') },
      { kind: 'choices', opts: [L('Ask the author to split it', 'Попросити автора розбити', 'Demander à l’auteur de la découper', 'Pedir al autor que la divida'), L('Skim and approve to be nice', 'Прогорнути й заапрувити «по-доброму»', 'Survoler et approuver pour être sympa', 'Ojearla y aprobar por quedar bien')], pick: 0 },
      { kind: 'bot', text: L('Smaller PRs = better code + faster reviews.', 'Малі PR = краще код + швидший review.', 'PR plus petites = meilleur code + revues plus rapides.', 'PR más pequeñas = mejor código + revisiones más rápidas.') },
    ],
  },
  {
    id: 'eng-incident',
    name: L('Dmytro', 'Дмитро', 'Dmytro', 'Dmytro'),
    status: L('Tech Lead', 'Тимлід', 'Tech Lead', 'Tech Lead'),
    steps: [
      { kind: 'bot', text: L('Production is down. First channel?', 'Production лежить. Перший канал?', 'La prod est tombée. Premier canal ?', 'Producción está caída. ¿Primer canal?') },
      { kind: 'choices', opts: [L('Incident channel + status page', 'Incident channel + status page', 'Canal d’incident + page de statut', 'Canal de incidentes + página de estado'), L('DM your manager', 'Особисте повідомлення менеджеру', 'Un message privé à mon manager', 'Un privado a mi responsable')], pick: 0 },
      { kind: 'bot', text: L('Public + structured. The team rallies fast.', 'Публічно + структуровано. Команда збирається швидко.', 'Public + structuré. L’équipe se mobilise vite.', 'Público + estructurado. El equipo se moviliza rápido.') },
    ],
  },
  {
    id: 'eng-tradeoffs',
    name: L('Dmytro', 'Дмитро', 'Dmytro', 'Dmytro'),
    status: L('Tech Lead', 'Тимлід', 'Tech Lead', 'Tech Lead'),
    steps: [
      { kind: 'bot', text: L("Feature: ship Friday or polish until Monday?", 'Фіча: реліз у пʼятницю чи допилити до понеділка?', 'La fonctionnalité : on livre vendredi ou on peaufine jusqu’à lundi ?', 'La función: ¿la lanzamos el viernes o la pulimos hasta el lunes?') },
      { kind: 'choices', opts: [L("Ship Monday — Fridays burn people", 'У понеділок — пʼятниця палить людей', 'Lundi — les vendredis épuisent tout le monde', 'El lunes — los viernes queman a la gente'), L('Friday — never miss a date', 'У пʼятницю — ніколи не зриваємо дату', 'Vendredi — on ne rate jamais une date', 'El viernes — una fecha no se incumple')], pick: 0 },
      { kind: 'bot', text: L("Calm releases beat heroic Fridays.", 'Спокійні релізи кращі за «героїчні» пʼятниці.', 'Mieux vaut une livraison sereine qu’un vendredi héroïque.', 'Un lanzamiento tranquilo gana a un viernes heroico.') },
    ],
  },

  // ─── Finance + ops ────────────────────────────────────────────────────────
  {
    id: 'fin-invoice',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Finance', 'Фінанси', 'Finance', 'Finanzas'),
    steps: [
      { kind: 'bot', text: L('Vendor invoice differs from the agreed price. You…?', 'Інвойс відрізняється від домовленої ціни. Ви…?', 'La facture du fournisseur ne correspond pas au prix convenu. Vous… ?', 'La factura del proveedor no coincide con el precio acordado. ¿Tú…?') },
      { kind: 'choices', opts: [L('Hold + ask for a correction', 'Затримати + попросити корекцію', 'Je la bloque + je demande une correction', 'La retengo + pido una corrección'), L('Pay quickly to keep them happy', 'Заплатити швидко, щоб не сваритись', 'Je paie vite pour ne pas le froisser', 'Pago rápido para tenerlo contento')], pick: 0 },
      { kind: 'bot', text: L('Process > politeness. Document the fix.', 'Процес > ввічливість. Документуємо коректування.', 'Procédure > politesse. Gardez une trace de la correction.', 'Proceso > cortesía. Documenta la corrección.') },
    ],
  },
  {
    id: 'ops-process',
    name: L('Maksym', 'Максим', 'Maksym', 'Maksym'),
    status: L('Ops', 'Операції', 'Opérations', 'Operaciones'),
    steps: [
      { kind: 'bot', text: L('Same problem keeps coming back. Best fix?', 'Та сама проблема повертається. Найкраще рішення?', 'Le même problème revient sans cesse. La meilleure solution ?', 'El mismo problema vuelve una y otra vez. ¿La mejor solución?') },
      { kind: 'choices', opts: [L('Find the root cause + add a guardrail', 'Знайти root cause + додати guardrail', 'Trouver la cause racine + ajouter un garde-fou', 'Buscar la causa raíz + poner una salvaguarda'), L('Patch it each time', 'Латати щоразу', 'Colmater à chaque fois', 'Parchearlo cada vez')], pick: 0 },
      { kind: 'bot', text: L('Patches stack up. Guardrails compound.', 'Латки накопичуються. Guardrails — множаться у користі.', 'Les rustines s’empilent. Les garde-fous, eux, rapportent.', 'Los parches se acumulan. Las salvaguardas rinden cada vez más.') },
    ],
  },
  {
    id: 'ops-meeting',
    name: L('Kuzia', 'Кузя', 'Kuzia', 'Kuzia'),
    status: L('Ops', 'Операції', 'Opérations', 'Operaciones'),
    steps: [
      { kind: 'bot', text: L('Recurring meeting feels useless. Your move?', 'Регулярна зустріч відчувається непотрібною. Ваш хід?', 'Une réunion récurrente semble inutile. Que faites-vous ?', 'Una reunión periódica parece inútil. ¿Qué haces?') },
      { kind: 'choices', opts: [L('Propose async + a clear owner', 'Запропонувати async + чіткого owner', 'Proposer de l’asynchrone + un responsable clair', 'Proponer hacerlo asíncrono + un responsable claro'), L('Just keep showing up', 'Просто далі ходити', 'Continuer d’y aller', 'Seguir yendo sin más')], pick: 0 },
      { kind: 'bot', text: L('Calendars love being challenged.', 'Календарі обожнюють виклик.', 'Les agendas adorent être remis en question.', 'A los calendarios les encanta que los cuestionen.') },
    ],
  },

  // ─── Recruitment ──────────────────────────────────────────────────────────
  {
    id: 'rec-interview',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Recruiter', 'Рекрутерка', 'Recruteuse', 'Reclutadora'),
    steps: [
      { kind: 'bot', text: L('In an interview — best opening?', 'На інтервʼю — найкращий старт?', 'En entretien — la meilleure entrée en matière ?', 'En una entrevista — ¿la mejor forma de empezar?') },
      { kind: 'choices', opts: [L('"What\'s the day-to-day like?"', '«Як виглядає типовий день?»', '« À quoi ressemble une journée type ? »', '“¿Cómo es el día a día?”'), L('"Tell me about the company"', '«Розкажіть про компанію»', '« Parlez-moi de l’entreprise »', '“Háblame de la empresa”')], pick: 0 },
      { kind: 'bot', text: L('Specific beats generic. Always.', 'Конкретне краще за загальне. Завжди.', 'Le précis bat le générique. Toujours.', 'Lo concreto gana a lo genérico. Siempre.') },
    ],
  },
  {
    id: 'rec-rejection',
    name: L('Anna', 'Аня', 'Anna', 'Anna'),
    status: L('Recruiter', 'Рекрутерка', 'Recruteuse', 'Reclutadora'),
    steps: [
      { kind: 'bot', text: L('Rejecting a candidate — what do you include?', 'Відмовляєте кандидату — що додаєте?', 'Vous refusez un candidat — que mettez-vous dans le message ?', 'Rechazas a un candidato — ¿qué incluyes?') },
      { kind: 'choices', opts: [L('A real reason + thanks', 'Реальну причину + подяку', 'Une vraie raison + un merci', 'Un motivo real + las gracias'), L('A vague form letter', 'Туманний шаблонний лист', 'Une lettre type bien vague', 'Una carta tipo y vaga')], pick: 0 },
      { kind: 'bot', text: L("Kindness today is the talent brand tomorrow.", 'Сьогоднішня доброта — завтрашній talent brand.', 'La bienveillance d’aujourd’hui, c’est la marque employeur de demain.', 'La amabilidad de hoy es la marca empleadora de mañana.') },
    ],
  },

  // ─── Lighthearted (still on-topic, just fun) ─────────────────────────────
  {
    id: 'fun-coffee',
    name: L('Coffee bot', 'Кавобот', 'Cafébot', 'Cafebot'),
    status: L('beep', 'біп', 'bip', 'bip'),
    steps: [
      { kind: 'bot', text: L('Beep. Calibrating you. Coffee or tea?', 'Біп. Калібрую вас. Кава чи чай?', 'Bip. Calibrage en cours. Café ou thé ?', 'Bip. Calibrándote. ¿Café o té?') },
      { kind: 'choices', opts: [L('Coffee. Now.', 'Каву. Негайно.', 'Un café. Tout de suite.', 'Café. Ya.'), L('Tea, with kindness', 'Чай, з добротою', 'Un thé, tout en douceur', 'Té, con cariño')], pick: 0 },
      { kind: 'bot', text: L('Initiating productivity protocol ☕', 'Запускаю протокол продуктивності ☕', 'Lancement du protocole productivité ☕', 'Iniciando protocolo de productividad ☕') },
    ],
  },
  {
    id: 'fun-tabs-spaces',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Tech Lead', 'Тимлід', 'Tech Lead', 'Tech Lead'),
    steps: [
      { kind: 'bot', text: L('The ancient question: tabs or spaces?', 'Одвічне питання: tabs чи spaces?', 'L’éternelle question : tabulations ou espaces ?', 'La eterna pregunta: ¿tabuladores o espacios?') },
      { kind: 'choices', opts: [L('Whatever the linter says', 'Що скаже лінтер', 'Ce que dit le linter', 'Lo que diga el linter'), L('Civil war, here we come', 'Громадянська війна, ось і ми', 'Guerre civile, nous voilà', 'Guerra civil, allá vamos')], pick: 0 },
      { kind: 'bot', text: L('Wise. Diplomacy 1, holy wars 0.', 'Мудро. Дипломатія 1, holy wars 0.', 'Sage décision. Diplomatie 1, guerres de religion 0.', 'Sabia elección. Diplomacia 1, guerras santas 0.') },
    ],
  },
  {
    id: 'fun-standup',
    name: L('Kuzia', 'Кузя', 'Kuzia', 'Kuzia'),
    status: L('Scrum Master', 'Scrum Master', 'Scrum Master', 'Scrum Master'),
    steps: [
      { kind: 'bot', text: L('Standup tip: best length per person?', 'Standup-порада: оптимальна тривалість на людину?', 'Conseil pour le daily : la bonne durée par personne ?', 'Consejo para la daily: ¿duración ideal por persona?') },
      { kind: 'choices', opts: [L('Under a minute', 'До хвилини', 'Moins d’une minute', 'Menos de un minuto'), L('A full TED talk', 'Повноцінний TED talk', 'Une vraie conférence TED', 'Toda una charla TED')], pick: 0 },
      { kind: 'bot', text: L('TED is paid. Standups aren\'t. 😄', 'TED — платно. Standup — ні. 😄', 'Pour TED, on paie sa place. Pas pour le daily. 😄', 'En TED se paga entrada. En la daily, no. 😄') },
    ],
  },
  {
    id: 'fun-emoji',
    name: L('Nazar', 'Назар', 'Nazar', 'Nazar'),
    status: L('HR', 'HR', 'RH', 'RR. HH.'),
    steps: [
      { kind: 'bot', text: L('Approving a PR — best emoji?', 'Approve на PR — найкраще emoji?', 'Vous approuvez une PR — le meilleur emoji ?', 'Apruebas una PR — ¿el mejor emoji?') },
      { kind: 'choices', opts: [L('🚀', '🚀', '🚀', '🚀'), L('🐢', '🐢', '🐢', '🐢')], pick: 0 },
      { kind: 'bot', text: L('🚀 says "ship it." 🐢 says "we\'ll talk."', '🚀 значить «релізимо». 🐢 значить «треба поговорити».', '🚀 dit « on livre ». 🐢 dit « il faut qu’on parle ».', '🚀 dice “a producción”. 🐢 dice “tenemos que hablar”.') },
    ],
  },
  {
    id: 'fun-pineapple',
    name: L('Nazar', 'Назар', 'Nazar', 'Nazar'),
    status: L('Team Dinner', 'Командна вечеря', 'Dîner d’équipe', 'Cena de equipo'),
    steps: [
      { kind: 'bot', text: L('Hot vote: pineapple on pizza for the team dinner?', 'Гаряче голосування: ананас на піцу на командну вечерю?', 'Vote brûlant : de l’ananas sur la pizza au dîner d’équipe ?', 'Votación polémica: ¿piña en la pizza para la cena de equipo?') },
      { kind: 'choices', opts: [L('Order it on the side', 'Замовити окремо', 'La commander à part', 'Pedirla aparte'), L('Start a holy war', 'Розпочати holy war', 'Déclencher une guerre de religion', 'Empezar una guerra santa')], pick: 0 },
      { kind: 'bot', text: L('Diplomacy saves dinners. 🍕', 'Дипломатія рятує вечері. 🍕', 'La diplomatie sauve les dîners. 🍕', 'La diplomacia salva cenas. 🍕') },
    ],
  },
  {
    id: 'fun-office-pet',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Office Vibe', 'Офісний vibe', 'Ambiance bureau', 'Ambiente de oficina'),
    steps: [
      { kind: 'bot', text: L('Office mascot: dog or cat?', 'Маскот офісу: собака чи кіт?', 'La mascotte du bureau : chien ou chat ?', 'Mascota de la oficina: ¿perro o gato?') },
      { kind: 'choices', opts: [L('Both. We negotiate.', 'Обидва. Домовимось.', 'Les deux. On négocie.', 'Los dos. Negociamos.'), L('Goldfish — low drama', 'Золота рибка — без драм', 'Un poisson rouge — zéro drame', 'Un pez — cero dramas')], pick: 0 },
      { kind: 'bot', text: L('"Both" is the right answer to most office polls.', '«Обидва» — правильна відповідь у більшості опитувань офісу.', '« Les deux » est la bonne réponse à presque tous les sondages de bureau.', '“Los dos” es la respuesta correcta en casi todas las encuestas de oficina.') },
    ],
  },
  {
    id: 'fun-friday',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Manager', 'Менеджер', 'Manager', 'Manager'),
    steps: [
      { kind: 'bot', text: L('It\'s 4:55 PM Friday. A "tiny" request lands.', '16:55, пʼятниця. Прилітає «маленький» запит.', 'Vendredi, 16 h 55. Une « petite » demande arrive.', 'Viernes, 16:55. Llega una petición “pequeñita”.') },
      { kind: 'choices', opts: [L('"Logged. First thing Monday."', '«Записав. Першим у понеділок.»', '« C’est noté. Lundi à la première heure. »', '“Anotado. El lunes a primera hora.”'), L('Open the laptop, sigh deeply', 'Відкрити ноут, важко зітхнути', 'Rouvrir l’ordinateur en soupirant', 'Abrir el portátil con un gran suspiro')], pick: 0 },
      { kind: 'bot', text: L('Mondays exist for a reason. 😌', 'Понеділки існують не просто так. 😌', 'Les lundis n’existent pas pour rien. 😌', 'Los lunes existen por algo. 😌') },
    ],
  },
  {
    id: 'fun-wifi',
    name: L('Nazar', 'Назар', 'Nazar', 'Nazar'),
    status: L('IT', 'IT', 'IT', 'IT'),
    steps: [
      { kind: 'bot', text: L('Wi-Fi is mysteriously down. Step one?', 'Wi-Fi загадково впав. Крок 1?', 'Le Wi-Fi est mystérieusement tombé. Première étape ?', 'El Wi-Fi se ha caído misteriosamente. ¿Primer paso?') },
      { kind: 'choices', opts: [L("Turn it off and on again", 'Вимкнути й увімкнути', 'L’éteindre et le rallumer', 'Apagar y volver a encender'), L('Blame the calendar', 'Звинуватити календар', 'Accuser le calendrier', 'Culpar al calendario')], pick: 0 },
      { kind: 'bot', text: L('The ancient art. Works ~80% of the time.', 'Древнє мистецтво. Працює у ~80% випадків.', 'Un art ancestral. Ça marche dans ~80 % des cas.', 'El arte ancestral. Funciona ~80 % de las veces.') },
    ],
  },
  {
    id: 'fun-meeting-could-be-email',
    name: L('Ksiu', 'Ксюша', 'Ksiu', 'Ksiu'),
    status: L('Coach', 'Коуч', 'Coach', 'Coach'),
    steps: [
      { kind: 'bot', text: L('"This meeting could\'ve been an email." Reply?', '«Цю зустріч можна було б листом». Відповідь?', '« Cette réunion aurait pu être un e-mail. » Votre réponse ?', '“Esta reunión podría haber sido un correo”. ¿Qué respondes?') },
      { kind: 'choices', opts: [L('Suggest async next time', 'Запропонувати async наступного разу', 'Proposer de l’asynchrone la prochaine fois', 'Proponer hacerlo asíncrono la próxima vez'), L('Stare into the camera', 'Дивитись у камеру мовчки', 'Fixer la caméra en silence', 'Mirar fijamente a la cámara')], pick: 0 },
      { kind: 'bot', text: L('Async is a love language for calendars.', 'Async — це мова любові для календарів.', 'L’asynchrone, c’est le langage de l’amour des agendas.', 'Lo asíncrono es el lenguaje del amor de los calendarios.') },
    ],
  },
]
