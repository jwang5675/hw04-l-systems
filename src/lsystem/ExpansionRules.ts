class ExpansionRules {
  axiom: string;
  grammar : Map<string, any> = new Map();
  controls: any;

  constructor(controls: any) {
    this.axiom = "F*XBL";
    this.grammar.set("F", this.expandForward);
    this.grammar.set("X", this.expandRecursively.bind(this));
    this.grammar.set("B", this.expandUpward);
    this.grammar.set("L", this.expandLeaf.bind(this));
    this.controls = controls;
  }

  expandForward() {
    return "F-F+";
  }

  expandRecursively() {
    return "[1~FXL][2~FXL][3~FXL][4~FXL][5~FXL][~FXL]";
  }

  expandUpward() {
    return "FBF*X";
  }

  expandLeaf() {
    if (Math.random() > (1 - this.controls["Randomness"])) {
      return "Q";
    } else {
      return "L";
    }
  }

  expandAxiom(iterations: number) {
    let resultAxiom: string = this.axiom;

    for (let i: number = 0; i < iterations; i++) {
      let newAxiom: string = "";
      for (let j: number = 0; j < resultAxiom.length; j++) {
        let currentChar: string = resultAxiom[j];
        let expansionFunc: any = this.grammar.get(currentChar);
        if (expansionFunc) {
          newAxiom = newAxiom + expansionFunc();
        } else {
          newAxiom = newAxiom + currentChar;
        }        
      }
      resultAxiom = newAxiom;
    }
    return resultAxiom;
  }

}

export default ExpansionRules;