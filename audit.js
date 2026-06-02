/* ============================================
   AUDAI — Quiz Engine & Score Generator
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    
    // =============================================
    // QUIZ ENGINE
    // =============================================
    const quizState = {
        currentStep: 1,
        totalSteps: 5,
        answers: {}
    };

    // Handle single-select option clicks (auto-advance)
    document.querySelectorAll('.quiz-options:not(.multi) .quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.quiz-options');
            const name = parent.dataset.name;
            const value = btn.dataset.value;

            // Deselect siblings
            parent.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // Save answer
            quizState.answers[name] = value;

            // Auto-advance after brief delay
            setTimeout(() => advanceQuiz(), 350);
        });
    });

    // Handle multi-select
    document.querySelectorAll('.quiz-options.multi .quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            const parent = btn.closest('.quiz-options');
            const name = parent.dataset.name;
            const selected = Array.from(parent.querySelectorAll('.quiz-option.selected'))
                .map(b => b.dataset.value);
            quizState.answers[name] = selected;

            // Enable/disable next button
            const nextBtn = document.getElementById('quiz-next-3');
            if (nextBtn) nextBtn.disabled = selected.length === 0;
        });
    });

    // Next button for multi-select step
    const nextBtn3 = document.getElementById('quiz-next-3');
    if (nextBtn3) {
        nextBtn3.addEventListener('click', () => {
            if (!nextBtn3.disabled) advanceQuiz();
        });
    }

    function advanceQuiz() {
        const currentStepEl = document.querySelector(`.quiz-step[data-step="${quizState.currentStep}"]`);
        if (currentStepEl) currentStepEl.classList.remove('active');

        quizState.currentStep++;

        if (quizState.currentStep <= quizState.totalSteps) {
            // Show next question
            const nextStepEl = document.querySelector(`.quiz-step[data-step="${quizState.currentStep}"]`);
            if (nextStepEl) {
                void nextStepEl.offsetWidth;
                nextStepEl.classList.add('active');
            }
            updateProgress();
        } else {
            showAnalyzing();
        }
    }

    function updateProgress() {
        const pct = (quizState.currentStep / quizState.totalSteps) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${pct}%`;
        document.getElementById('quiz-progress-text').textContent =
            `Domanda ${quizState.currentStep} di ${quizState.totalSteps}`;
    }

    // =============================================
    // ANALYZING ANIMATION
    // =============================================
    function showAnalyzing() {
        document.getElementById('quiz-progress-bar').style.width = '100%';
        document.getElementById('quiz-progress-text').textContent = 'Analisi in corso...';

        const analyzingStep = document.getElementById('quiz-step-analyzing');
        void analyzingStep.offsetWidth;
        analyzingStep.classList.add('active');

        const steps = ['a-step-1', 'a-step-2', 'a-step-3', 'a-step-4'];
        steps.forEach((id, i) => {
            setTimeout(() => {
                const el = document.getElementById(id);
                el.classList.add('done');
                el.querySelector('.a-check').textContent = '✅';
            }, 800 + i * 900);
        });

        // Show lead capture after animation
        setTimeout(() => showLeadCapture(), 800 + steps.length * 900 + 600);
    }

    // =============================================
    // LEAD CAPTURE
    // =============================================
    function showLeadCapture() {
        const analyzingStep = document.getElementById('quiz-step-analyzing');
        analyzingStep.classList.remove('active');

        const leadStep = document.getElementById('quiz-step-lead');
        void leadStep.offsetWidth;
        leadStep.classList.add('active');

        document.getElementById('quiz-progress-text').textContent = 'Ultimo Step!';
    }

    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('lead-name').value;
            const email = document.getElementById('lead-email').value;
            
            const btn = document.getElementById('lead-submit-btn');
            btn.innerHTML = '<span>Invio in corso...</span>';
            btn.disabled = true;

            // Inserisci qui l'URL del tuo Webhook Make.com
            const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/INSERISCI_QUI_IL_TUO_WEBHOOK';
            
            const payload = {
                name: name,
                email: email,
                answers: quizState.answers,
                timestamp: new Date().toISOString()
            };

            // Invia i dati a Make.com (non blocca se fallisce)
            fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(e => console.log('Webhook Make.com non ancora configurato o errore di rete.', e))
              .finally(() => {
                  const leadStep = document.getElementById('quiz-step-lead');
                  leadStep.classList.remove('active');
                  showScore();
              });
        });
    }

    // =============================================
    // SCORE CALCULATION & DISPLAY
    // =============================================
    function calculateScore(answers) {
        localStorage.setItem('aiAuditAnswers', JSON.stringify(answers));
        
        let score = 40;

        const painCount = (answers.painPoints || []).length;
        score += Math.min(painCount * 7, 28);

        const hoursMap = { '5': 5, '10': 10, '20': 15, '30': 20, '40': 25 };
        score += hoursMap[answers.hoursWasted] || 10;

        const expMap = { 'none': 12, 'basic': 8, 'some': 4, 'advanced': 2 };
        score += expMap[answers.aiExperience] || 6;

        return Math.min(Math.max(score, 35), 95);
    }

    function getVerdict(score) {
        if (score >= 80) return '🔴 La tua azienda ha un <strong>enorme potenziale di automazione</strong>. Stai lasciando sul tavolo migliaia di euro ogni mese.';
        if (score >= 60) return '🟡 La tua azienda ha <strong>significative opportunità</strong> di automazione AI. Ci sono almeno 3-4 aree ad alto impatto.';
        return '🟢 Hai alcune <strong>opportunità mirate</strong> per l\'AI. Con le automazioni giuste puoi comunque risparmiare ore ogni settimana.';
    }

    function getPreviewItems(answers) {
        const items = [];
        const painPoints = answers.painPoints || [];

        const painMap = {
            customer_support: { icon: '💬', title: 'Automazione Customer Care', desc: 'Chatbot AI che gestisce 70-80% delle richieste in autonomia' },
            data_entry: { icon: '📝', title: 'Eliminazione Data Entry Manuale', desc: 'Estrazione automatica dati da documenti, fatture e email' },
            reporting: { icon: '📊', title: 'Report Auto-Generati', desc: 'Dashboard e report settimanali creati automaticamente dall\'AI' },
            content: { icon: '✍️', title: 'Content Creation AI-Powered', desc: 'Generazione di bozze, social post e copy con AI personalizzata' },
            lead_management: { icon: '🎯', title: 'Lead Scoring & Follow-up Automatico', desc: 'AI che qualifica i lead e invia follow-up personalizzati' },
            invoicing: { icon: '🧾', title: 'Automazione Contabilità', desc: 'Categorizzazione automatica, riconciliazione e promemoria pagamenti' }
        };

        painPoints.forEach((pp, i) => {
            if (painMap[pp] && i < 2) items.push(painMap[pp]);
        });

        if (items.length < 2) {
            items.push({ icon: '⚡', title: 'Workflow Automation', desc: 'Automazione dei processi più ripetitivi del tuo team' });
        }

        return items;
    }

    function getSavingsEstimate(answers) {
        const hours = parseInt(answers.hoursWasted) || 15;
        const costPerHour = 25;
        const savingsPct = 0.6;
        const weeklySavingsHours = Math.round(hours * savingsPct);
        const monthlySavingsEur = weeklySavingsHours * 4 * costPerHour;
        const yearlySavingsEur = monthlySavingsEur * 12;

        return {
            hours: weeklySavingsHours,
            monthly: monthlySavingsEur.toLocaleString('it-IT'),
            yearly: yearlySavingsEur.toLocaleString('it-IT')
        };
    }

    function showScore() {

        const svgNS = 'http://www.w3.org/2000/svg';
        const scoreSvg = document.querySelector('.score-ring');
        if (scoreSvg && !document.getElementById('scoreGradient')) {
            const defs = document.createElementNS(svgNS, 'defs');
            const gradient = document.createElementNS(svgNS, 'linearGradient');
            gradient.id = 'scoreGradient';
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '0%');
            const stop1 = document.createElementNS(svgNS, 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('style', 'stop-color:#7c5cfc');
            const stop2 = document.createElementNS(svgNS, 'stop');
            stop2.setAttribute('offset', '50%');
            stop2.setAttribute('style', 'stop-color:#c084fc');
            const stop3 = document.createElementNS(svgNS, 'stop');
            stop3.setAttribute('offset', '100%');
            stop3.setAttribute('style', 'stop-color:#f472b6');
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            gradient.appendChild(stop3);
            defs.appendChild(gradient);
            scoreSvg.insertBefore(defs, scoreSvg.firstChild);
        }

        const scoreStep = document.getElementById('quiz-step-score');
        void scoreStep.offsetWidth;
        scoreStep.classList.add('active');

        const score = calculateScore(quizState.answers);
        const savings = getSavingsEstimate(quizState.answers);
        const previewItems = getPreviewItems(quizState.answers);

        const scoreValueEl = document.getElementById('score-value');
        animateCounter(scoreValueEl, 0, score, 1500);

        const ringFill = document.getElementById('score-ring-fill');
        const circumference = 339.292;
        const offset = circumference - (score / 100) * circumference;
        setTimeout(() => {
            ringFill.style.strokeDashoffset = offset;
        }, 100);

        document.getElementById('score-verdict').innerHTML = getVerdict(score);

        const previewContainer = document.getElementById('score-preview-items');
        previewContainer.innerHTML = previewItems.map(item => `
            <div class="preview-item">
                <span class="preview-item-icon">${item.icon}</span>
                <div class="preview-item-text">
                    <strong>${item.title}</strong>
                    <p>${item.desc}</p>
                </div>
            </div>
        `).join('');

        document.getElementById('score-savings').innerHTML = `
            💰 Stima risparmio: <strong>${savings.hours} ore/settimana</strong> · <strong>€${savings.monthly}/mese</strong> · <strong>€${savings.yearly}/anno</strong>
        `;

        document.getElementById('quiz-progress-bar').style.width = '100%';
        document.getElementById('quiz-progress-text').textContent = 'Analisi completata ✓';

        setTimeout(() => {
            document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }

    function animateCounter(el, start, end, duration) {
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            el.textContent = current;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // =============================================
    // STRIPE CHECKOUT
    // =============================================
    const buyBtn = document.getElementById('score-buy-btn');
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            buyBtn.innerHTML = '<span>Reindirizzamento...</span>';
            buyBtn.disabled = true;
            
            const stripe = Stripe('pk_live_51TVfdJQ5RBA7VVsMKPmMB1nIB2vAADfxXE0OSG2VM4uRvKqTsN4bFXcM5JG31cK4jj0fEgaWWqiisjDLQbiBkLhD00KiTCooLg');
            
            const baseUrl = window.location.href.split('?')[0].replace('audit.html', '');
            const successUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'report.html';
            
            stripe.redirectToCheckout({
                lineItems: [{
                    price: 'price_1TdcTBQ5RBA7VVsMuBvJU5i2', // Updated with actual Price ID!
                    quantity: 1
                }],
                mode: 'payment',
                successUrl: successUrl,
                cancelUrl: window.location.href,
            }).then(function (result) {
                if (result.error) {
                    alert('Errore Stripe: ' + result.error.message);
                    buyBtn.innerHTML = '<span>Sblocca il Report Completo — €147</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                    buyBtn.disabled = false;
                }
            });
        });
    }

    // Button ripple
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position:absolute; width:0; height:0; border-radius:50%;
                background:rgba(255,255,255,0.15); transform:translate(-50%,-50%);
                left:${e.clientX - rect.left}px; top:${e.clientY - rect.top}px;
                animation:ripple-expand 0.6s ease-out forwards; pointer-events:none;
            `;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
});
