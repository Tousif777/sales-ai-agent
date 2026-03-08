(function() {
    // Current script finding to get the userId
    const currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    
    const userId = currentScript.getAttribute('data-user-id');
    const baseUrl = window.location.origin; // Assuming the widget is hosted on the same domain or we can hardcode for prod
    
    if (!userId) {
        console.error('SalesAI Widget: data-user-id is missing.');
        return;
    }

    // Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .sales-ai-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .sales-ai-bubble {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1d4ed8 0%, #3730a3 100%);
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .sales-ai-bubble:hover {
            transform: scale(1.1) rotate(5deg);
        }
        .sales-ai-bubble svg {
            width: 28px;
            height: 28px;
            fill: white;
        }
        .sales-ai-iframe-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 400px;
            height: 600px;
            max-height: calc(100vh - 110px);
            max-width: calc(100vw - 40px);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
            overflow: hidden;
            display: none;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s ease;
            transform-origin: bottom right;
        }
        .sales-ai-iframe-container.open {
            display: block;
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        .sales-ai-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        @media (max-width: 480px) {
            .sales-ai-iframe-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                max-width: 100%;
                max-height: 100%;
                border-radius: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Widget Elements
    const container = document.createElement('div');
    container.className = 'sales-ai-widget-container';
    
    const bubble = document.createElement('div');
    bubble.className = 'sales-ai-bubble';
    bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H6l-2 2V4h16v12z"/></svg>`;
    
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'sales-ai-iframe-container';
    
    const iframe = document.createElement('iframe');
    iframe.name = 'sales-ai-widget-iframe';
    iframe.className = 'sales-ai-iframe';
    iframe.src = `${baseUrl}/agent/${userId}/embed`;
    
    iframeContainer.appendChild(iframe);
    container.appendChild(iframeContainer);
    container.appendChild(bubble);
    document.body.appendChild(container);

    // Toggle Logic
    let isOpen = false;
    const toggle = () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframeContainer.style.display = 'block';
            setTimeout(() => iframeContainer.classList.add('open'), 10);
            bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
        } else {
            iframeContainer.classList.remove('open');
            setTimeout(() => { if (!isOpen) iframeContainer.style.display = 'none'; }, 300);
            bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H6l-2 2V4h16v12z"/></svg>`;
        }
    };

    bubble.onclick = toggle;

    // Listen for close messages from the iframe
    window.addEventListener('message', (event) => {
        if (event.data === 'sales-ai-widget-close') {
            toggle();
        }
    });

})();
