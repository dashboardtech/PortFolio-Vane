// DOM Utilities - Helper functions for DOM manipulation
class DOMUtils {
    // Safely get element by ID
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found`);
        }
        return element;
    }
    
    // Safely get elements by class name
    static getElementsByClassName(className) {
        return Array.from(document.getElementsByClassName(className));
    }
    
    // Create element with attributes and content
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        // Set attributes
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        // Set properties
        if (options.properties) {
            Object.entries(options.properties).forEach(([key, value]) => {
                element[key] = value;
            });
        }
        
        // Set content
        if (options.text) {
            element.textContent = options.text;
        } else if (options.html) {
            element.innerHTML = options.html;
        }
        
        // Add classes
        if (options.classes) {
            if (Array.isArray(options.classes)) {
                element.classList.add(...options.classes);
            } else {
                element.className = options.classes;
            }
        }
        
        // Add styles
        if (options.styles) {
            Object.assign(element.style, options.styles);
        }
        
        // Add event listeners
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        return element;
    }
    
    // Show/hide elements
    static show(element, display = 'block') {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            element.style.display = display;
        }
    }
    
    static hide(element) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            element.style.display = 'none';
        }
    }
    
    static toggle(element, display = 'block') {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            if (element.style.display === 'none') {
                this.show(element, display);
            } else {
                this.hide(element);
            }
        }
    }
    
    // Add/remove CSS classes
    static addClass(element, className) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            element.classList.add(className);
        }
    }
    
    static removeClass(element, className) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    }
    
    static toggleClass(element, className) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            element.classList.toggle(className);
        }
    }
    
    // Set element content safely
    static setContent(element, content, isHTML = false) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            if (isHTML) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
        }
    }
    
    // Clear element content
    static clearContent(element) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            element.innerHTML = '';
        }
    }
    
    // Check if element is visible
    static isVisible(element) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }
    
    // Scroll to element smoothly
    static scrollToElement(element, offset = 0) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            const elementTop = element.offsetTop - offset;
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
    }
    
    // Wait for element to appear
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations) => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }
    
    // Remove all child elements
    static removeAllChildren(element) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }
    
    // Get element position
    static getElementPosition(element) {
        if (typeof element === 'string') {
            element = this.getElementById(element);
        }
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    }
}

// Make available globally
window.DOMUtils = DOMUtils;
console.log('✅ DOM Utils loaded');