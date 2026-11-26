
export abstract class ErreurDomaine extends Error {

  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    
    this.name = new.target.name;
  }
}