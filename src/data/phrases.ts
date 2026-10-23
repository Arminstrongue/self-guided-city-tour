/**
 * Frases úteis na língua local de cada destino (para dizer ou mostrar). O significado aparece na língua do viajante
 * (dicionário "ph"). Ficam no próprio código: funcionam sem internet.
 */
export const PHRASE_KEYS = ["hello", "thanks", "help", "lost", "where", "toilet", "english", "take", "police", "hospital"] as const;
export type PhraseKey = (typeof PHRASE_KEYS)[number];

/** Língua mais útil na rua para cada país dos destinos. */
export const LOCAL_LANG: Record<string, string> = {
  PT: "pt", BR: "pt", AO: "pt", ES: "es", MX: "es", AR: "es", FR: "fr", SN: "fr", MA: "fr", TN: "fr", IT: "it", NL: "nl", TR: "tr",
  DE: "de", AT: "de", CZ: "cs", AE: "ar", QA: "ar", SA: "ar", EG: "ar", JO: "ar", OM: "ar", TZ: "sw", KE: "sw", ET: "am",
  GB: "en", US: "en", CA: "en", SG: "en", ZA: "en", GH: "en", RW: "en"
};

export const PHRASES: Record<string, Record<PhraseKey, string>> = {
  en: { hello: "Hello", thanks: "Thank you", help: "Can you help me, please?", lost: "I'm lost", where: "Where is…?", toilet: "Where is the toilet?", english: "Do you speak English?", take: "Please take me to this address", police: "Please call the police", hospital: "I need a hospital" },
  pt: { hello: "Olá", thanks: "Obrigado / Obrigada", help: "Pode ajudar-me, por favor?", lost: "Estou perdido / perdida", where: "Onde fica…?", toilet: "Onde é a casa de banho?", english: "Fala inglês?", take: "Leve-me a esta morada, por favor", police: "Chame a polícia, por favor", hospital: "Preciso de um hospital" },
  es: { hello: "Hola", thanks: "Gracias", help: "¿Me puede ayudar, por favor?", lost: "Estoy perdido / perdida", where: "¿Dónde está…?", toilet: "¿Dónde está el baño?", english: "¿Habla inglés?", take: "Lléveme a esta dirección, por favor", police: "Llame a la policía, por favor", hospital: "Necesito un hospital" },
  fr: { hello: "Bonjour", thanks: "Merci", help: "Pouvez-vous m'aider, s'il vous plaît ?", lost: "Je suis perdu / perdue", where: "Où est… ?", toilet: "Où sont les toilettes ?", english: "Parlez-vous anglais ?", take: "Emmenez-moi à cette adresse, s'il vous plaît", police: "Appelez la police, s'il vous plaît", hospital: "J'ai besoin d'un hôpital" },
  de: { hello: "Hallo", thanks: "Danke", help: "Können Sie mir bitte helfen?", lost: "Ich habe mich verlaufen", where: "Wo ist…?", toilet: "Wo ist die Toilette?", english: "Sprechen Sie Englisch?", take: "Bitte bringen Sie mich zu dieser Adresse", police: "Bitte rufen Sie die Polizei", hospital: "Ich brauche ein Krankenhaus" },
  it: { hello: "Ciao / Buongiorno", thanks: "Grazie", help: "Mi può aiutare, per favore?", lost: "Mi sono perso / persa", where: "Dov'è…?", toilet: "Dov'è il bagno?", english: "Parla inglese?", take: "Mi porti a questo indirizzo, per favore", police: "Chiami la polizia, per favore", hospital: "Ho bisogno di un ospedale" },
  nl: { hello: "Hallo", thanks: "Dank u wel", help: "Kunt u mij helpen, alstublieft?", lost: "Ik ben verdwaald", where: "Waar is…?", toilet: "Waar is het toilet?", english: "Spreekt u Engels?", take: "Breng me naar dit adres, alstublieft", police: "Bel de politie, alstublieft", hospital: "Ik heb een ziekenhuis nodig" },
  tr: { hello: "Merhaba", thanks: "Teşekkürler", help: "Bana yardım eder misiniz, lütfen?", lost: "Kayboldum", where: "… nerede?", toilet: "Tuvalet nerede?", english: "İngilizce biliyor musunuz?", take: "Lütfen beni bu adrese götürün", police: "Lütfen polisi arayın", hospital: "Hastaneye ihtiyacım var" },
  cs: { hello: "Dobrý den", thanks: "Děkuji", help: "Můžete mi prosím pomoct?", lost: "Ztratil jsem se / Ztratila jsem se", where: "Kde je…?", toilet: "Kde je toaleta?", english: "Mluvíte anglicky?", take: "Prosím, odvezte mě na tuto adresu", police: "Zavolejte prosím policii", hospital: "Potřebuji nemocnici" },
  ar: { hello: "مرحبا", thanks: "شكرا", help: "هل يمكنك مساعدتي من فضلك؟", lost: "أنا تائه", where: "أين…؟", toilet: "أين الحمام؟", english: "هل تتكلم الإنجليزية؟", take: "خذني إلى هذا العنوان من فضلك", police: "اتصل بالشرطة من فضلك", hospital: "أحتاج إلى مستشفى" },
  sw: { hello: "Habari / Jambo", thanks: "Asante", help: "Tafadhali, unaweza kunisaidia?", lost: "Nimepotea", where: "… iko wapi?", toilet: "Choo kiko wapi?", english: "Unazungumza Kiingereza?", take: "Tafadhali nipeleke kwenye anwani hii", police: "Tafadhali piga simu polisi", hospital: "Nahitaji hospitali" },
  am: { hello: "ሰላም (Selam)", thanks: "አመሰግናለሁ (Ameseginalehu)", help: "እባክዎ ሊረዱኝ ይችላሉ? (Ebakwo liredugn yichilalu?)", lost: "ጠፍቻለሁ (Tefichalehu)", where: "… የት ነው? (… yet new?)", toilet: "መጸዳጃ ቤት የት ነው? (Metsedaja bet yet new?)", english: "እንግሊዝኛ ይናገራሉ? (Englizigna yinageralu?)", take: "እባክዎ ወደዚህ አድራሻ ይውሰዱኝ (Ebakwo wedezih adrasha yiwesidugn)", police: "እባክዎ ፖሊስ ይጥሩ (Ebakwo polis yitru)", hospital: "ሆስፒታል ያስፈልገኛል (Hospital yasfelegnal)" }
};

/** BCP-47 para a voz do telemóvel (sintetizador). */
export const SPEECH_LANG: Record<string, string> = { en: "en-GB", pt: "pt-PT", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT", nl: "nl-NL", tr: "tr-TR", cs: "cs-CZ", ar: "ar-SA", sw: "sw-KE", am: "am-ET" };
