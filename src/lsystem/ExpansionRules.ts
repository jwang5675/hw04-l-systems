class ExpansionRules {
  axiom: string;
  grammar : Map<string, any> = new Map();

  constructor() {
    this.axiom = "FX";
    this.grammar.set("F", this.expandF);
    this.grammar.set("X", this.expandX);
  }

  expandF() {
    return "FF";
  }

  expandX() {
    return "[+FX][-FX]FFX";
  }

}

export default ExpansionRules;