// Focus Page Application Logic
(function() {
    'use strict';

    let audioElementsState = [];
    let isPreventCloseEnabled = false;
    let notificationTimeout = null;
    let notificationInterval = null;
    let isNotificationActive = false;

    // Get query parameters
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            game: params.get('game'),
            title: params.get('title')
        };
    }

    // Initialize focus page
    function initializeFocusPage() {
        const { game, title } = getQueryParams();
        const decodedGame = decodeURIComponent(game || '');
        const decodedTitle = decodeURIComponent(title || 'GAME');
        
        if (game && title) {
            document.getElementById('gameFrame').src = decodedGame;
            document.getElementById('gameTitle').textContent = decodedTitle;
        } else {
            document.getElementById('gameFrame').src = 'files/not-found/index.html';
            document.getElementById('gameTitle').textContent = 'GAME NOT FOUND';
        }

        const iframe = document.getElementById('gameFrame');
        iframe.onload = function() {
            if (decodedGame.includes('granny/index.html')) {
                const disableKey = 'popup_disabled_granny';
                if (localStorage.getItem(disableKey) !== 'true') {
                    setTimeout(showPopup, 1000);
                }
            }
        };
    }

    // Dropdown functionality
    document.getElementById('featuresButton').addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById('featuresMenu');
        menu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#featuresDropdown')) {
            document.getElementById('featuresMenu').classList.remove('show');
        }
    });

    // Show popup
    function showPopup() {
        distortAudio();
        document.getElementById('popupOverlay').style.display = 'flex';
    }

    // Close popup
    function closePopup() {
        document.getElementById('popupOverlay').style.display = 'none';
        restoreAudio();
    }

    // Show cloak popup
    function showCloakPopup() {
        distortAudio();
        document.getElementById('cloakPopupOverlay').style.display = 'flex';
    }

    // Close cloak popup
    function closeCloakPopup() {
        document.getElementById('cloakPopupOverlay').style.display = 'none';
        restoreAudio();
    }

    // Distort audio
    function distortAudio() {
        const iframe = document.getElementById('gameFrame');
        try {
            const mediaElements = iframe.contentDocument?.querySelectorAll('audio, video') || [];
            audioElementsState = [];
            mediaElements.forEach(el => {
                if (!el.paused) {
                    audioElementsState.push({
                        element: el,
                        originalRate: el.playbackRate,
                        originalVolume: el.volume
                    });
                    el.playbackRate = 0.5;
                    el.volume = 0.2;
                }
            });
        } catch (e) {
            console.warn('Unable to access iframe audio elements:', e);
        }
    }

    // Restore audio
    function restoreAudio() {
        audioElementsState.forEach(state => {
            try {
                state.element.playbackRate = state.originalRate;
                state.element.volume = state.originalVolume;
            } catch (e) {
                console.warn('Error restoring audio for element:', e);
            }
        });
        audioElementsState = [];
    }

    // Show notification
    function showNotification(message) {
        if (isNotificationActive) {
            clearNotification();
        }

        const notificationBox = document.getElementById('notificationBox');
        const notificationText = document.getElementById('notificationText');
        const notificationTimer = document.getElementById('notificationTimer');

        isNotificationActive = true;

        notificationText.innerHTML = '';
        notificationTimer.textContent = '';

        notificationText.textContent = message;

        notificationBox.classList.remove('show', 'closing');
        notificationBox.style.display = 'block';
        
        notificationBox.offsetHeight;
        
        notificationBox.classList.add('show');

        let timeLeft = 7.0;
        notificationTimer.textContent = `⏱ ${timeLeft.toFixed(1)}s`;

        notificationInterval = setInterval(() => {
            timeLeft -= 0.1;
            if (timeLeft <= 0.1 && isNotificationActive) {
                clearNotification();
            } else if (isNotificationActive) {
                notificationTimer.textContent = `⏱ ${Math.max(0, timeLeft).toFixed(1)}s`;
            }
        }, 100);

        notificationTimeout = setTimeout(() => {
            if (isNotificationActive) {
                clearNotification();
            }
        }, 7000);
    }

    // Clear notification
    function clearNotification() {
        if (!isNotificationActive) return;

        isNotificationActive = false;

        const notificationBox = document.getElementById('notificationBox');
        
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        if (notificationInterval) {
            clearInterval(notificationInterval);
            notificationInterval = null;
        }

        notificationBox.classList.remove('show');
        notificationBox.classList.add('closing');

        setTimeout(() => {
            notificationBox.classList.remove('closing');
            notificationBox.style.display = 'none';
            document.getElementById('notificationText').innerHTML = '';
            document.getElementById('notificationTimer').textContent = '';
        }, 300);
    }

    // About:Blank cloak
    function aboutBlankCloak() {
        console.log('About:Blank Cloak activated');
        const win = window.open('about:blank', '_blank');
        if (win) {
            win.document.write('<iframe src="' + window.location.href + '" style="width:100%;height:100vh;border:none;"></iframe>');
        }
        closeCloakPopup();
        showNotification('✓ About:Blank Cloak activated in new tab!');
    }

    // Data:Text cloak
    function dataTextCloak() {
        closeCloakPopup();
        const textToCopy = 'data:text/html,<!DOCTYPE%20html><html><head><title>Google%20Classroom</title><style%20type="text/css">html%20{overflow:auto;}html,body,div,iframe{margin:0px;padding:0px;height:100%;border:none;}iframe{display:block;width:100%;border:none;overflow-y:auto;overflow-x:hidden;}</style></head><body><iframe%20src="' + window.location.origin + '"%20frameborder="0"%20marginheight="0"%20marginwidth="0"%20width="100%"%20height="100%"%20scrolling="auto"></iframe></body></html>';
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('✓ DATA:TEXT cloaked URL copied! Paste in new tab URL bar.');
        }).catch(err => {
            console.error('Failed to copy text:', err);
            showNotification('✗ Error copying DATA:TEXT URL. Please try again.');
        });
    }

    // Update prevent close status
    function updatePreventCloseStatus() {
        const button = document.getElementById('preventCloseToggle');
        const status = document.getElementById('preventCloseStatus');
        const indicator = document.getElementById('preventCloseIndicator');
        
        if (isPreventCloseEnabled) {
            button.classList.remove('disabled');
            status.textContent = 'ENABLED';
            status.className = 'itemStatus enabled';
            indicator.className = 'statusIndicator enabled';
        } else {
            button.classList.add('disabled');
            status.textContent = 'DISABLED';
            status.className = 'itemStatus disabled';
            indicator.className = 'statusIndicator';
        }
    }

    // Prevent close handler
    function preventClose(event) {
        event.preventDefault();
        event.returnValue = '';
    }

    // Event Listeners
    document.getElementById('homeButton').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('preventCloseToggle').addEventListener('click', () => {
        isPreventCloseEnabled = !isPreventCloseEnabled;
        if (isPreventCloseEnabled) {
            window.addEventListener('beforeunload', preventClose);
            showNotification('🛡 Prevent Tab Closing ENABLED');
        } else {
            window.removeEventListener('beforeunload', preventClose);
            showNotification('⚠ Prevent Tab Closing DISABLED');
        }
        updatePreventCloseStatus();
    });

    document.getElementById('cloakTabToggle').addEventListener('click', () => {
        document.getElementById('featuresMenu').classList.remove('show');
        showCloakPopup();
    });

    document.getElementById('aboutBlankButton').addEventListener('click', () => {
        aboutBlankCloak();
    });

    document.getElementById('dataTextButton').addEventListener('click', () => {
        dataTextCloak();
    });

    document.getElementById('fullscreenButton').addEventListener('click', () => {
        const iframe = document.getElementById('gameFrame');
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
        showNotification('⛶ Fullscreen activated!');
    });

    document.getElementById('okButton').addEventListener('click', () => {
        const checkbox = document.getElementById('dontShowCheckbox');
        if (checkbox.checked) {
            localStorage.setItem('popup_disabled_granny', 'true');
        }
        closePopup();
    });

    document.getElementById('notificationClose').addEventListener('click', (e) => {
        e.stopPropagation();
        clearNotification();
    });

    // Initialize
    updatePreventCloseStatus();
    initializeFocusPage();

    // Prevent context menu
    document.addEventListener('contextmenu', e => e.preventDefault());
})();