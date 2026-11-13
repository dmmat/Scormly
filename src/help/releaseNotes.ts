import type { Language } from '../i18n/types'

// Builder release notes for the "What's new" dialog, newest first. Add an
// entry when shipping user-visible changes; the id doubles as the "seen" marker
// (a new id lights up the Help badge once for returning authors).
export interface Release {
  id: string
  /** YYYY-MM-DD; omitted while the release is still in progress. */
  date?: string
  items: Record<Language, string[]>
}

export const RELEASES: Release[] = [
  {
    id: '2026-11-13',
    date: '2026-11-13',
    items: {
      en: ['New interface language: German. The builder and the site (scormly.app/de) now speak English, Ukrainian, French, Spanish and German; pick the language in the top bar.'],
      uk: ['Нова мова інтерфейсу: німецька. Конструктор і сайт (scormly.app/de) тепер доступні англійською, українською, французькою, іспанською та німецькою; мову можна вибрати у верхній панелі.'],
      fr: ['Nouvelle langue d’interface : l’allemand. Le constructeur et le site (scormly.app/de) existent désormais en anglais, ukrainien, français, espagnol et allemand ; choisissez la langue dans la barre du haut.'],
      es: ['Nuevo idioma de la interfaz: alemán. El constructor y el sitio (scormly.app/de) ya están en inglés, ucraniano, francés, español y alemán; elige el idioma en la barra superior.'],
      de: ['Neue Oberflächensprache: Deutsch. Der Builder und die Website (scormly.app/de) sprechen jetzt Englisch, Ukrainisch, Französisch, Spanisch und Deutsch; die Sprache wählen Sie in der oberen Leiste.'],
    },
  },
  {
    id: '2026-11-12',
    date: '2026-11-12',
    items: {
      en: [
        'The builder and the site now speak French and Spanish: pick the language in the top bar.',
        'Shorter addresses: scormly.app/app for the builder, scormly.app/demo for the sample course. Old links still work.',
        'The site has an address for each language: scormly.app/uk, scormly.app/fr and scormly.app/es.',
        'The builder fits small screens better: the top bar stays on one line, long headings wrap.',
        'A tab-only project shows an amber “!” by its name instead of a banner, and leaving it offers to download the .zip first.',
        'The tour now covers review comments.',
      ],
      uk: [
        'Конструктор і сайт тепер доступні французькою та іспанською: мову можна вибрати у верхній панелі.',
        'Коротші адреси: scormly.app/app для конструктора, scormly.app/demo для прикладу курсу. Старі посилання працюють.',
        'Сайт має окрему адресу для кожної мови: scormly.app/uk, scormly.app/fr і scormly.app/es.',
        'Конструктор зручніший на малих екранах: верхня панель в один рядок, довгі заголовки переносяться.',
        'Проєкт лише у вкладці позначено жовтим «!» біля назви замість смуги, а перед виходом пропонується завантажити .zip.',
        'У турі з’явився крок про коментарі.',
      ],
      fr: [
        'L’éditeur et le site sont désormais disponibles en français et en espagnol : choisissez la langue dans la barre supérieure.',
        'Adresses plus courtes : scormly.app/app pour l’éditeur, scormly.app/demo pour le cours d’exemple. Les anciens liens fonctionnent toujours.',
        'Le site a une adresse pour chaque langue : scormly.app/uk, scormly.app/fr et scormly.app/es.',
        'L’éditeur s’adapte mieux aux petits écrans : la barre supérieure tient sur une seule ligne, les titres longs passent à la ligne.',
        'Un projet qui n’existe que dans l’onglet affiche un « ! » orange à côté de son nom au lieu d’un bandeau, et Scormly propose de télécharger le .zip avant de le quitter.',
        'La visite guidée présente désormais les commentaires de relecture.',
      ],
      es: [
        'El editor y el sitio ya están disponibles en español y en francés: elige el idioma en la barra superior.',
        'Direcciones más cortas: scormly.app/app para el editor y scormly.app/demo para el curso de ejemplo. Los enlaces antiguos siguen funcionando.',
        'El sitio tiene una dirección para cada idioma: scormly.app/uk, scormly.app/fr y scormly.app/es.',
        'El editor se adapta mejor a las pantallas pequeñas: la barra superior se mantiene en una sola línea y los títulos largos pasan a la línea siguiente.',
        'Un proyecto que solo existe en la pestaña muestra un “!” ámbar junto a su nombre en lugar de un aviso, y al salir se ofrece descargar antes el .zip.',
        'El recorrido ahora incluye los comentarios de revisión.',
      ],
      de: [
        'Der Builder und die Website sprechen jetzt auch Deutsch: Die Sprache wählen Sie in der oberen Leiste.',
        'Kürzere Adressen: scormly.app/app für den Builder, scormly.app/demo für den Beispielkurs. Alte Links funktionieren weiterhin.',
        'Die Website hat für jede Sprache eine eigene Adresse: scormly.app/uk, scormly.app/fr, scormly.app/es und scormly.app/de.',
        'Der Builder passt besser auf kleine Bildschirme: Die obere Leiste bleibt einzeilig, lange Überschriften werden umgebrochen.',
        'Ein Projekt, das nur im Tab existiert, zeigt statt eines Banners ein oranges „!“ neben seinem Namen, und beim Verlassen wird angeboten, zuerst die .zip herunterzuladen.',
        'Die Tour behandelt jetzt auch Review-Kommentare.',
      ],
    },
  },
  {
    // Bumped from '2026-11-09' when review comments joined this release, so
    // authors who saw its first items get the badge again.
    id: '2026-11-09-review',
    date: '2026-11-09',
    items: {
      en: [
        'Review comments: comment on any block, reply and resolve — in the editor or in Preview, while you go through the course as a learner. For colleagues, or as notes to yourself for later. No accounts: just type your name, or pick one of the people who have commented.',
        'Comments are kept in the project’s own comments.json file, travel in the project .zip and never reach the exported course. When a reviewer’s .zip comes back, their comments are added to yours — or bring in only the comments and keep your course as it is.',
        'New Widget block: write your own HTML, CSS and JavaScript, or upload an .html page or a .zip site — for widgets, simulations, calculators and mini-games. It plays in the exported course too.',
        'Widget pages match your course: the theme color, button shape and fonts, plus ready-made classes for buttons, cards, fields and feedback. Turn course styles off for a page with its own design.',
        '“Copy instructions for AI” in the block: paste them into a chat assistant with what you need, and the page it writes drops straight in. AGENTS.md in every project explains it too.',
        'The sample course has a “Link detective” widget: spot who really owns a web address — a live example of what the Widget block can do.',
        'Preview: “Complete the test” → Passed / Not passed answers and submits a test in one click, so you can check the result screen and what comes after it without answering by hand.',
      ],
      uk: [
        'Рецензування: коментуйте будь-який блок, відповідайте й позначайте вирішеним — у редакторі або в перегляді, поки проходите курс як слухач. Для колег або собі на потім. Без облікових записів: просто вкажіть ім’я чи виберіть когось із тих, хто вже коментував.',
        'Коментарі зберігаються в окремому файлі проєкту comments.json, їдуть разом із .zip проєкту й ніколи не потрапляють в експортований курс. Коли .zip повертається від рецензента, його коментарі додаються до ваших — або можна забрати лише коментарі, а курс лишити як є.',
        'Новий блок «Віджет»: пишіть власний HTML, CSS і JavaScript або завантажуйте сторінку .html чи сайт у .zip — для віджетів, симуляцій, калькуляторів і міні-ігор. Працює й в експортованому курсі.',
        'Сторінки в блоці «Віджет» виглядають як курс: колір теми, форма кнопок і шрифти, а ще готові класи для кнопок, карток, полів і відгуків. Для сторінки з власним дизайном стилі курсу можна вимкнути.',
        '«Скопіювати інструкцію для AI» в блоці: вставте її в чат-асистента разом з описом того, що потрібно, — і написана ним сторінка одразу підійде. Те саме пояснює AGENTS.md у кожному проєкті.',
        'У прикладі курсу з’явився віджет «Детектив посилань»: визначте, кому насправді належить адреса сайту, — живий приклад того, що вміє блок «Віджет».',
        'Перегляд: «Пройти тест» → «Успішно» / «Неуспішно» одним кліком відповідає на тест і надсилає його, щоб перевірити екран результату й те, що йде далі, без ручних відповідей.',
      ],
      fr: [
        'Commentaires de relecture : commentez n’importe quel bloc, répondez et résolvez — dans l’éditeur ou dans l’aperçu, pendant que vous parcourez le cours comme un apprenant. Pour vos collègues, ou comme notes pour vous-même. Pas de compte : saisissez simplement votre nom, ou choisissez celui d’une personne qui a déjà commenté.',
        'Les commentaires sont conservés dans le fichier comments.json du projet, voyagent dans le .zip du projet et n’apparaissent jamais dans le cours exporté. Quand le .zip d’un relecteur vous revient, ses commentaires s’ajoutent aux vôtres — ou importez uniquement les commentaires et gardez votre cours tel quel.',
        'Nouveau bloc Widget : écrivez votre propre HTML, CSS et JavaScript, ou importez une page .html ou un site en .zip — pour des widgets, des simulations, des calculateurs et des mini-jeux. Il fonctionne aussi dans le cours exporté.',
        'Les pages du Widget s’accordent à votre cours : couleur du thème, forme des boutons et polices, plus des classes prêtes à l’emploi pour les boutons, les cartes, les champs et le feedback. Désactivez les styles du cours pour une page qui a son propre design.',
        '« Copier les instructions pour l’IA » dans le bloc : collez-les dans un assistant conversationnel avec votre demande, et la page qu’il écrit s’intègre directement. Le fichier AGENTS.md de chaque projet l’explique aussi.',
        'Le cours d’exemple contient un widget « Détective de liens » : repérez à qui appartient vraiment une adresse web — un exemple concret de ce que permet le bloc Widget.',
        'Aperçu : « Passer le test » → Réussi / Non réussi répond à un test et le valide en un clic, pour vérifier l’écran de résultat et la suite sans répondre à la main.',
      ],
      es: [
        'Comentarios de revisión: comenta cualquier bloque, responde y resuelve, en el editor o en la vista previa, mientras recorres el curso como un alumno. Para tus colegas o como notas para ti. Sin cuentas: basta con escribir tu nombre o elegir el de alguien que ya haya comentado.',
        'Los comentarios se guardan en el archivo comments.json del propio proyecto, viajan en el .zip del proyecto y nunca llegan al curso exportado. Cuando vuelve el .zip de un revisor, sus comentarios se añaden a los tuyos; o importa solo los comentarios y deja tu curso como está.',
        'Nuevo bloque Widget: escribe tu propio HTML, CSS y JavaScript, o sube una página .html o un sitio en .zip, para widgets, simulaciones, calculadoras y minijuegos. También funciona en el curso exportado.',
        'Las páginas del Widget combinan con tu curso: el color del tema, la forma de los botones y las fuentes, además de clases listas para usar para botones, tarjetas, campos y retroalimentación. Desactiva los estilos del curso si la página tiene su propio diseño.',
        '“Copiar instrucciones para la IA” en el bloque: pégalas en un asistente de chat junto con lo que necesitas, y la página que escriba encajará directamente. El AGENTS.md de cada proyecto también lo explica.',
        'El curso de ejemplo incluye el widget “Detective de enlaces”: descubre a quién pertenece realmente una dirección web. Es un ejemplo real de lo que puede hacer el bloque Widget.',
        'Vista previa: “Completar la prueba” → Aprobado / No aprobado responde y envía una prueba con un clic, para que revises la pantalla de resultados y lo que viene después sin responder a mano.',
      ],
      de: [
        'Review-Kommentare: Kommentieren Sie jeden Block, antworten Sie und markieren Sie Kommentare als erledigt — im Editor oder in der Vorschau, während Sie den Kurs als Lernende durchgehen. Für Kolleginnen und Kollegen oder als Notizen für später an sich selbst. Keine Konten: Geben Sie einfach Ihren Namen ein oder wählen Sie jemanden, der bereits kommentiert hat.',
        'Kommentare liegen in der eigenen Datei comments.json des Projekts, reisen in der Projekt-.zip mit und gelangen nie in den exportierten Kurs. Kommt die .zip eines Reviewers zurück, werden seine Kommentare zu Ihren hinzugefügt — oder Sie übernehmen nur die Kommentare und behalten Ihren Kurs, wie er ist.',
        'Neuer Widget-Block: Schreiben Sie eigenes HTML, CSS und JavaScript oder laden Sie eine .html-Seite oder eine Website als .zip hoch — für Widgets, Simulationen, Rechner und Minispiele. Er funktioniert auch im exportierten Kurs.',
        'Widget-Seiten passen zu Ihrem Kurs: Themenfarbe, Button-Form und Schriften, dazu fertige Klassen für Buttons, Karten, Felder und Feedback. Schalten Sie die Kursstile für eine Seite mit eigenem Design aus.',
        '„KI-Anweisungen kopieren“ im Block: Fügen Sie sie mit Ihrem Anliegen in einen Chat-Assistenten ein, und die Seite, die er schreibt, lässt sich direkt einsetzen. Die AGENTS.md in jedem Projekt erklärt es ebenfalls.',
        'Der Beispielkurs enthält ein Widget „Link-Detektiv“: Finden Sie heraus, wem eine Webadresse wirklich gehört — ein lebendiges Beispiel dafür, was der Widget-Block kann.',
        'Vorschau: „Test abschließen“ → Bestanden / Nicht bestanden beantwortet und sendet einen Test mit einem Klick ab, damit Sie den Ergebnisbildschirm und alles danach prüfen können, ohne von Hand zu antworten.',
      ],
    },
  },
  {
    id: '2026-10-26',
    date: '2026-10-26',
    items: {
      en: [
        'Save a course as a .zip and open it in any browser — easy to share with colleagues or hand to an AI assistant. Courses can also live in this browser and survive reloads.',
        'New blocks: process diagram, step-by-step guide, comparison, before / after slider and reflection.',
        'Tables and links in text, plus shortcuts like Ctrl+B and Ctrl+K.',
        'Continue reveals the next part of a lesson; your own theme colors; more reliable LMS results.',
      ],
      uk: [
        'Зберігайте курс як .zip і відкривайте в будь-якому браузері — зручно ділитися з колегами чи передати ШІ-асистентові. Курси також можна тримати в браузері — вони переживуть оновлення сторінки.',
        'Нові блоки: схема процесу, покрокова інструкція, порівняння, слайдер «до / після» та рефлексія.',
        'Таблиці й посилання в тексті та гарячі клавіші на кшталт Ctrl+B і Ctrl+K.',
        '«Продовжити» відкриває наступну частину уроку; власні кольори теми; надійніші результати в LMS.',
      ],
      fr: [
        'Enregistrez un cours au format .zip et ouvrez-le dans n’importe quel navigateur — pratique pour le partager avec des collègues ou le confier à un assistant IA. Les cours peuvent aussi rester dans ce navigateur et survivre aux rechargements.',
        'Nouveaux blocs : schéma de processus, guide pas à pas, comparaison, curseur avant / après et réflexion.',
        'Tableaux et liens dans le texte, et des raccourcis comme Ctrl+B et Ctrl+K.',
        'Continuer révèle la suite d’une leçon ; vos propres couleurs de thème ; des résultats plus fiables dans le LMS.',
      ],
      es: [
        'Guarda un curso como .zip y ábrelo en cualquier navegador: fácil de compartir con colegas o de pasar a un asistente de IA. Los cursos también pueden vivir en este navegador y se conservan al recargar.',
        'Nuevos bloques: diagrama de proceso, guía paso a paso, comparación, control deslizante antes / después y reflexión.',
        'Tablas y enlaces en el texto, además de atajos como Ctrl+B y Ctrl+K.',
        'Continuar revela la siguiente parte de una lección; tus propios colores de tema; resultados más fiables en el LMS.',
      ],
      de: [
        'Speichern Sie einen Kurs als .zip und öffnen Sie ihn in jedem Browser — leicht mit Kolleginnen und Kollegen zu teilen oder an einen KI-Assistenten zu übergeben. Kurse können auch in diesem Browser liegen und bleiben nach dem Neuladen erhalten.',
        'Neue Blöcke: Prozessdiagramm, Schritt-für-Schritt-Anleitung, Vergleich, Vorher-nachher-Regler und Reflexion.',
        'Tabellen und Links im Text sowie Kurzbefehle wie Strg+B und Strg+K.',
        '„Weiter“ blendet den nächsten Teil einer Lektion ein; eigene Themenfarben; zuverlässigere LMS-Ergebnisse.',
      ],
    },
  },
  {
    id: '2026-10-07',
    date: '2026-10-07',
    items: {
      en: [
        'Block styles: theme or photo backgrounds, padding and width, plus ready-made blocks.',
        'A cover page before the first lesson, with your own text and media.',
        'Quizzes mix every question type, now with ordering and fill in the blanks, under one Submit.',
        'New blocks and options: columns, carousel, image & text, attachments, quote styles, table width.',
      ],
      uk: [
        'Стилі блоків: фон із теми чи фото, відступи й ширина, а також готові блоки.',
        'Титульна сторінка перед першим уроком із вашим текстом і медіа.',
        'Квіз поєднує всі типи питань, тепер і впорядкування та пропуски, з однією кнопкою відповіді.',
        'Нові блоки й опції: колонки, карусель, фото й текст, вкладення, стилі цитат, ширина таблиці.',
      ],
      fr: [
        'Styles de bloc : arrière-plans aux couleurs du thème ou en photo, espacement et largeur, plus des blocs prêts à l’emploi.',
        'Une page de couverture avant la première leçon, avec vos propres textes et médias.',
        'Les quiz mélangent tous les types de questions, désormais avec la mise en ordre et le texte à trous, sous un seul bouton de validation.',
        'Nouveaux blocs et options : colonnes, carrousel, image et texte, pièces jointes, styles de citation, largeur des tableaux.',
      ],
      es: [
        'Estilos de bloque: fondos del tema o con foto, espaciado y ancho, además de bloques prediseñados.',
        'Una portada antes de la primera lección, con tu propio texto y multimedia.',
        'Los cuestionarios combinan todos los tipos de pregunta, ahora también ordenar y rellenar huecos, con un único botón de envío.',
        'Nuevos bloques y opciones: columnas, carrusel, imagen y texto, archivos adjuntos, estilos de cita, ancho de tabla.',
      ],
      de: [
        'Blockstile: Hintergründe aus Theme oder Foto, Innenabstand und Breite sowie fertige Blöcke.',
        'Eine Titelseite vor der ersten Lektion, mit eigenem Text und Medien.',
        'Quizze mischen alle Fragetypen, jetzt auch Sortieren und Lückentext, unter einem gemeinsamen Absenden.',
        'Neue Blöcke und Optionen: Spalten, Karussell, Bild & Text, Anhänge, Zitatstile, Tabellenbreite.',
      ],
    },
  },
  {
    id: '2026-10-06-2',
    date: '2026-10-06',
    items: {
      en: [
        'More reliable LMS tracking: resume, time spent and pass/fail reach the LMS more reliably, and a passed course stays passed.',
        'Stricter SCORM and cmi5 conformance, with the official schema files included for older LMSes.',
        'An honest completion screen: it says when the course isn’t complete or passed yet and links to the lessons to finish or retake.',
        'Player buttons follow the course language, and a new “Exit course” button returns to the LMS.',
      ],
      uk: [
        'Надійніше відстеження в LMS: місце зупинки, час і результат доходять до LMS надійніше, а складений курс лишається складеним.',
        'Суворіша відповідність SCORM і cmi5, а для старіших LMS у пакети додано офіційні файли схем.',
        'Чесний фінальний екран: повідомляє, якщо курс ще не завершено чи не складено, і дає посилання на уроки, які треба пройти чи перескласти.',
        'Кнопки плеєра говорять мовою курсу, а нова кнопка «Вийти з курсу» повертає до LMS.',
      ],
      fr: [
        'Suivi LMS plus fiable : la reprise, le temps passé et la réussite ou l’échec parviennent mieux au LMS, et un cours réussi le reste.',
        'Conformité SCORM et cmi5 plus stricte, avec les fichiers de schéma officiels inclus pour les LMS plus anciens.',
        'Un écran de fin honnête : il indique quand le cours n’est pas encore terminé ou réussi et renvoie vers les leçons à terminer ou à repasser.',
        'Les boutons du lecteur suivent la langue du cours, et un nouveau bouton « Quitter le cours » ramène au LMS.',
      ],
      es: [
        'Seguimiento más fiable en el LMS: la reanudación, el tiempo dedicado y el aprobado o suspenso llegan al LMS con más fiabilidad, y un curso aprobado sigue aprobado.',
        'Conformidad más estricta con SCORM y cmi5, con los archivos de esquema oficiales incluidos para los LMS más antiguos.',
        'Una pantalla final honesta: indica cuándo el curso aún no está completado o aprobado y enlaza a las lecciones que hay que terminar o repetir.',
        'Los botones del reproductor siguen el idioma del curso, y un nuevo botón “Salir del curso” vuelve al LMS.',
      ],
      de: [
        'Zuverlässigeres LMS-Tracking: Fortsetzen, Lernzeit und Bestanden/Nicht bestanden erreichen das LMS zuverlässiger, und ein bestandener Kurs bleibt bestanden.',
        'Strengere SCORM- und cmi5-Konformität, mit den offiziellen Schemadateien für ältere LMS.',
        'Ein ehrlicher Abschlussbildschirm: Er sagt, wenn der Kurs noch nicht abgeschlossen oder bestanden ist, und verlinkt auf die Lektionen, die noch zu beenden oder zu wiederholen sind.',
        'Die Player-Schaltflächen folgen der Kurssprache, und eine neue Schaltfläche „Kurs beenden“ führt zurück ins LMS.',
      ],
    },
  },
  {
    id: '2026-09-30',
    date: '2026-09-30',
    items: {
      en: [
        'Five new themes, including a hacker-style Terminal; exports now match each theme’s shapes.',
        'Accessible courses: a learner accessibility menu, full keyboard and screen-reader support, AA contrast.',
        'Captions and transcripts for video and audio, decorative images and a content language.',
        'The pre-export check flags accessibility gaps such as missing alt text or captions.',
      ],
      uk: [
        'П’ять нових тем, зокрема хакерська Terminal; експорт повторює форму кнопок і карток теми.',
        'Доступні курси: меню доступності для слухача, повна підтримка клавіатури й зчитувачів екрана, контраст AA.',
        'Субтитри й розшифровки для відео та аудіо, декоративні зображення і мова контенту.',
        'Перевірка перед експортом знаходить прогалини доступності, як-от відсутні alt-тексти чи субтитри.',
      ],
      fr: [
        'Cinq nouveaux thèmes, dont Terminal au style hacker ; les exports reprennent désormais les formes de chaque thème.',
        'Des cours accessibles : menu d’accessibilité pour l’apprenant, prise en charge complète du clavier et des lecteurs d’écran, contraste AA.',
        'Sous-titres et transcriptions pour la vidéo et l’audio, images décoratives et langue du contenu.',
        'La vérification avant export signale les lacunes d’accessibilité, comme un texte alternatif ou des sous-titres manquants.',
      ],
      es: [
        'Cinco temas nuevos, incluido Terminal, de estilo hacker; las exportaciones ahora respetan las formas de cada tema.',
        'Cursos accesibles: menú de accesibilidad para el alumno, compatibilidad total con teclado y lectores de pantalla, contraste AA.',
        'Subtítulos y transcripciones para video y audio, imágenes decorativas e idioma del contenido.',
        'La comprobación previa a la exportación señala carencias de accesibilidad, como textos alternativos o subtítulos que faltan.',
      ],
      de: [
        'Fünf neue Themes, darunter ein Terminal im Hacker-Stil; Exporte übernehmen jetzt die Formen jedes Themes.',
        'Barrierefreie Kurse: ein Barrierefreiheitsmenü für Lernende, volle Tastatur- und Screenreader-Unterstützung, AA-Kontrast.',
        'Untertitel und Transkripte für Video und Audio, dekorative Bilder und eine Inhaltssprache.',
        'Die Prüfung vor dem Export weist auf Barrierefreiheitslücken wie fehlenden Alternativtext oder fehlende Untertitel hin.',
      ],
    },
  },
  {
    id: '2026-09-29',
    date: '2026-09-29',
    items: {
      en: [
        'New blocks: image hotspots, timeline, and scored sort / order and fill-in-the-blanks exercises.',
        'A Help menu with a guided tour, Q&A and release notes; keyboard shortcuts everywhere.',
        'Insert a block anywhere, undo deletes from the notification, and a course check before export.',
        'Tabbed project settings with player language, lesson progress and a custom finish message.',
      ],
      uk: [
        'Нові блоки: hotspots на зображенні, таймлайн і оцінювані вправи на сортування та заповнення пропусків.',
        'Меню «Довідка» з туром, питаннями й відповідями та списком змін; гарячі клавіші всюди.',
        'Вставлення блоку будь-де, скасування видалення зі сповіщення й перевірка курсу перед експортом.',
        'Налаштування проєкту з вкладками: мова плеєра, прогрес уроків і власний текст фінального екрана.',
      ],
      fr: [
        'Nouveaux blocs : zones cliquables sur image, chronologie, et exercices notés de classement / mise en ordre et de texte à trous.',
        'Un menu Aide avec une visite guidée, des questions-réponses et les nouveautés ; des raccourcis clavier partout.',
        'Insérez un bloc n’importe où, annulez une suppression depuis la notification, et vérifiez le cours avant l’export.',
        'Paramètres du projet organisés en onglets, avec la langue du lecteur, la progression des leçons et un message de fin personnalisé.',
      ],
      es: [
        'Nuevos bloques: zonas interactivas en imagen, línea de tiempo y ejercicios puntuados de clasificar / ordenar y de rellenar huecos.',
        'Un menú Ayuda con un recorrido guiado, preguntas y respuestas y las novedades; atajos de teclado en todas partes.',
        'Inserta un bloque en cualquier lugar, deshaz una eliminación desde la notificación y comprueba el curso antes de exportarlo.',
        'Configuración del proyecto en pestañas, con el idioma del reproductor, el progreso de las lecciones y un mensaje final personalizado.',
      ],
      de: [
        'Neue Blöcke: Bild-Hotspots, Zeitleiste sowie bewertete Sortier- und Lückentext-Übungen.',
        'Ein Hilfemenü mit geführter Tour, Fragen & Antworten und Versionshinweisen; Tastenkürzel überall.',
        'Blöcke überall einfügen, Löschen über die Benachrichtigung rückgängig machen und eine Kursprüfung vor dem Export.',
        'Projekteinstellungen mit Registerkarten, mit Player-Sprache, Lektionsfortschritt und eigener Abschlussnachricht.',
      ],
    },
  },
  {
    id: '2026-05-23',
    date: '2026-05-23',
    items: {
      en: [
        'cmi5 (xAPI) export next to SCORM 2004 and 1.2.',
        'Course outline block, chat layout for dialogue scenarios, required video watching and step-by-step navigation.',
        'Richer LMS reporting: per-quiz objectives, detailed question interactions, learner name and language.',
        'Download a project as a .zip to share it.',
      ],
      uk: [
        'Експорт cmi5 (xAPI) поруч із SCORM 2004 і 1.2.',
        'Блок «Зміст курсу», чат-вигляд для діалогових сценаріїв, обов’язковий перегляд відео й покрокова навігація.',
        'Детальніші звіти в LMS: цілі для кожного тесту, докладні відповіді на питання, ім’я та мова слухача.',
        'Завантаження проєкту як .zip, щоб поділитися ним.',
      ],
      fr: [
        'Export cmi5 (xAPI) en plus de SCORM 2004 et 1.2.',
        'Bloc Sommaire du cours, présentation en chat pour les scénarios de dialogue, visionnage obligatoire des vidéos et navigation pas à pas.',
        'Des rapports LMS plus riches : objectifs par quiz, interactions détaillées par question, nom et langue de l’apprenant.',
        'Téléchargez un projet au format .zip pour le partager.',
      ],
      es: [
        'Exportación cmi5 (xAPI) junto a SCORM 2004 y 1.2.',
        'Bloque Índice del curso, diseño de chat para los escenarios de diálogo, visualización obligatoria de videos y navegación paso a paso.',
        'Informes más completos en el LMS: objetivos por cuestionario, interacciones detalladas por pregunta, nombre e idioma del alumno.',
        'Descarga un proyecto como .zip para compartirlo.',
      ],
      de: [
        'cmi5-(xAPI-)Export neben SCORM 2004 und 1.2.',
        'Block „Kursübersicht“, Chat-Layout für Dialogszenarien, verpflichtendes Ansehen von Videos und Schritt-für-Schritt-Navigation.',
        'Umfangreicheres LMS-Reporting: Ziele pro Quiz, detaillierte Fragen-Interaktionen, Name und Sprache der Lernenden.',
        'Ein Projekt als .zip herunterladen, um es zu teilen.',
      ],
    },
  },
]

export const LATEST_RELEASE = RELEASES[0].id
