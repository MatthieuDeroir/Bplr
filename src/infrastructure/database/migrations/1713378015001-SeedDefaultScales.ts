// src/infrastructure/database/migrations/1713378015001-SeedDefaultScales.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDefaultScales1713378015001 implements MigrationInterface {
    name = 'SeedDefaultScales1713378015001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create default scales
        const humeurScaleId = await this.createDefaultScale(queryRunner, {
            name: 'humeur',
            description: 'Échelle de l\'Humeur (Dépression ←→ Manie)',
            minValue: 0,
            maxValue: 13,
            isDefault: true,
            isActive: true
        });

        const irritabiliteScaleId = await this.createDefaultScale(queryRunner, {
            name: 'irritabilite',
            description: 'Échelle d\'Irritabilité',
            minValue: 0,
            maxValue: 13,
            isDefault: true,
            isActive: true
        });

        const confianceScaleId = await this.createDefaultScale(queryRunner, {
            name: 'confiance',
            description: 'Échelle de Confiance en soi',
            minValue: 0,
            maxValue: 13,
            isDefault: true,
            isActive: true
        });

        const extraversionScaleId = await this.createDefaultScale(queryRunner, {
            name: 'extraversion',
            description: 'Échelle d\'Extraversion (Sociabilité)',
            minValue: 0,
            maxValue: 13,
            isDefault: true,
            isActive: true
        });

        const bienEtreScaleId = await this.createDefaultScale(queryRunner, {
            name: 'bien_etre',
            description: 'Échelle de Bien-être (Anxiété inversée)',
            minValue: 0,
            maxValue: 13,
            isDefault: true,
            isActive: true
        });

        // Add scale levels for each scale
        await this.addHumeurLevels(queryRunner, humeurScaleId);
        await this.addIrritabiliteLevels(queryRunner, irritabiliteScaleId);
        await this.addConfianceLevels(queryRunner, confianceScaleId);
        await this.addExtraversionLevels(queryRunner, extraversionScaleId);
        await this.addBienEtreLevels(queryRunner, bienEtreScaleId);

        // Create default stability formula
        const formulaId = await this.createDefaultFormula(queryRunner, {
            description: 'Formule par défaut, toutes les échelles ayant le même poids sauf irritabilité qui est inversée',
            isDefault: true,
            isActive: true
        });

        // Add scale weights to the formula
        await this.addScaleWeight(queryRunner, formulaId, humeurScaleId, 1.0, false);
        await this.addScaleWeight(queryRunner, formulaId, irritabiliteScaleId, 1.0, true);
        await this.addScaleWeight(queryRunner, formulaId, confianceScaleId, 1.0, false);
        await this.addScaleWeight(queryRunner, formulaId, extraversionScaleId, 1.0, false);
        await this.addScaleWeight(queryRunner, formulaId, bienEtreScaleId, 1.0, false);

        // Generate the formula string
        const formula = `humeur:1,irritabilite:1:true,confiance:1,extraversion:1,bien_etre:1`;
        await queryRunner.query(`
            UPDATE "stability_formulas" 
            SET "formula" = $1 
            WHERE "id" = $2
        `, [formula, formulaId]);
    }

    private async createDefaultScale(queryRunner: QueryRunner, scale: {
        name: string;
        description: string;
        minValue: number;
        maxValue: number;
        isDefault: boolean;
        isActive: boolean;
    }): Promise<string> {
        const result = await queryRunner.query(`
            INSERT INTO "scales" 
            ("name", "description", "minValue", "maxValue", "isDefault", "isActive", "createdAt", "updatedAt") 
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
            RETURNING "id"
        `, [scale.name, scale.description, scale.minValue, scale.maxValue, scale.isDefault, scale.isActive]);

        return result[0].id;
    }

    private async createDefaultFormula(queryRunner: QueryRunner, formula: {
        description: string;
        isDefault: boolean;
        isActive: boolean;
    }): Promise<string> {
        const result = await queryRunner.query(`
            INSERT INTO "stability_formulas" 
            ("description", "formula", "isDefault", "isActive", "createdAt", "updatedAt") 
            VALUES ($1, $2, $3, $4, NOW(), NOW()) 
            RETURNING "id"
        `, [formula.description, '', formula.isDefault, formula.isActive]);

        return result[0].id;
    }

    private async addScaleWeight(
        queryRunner: QueryRunner,
        formulaId: string,
        scaleId: string,
        weight: number,
        isInverted: boolean
    ): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "scale_weights" 
            ("stabilityFormulaId", "scaleId", "weight", "isInverted", "createdAt") 
            VALUES ($1, $2, $3, $4, NOW())
        `, [formulaId, scaleId, weight, isInverted]);
    }

    private async addHumeurLevels(queryRunner: QueryRunner, scaleId: string): Promise<void> {
        const levels = [
            { level: 0, description: "Détresse absolue : désespoir intense, idées suicidaires ou grande souffrance psychique." },
            { level: 1, description: "Dépression très sévère : incapacité quasi totale à fonctionner, tristesse omniprésente." },
            { level: 2, description: "Dépression marquée : pleurs fréquents, sentiment de culpabilité ou d'inutilité prononcé." },
            { level: 3, description: "Dépression modérée : fatigue importante, ralentissement, difficultés à éprouver du plaisir." },
            { level: 4, description: "Déprime notable : humeur morose la majeure partie du temps, mais moments de répit." },
            { level: 5, description: "Légère dépression : pessimisme, baisse de motivation, on arrive cependant à faire l'essentiel." },
            { level: 6, description: "Humeur légèrement basse : tristesse diffuse, mais capacité à fonctionner presque normale." },
            { level: 7, description: "Humeur neutre : ni tristesse majeure, ni euphorie, sentiment d'équilibre." },
            { level: 8, description: "Humeur positive : bonne énergie, optimisme modéré, on se sent assez bien." },
            { level: 9, description: "Humeur assez élevée : enthousiasme, vitalité, légère euphorie possible." },
            { level: 10, description: "Humeur haute : exaltation, créativité, possible tendance à parler beaucoup plus vite." },
            { level: 11, description: "Hypomanie : énergie débordante, insomnie ou besoin de sommeil réduit, irritabilité potentielle." },
            { level: 12, description: "Forte hypomanie / proche manie : sentiment de toute-puissance, impulsivité accrue, difficulté à se concentrer." },
            { level: 13, description: "Manie : euphorie ou irritabilité extrême, risque de comportements dangereux, déconnexion partielle de la réalité." }
        ];

        for (const level of levels) {
            await queryRunner.query(`
                INSERT INTO "scale_levels" 
                ("scaleId", "level", "description", "createdAt", "updatedAt") 
                VALUES ($1, $2, $3, NOW(), NOW())
            `, [scaleId, level.level, level.description]);
        }
    }

    private async addIrritabiliteLevels(queryRunner: QueryRunner, scaleId: string): Promise<void> {
        const levels = [
            { level: 0, description: "Zéro irritation : calme parfait, aucune colère." },
            { level: 1, description: "Très légèrement irritable : un agacement bref possible, mais vite maîtrisé." },
            { level: 2, description: "Irritabilité faible : on peut s'énerver un peu si contrarié, mais globalement on reste posé." },
            { level: 3, description: "Irritabilité modérée : on se sent facilement agacé, tension notable, mais pas d'explosion." },
            { level: 4, description: "Fréquent agacement : on \"bouillonne\" plus facilement, impatience récurrente." },
            { level: 5, description: "Agacement soutenu : début de hausse de ton, possibilité de paroles sèches ou agressives." },
            { level: 6, description: "Montée de colère : on se braque rapidement, tendance à réagir vivement à la moindre contrariété." },
            { level: 7, description: "Irritabilité moyenne : on s'énerve lorsqu'une limite est franchie, mais ça reste gérable." },
            { level: 8, description: "Irritabilité forte : la colère affleure souvent, conflits plus fréquents." },
            { level: 9, description: "Colère récurrente : hausse du volume sonore, propos blessants ou impulsifs." },
            { level: 10, description: "Irritabilité très marquée : peu de patience, accès de colère parfois soudains." },
            { level: 11, description: "Colère explosive potentielle : on peine à se retenir, réactions excessives." },
            { level: 12, description: "Agressivité réelle : on peut crier, avoir des gestes brusques ou violents, tension permanente." },
            { level: 13, description: "Irritabilité extrême : colère quasi constante, impossibilité de se calmer, situation dangereuse ou incontrôlée." }
        ];

        for (const level of levels) {
            await queryRunner.query(`
                INSERT INTO "scale_levels" 
                ("scaleId", "level", "description", "createdAt", "updatedAt") 
                VALUES ($1, $2, $3, NOW(), NOW())
            `, [scaleId, level.level, level.description]);
        }
    }

    private async addConfianceLevels(queryRunner: QueryRunner, scaleId: string): Promise<void> {
        const levels = [
            { level: 0, description: "Auto-dévalorisation totale : sentiment d'infériorité, honte, incapacité perçue dans tous les domaines." },
            { level: 1, description: "Confiance minimale : énorme doute de soi, peur de l'échec, évitement massif." },
            { level: 2, description: "Très faible estime : impression de compétence quasi nulle, on se sent « moins bon » que tout le monde." },
            { level: 3, description: "Confiance limitée : hésitation à prendre la parole, crainte du jugement, mais quelques rares moments d'assurance." },
            { level: 4, description: "Confiance timide : on ose un peu, mais on a besoin d'encouragement ou de validation." },
            { level: 5, description: "Confiance en soi sous la moyenne : quelques appréhensions, sentiment de ne pas être au top." },
            { level: 6, description: "Légère assurance : on arrive à agir, malgré des doutes, on fonctionne « passablement »." },
            { level: 7, description: "Confiance moyenne : on se sent plutôt à l'aise, tout en restant conscient de ses limites." },
            { level: 8, description: "Bonne estime : aisance relationnelle, on s'exprime avec moins de crainte, on se sent capable." },
            { level: 9, description: "Confiance solide : on croit en ses capacités, on prend des initiatives, peu d'auto-sabotage." },
            { level: 10, description: "Forte assurance : on se sait compétent dans plusieurs domaines, on n'hésite pas à s'exposer." },
            { level: 11, description: "Surconfiance : on commence à surestimer ses capacités, on sous-estime les risques." },
            { level: 12, description: "Mégalomanie légère : sentiment de supériorité net, on se croit capable de tout, possible manque d'empathie." },
            { level: 13, description: "Surconfiance extrême : mégalomanie franche, sentiment d'invincibilité, risques majeurs de comportements imprudents." }
        ];

        for (const level of levels) {
            await queryRunner.query(`
                INSERT INTO "scale_levels" 
                ("scaleId", "level", "description", "createdAt", "updatedAt") 
                VALUES ($1, $2, $3, NOW(), NOW())
            `, [scaleId, level.level, level.description]);
        }
    }

    private async addExtraversionLevels(queryRunner: QueryRunner, scaleId: string): Promise<void> {
        const levels = [
            { level: 0, description: "Fermeture totale : envie de voir personne, isolement complet, évitement extrême." },
            { level: 1, description: "Sociabilité quasi nulle : on sort ou contacte autrui uniquement si on n'a pas le choix." },
            { level: 2, description: "Faible sociabilité : on supporte quelques rares échanges, mais avec réticence." },
            { level: 3, description: "Introversion marquée : on préfère être seul, on accepte un peu de compagnie ponctuellement." },
            { level: 4, description: "Plutôt réservé : on peut apprécier certaines rencontres, mais on a besoin de beaucoup de temps seul." },
            { level: 5, description: "Légèrement introverti : on participe un minimum, sans aller spontanément vers les autres." },
            { level: 6, description: "Légère préférence pour la solitude : on ne fuit pas la compagnie, mais on n'en a pas un grand besoin." },
            { level: 7, description: "Extraversion moyenne : à l'aise tant seul qu'en groupe, pas de forte préférence." },
            { level: 8, description: "Sociable : plaisir à interagir, on va parfois vers de nouvelles connaissances." },
            { level: 9, description: "Extraverti : on aime être en groupe, on parle volontiers, on cherche activement des contacts." },
            { level: 10, description: "Très sociable : on a souvent besoin de voir du monde, on déteste rester seul trop longtemps." },
            { level: 11, description: "Extraversion marquée : on multiplie les rencontres, recherche permanente de stimulation sociale." },
            { level: 12, description: "Hyper-extraversion : on ne supporte presque pas la solitude, on a besoin d'attention quasi constante." },
            { level: 13, description: "Exubérance totale : on veut être entouré en permanence, on se sent « éteint » sans public, risque d'agitation sociale." }
        ];

        for (const level of levels) {
            await queryRunner.query(`
                INSERT INTO "scale_levels" 
                ("scaleId", "level", "description", "createdAt", "updatedAt") 
                VALUES ($1, $2, $3, NOW(), NOW())
            `, [scaleId, level.level, level.description]);
        }
    }

    private async addBienEtreLevels(queryRunner: QueryRunner, scaleId: string): Promise<void> {
        const levels = [
            { level: 0, description: "Détresse totale : panique, terreur, crises d'angoisse fortes, sensation d'être en danger permanent." },
            { level: 1, description: "Anxiété intense : stress constant, tensions physiques, hypervigilance, on se sent submergé." },
            { level: 2, description: "Anxiété très élevée : nombreuses inquiétudes, ruminations quasi continues, difficulté à se calmer." },
            { level: 3, description: "Grande anxiété : on fait face, mais avec beaucoup de mal, troubles du sommeil fréquents." },
            { level: 4, description: "Anxiété modérée-forte : préoccupations récurrentes, sensations corporelles de stress (maux de ventre, etc.)." },
            { level: 5, description: "Anxiété sensible : on est souvent tendu, mais on parvient parfois à se détendre." },
            { level: 6, description: "Anxiété moyenne : préoccupations, mais on peut connaître des moments de calme." },
            { level: 7, description: "Équilibre neutre : niveau « normal » de stress, globalement gérable." },
            { level: 8, description: "Bien-être modéré : on se sent plutôt serein, la nervosité est occasionnelle." },
            { level: 9, description: "Bonne détente : on est relativement confiant, anxiété légère et sporadique." },
            { level: 10, description: "Niveau de bien-être élevé : on se sent calme la plupart du temps, peu de stress." },
            { level: 11, description: "Sérénité importante : peu de pensées anxieuses, sentiment de paix assez stable." },
            { level: 12, description: "Profonde tranquillité : anxiété très rare, sentiment de bien-être presque constant." },
            { level: 13, description: "Bien-être total : aucune angoisse, grande sérénité intérieure, sentiment de sécurité absolue." }
        ];

        for (const level of levels) {
            await queryRunner.query(`
                INSERT INTO "scale_levels" 
                ("scaleId", "level", "description", "createdAt", "updatedAt") 
                VALUES ($1, $2, $3, NOW(), NOW())
            `, [scaleId, level.level, level.description]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete all default scales and formulas
        await queryRunner.query(`DELETE FROM "scales" WHERE "isDefault" = true`);
        await queryRunner.query(`DELETE FROM "stability_formulas" WHERE "isDefault" = true`);
    }
}
