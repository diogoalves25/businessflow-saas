(function() {
  'use strict';

  // Widget configuration
  const WIDGET_VERSION = '1.0.0';
  const DEFAULT_CONFIG = {
    position: 'bottom-right',
    primaryColor: '#0066FF',
    width: '400px',
    height: '600px',
    zIndex: 9999,
  };

  class BusinessFlowBookingWidget {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.isOpen = false;
      this.container = null;
      this.iframe = null;
      this.button = null;
      
      this.init();
    }

    init() {
      // Create widget container
      this.createContainer();
      this.createButton();
      this.createIframe();
      
      // Add styles
      this.injectStyles();
      
      // Add event listeners
      this.attachEventListeners();
    }

    createContainer() {
      this.container = document.createElement('div');
      this.container.id = 'businessflow-widget-container';
      this.container.style.cssText = `
        position: fixed;
        ${this.config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
        ${this.config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
        z-index: ${this.config.zIndex};
        display: none;
        width: ${this.config.width};
        height: ${this.config.height};
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 40px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      `;
      document.body.appendChild(this.container);
    }

    createButton() {
      this.button = document.createElement('button');
      this.button.id = 'businessflow-widget-button';
      this.button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
        </svg>
        <span>Book Now</span>
      `;
      this.button.style.cssText = `
        position: fixed;
        ${this.config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
        ${this.config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
        z-index: ${this.config.zIndex};
        background-color: ${this.config.primaryColor};
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      `;
      document.body.appendChild(this.button);
    }

    createIframe() {
      this.iframe = document.createElement('iframe');
      this.iframe.id = 'businessflow-widget-iframe';
      this.iframe.src = `${this.config.baseUrl}/booking/widget?organizationId=${this.config.organizationId}`;
      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;
      this.iframe.setAttribute('allow', 'payment');
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        color: #333;
        font-size: 24px;
        line-height: 1;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.2s;
        z-index: 1;
      `;
      closeButton.onmouseover = () => closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
      closeButton.onmouseout = () => closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
      closeButton.onclick = () => this.close();
      
      this.container.appendChild(closeButton);
      this.container.appendChild(this.iframe);
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        #businessflow-widget-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
        }
        
        #businessflow-widget-container {
          animation: businessflow-slide-in 0.3s ease-out;
        }
        
        @keyframes businessflow-slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 480px) {
          #businessflow-widget-container {
            width: 100% !important;
            height: 100% !important;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            top: 0 !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            max-height: 100% !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    attachEventListeners() {
      // Button click
      this.button.addEventListener('click', () => this.open());
      
      // Listen for messages from iframe
      window.addEventListener('message', (event) => {
        if (event.origin !== this.config.baseUrl) return;
        
        if (event.data.type === 'businessflow-booking-complete') {
          this.handleBookingComplete(event.data.booking);
        } else if (event.data.type === 'businessflow-close-widget') {
          this.close();
        }
      });
      
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    open() {
      this.isOpen = true;
      this.container.style.display = 'block';
      this.button.style.display = 'none';
      
      // Send config to iframe
      setTimeout(() => {
        this.iframe.contentWindow.postMessage({
          type: 'businessflow-widget-config',
          config: {
            primaryColor: this.config.primaryColor,
            organizationId: this.config.organizationId,
          }
        }, this.config.baseUrl);
      }, 100);
    }

    close() {
      this.isOpen = false;
      this.container.style.display = 'none';
      this.button.style.display = 'flex';
    }

    handleBookingComplete(booking) {
      // Call custom callback if provided
      if (this.config.onBookingComplete) {
        this.config.onBookingComplete(booking);
      }
      
      // Show success message
      this.showSuccessMessage();
      
      // Close widget after delay
      setTimeout(() => this.close(), 3000);
    }

    showSuccessMessage() {
      const message = document.createElement('div');
      message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10B981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: ${this.config.zIndex + 1};
        animation: businessflow-slide-in 0.3s ease-out;
      `;
      message.textContent = 'Booking confirmed! You will receive a confirmation email shortly.';
      document.body.appendChild(message);
      
      setTimeout(() => message.remove(), 3000);
    }
  }

  // Auto-initialize if script has data attributes
  function autoInit() {
    const script = document.currentScript || document.querySelector('script[data-businessflow-widget]');
    if (!script) return;
    
    const config = {
      organizationId: script.getAttribute('data-organization-id'),
      baseUrl: script.getAttribute('data-base-url') || 'https://app.businessflow.com',
      primaryColor: script.getAttribute('data-primary-color'),
      position: script.getAttribute('data-position'),
    };
    
    // Remove undefined values
    Object.keys(config).forEach(key => {
      if (config[key] === null || config[key] === undefined) {
        delete config[key];
      }
    });
    
    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.BusinessFlowWidget = new BusinessFlowBookingWidget(config);
      });
    } else {
      window.BusinessFlowWidget = new BusinessFlowBookingWidget(config);
    }
  }

  // Expose constructor for manual initialization
  window.BusinessFlowBookingWidget = BusinessFlowBookingWidget;
  
  // Auto-initialize
  autoInit();
})();