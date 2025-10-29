// Main Application Logic
(function() {
    'use strict';

    // Valid access codes
    const validNames = ['6969', '16569', '15590', '14421', '17682', '14966', '17656', '20990', '17717', '16559', '15744', '18290'];

    // ASCII Arts for login screen
    const asciiArts = [
        // Add your ASCII arts here - keeping it simple for size
        `
    ███████╗██╗   ██╗███████╗██████╗  ██████╗ ██████╗ ███████╗
    ██╔════╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔════╝
    █████╗   ╚████╔╝ █████╗  ██║  ██║██║   ██║██████╔╝█████╗  
    ██╔══╝    ╚██╔╝  ██╔══╝  ██║  ██║██║   ██║██╔═══╝ ██╔══╝  
    ███████╗   ██║   ███████╗██████╔╝╚██████╔╝██║     ███████╗
    ╚══════╝   ╚═╝   ╚══════╝╚═════╝  ╚═════╝ ╚═╝     ╚══════╝
        `
    ];

    // Games data
    const games = [
        {
            title: '2048',
            description: 'Combine tiles to reach 2048 in this merging puzzle game.',
            image: './files/2048/logo.png',
            path: './files/2048/'
        },
        {
            title: 'BAD PARENTING',
            description: 'A popular story horror game, now actually functioning.',
            image: './files/bad-parenting/logo.png',
            path: './files/bad-parenting/'
        },
        {
            title: 'FIVE NIGHTS AT FREDDY\'S',
            description: 'Survive 5 nights at Freddy\'s. Can you handle the animatronics?',
            image: './files/fnaf/logo.png',
            path: './files/fnaf/'
        },
        {
            title: 'GRANNY',
            description: 'Escape granny\'s house without getting caught.',
            image: './files/granny/logo.png',
            path: './files/granny/'
        },
        {
            title: 'RETRO BOWL',
            description: 'Play American football in this retro-style game.',
            image: './files/retrobowl/logo.png',
            path: './files/retrobowl/'
        }
    ].sort((a, b) => a.title.localeCompare(b.title));

    // Exploits data
    const exploits = [
        {
            title: 'Console Logger',
            description: 'Log system information to console for debugging.',
            code: 'console.log("System Info:", navigator.userAgent)'
        }
    ];

    // Tab configuration
    const tabsConfig = {
        games: {
            title: 'EYEDOPE',
            desc: 'Welcome, <span id="userName"></span> | The best crystalized DOPE for the eyes.',
            others: ['proxies', 'exploits']
        },
        proxies: {
            title: 'EYEDOPE PROXIES',
            desc: 'Discover the proxies. [Powered by Browser.js]',
            others: ['games', 'exploits']
        },
        exploits: {
            title: 'EYEDOPE EXPLOITS',
            desc: 'Discover the exploits. [Work-In-Progress]',
            others: ['games', 'proxies']
        }
    };

    let userNameVar = '';
    let currentFingerprint = '';

    // Initialize particles
    function initParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // Display fingerprint
    async function displayFingerprint() {
        const fingerprintDisplay = document.getElementById('fingerprintDisplay');
        if (!fingerprintDisplay) return;

        fingerprintDisplay.textContent = 'Calculating...';
        currentFingerprint = await sessionManager.generateFingerprint();
        fingerprintDisplay.textContent = sessionManager.getShortFingerprint(currentFingerprint);
        sessionManager.storeFingerprint(currentFingerprint);
    }

    // Display login ASCII
    function displayLoginAscii() {
        if (asciiArts.length === 0) return;
        const asciiElement = document.getElementById('asciiArt');
        const randomArt = asciiArts[Math.floor(Math.random() * asciiArts.length)];
        if (randomArt && asciiElement) {
            asciiElement.textContent = randomArt;
            asciiElement.classList.add('flickering');
        }
    }

    // Show welcome screen
    async function showWelcomeScreen(userId) {
        document.getElementById('lockScreen').style.display = 'none';
        document.getElementById('welcomeUserId').textContent = userId.toUpperCase();
        
        // Get session info
        const session = sessionManager.getCurrentSession();
        if (session) {
            document.getElementById('sessionId').textContent = session.sessionId.substring(0, 16) + '...';
            const activeCount = sessionManager.getActiveSessionCount(userId);
            document.getElementById('activeSessions').textContent = activeCount + '/' + sessionManager.maxSessionsPerUser;
        }

        const welcomeScreen = document.getElementById('welcomeScreen');
        welcomeScreen.classList.add('active');

        setTimeout(() => {
            welcomeScreen.classList.add('fadeOut');
            setTimeout(() => {
                welcomeScreen.classList.remove('active', 'fadeOut');
                showMainScreen(userId);
            }, 1000);
        }, 2500);
    }

    // Show main screen
    function showMainScreen(userId) {
        userNameVar = userId.toUpperCase();
        document.getElementById('lockScreen').style.display = 'none';
        const mainScreen = document.getElementById('mainScreen');
        mainScreen.classList.add('active');

        initNavbarScrollEffects();
        loadGames();
        setupTabNavigation();
    }

    // Navbar scroll effects
    function initNavbarScrollEffects() {
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Load games
    function loadGames() {
        const container = document.getElementById('gamesContainer');
        container.innerHTML = '';
        games.forEach((game, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <img src="${game.image}" alt="${game.title}" class="gameImage" onerror="this.style.display='none'">
                <div class="card-title">${game.title}</div>
                <div class="card-description">${game.description}</div>
                <button class="card-button" onclick="window.location.href='focus.html?game=${encodeURIComponent(game.path)}&title=${encodeURIComponent(game.title)}'">
                    <span>EXPERIENCE IT</span>
                </button>
            `;
            container.appendChild(card);
        });
    }

    // Load exploits
    function loadExploits() {
        const container = document.getElementById('exploitsContainer');
        container.innerHTML = '';
        exploits.forEach((exploit, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="card-title">${exploit.title}</div>
                <div class="card-description">${exploit.description}</div>
                <button class="card-button" onclick="copyToClipboard('${encodeURIComponent(exploit.code)}')">
                    <span>COPY EXPLOIT CODE</span>
                </button>
            `;
            container.appendChild(card);
        });
    }

    // Copy to clipboard
    window.copyToClipboard = function(encodedCode) {
        const code = decodeURIComponent(encodedCode);
        navigator.clipboard.writeText(code).then(() => {
            const button = event.target.closest('.card-button');
            const originalHTML = button.innerHTML;
            button.innerHTML = '<span>✓ COPIED!</span>';
            button.style.background = '#00ff00';
            button.style.color = '#000';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
                button.style.color = '';
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy code.');
        });
    };

    // Load proxies
    function loadProxies() {
        const iframe = document.getElementById('proxy-frame');
        const urlBar = document.getElementById('url-bar');

        // Go button
        document.getElementById('go').addEventListener('click', () => {
            let url = urlBar.value.trim();
            if (!url) {
                alert('Please enter a URL');
                return;
            }
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            try {
                const proxiedUrl = '/proxy/' + encodeURIComponent(url);
                iframe.src = proxiedUrl;
                iframe.classList.add('active');
                urlBar.value = url;
            } catch (error) {
                console.error('URL encoding error:', error);
                alert('Failed to load URL: ' + error.message);
            }
        });

        // Enter key
        urlBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('go').click();
            }
        });

        // Back button
        document.getElementById('back').addEventListener('click', () => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.history) {
                    iframe.contentWindow.history.back();
                }
            } catch (error) {
                console.warn('Cannot access iframe history:', error);
            }
        });

        // Forward button
        document.getElementById('forward').addEventListener('click', () => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.history) {
                    iframe.contentWindow.history.forward();
                }
            } catch (error) {
                console.warn('Cannot access iframe history:', error);
            }
        });

        // Reload button
        document.getElementById('reload').addEventListener('click', () => {
            if (iframe.src) {
                iframe.src = iframe.src;
            } else {
                alert('No page loaded to reload');
            }
        });
    }

    // Switch tab
    function switchTab(tabId) {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        const config = tabsConfig[tabId];
        document.getElementById('navbarTitle').innerHTML = '▓▒░ ' + config.title + ' ░▒▓';
        document.getElementById('navbarDesc').innerHTML = config.desc;

        const userSpan = document.getElementById('userName');
        if (userSpan) {
            userSpan.textContent = userNameVar;
        }

        const leftButton = document.getElementById('leftTabButton');
        const rightButton = document.getElementById('rightTabButton');
        leftButton.textContent = config.others[0].toUpperCase();
        leftButton.dataset.tab = config.others[0];
        rightButton.textContent = config.others[1].toUpperCase();
        rightButton.dataset.tab = config.others[1];

        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        } else {
            leftButton.classList.add('active');
        }

        if (tabId === 'games') {
            loadGames();
        } else if (tabId === 'proxies') {
            loadProxies();
        } else if (tabId === 'exploits') {
            loadExploits();
        }
    }

    // Setup tab navigation
    function setupTabNavigation() {
        const leftButton = document.getElementById('leftTabButton');
        const rightButton = document.getElementById('rightTabButton');

        const defaultTab = 'games';
        const config = tabsConfig[defaultTab];
        leftButton.textContent = config.others[0].toUpperCase();
        leftButton.dataset.tab = config.others[0];
        rightButton.textContent = config.others[1].toUpperCase();
        rightButton.dataset.tab = config.others[1];
        leftButton.classList.add('active');

        leftButton.addEventListener('click', () => {
            switchTab(leftButton.dataset.tab);
        });
        rightButton.addEventListener('click', () => {
            switchTab(rightButton.dataset.tab);
        });

        switchTab(defaultTab);
    }

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            sessionManager.destroySession();
            location.reload();
        }
    });

    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const input = document.getElementById('nameInput').value.trim();
        const submitBtn = this.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loading = submitBtn.querySelector('.loading');

        if (!input) {
            alert('Please enter an access code');
            return;
        }

        // Show loading
        btnText.style.display = 'none';
        loading.style.display = 'inline-block';
        submitBtn.disabled = true;

        // Validate code
        if (validNames.includes(input.toUpperCase())) {
            try {
                // Create session
                await sessionManager.createSession(input.toUpperCase(), currentFingerprint);
                showWelcomeScreen(input.toUpperCase());
            } catch (error) {
                console.error('Session creation error:', error);
                alert('Failed to create session. Please try again.');
                btnText.style.display = 'inline';
                loading.style.display = 'none';
                submitBtn.disabled = false;
            }
        } else {
            // Invalid code
            alert('Invalid access code');
            btnText.style.display = 'inline';
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }

        document.getElementById('nameInput').value = '';
    });

    // Check existing session
    async function checkAccess() {
        // Validate existing session
        const isValid = await sessionManager.validateSession();
        
        if (isValid) {
            const session = sessionManager.getCurrentSession();
            if (session) {
                showWelcomeScreen(session.userId);
                return;
            }
        }

        // Show login screen
        document.getElementById('lockScreen').style.display = 'flex';
        displayLoginAscii();
        await displayFingerprint();
    }

    // Initialize app
    document.addEventListener('DOMContentLoaded', function() {
        initParticles();
        checkAccess();

        // Prevent context menu
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Session validation interval
        setInterval(async () => {
            const isValid = await sessionManager.validateSession();
            if (!isValid && document.getElementById('mainScreen').classList.contains('active')) {
                alert('Session expired or invalid. Please login again.');
                location.reload();
            }
        }, 60000); // Check every minute
    });
})();