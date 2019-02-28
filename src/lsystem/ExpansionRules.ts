class ExpansionRules {
  axiom: string;
  grammar : Map<string, any> = new Map();

  constructor() {
    this.axiom = "XBL";
    this.grammar.set("F", this.expandF);
    this.grammar.set("X", this.expandX);
    this.grammar.set("B", this.expandB);
    this.grammar.set("L", this.expandL);
  }

  expandF() {
    return "FF";
  }

  expandX() {
    return "[+FXL][-FXL][(FXL][)FXL]";
  }

  expandB() {
    return "FXFXB";
  }

  expandL() {
    return "L";
  }

}

export default ExpansionRules;