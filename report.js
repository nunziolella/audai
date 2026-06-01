document.addEventListener('DOMContentLoaded', () => {
    
    // Recupera le risposte dal localStorage
    const savedAnswers = localStorage.getItem('aiAuditAnswers');
    let answers = {
        sector: 'other',
        teamSize: 'micro',
        painPoints: ['data_entry', 'reporting'],
        hoursWasted: '10',
        aiExperience: 'none'
    };

    if (savedAnswers) {
        try {
            answers = JSON.parse(savedAnswers);
        } catch (e) {
            console.error("Errore nel parsing delle risposte salvate", e);
        }
    }

    // --- Mappatura Settori ---
    const sectorMap = {
        ecommerce: "E-commerce & Retail",
        agency: "Agenzia Marketing & Comunicazione",
        professional: "Studio Professionale",
        manufacturing: "Settore Manifatturiero",
        services: "Azienda di Servizi",
        other: "la tua azienda"
    };

    // --- Update Header ---
    const today = new Date();
    document.getElementById('report-date').textContent = `Generato il: ${today.toLocaleDateString('it-IT')}`;
    const sectorName = sectorMap[answers.sector] || "la tua azienda";
    document.getElementById('report-sector-title').textContent = sectorName;

    // --- Calcolo ROI ---
    const hours = parseInt(answers.hoursWasted) || 15;
    const costPerHour = 25;
    const savingsPct = 0.6; // 60% time saved
    const weeklySavingsHours = Math.round(hours * savingsPct);
    const monthlySavingsEur = weeklySavingsHours * 4 * costPerHour;
    const yearlySavingsEur = monthlySavingsEur * 12;

    document.getElementById('roi-hours').textContent = `${weeklySavingsHours} ore`;
    document.getElementById('roi-monthly').textContent = monthlySavingsEur.toLocaleString('it-IT');
    document.getElementById('roi-yearly').textContent = yearlySavingsEur.toLocaleString('it-IT');

    // --- Mappatura Automazioni (Dettagliate per Report Completo) ---
    const detailedAutomations = {
        customer_support: {
            title: "Automazione Customer Care & Supporto",
            icon: "💬",
            desc: "Un chatbot intelligente alimentato da modelli linguistici avanzati (es. ChatGPT) può risolvere in autonomia fino all'80% delle richieste ricorrenti dei clienti (FAQ, stato ordini, resi), smistando solo i casi complessi al team umano.",
            steps: [
                "Crea una base di conoscenza esportando le tue FAQ o le conversazioni passate con i clienti.",
                "Usa un tool no-code come Chatbase per addestrare un bot sui tuoi dati.",
                "Integra il bot sul sito web (widget) o sui canali social (es. ManyChat per Instagram/Facebook).",
                "Imposta un fallback per cui, se l'AI non conosce la risposta, passa la chat a un operatore."
            ],
            tools: [
                { name: "Chatbase / Dante AI", desc: "Per creare chatbot basati sui tuoi documenti. Da $20/mese." },
                { name: "ManyChat", desc: "Automazione messaggistica social. Free tier, poi $15/mese." },
                { name: "Intercom (Fin)", desc: "Se usi già Intercom, l'add-on AI nativo. Fascia Premium." }
            ]
        },
        data_entry: {
            title: "Eliminazione Data Entry Manuale",
            icon: "📝",
            desc: "L'estrazione dati manuale da fatture, email o moduli è un enorme spreco di tempo e fonte di errori. L'AI oggi è in grado di leggere documenti non strutturati e popolare direttamente i tuoi database o CRM.",
            steps: [
                "Identifica il punto di ingresso dei dati (es. un indirizzo email aziendale dove arrivano fatture o ordini in PDF).",
                "Collega questo indirizzo a Zapier o Make.",
                "Usa un'azione AI (es. OpenAI ChatGPT in Make o Document AI) per estrarre campi specifici (nome, importo, data) dal testo/PDF.",
                "Aggiungi un'azione finale per salvare i dati estratti nel tuo gestionale, Airtable o Excel."
            ],
            tools: [
                { name: "Make.com (ex Integromat)", desc: "Piattaforma automazione visiva potente e flessibile. Da $9/mese." },
                { name: "ChatGPT (via API/Make)", desc: "Per interpretare il testo ed estrarre dati JSON strutturati. A consumo (pochissimi centesimi per doc)." },
                { name: "Docparser", desc: "Tool specifico per estrazione da PDF. Da $39/mese." }
            ]
        },
        reporting: {
            title: "Reportistica Auto-Generata",
            icon: "📊",
            desc: "L'AI può aggregare dati da fonti diverse, analizzarli e fornirti una sintesi discorsiva settimanale o mensile, senza dover aprire fogli di calcolo.",
            steps: [
                "Scegli dove vivono i tuoi dati principali (Google Analytics, CRM, Excel, Shopify).",
                "Crea un workflow (es. su Zapier) che si attiva ogni lunedì mattina alle 8:00.",
                "Il workflow raccoglie i dati della settimana precedente, li passa a un modello AI (prompt: 'Fai un riassunto esecutivo per il CEO di queste metriche e suggerisci 3 azioni').",
                "Invia il risultato come email, messaggio Slack o su Notion."
            ],
            tools: [
                { name: "Zapier", desc: "Il leader per connettere app senza codice. Piano base $20/mese." },
                { name: "Julius AI / ChatGPT Advanced Data Analysis", desc: "Per caricare CSV complessi e chiedere grafici e analisi conversazionali." }
            ]
        },
        content: {
            title: "Creazione Contenuti AI-Powered",
            icon: "✍️",
            desc: "Non si tratta di far scrivere tutto a ChatGPT, ma di usarlo come assistente per la bozza iniziale, il brainstorming, l'adattamento ai vari formati (da blog post a 5 post social) e la SEO.",
            steps: [
                "Definisci il 'tono di voce' del tuo brand e salvalo come prompt di sistema o Custom GPT.",
                "Inserisci i tuoi appunti, vocali (trascritti con Whisper) o link come contesto.",
                "Chiedi all'AI di generare una prima bozza completa, o di riadattare un testo esistente per i vari canali social.",
                "Revisione umana (fondamentale) prima della pubblicazione."
            ],
            tools: [
                { name: "ChatGPT Plus (Custom GPTs)", desc: "Crea versioni personalizzate di ChatGPT addestrate sul tuo stile. $20/mese." },
                { name: "Claude 3 (Anthropic)", desc: "Spesso considerato superiore a ChatGPT per la scrittura naturale e meno robotica." },
                { name: "OpusClip / Munch", desc: "Se fai video: per tagliare video lunghi in shorts/reels automatici virali." }
            ]
        },
        lead_management: {
            title: "Lead Scoring & Follow-up Intelligente",
            icon: "🎯",
            desc: "Non perdere mai un potenziale cliente a causa di risposte lente. Qualifica i lead in automatico e genera risposte email contestuali in base alle loro richieste.",
            steps: [
                "Connetti il tuo form di contatto web o le Lead Ads di Meta al tuo sistema di automazione.",
                "Fai analizzare la richiesta all'AI per assegnare un punteggio (Scoring: 'è un lead caldo o no?').",
                "Genera una bozza di risposta via email altamente personalizzata.",
                "Salva la bozza nella cartella 'Bozze' di Gmail o mandala su un canale Slack per un click-to-send."
            ],
            tools: [
                { name: "HubSpot AI", desc: "Se usi HubSpot, integra strumenti AI nativi per bozze e summarization." },
                { name: "Clay", desc: "Tool pazzesco per arricchire i lead: trova informazioni da LinkedIn/Web e crea email personalizzate." },
                { name: "Make + OpenAI", desc: "Per costruire flussi di routing dei lead completamente su misura." }
            ]
        },
        invoicing: {
            title: "Automazione e Smistamento Contabile",
            icon: "🧾",
            desc: "L'AI può leggere i giustificativi, le ricevute e assegnare la corretta categoria di spesa, inviando solleciti automatici (con un tono cortese ma fermo, scritto dall'AI) per le fatture scadute.",
            steps: [
                "Fai convergere tutte le ricevute in una cartella cloud (Google Drive).",
                "Usa un tool AI OCR per estrarre Fornitore, P.IVA, Importo e Data.",
                "Collega un flusso che passa i dati al tuo commercialista o al tuo software di fatturazione."
            ],
            tools: [
                { name: "Dext / Spendesk", desc: "Tool dedicati alla gestione spese con OCR potenziato." },
                { name: "ChatGPT Vision", desc: "Puoi fotografare scontrini ed estrarre i dati in Excel con un prompt." }
            ]
        },
        scheduling: {
            title: "Smart Scheduling e Meeting Notes",
            icon: "📅",
            desc: "L'AI non solo ti fissa gli appuntamenti, ma entra nelle tue call, trascrive tutto, crea i task successivi (to-do list) e manda la mail di recap.",
            steps: [
                "Usa uno strumento di booking come Cal.com o Calendly.",
                "Integra un bot AI che partecipa automaticamente alle tue riunioni Zoom/Meet/Teams.",
                "Ricevi immediatamente dopo la call il riassunto strutturato e i task delegati."
            ],
            tools: [
                { name: "Fireflies.ai / Otter.ai", desc: "Partecipano ai meeting, trascrivono e generano summary e action items." },
                { name: "Cal.com", desc: "Piattaforma di scheduling open source molto flessibile." }
            ]
        },
        orders: {
            title: "Ottimizzazione Gestione Ordini & Magazzino",
            icon: "📦",
            desc: "L'AI analizza i pattern storici di acquisto per prevedere rotture di stock e automatizzare il re-ordering presso i fornitori, oltre a tenere aggiornato il cliente.",
            steps: [
                "Estrai i dati storici dal tuo ERP o Shopify.",
                "Usa tool di analisi predittiva (o anche prompt avanzati in ChatGPT Plus) per individuare i trend di stagionalità.",
                "Imposta trigger di basso stock che mandano email precompilate (dall'AI) al fornitore per il riordino."
            ],
            tools: [
                { name: "Shopify Magic", desc: "Funzioni AI integrate in Shopify per descrizioni prodotti e inventory." },
                { name: "Zapier", desc: "Per inviare notifiche asincrone su Slack/Email allo staff di magazzino." }
            ]
        }
    };

    // --- Render Automations ---
    const container = document.getElementById('automations-container');
    const selectedPains = answers.painPoints && answers.painPoints.length > 0 ? answers.painPoints : ['data_entry', 'content']; 

    let html = '';

    selectedPains.forEach(painKey => {
        const auto = detailedAutomations[painKey];
        if (auto) {
            html += `
                <div class="automation-card">
                    <div class="automation-header">
                        <div class="automation-icon">${auto.icon}</div>
                        <h3 class="automation-title">${auto.title}</h3>
                    </div>
                    <div class="automation-body">
                        <p style="font-size: 1.05rem; line-height: 1.7;">${auto.desc}</p>
                        
                        <h4 style="margin-top: 24px; margin-bottom: 12px; color: var(--text-primary);">Come implementarlo:</h4>
                        <ol style="padding-left: 20px; color: var(--text-secondary); line-height: 1.7;">
                            ${auto.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>

                        <h4 style="margin-top: 24px; margin-bottom: 12px; color: var(--text-primary);">Tool Consigliati:</h4>
                        <div class="tool-grid">
                            ${auto.tools.map(tool => `
                                <div class="tool-card">
                                    <h4>${tool.name}</h4>
                                    <p>${tool.desc}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    // Se mancano automazioni selezionate o per errore
    if(html === '') {
        html = '<p>Dati del questionario non trovati. Assicurati di aver compilato il quiz iniziale.</p>';
    }

    container.innerHTML = html;
});
