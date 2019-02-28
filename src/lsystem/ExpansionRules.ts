class ExpansionRules {
  axiom: string;
  grammar : Map<string, any> = new Map();

  constructor() {
    this.axiom = "F*XBL";
    this.grammar.set("F", this.expandForward);
    this.grammar.set("X", this.expandRecursively);
    this.grammar.set("B", this.expandUpward);
    this.grammar.set("L", this.expandLeaf);
  }

  expandForward() {
    return "F-F+";
  }

  expandRecursively() {
    return "[1~FXL][2~FXL][3~FXL][4~FXL][5~FXL][~FXL]";
  }

  expandUpward() {
    //return "F*XFFB";
    return "FBF*X";
  }

  expandLeaf() {
    return "L";
  }

}

export default ExpansionRules;