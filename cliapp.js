/* cliapp */
class Cliapp {
    constructor(obj = {}) {
        this.args = process.argv.slice(2);
        this.allowed = {actions: [], options: []};

        if (typeof obj == "object") {

            switch(typeof obj.actions) {
                case "object":
                    obj.actions.list = obj.actions.list || [];
                break;

                case "undefined":
                    this.log("Configure as ações do app [By Cliapp]").exit();
                break;

                default:
                    this.log("Configurações de ações do app inválida! [By Cliapp]").exit();
            }

            if (Array.isArray(obj.actions.list)) {
                this.allowed.actions = obj.actions;
            }

            obj.options = obj.options || [];

            if (Array.isArray(obj.options)) {
                this.allowed.options = obj.options;
            }
        }

    }

    get mainAction() {
        return this.allowed.actions.main;
    }

    log(text) {
        console.log(text);
        return {
            exit: () => process.exit(0)
        };
    }

    isValue(value) {
        if (value == undefined || value.match(/^-|-$/g) != null) {
            return false;
        }
        return true;
    }
    

    isAllowed(obj = {}) {
        if (typeof obj == "object") {
            if (obj.action != undefined) {
                if (obj.action == this.mainAction) {
                    return true;
                }
                return this.allowed.actions.list.includes(obj.action);
            }

            if (obj.option != undefined) {
                return this.allowed.options.includes(obj.option);
            }
        }
        return false;
    }

    setAction(args){
        const action = {name: args[0]};

        if (!this.isAllowed({action: action.name})) {
            const main = this.mainAction;
            if (main == undefined) {
                this.log("No command entered!").exit();
            }
            action.name = main;
        }else{
            action.name = args.shift();
        }

        action.value = (this.isValue(args[0]) ? args.shift() : undefined);
        this.action = action;
    }

    setOptions(options) {
        const separator = ":";
        const objectOptions = {};

        while(options.length > 0) {
            const name = options.shift();

            if (this.isValue(name)) {
                this.log("Argument "+name+" invalid!").exit();
            }

            if (!this.isAllowed({option: name})) {

                const search = name+separator;
                const result = this.allowed.options.filter(item => {
                    const regex = new RegExp(`${search}[a-zA-Z0-9]+`);
                    if (Array.isArray(item.match(regex))) {
                        return true;
                    }
                    return false;
                }).shift();

                if (result == undefined) {
                    this.log("option "+name+" invalid!").exit();
                }

                let value = result.replace(search, '');

                if (this.isValue(options[0])) {
                    value = options.shift();
                }

                objectOptions[name.replace(/-/g, '')] = value;
                continue;
            }

            const next = options.shift();
            
            if (!this.isValue(next)) {
                this.log("the option "+name+" have a value invalid!").exit();
            }

            objectOptions[name.replace(/-/g, '')] = next;
        }
        this.options = objectOptions;
    }

    execute() {
        const args = this.args;
        this.setAction(args);        
        this.setOptions(args);

        if (typeof this[this.action.name] != "function") {
            this.log("action "+this.action.name+" not created!").exit();
        }

        this[this.action.name](this.action.value, this.options);
    }

}

module.exports = Cliapp;
/* cliapp-end */