import { ErreurDomaine } from "./erreurs";
import { PeriodeSondage } from "./PeriodeSondage";


export class QuestionVide extends ErreurDomaine {
    readonly code = "question-vide"; 
    constructor() {super("La question du sondage ne peut pas être vide");}
}

export class OptionsInsuffisantes extends ErreurDomaine {
    readonly code = "options-insuffisantes";
    constructor(nombre:number) {super(`Un sondage a besoin d'au moins deux options, reçu :${nombre}`);}
}

export class OptionsEnDouble extends ErreurDomaine {
    readonly code = "options-en-double";
    constructor(option:string) {super(`Un sondage ne peux pas avoir des options en double, l'option ${option} existe déjà`);}
}

export class SondageHorsPeriode extends ErreurDomaine { 
    readonly code = "sondage-hors-periode";
    constructor (sondageId:string) {super(`Un sondage ${sondageId} n'est pas ouvert au vote`)}
}

export class DejaVote extends ErreurDomaine {
    readonly code = "deja-vote"; 
    constructor (sondageId:string, votantId:string) {super(`${votantId}a déjà voté au ${sondageId}`)}
}

export class BulletinVide extends ErreurDomaine {
    readonly code = "bulletin-vide";
    constructor() { super("Un vote doit contenir au moins une option"); }
}
  
export class OptionInconnue extends ErreurDomaine {
    readonly code = "option-inconnue";
    constructor(option: string) { super(`L'option « ${option} » n'existe pas dans ce sondage`); }
}

export class ChoixEnDouble extends ErreurDomaine {
    readonly code = "choix-en-double";
    constructor(option: string) { super(`L'option « ${option} » est cochée deux fois`); }
}
   
export class ChoixUniqueDepasse extends ErreurDomaine {
     readonly code = "choix-unique-depasse";
     constructor(nombre: number) { super(`Ce sondage n'accepte qu'une option (reçu : ${nombre})`); }
}

export type ModeDeChoix = "unique" | "multiple";

export interface Vote {
    readonly id : string;
    readonly votantId : string;
    readonly options : readonly string[];
    readonly le : Date; 
}

export interface SondageProps {
    question: string;
    options: string[];
    mode: ModeDeChoix;
    periode: PeriodeSondage;
    associationId: string;
    createurId: string;
    votes: Vote[];
   }

export type NouveauSondage = Omit<SondageProps, "votes"> & {id : string};

export class Sondage {
    private constructor (readonly id:string, private props:SondageProps) {}

    static creer(donnees:NouveauSondage): Sondage
    {
        if (donnees.question.trim() === "") throw new QuestionVide();
        if (donnees.options.length < 2) throw new OptionsInsuffisantes(donnees.options.length);
        const doublon = trouverDoublon(donnees.options);
       if (doublon !== undefined) throw new OptionsEnDouble(doublon);
      const { id, ...reste } = donnees;
       return new Sondage(id, { ...reste, options: [...donnees.options], votes: [] });
     }


    static restaurer(id: string, props: SondageProps): Sondage {
        return new Sondage(id, { ...props, options: [...props.options], votes: [...props.votes] });
    }
 
     get question(): string { return this.props.question; }
     get mode(): ModeDeChoix { return this.props.mode; }
     get periode(): PeriodeSondage { return this.props.periode; }
     get associationId(): string { return this.props.associationId; }
     get createurId(): string { return this.props.createurId; }
     get options(): readonly string[] { return [...this.props.options]; }
     get votes(): readonly Vote[] { return [...this.props.votes]; }
 
     voter(voteId: string, votantId: string, choix: string[], maintenant: Date): Vote {
       if (!this.props.periode.contient(maintenant)) {
         throw new SondageHorsPeriode(this.id);
       }
       if (this.props.votes.some((v) => v.votantId === votantId)) {
         throw new DejaVote(this.id, votantId);
       }
       this.verifierBulletin(choix);
      const vote: Vote = { id: voteId, votantId, options: [...choix], le: maintenant };
      this.props.votes.push(vote);
      return vote;
    }

    private verifierBulletin(choix: string[]): void {
      if (choix.length === 0) throw new BulletinVide();
      const inconnue = choix.find((c) => !this.props.options.includes(c));
      if (inconnue !== undefined) throw new OptionInconnue(inconnue);
      const doublon = trouverDoublon(choix);
      if (doublon !== undefined) throw new ChoixEnDouble(doublon);
      if (this.props.mode === "unique" && choix.length > 1) {
        throw new ChoixUniqueDepasse(choix.length);
      }
    }
  }

  function trouverDoublon(valeurs: readonly string[]): string | undefined {
    return valeurs.find((v, i) => valeurs.indexOf(v) !== i);
  } 
    

