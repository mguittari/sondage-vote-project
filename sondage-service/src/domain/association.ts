class Association {
  constructor(
    public readonly id: string,
    public nom: string,
  ) {}

  renommer(nouveauNom: string) {
    if (!nouveauNom.trim()) throw new Error("Nom obligatoire");
    this.nom = nouveauNom;
  }
}

interface AssociationRepository {
  trouverParId(id: string): Promise<Association | null>;
  creer(association: Association): Promise<void>;
}