class ContextFreeGrammar {
    constructor(cfg) {
        this.nonterminals = new Set()
        this.terminals = new Set()
        this.grammar = {}
        this.order = []

        this.#parseGrammar(cfg)
        this.#eliminateLeftRecursion()
    }

    #isNonterminal(symbol) {
        return /^[A-Z]'*$/.test(symbol);
    }

    #splitSymbols(rule) {
        return rule.match(/[A-Z]'*|./g);
    }

    #getLeftNonterminal(rule) {
        return rule.match(/^[A-Z]'*/g)?.[0] || null;
    }

    #isLeftRecursive(nonterminal, rules) {
        for (const rule of rules) {
            if (rule.startsWith(nonterminal)) return true;
        }
        return false;
    }

    #generateNewNonterminal(base) {
        let newNonterminal = base + "'";
        while (this.nonterminals.has(newNonterminal)) {
            newNonterminal += "'";
        }

        this.nonterminals.add(newNonterminal);
        this.order.splice(this.order.indexOf(base) + 1, 0, newNonterminal);
        this.grammar[newNonterminal] = new Set();
        return newNonterminal;
    }

    #parseGrammar(cfg) {
        cfg.split("\n").forEach(production => {
            const [ nonterminal, rule ] = production.split("->");
            this.#initializeNonterminal(nonterminal);
            this.grammar[nonterminal].add(rule);
            this.#classifySymbols(rule);
        });
    }

    #initializeNonterminal(nonterminal) {
        if (nonterminal in this.grammar) {
            return;
        }
        if (!this.#isNonterminal(nonterminal)) {
            throw new Error(`El símbolo '${nonterminal}' no es un no-terminal válido`);
        }
        this.grammar[nonterminal] = new Set();
        this.nonterminals.add(nonterminal);
        this.order.push(nonterminal);
    }

    #classifySymbols(rule) {
        this.#splitSymbols(rule).forEach(symbol => {
            if (this.#isNonterminal(symbol)) {
                this.nonterminals.add(symbol);
                return;
            }
            this.terminals.add(symbol);
        });
    }

    #eliminateLeftRecursion() {
        for (const nonterminal of this.order) {
            this.#expandRules(nonterminal);
            console.log(this.grammar)
            if (this.#isLeftRecursive(nonterminal, this.grammar[nonterminal])) {
                this.#removeDirectLeftRecursion(nonterminal);
            }
            // Aca crea una funcion para factorizar 
        }
    }

    #eliminateLeftRecursion() {
        for (const nonterminal of this.order) {
            this.#expandRules(nonterminal);
            if (this.#isLeftRecursive(nonterminal, this.grammar[nonterminal])) {
                this.#removeDirectLeftRecursion(nonterminal);
            }
            this.#leftFactoring(nonterminal) // funcion para factorizar 
        }
    }

    #leftFactoring(nonterminal) {

    }

    #removeDirectLeftRecursion(nonterminal) {
        const newNonterminal = this.#generateNewNonterminal(nonterminal);
        const rules = new Set();
        
        this.grammar[nonterminal].forEach(rule => {
            const leftNonterminal = this.#getLeftNonterminal(rule);
            if (leftNonterminal === nonterminal) {
                this.grammar[newNonterminal].add(rule.slice(leftNonterminal.length) + newNonterminal);
            } else {
                rules.add(rule + newNonterminal);
            }
        });

        this.grammar[newNonterminal].add("&");
        this.grammar[nonterminal] = rules;
    }

    #expandRules(nonterminal) {
        const expandedRules = new Set();

        this.grammar[nonterminal].forEach(rule => {
            const expanded = this.#expandRule(nonterminal, rule);
            if (expanded) {
                expanded.forEach(exp => expandedRules.add(exp));
            } else {
                expandedRules.add(rule);
            }
        });

        this.grammar[nonterminal] = expandedRules
    }

    #expandRule(nonterminal, rule) {
        const expansions = [rule];
        const expansionGroups = [];

        for (const expansion of expansions) {
            const group = [];

            expansionGroups.push(group);

            const leftNonterminal = this.#getLeftNonterminal(expansion);

            if (!leftNonterminal || this.order.indexOf(leftNonterminal) >= this.order.indexOf(nonterminal)) {
                continue;
            }

            const expansionTail = expansion.slice(leftNonterminal.length);

            this.grammar[leftNonterminal].forEach(derivation => {
                const newExpansion = derivation + expansionTail;
                expansions.push(newExpansion);
                group.push(newExpansion);
            });
        }

        const finalExpansions = new Set(
            expansions.filter((exp, i) => expansionGroups[i].length === 0)
        );

        if (this.#isLeftRecursive(nonterminal, expansions)) {
            this.#contractExpansions(nonterminal, finalExpansions, expansions, expansionGroups);
            return finalExpansions;
        }

        this.#contractExpansions(nonterminal, finalExpansions, expansions, expansionGroups);
        return null;
    }

    #contractExpansions(nonterminal, finalExpansions, expansions, expansionGroups) {
        for (let i = expansions.length - 1; i >= 0; i--) {           
            const origin = expansions[i];
            const group = expansionGroups[i];

            if (!this.#isLeftRecursive(nonterminal, group) && group.every(expansion => finalExpansions.has(expansion))) {
                group.forEach(expansion => finalExpansions.delete(expansion));
                finalExpansions.add(origin);
            }
        }
    }

}

const gic1 = `S->(L)
S->a
L->L,S
L->S`;

const gic2 = `E->E+T
E->E-T
E->T
T->T*F
T->T/F
T->F
F->(E)
F->id`;

const gic3 = `A->Ba
B->Cb
C->Ac
C->d`;

const gic4 = `S->Sa
S->aAc
S->c
A->Ab
A->ba`;

const gic5 = `S->Ab
S->B
A->Aa
A->c
A->d
B->a
B->aB`;

console.log(new ContextFreeGrammar(gic3))
