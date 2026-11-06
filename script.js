// ===================================================================
// Swift Logistics: site scripts
// Covers: mobile nav, active-link highlighting, scroll reveal,
// newsletter capture, shipping rate calculator, enhanced waybill
// tracking simulator, printable consignment note, and contact form.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initActiveNav();
    initScrollReveal();
    initSmoothScroll();
    initFooterYear();
    initNewsletterForms();
    initRateCalculator();
    initTrackingForm();
    initContactForm();
    initFaqAccordion();
});

// -------------------------------------------------------------------
// Mobile menu toggle
// -------------------------------------------------------------------
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', String(!isHidden));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// -------------------------------------------------------------------
// Highlight current page in nav
// -------------------------------------------------------------------
function initActiveNav() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) return;

    document.querySelectorAll(`a[data-page="${currentPage}"]`).forEach(link => {
        link.classList.add('active');
    });
}

// -------------------------------------------------------------------
// Scroll reveal animation
// -------------------------------------------------------------------
function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    targets.forEach(el => observer.observe(el));
}

// -------------------------------------------------------------------
// Smooth scroll for anchor links
// -------------------------------------------------------------------
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// -------------------------------------------------------------------
// Footer copyright year
// -------------------------------------------------------------------
function initFooterYear() {
    document.querySelectorAll('#year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

// -------------------------------------------------------------------
// Newsletter forms
// -------------------------------------------------------------------
function initNewsletterForms() {
    document.querySelectorAll('#newsletterForm').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (!input || !input.checkValidity()) {
                input && input.reportValidity();
                return;
            }
            const msg = form.parentElement.querySelector('#newsletterMsg');
            if (msg) msg.classList.remove('hidden');
            form.reset();
        });
    });
}

// -------------------------------------------------------------------
// Volumetric Shipping Rate & Tariff Calculator
// -------------------------------------------------------------------
const REGIONAL_ZONES = {
    'greater-accra': { name: 'Greater Accra', baseRate: 35, transitDays: 'Same-day to 24h', factor: 1.0 },
    'ashanti': { name: 'Ashanti (Kumasi & surrounding)', baseRate: 55, transitDays: '24h next-day', factor: 1.25 },
    'western': { name: 'Western (Sekondi-Takoradi)', baseRate: 60, transitDays: '24h to 48h', factor: 1.3 },
    'central': { name: 'Central (Cape Coast / Winneba)', baseRate: 45, transitDays: '24h next-day', factor: 1.15 },
    'eastern': { name: 'Eastern (Koforidua)', baseRate: 45, transitDays: '24h next-day', factor: 1.15 },
    'northern': { name: 'Northern (Tamale)', baseRate: 85, transitDays: '48h to 72h', factor: 1.55 },
    'upper-east': { name: 'Upper East (Bolgatanga)', baseRate: 95, transitDays: '48h to 72h', factor: 1.7 },
    'upper-west': { name: 'Upper West (Wa)', baseRate: 95, transitDays: '48h to 72h', factor: 1.7 },
    'volta': { name: 'Volta (Ho / Aflao)', baseRate: 55, transitDays: '24h to 48h', factor: 1.25 },
    'bono': { name: 'Bono (Sunyani)', baseRate: 70, transitDays: '24h to 48h', factor: 1.4 },
    'bono-east': { name: 'Bono East (Techiman)', baseRate: 70, transitDays: '24h to 48h', factor: 1.4 },
    'ahafo': { name: 'Ahafo (Goaso)', baseRate: 75, transitDays: '48h', factor: 1.45 },
    'oti': { name: 'Oti (Dambai)', baseRate: 80, transitDays: '48h', factor: 1.5 },
    'savannah': { name: 'Savannah (Damongo)', baseRate: 90, transitDays: '48h to 72h', factor: 1.6 },
    'north-east': { name: 'North East (Nalerigu)', baseRate: 95, transitDays: '48h to 72h', factor: 1.7 },
    'western-north': { name: 'Western North (Sefwi Wiawso)', baseRate: 80, transitDays: '48h', factor: 1.5 }
};

function calculateShippingCost(origin, destinationKey, actualWeightKg, lengthCm, widthCm, heightCm, serviceType, includeInsurance, declaredValue) {
    const zone = REGIONAL_ZONES[destinationKey] || REGIONAL_ZONES['greater-accra'];
    
    // Volumetric weight divisor standard: 5000 cm3/kg
    const volWeightKg = Math.max(0, (lengthCm * widthCm * heightCm) / 5000);
    const chargeableWeight = Math.max(actualWeightKg, volWeightKg, 1);
    
    // Base rate covers first 2 kg
    const base = zone.baseRate;
    const additionalKg = Math.max(0, chargeableWeight - 2);
    const weightSurcharge = additionalKg * (8 * zone.factor);
    
    // Service multipliers
    let serviceMultiplier = 1.0;
    if (serviceType === 'express') serviceMultiplier = 1.6;
    if (serviceType === 'freight') serviceMultiplier = 0.85;

    const freightSubtotal = (base + weightSurcharge) * serviceMultiplier;
    
    // Insurance fee: 1.5% of declared cargo value (minimum GH₵ 10)
    let insuranceFee = 0;
    if (includeInsurance && declaredValue > 0) {
        insuranceFee = Math.max(10, declaredValue * 0.015);
    }

    const totalCost = Math.round(freightSubtotal + insuranceFee);

    return {
        chargeableWeight: chargeableWeight.toFixed(2),
        volWeightKg: volWeightKg.toFixed(2),
        actualWeightKg: actualWeightKg.toFixed(2),
        baseFreight: Math.round(freightSubtotal),
        insuranceFee: Math.round(insuranceFee),
        totalCost,
        transitDays: serviceType === 'express' ? 'Fast track same-day or early next morning' : zone.transitDays,
        destinationName: zone.name
    };
}

function initRateCalculator() {
    const calcForm = document.getElementById('rateCalcForm');
    if (!calcForm) return;

    const resultBox = document.getElementById('calcResultBox');
    
    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const origin = calcForm.elements['calcOrigin'].value;
        const destination = calcForm.elements['calcDestination'].value;
        const weight = parseFloat(calcForm.elements['calcWeight'].value) || 1;
        const length = parseFloat(calcForm.elements['calcLength'].value) || 20;
        const width = parseFloat(calcForm.elements['calcWidth'].value) || 20;
        const height = parseFloat(calcForm.elements['calcHeight'].value) || 15;
        const service = calcForm.elements['calcService'].value;
        const insurance = calcForm.elements['calcInsurance'] ? calcForm.elements['calcInsurance'].checked : false;
        const declaredVal = parseFloat(calcForm.elements['calcDeclaredVal'] ? calcForm.elements['calcDeclaredVal'].value : 0) || 0;

        const breakdown = calculateShippingCost(origin, destination, weight, length, width, height, service, insurance, declaredVal);

        if (resultBox) {
            document.getElementById('resChargeableWeight').textContent = `${breakdown.chargeableWeight} kg`;
            document.getElementById('resTransitTime').textContent = breakdown.transitDays;
            document.getElementById('resBaseFreight').textContent = `GH₵ ${breakdown.baseFreight}`;
            document.getElementById('resInsuranceFee').textContent = breakdown.insuranceFee > 0 ? `GH₵ ${breakdown.insuranceFee}` : 'Waived';
            document.getElementById('resTotalCost').textContent = `GH₵ ${breakdown.totalCost}`;
            
            const bookLink = document.getElementById('resBookLink');
            if (bookLink) {
                bookLink.href = `contact.html?service=${service}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&weight=${breakdown.chargeableWeight}&cost=${breakdown.totalCost}`;
            }

            resultBox.classList.remove('hidden');
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// -------------------------------------------------------------------
// Enhanced Shipment Tracking & Waybill Simulator
// -------------------------------------------------------------------
function initTrackingForm() {
    const form = document.getElementById('trackingForm');
    if (!form) return;

    const input = document.getElementById('trackingNumber');
    const errorEl = document.getElementById('trackingError');
    const resultEl = document.getElementById('trackingResult');
    const notFoundEl = document.getElementById('trackingNotFound');

    // Preset authentic Ghanaian demonstration waybills
    const DEMO_WAYBILLS = {
        'SG-108249': {
            statusIndex: 2, // In Transit
            origin: 'Accra Central Fulfillment Hub (Circle)',
            destination: 'Kumasi Adum Commercial Terminal',
            courier: 'Kwame Mensah (Fleet Van GH-2941-24)',
            service: 'Swift Regional Express',
            weight: '4.2 kg (Consignment Box)',
            eta: 'Today by 4:30 PM',
            steps: [
                { title: 'Electronic Shipping Manifest Received', hub: 'Accra Booking Office', time: 'Yesterday, 02:15 PM', done: true },
                { title: 'Consignment Collected & Scanned', hub: 'Ridge Sorting Center', time: 'Yesterday, 05:40 PM', done: true },
                { title: 'Departed Central Cross-Dock', hub: 'Accra-Kumasi Highway Transit Line', time: 'Today, 06:10 AM', current: true },
                { title: 'Arrival at Regional Distribution Terminal', hub: 'Kumasi Adum Hub', time: 'Estimated 02:45 PM', done: false },
                { title: 'Out for Final Mile Delivery', hub: 'Kumasi Metro Courier Unit', time: 'Estimated 03:30 PM', done: false },
                { title: 'Handed Over with Digital Signature', hub: 'Recipient Delivery Address', time: 'Pending', done: false }
            ]
        },
        'SG-391820': {
            statusIndex: 4, // Out for Delivery
            origin: 'Tema Harbour Cargo Terminal',
            destination: 'Tamale Central Regional Post',
            courier: 'Ibrahim Yakubu (Motorcycle Dispatch #TML-12)',
            service: 'Priority Courier Document & Small Parcel',
            weight: '0.85 kg (Security Pouch)',
            eta: 'Within the next 90 minutes',
            steps: [
                { title: 'Order Registered by Sender', hub: 'Tema Industrial Branch', time: '2 Days Ago, 10:00 AM', done: true },
                { title: 'Processed at Air Transit Gateway', hub: 'Kotoka Air Cargo Gate', time: 'Yesterday, 08:30 AM', done: true },
                { title: 'Arrived at Northern Sorting Hub', hub: 'Tamale Airport Road Hub', time: 'Yesterday, 04:15 PM', done: true },
                { title: 'Sorted into Delivery Run', hub: 'Tamale Central Depot', time: 'Today, 07:45 AM', done: true },
                { title: 'Out for Delivery with Courier', hub: 'Tamale Metro Route 4', time: 'Today, 08:30 AM', current: true },
                { title: 'Delivered and Signed', hub: 'Destination Address', time: 'Pending confirmation', done: false }
            ]
        },
        'SG-829104': {
            statusIndex: 5, // Delivered
            origin: 'Takoradi Harbour Freight Depot',
            destination: 'East Legon, Greater Accra',
            courier: 'Emmanuel Tetteh (Dispatch Van GH-1102-23)',
            service: 'Commercial Door-to-Door Freight',
            weight: '18.5 kg (Carton)',
            eta: 'Delivered on Schedule',
            steps: [
                { title: 'Waybill Issued & Consignment Tagged', hub: 'Takoradi Harbour Office', time: '3 Days Ago, 09:20 AM', done: true },
                { title: 'Freight Inter-City Transfer', hub: 'Cape Coast Highway Corridor', time: '2 Days Ago, 01:15 PM', done: true },
                { title: 'Inward Scan at Accra Depot', hub: 'Spintex Road Central Facility', time: 'Yesterday, 09:45 AM', done: true },
                { title: 'Dispatched with Delivery Associate', hub: 'East Legon Sector Van', time: 'Yesterday, 11:30 AM', done: true },
                { title: 'Delivered to Recipient', hub: 'East Legon, Boundary Road', time: 'Yesterday, 01:45 PM', done: true, signature: 'Signed by: Abena Osei (ID: GHA-71829381)' }
            ]
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        resultEl.classList.add('hidden');
        notFoundEl.classList.add('hidden');
        errorEl.classList.add('hidden');

        const value = input.value.trim().toUpperCase();

        if (!value) {
            errorEl.textContent = 'Please enter a valid waybill tracking number.';
            errorEl.classList.remove('hidden');
            return;
        }

        const match = /^SG-?(\d{4,8})$/.exec(value);
        if (!match) {
            notFoundEl.classList.remove('hidden');
            return;
        }

        const normalizedCode = `SG-${match[1]}`;
        const waybillData = DEMO_WAYBILLS[normalizedCode] || generateDynamicWaybill(normalizedCode);

        renderTrackingResult(normalizedCode, waybillData);
    });

    function generateDynamicWaybill(code) {
        const digits = code.replace(/\D/g, '');
        const hash = digits.split('').reduce((sum, d) => sum + Number(d), 0);
        const hubs = ['Accra Central Hub', 'Kumasi Distribution Center', 'Takoradi Hub', 'Tamale Hub', 'Cape Coast Hub'];
        const origin = hubs[hash % hubs.length];
        const dest = hubs[(hash + 2) % hubs.length];
        const stepCount = 5;
        const currentStep = (hash % stepCount);

        const statusLabels = [
            'Booking Manifest Generated',
            'Consignment Picked Up from Shipper',
            'Transit Between Sorting Hubs',
            'Dispatched for Final Delivery',
            'Delivered with Proof of Delivery'
        ];

        const steps = statusLabels.map((label, idx) => ({
            title: label,
            hub: idx <= 1 ? origin : idx >= 3 ? dest : 'National Transit Corridor',
            time: idx < currentStep ? 'Completed' : idx === currentStep ? 'In Progress Right Now' : 'Scheduled',
            done: idx < currentStep,
            current: idx === currentStep
        }));

        return {
            statusIndex: currentStep,
            origin,
            destination: dest,
            courier: `Kofi Darko (Courier Unit #${10 + (hash % 80)})`,
            service: 'Swift Standard Express',
            weight: `${(1.5 + (hash % 15)).toFixed(1)} kg`,
            eta: currentStep === 4 ? 'Delivered' : 'Today by 5:00 PM',
            steps
        };
    }

    function renderTrackingResult(code, data) {
        document.getElementById('resultTrackingNumber').textContent = code;
        
        const badge = document.getElementById('resultStatusBadge');
        const isDelivered = data.statusIndex >= data.steps.length - 1;
        
        badge.textContent = isDelivered ? 'Delivered' : 'Active Shipment';
        badge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${isDelivered ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`;

        // Populate Route & Info Metadata
        const routeEl = document.getElementById('resultRouteInfo');
        if (routeEl) {
            routeEl.innerHTML = `
                <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-sm border border-slate-200">
                    <div>
                        <span class="text-xs text-gray-500 block uppercase font-medium">Origin Hub</span>
                        <strong class="text-gray-800">${data.origin}</strong>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 block uppercase font-medium">Destination</span>
                        <strong class="text-gray-800">${data.destination}</strong>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 block uppercase font-medium">Assigned Courier</span>
                        <span class="text-gray-800 font-semibold block">${data.courier}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 block uppercase font-medium">Estimated Arrival</span>
                        <span class="text-blue-600 font-bold block">${data.eta}</span>
                    </div>
                </div>
            `;
        }

        // Render steps
        const stepsContainer = document.getElementById('resultSteps');
        stepsContainer.innerHTML = data.steps.map((step) => {
            const stateClass = step.done ? 'complete' : step.current ? 'current' : '';
            const iconClass = step.done ? 'fa-check' : step.current ? 'fa-truck-fast text-blue-600' : 'fa-clock text-gray-300';
            return `
                <div class="status-step ${stateClass}">
                    <span class="status-dot"><i class="fas ${iconClass} text-[11px]"></i></span>
                    <div class="flex-1">
                        <div class="flex justify-between items-baseline">
                            <p class="font-bold text-gray-800">${step.title}</p>
                            <span class="text-xs text-gray-400 font-medium">${step.time}</span>
                        </div>
                        <p class="text-gray-500 text-sm">${step.hub}</p>
                        ${step.signature ? `<p class="text-xs text-green-700 bg-green-50 p-2 rounded mt-1.5 font-medium"><i class="fas fa-signature mr-1.5"></i>${step.signature}</p>` : ''}
                    </div>
                </div>`;
        }).join('');

        // Wire copy button
        const copyBtn = document.getElementById('copyTrackingBtn');
        if (copyBtn) {
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(code).then(() => {
                    const original = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check text-green-600"></i> Copied!';
                    setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
                });
            };
        }

        // Wire print waybill slip button
        const printBtn = document.getElementById('printWaybillBtn');
        if (printBtn) {
            printBtn.onclick = () => {
                window.print();
            };
        }

        resultEl.classList.remove('hidden');
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// -------------------------------------------------------------------
// Contact Form & Quote Request with Pre-filled URL Parameters
// -------------------------------------------------------------------
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Read URL query parameters to pre-fill quote details
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const originParam = params.get('origin');
    const destParam = params.get('destination');
    const weightParam = params.get('weight');
    const costParam = params.get('cost');

    if (serviceParam && form.elements['service']) {
        form.elements['service'].value = serviceParam;
    }

    if (destParam && form.elements['message']) {
        const prefillNote = `Rate Estimate Reference: From ${originParam || 'Accra'} to ${destParam} for ${weightParam || '1'} kg. Estimated Tariff: GH₵ ${costParam || '0'}.`;
        form.elements['message'].value = `${prefillNote}\n\nI would like to schedule a pickup for this shipment.`;
    }

    const successPanel = document.getElementById('contactSuccess');

    const validators = {
        fullName: (v) => v.trim().length >= 2 || 'Please enter your full name.',
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
        phone: (v) => /^[0-9+()\s-]{7,15}$/.test(v) || 'Please enter a valid phone number.',
        message: (v) => v.trim().length >= 10 || 'Please add a few more details (10+ characters).'
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let firstInvalid = null;

        Object.keys(validators).forEach(name => {
            const field = form.elements[name];
            if (!field) return;
            const errorEl = field.closest('div').querySelector('.field-error');
            const result = validators[name](field.value);

            if (result === true) {
                errorEl && errorEl.classList.add('hidden');
                field.classList.remove('border-red-500');
            } else {
                errorEl && (errorEl.textContent = result, errorEl.classList.remove('hidden'));
                field.classList.add('border-red-500');
                if (!firstInvalid) firstInvalid = field;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';

        setTimeout(() => {
            form.classList.add('hidden');
            if (successPanel) successPanel.classList.remove('hidden');
        }, 500);
    });
}

// -------------------------------------------------------------------
// FAQ Accordion
// -------------------------------------------------------------------
function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                items.forEach(other => {
                    if (other !== item) other.open = false;
                });
            }
        });
    });
}
