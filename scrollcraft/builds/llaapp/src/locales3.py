# -*- coding: utf-8 -*-
import json, io, collections, sys

# Only what the page actually renders. Everything else belonged to the page we
# deleted and was still being downloaded by every visitor in five languages.
L = {
"en": {
 "meta":{"title":"AI Transformation & Custom Software in Vancouver, BC | LLAAPP",
   "description":"Custom software and AI transformation from Vancouver, BC. I consult and build AI products engineered to hold up at millions of users."},
 "wfHeroTitle":"AI products built for millions.",
 "wfHeroLead":"Custom software and AI transformation, engineered in Vancouver, British Columbia.",
 "wfCta":"Request a technical briefing","wfEmail":"Email me",
 "wfAuditTitle":"Most AI never leaves the pilot.",
 "wfAuditBody":"I consult before I build. Every use case ranked by cost, risk and payback, so the thing that ships is the thing that pays.",
 "wfBuildTitle":"Elite is a standard, not an adjective.",
 "wfBuildBody":"Architecture, security and observability from the first commit, deployable in Canadian regions when your governance needs it. Built to hold up when the download count does.",
 "wfWorkTitle":"This is not a logo wall.",
 "wfWorkBody":"Every screen from here down is a product I helped build, including apps that reached millions of users.",
 "wfWorkEyebrow":"Products I helped build",
 "wfWorkMeta":"My role on each of these is available on request, along with references.",
 "wfFounderRole":"Founder & Principal Engineer, LLAAPP.com",
 "wfCloseTitle":"Own the 2027 transform.",
 "wfCloseBody":"Vancouver’s sovereign AI compute lands through 2026. LLAAPP.com is my practice: I take the briefing myself, I stay on the build, and you keep my direct line.",
 "wfLeg1":"Vancouver","wfLeg2":"Consult","wfLeg3":"Build","wfLeg4":"Scale","wfLeg5":"2027"},

# usted throughout: this page is read by executives, and tu was out of step
# with vous and Sie on the same site.
"es": {
 "meta":{"title":"Software a Medida e IA en Vancouver, BC | LLAAPP",
   "description":"Software a medida y transformacion con IA desde Vancouver, BC. Asesoro y construyo productos de IA disenados para sostenerse con millones de usuarios."},
 "wfHeroTitle":"Productos de IA para millones.",
 "wfHeroLead":"Software a medida y transformación con IA, diseñado en Vancouver, Columbia Británica.",
 "wfCta":"Solicitar una sesión técnica","wfEmail":"Escríbame",
 "wfAuditTitle":"Casi ninguna IA sale del piloto.",
 "wfAuditBody":"Asesoro antes de construir. Cada caso de uso ordenado por coste, riesgo y retorno, para que lo que se lanza sea lo que paga.",
 "wfBuildTitle":"Élite es un estándar, no un adjetivo.",
 "wfBuildBody":"Arquitectura, seguridad y observabilidad desde el primer commit, desplegable en regiones canadienses cuando su gobernanza lo exige. Construido para aguantar cuando aguanta el contador de descargas.",
 "wfWorkTitle":"Esto no es un muro de logos.",
 "wfWorkBody":"Cada pantalla de aquí en adelante es un producto que ayudé a construir, incluidas apps que alcanzaron millones de usuarios.",
 "wfWorkEyebrow":"Productos que ayudé a construir",
 "wfWorkMeta":"Mi rol en cada uno está disponible a solicitud, junto con referencias.",
 "wfFounderRole":"Fundador e Ingeniero Principal, LLAAPP.com",
 "wfCloseTitle":"Adelántese al cambio de 2027.",
 "wfCloseBody":"La computación soberana de IA de Vancouver llega a lo largo de 2026. LLAAPP.com es mi práctica: tomo la sesión técnica yo mismo, sigo en la construcción y usted conserva mi línea directa.",
 "wfLeg1":"Vancouver","wfLeg2":"Asesoría","wfLeg3":"Construcción","wfLeg4":"Escala","wfLeg5":"2027"},

"fr": {
 "meta":{"title":"Logiciel sur mesure et IA à Vancouver, BC | LLAAPP",
   "description":"Logiciel sur mesure et transformation par l'IA depuis Vancouver. Je conseille et construis des produits d'IA conçus pour tenir à des millions d'utilisateurs."},
 "wfHeroTitle":"Des produits d'IA pour des millions.",
 "wfHeroLead":"Logiciel sur mesure et transformation par l'IA, conçus à Vancouver, en Colombie-Britannique.",
 "wfCta":"Demander une session technique","wfEmail":"Écrivez-moi",
 "wfAuditTitle":"L'IA dépasse rarement le pilote.",
 "wfAuditBody":"Je conseille avant de construire. Chaque cas d'usage classé par coût, risque et retour, pour que ce qui sort soit ce qui rapporte.",
 "wfBuildTitle":"L'excellence est un standard, pas un adjectif.",
 "wfBuildBody":"Architecture, sécurité et observabilité dès le premier commit, déployables dans des régions canadiennes si votre gouvernance l'exige. Construit pour tenir quand le nombre de téléchargements tient.",
 "wfWorkTitle":"Ceci n'est pas un mur de logos.",
 "wfWorkBody":"Chaque écran à partir d'ici est un produit que j'ai contribué à construire, dont des applications qui ont atteint des millions d'utilisateurs.",
 "wfWorkEyebrow":"Produits que j'ai contribué à construire",
 "wfWorkMeta":"Mon rôle sur chacun est disponible sur demande, avec des références.",
 "wfFounderRole":"Fondateur et ingénieur principal, LLAAPP.com",
 "wfCloseTitle":"Prenez 2027 de vitesse.",
 "wfCloseBody":"La puissance de calcul souveraine de Vancouver arrive au cours de 2026. LLAAPP.com est mon cabinet : je mène la session technique moi-même, je reste sur la construction, et vous gardez ma ligne directe.",
 "wfLeg1":"Vancouver","wfLeg2":"Conseil","wfLeg3":"Construction","wfLeg4":"Échelle","wfLeg5":"2027"},

"de": {
 "meta":{"title":"Individuelle Software & KI in Vancouver, BC | LLAAPP",
   "description":"Individuelle Software und KI-Transformation aus Vancouver. Ich berate und baue KI-Produkte, die auch bei Millionen Nutzern tragen."},
 "wfHeroTitle":"KI-Produkte für Millionen.",
 "wfHeroLead":"Individuelle Software und KI-Transformation, entwickelt in Vancouver, British Columbia.",
 "wfCta":"Technisches Briefing anfragen","wfEmail":"Schreiben Sie mir",
 "wfAuditTitle":"KI kommt selten über den Piloten hinaus.",
 "wfAuditBody":"Ich berate, bevor ich baue. Jeder Anwendungsfall nach Kosten, Risiko und Amortisation geordnet, damit das Ausgelieferte auch das Tragende ist.",
 "wfBuildTitle":"Elite ist ein Standard, kein Adjektiv.",
 "wfBuildBody":"Architektur, Sicherheit und Observability ab dem ersten Commit, auf Wunsch in kanadischen Regionen betrieben. Gebaut, um zu tragen, wenn die Downloadzahl trägt.",
 "wfWorkTitle":"Das ist keine Logowand.",
 "wfWorkBody":"Jeder Bildschirm ab hier ist ein Produkt, an dem ich mitgebaut habe, darunter Apps mit Millionen Nutzern.",
 "wfWorkEyebrow":"Produkte, an denen ich mitgebaut habe",
 "wfWorkMeta":"Meine Rolle bei jedem davon ist auf Anfrage verfügbar, mit Referenzen.",
 "wfFounderRole":"Gründer und leitender Ingenieur, LLAAPP.com",
 "wfCloseTitle":"Sichern Sie sich 2027.",
 "wfCloseBody":"Vancouvers souveräne KI-Rechenleistung kommt im Lauf von 2026. LLAAPP.com ist meine Praxis: Ich führe das Briefing selbst, ich bleibe am Bau, und Sie behalten meine Durchwahl.",
 "wfLeg1":"Vancouver","wfLeg2":"Beratung","wfLeg3":"Aufbau","wfLeg4":"Skalierung","wfLeg5":"2027"},

# voi throughout. The old file mixed "i vostri dati" with "lavorerai con me".
"it": {
 "meta":{"title":"Software su misura e IA a Vancouver, BC | LLAAPP",
   "description":"Software su misura e trasformazione IA da Vancouver. Consiglio e costruisco prodotti di IA progettati per reggere milioni di utenti."},
 "wfHeroTitle":"Prodotti di IA per milioni.",
 "wfHeroLead":"Software su misura e trasformazione IA, progettati a Vancouver, British Columbia.",
 "wfCta":"Richiedi una sessione tecnica","wfEmail":"Scrivimi",
 "wfAuditTitle":"L'IA supera raramente il pilota.",
 "wfAuditBody":"Consiglio prima di costruire. Ogni caso d'uso ordinato per costo, rischio e ritorno, così ciò che esce è ciò che rende.",
 "wfBuildTitle":"Élite è uno standard, non un aggettivo.",
 "wfBuildBody":"Architettura, sicurezza e osservabilità dal primo commit, distribuibili in regioni canadesi quando la vostra governance lo richiede. Costruito per reggere quando regge il contatore dei download.",
 "wfWorkTitle":"Questo non è un muro di loghi.",
 "wfWorkBody":"Ogni schermata da qui in avanti è un prodotto che ho contribuito a costruire, incluse app che hanno raggiunto milioni di utenti.",
 "wfWorkEyebrow":"Prodotti che ho contribuito a costruire",
 "wfWorkMeta":"Il mio ruolo su ciascuno è disponibile su richiesta, insieme alle referenze.",
 "wfFounderRole":"Fondatore e Ingegnere Principale, LLAAPP.com",
 "wfCloseTitle":"Arrivate primi al 2027.",
 "wfCloseBody":"La potenza di calcolo sovrana di Vancouver arriva nel corso del 2026. LLAAPP.com è il mio studio: conduco io stesso la sessione tecnica, resto sulla costruzione e voi tenete la mia linea diretta.",
 "wfLeg1":"Vancouver","wfLeg2":"Consulenza","wfLeg3":"Costruzione","wfLeg4":"Scala","wfLeg5":"2027"},
}
for lang, d in L.items():
    out = collections.OrderedDict()
    out["meta"] = d["meta"]
    for k, v in d.items():
        if k != "meta": out[k] = v
    for base in sys.argv[1:]:
        io.open('%s/%s.json' % (base, lang), 'w', encoding='utf-8').write(
            json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print(lang, len(out), 'keys')
