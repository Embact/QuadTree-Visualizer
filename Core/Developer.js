export class Developer {
    static instance;
    static values = {};
    static onChangeCallbacks = [];
    static onInitCallbacks = [];

    constructor() {
        if (Developer.instance) return Developer.instance;

        console.log("Developer Class Loaded");

        this.container = document.querySelector('.controls');
        this.controlElements = this.container.querySelectorAll('input');

        this.initializeControls();
        Developer.instance = this;

        // 🔥 Call all registered onInit callbacks after setup
        Developer.onInitCallbacks.forEach(cb => cb());
    }

    initializeControls() {
        this.controlElements.forEach(input => {
            const id = input.id;
            Developer.values[id] = this.getValue(input);
            this.attachChangeListener(input);
            this.updateLabel(input);
        });
    }

    attachChangeListener(input) {
        input.addEventListener('input', () => {
            const value = this.getValue(input);
            Developer.values[input.id] = value;
            this.updateLabel(input);
            Developer.triggerChange(input.id, value);
        });
    }

    updateLabel(input) {
        const label = this.container.querySelector(`label[for="${input.id}"] span`);
        if (label) {
            label.textContent = input.type === 'range'
                ? input.value
                : input.checked ? "On" : "Off";
        }
    }

    getValue(input) {
        if (input.type === 'checkbox') return input.checked;
        if (input.type === 'range' || input.type === 'number') return parseFloat(input.value);
        return input.value;
    }

    // 🔁 STATIC METHODS

    static get(id) {
        return Developer.values[id];
    }

    static onChange(callback) {
        if (typeof callback === 'function') {
            Developer.onChangeCallbacks.push(callback);
        }
    }

    static onInit(callback) {
        if (typeof callback === 'function') {
            Developer.onInitCallbacks.push(callback);
        }
    }

    static triggerChange(id, value) {
        Developer.onChangeCallbacks.forEach(cb => cb(id, value));
    }
}