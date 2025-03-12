// scripts/setup-database.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../src/infrastructure/database/data-source';
import { ScaleEntity } from '../src/infrastructure/database/entities/scale.entity';
import { ScaleLevelEntity } from '../src/infrastructure/database/entities/scale-level.entity';
import { StabilityFormulaEntity } from '../src/infrastructure/database/entities/stability-formula.entity';
import { ScaleWeightEntity } from '../src/infrastructure/database/entities/scale-weight.entity';
import { UserEntity } from '../src/infrastructure/database/entities/user.entity';
import { MoodEntryEntity } from '../src/infrastructure/database/entities/mood-entry.entity';
import { MoodScaleValueEntity } from '../src/infrastructure/database/entities/mood-scale-value.entity';
import * as bcrypt from 'bcrypt';

// Define fixed UUIDs for consistent references
const SCALE_IDS = {
    HUMEUR: '9e28a52b-1a43-456d-be3d-85ec1d8d7dc5',
    IRRITABILITE: 'a3cfcd9b-2608-4dce-a576-b0cab5894af5',
    CONFIANCE: 'c7f09f47-c71f-4d2e-9e06-b53c6e9dec2f',
    EXTRAVERSION: 'd9b93e39-2d19-4af1-aae6-6895522bf81a',
    BIEN_ETRE: 'f5a28535-76db-4aec-80c4-303c1497a707'
};

const FORMULA_ID = 'b0c0b3b8-c8a3-44c0-8a9d-2c53813d882e';
const DEMO_USER_ID = '64b31607-1717-44d4-8344-5898a4119bd9';

// Initialize the database
async function initializeDatabase() {
    try {
        console.log('Initializing database connection...');
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        console.log('Database connection initialized successfully');

        await runDatabaseSetup(AppDataSource);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

async function tablesExist(dataSource: DataSource): Promise<boolean> {
    try {
        // Check if users table exists
        const usersExist = await dataSource.query(
            `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'users'
       )`
        );

        return usersExist[0].exists;
    } catch (error) {
        console.error('Error checking if tables exist:', error);
        return false;
    }
}

async function runDatabaseSetup(dataSource: DataSource) {
    try {
        console.log('Starting database setup...');

        // Check if tables already exist
        const tablesAlreadyExist = await tablesExist(dataSource);

        if (!tablesAlreadyExist) {
            // If tables don't exist, run migrations
            console.log('Tables do not exist. Running migrations...');
            try {
                const pendingMigrations = await dataSource.showMigrations();
                if (pendingMigrations) {
                    await dataSource.runMigrations();
                    console.log('Migrations completed successfully');
                } else {
                    console.log('No pending migrations');
                }
            } catch (migrationError) {
                console.error('Migration error:', migrationError);
                console.log('Attempting to continue with seeding...');
            }
        } else {
            console.log('Tables already exist. Skipping migrations.');
        }

        // Check if we need to seed data
        const scales = await dataSource.getRepository(ScaleEntity).find();
        if (scales.length > 0) {
            console.log('Database already contains scales. Checking default scales...');

            // Check if we need to add any missing default scales
            for (const scaleId of Object.values(SCALE_IDS)) {
                const scale = await dataSource.getRepository(ScaleEntity).findOne({ where: { id: scaleId } });
                if (!scale) {
                    console.log(`Default scale ${scaleId} not found. Adding missing scales...`);
                    await seedDefaultScales(dataSource);
                    break;
                }
            }
        } else {
            console.log('No scales found. Seeding default scales...');
            await seedDefaultScales(dataSource);
        }

        // Check if default formula exists
        const formula = await dataSource.getRepository(StabilityFormulaEntity).findOne({
            where: { id: FORMULA_ID }
        });

        if (!formula) {
            console.log('Default formula not found. Seeding formula...');
            await seedDefaultFormula(dataSource);
        } else {
            console.log('Default formula already exists.');
        }

        // Check if demo user exists
        const demoUser = await dataSource.getRepository(UserEntity).findOne({
            where: { id: DEMO_USER_ID }
        });

        if (!demoUser) {
            console.log('Demo user not found. Creating demo user...');
            await createDemoUser(dataSource);
        } else {
            console.log('Demo user already exists.');
        }

        // Check if we need to add example mood entries
        const moodEntries = await dataSource.getRepository(MoodEntryEntity).find({
            where: { userId: DEMO_USER_ID }
        });

        if (moodEntries.length === 0) {
            console.log('No mood entries found for demo user. Creating examples...');
            await createExampleMoodEntries(dataSource);
        } else {
            console.log(`${moodEntries.length} mood entries already exist for demo user.`);
        }

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
}

async function seedDefaultScales(dataSource: DataSource) {
    try {
        const scaleRepository = dataSource.getRepository(ScaleEntity);
        const scaleLevelRepository = dataSource.getRepository(ScaleLevelEntity);

        // Create Humeur scale if it doesn't exist
        const humeurScale = await scaleRepository.findOne({ where: { id: SCALE_IDS.HUMEUR } });
        if (!humeurScale) {
            await scaleRepository.save({
                id: SCALE_IDS.HUMEUR,
                name: 'humeur',
                description: 'Échelle de l\'Humeur (Dépression ←→ Manie)',
                minValue: 0,
                maxValue: 13,
                isDefault: true,
                isActive: true
            });
            await addHumeurLevels(scaleLevelRepository, SCALE_IDS.HUMEUR);
        }

        // Create Irritabilite scale if it doesn't exist
        const irritabiliteScale = await scaleRepository.findOne({ where: { id: SCALE_IDS.IRRITABILITE } });
        if (!irritabiliteScale) {
            await scaleRepository.save({
                id: SCALE_IDS.IRRITABILITE,
                name: 'irritabilite',
                description: 'Échelle d\'Irritabilité',
                minValue: 0,
                maxValue: 13,
                isDefault: true,
                isActive: true
            });
            await addIrritabiliteLevels(scaleLevelRepository, SCALE_IDS.IRRITABILITE);
        }

        // Create Confiance scale if it doesn't exist
        const confianceScale = await scaleRepository.findOne({ where: { id: SCALE_IDS.CONFIANCE } });
        if (!confianceScale) {
            await scaleRepository.save({
                id: SCALE_IDS.CONFIANCE,
                name: 'confiance',
                description: 'Échelle de Confiance en soi',
                minValue: 0,
                maxValue: 13,
                isDefault: true,
                isActive: true
            });
            await addConfianceLevels(scaleLevelRepository, SCALE_IDS.CONFIANCE);
        }

        // Create Extraversion scale if it doesn't exist
        const extraversionScale = await scaleRepository.findOne({ where: { id: SCALE_IDS.EXTRAVERSION } });
        if (!extraversionScale) {
            await scaleRepository.save({
                id: SCALE_IDS.EXTRAVERSION,
                name: 'extraversion',
                description: 'Échelle d\'Extraversion (Sociabilité)',
                minValue: 0,
                maxValue: 13,
                isDefault: true,
                isActive: true
            });
            await addExtraversionLevels(scaleLevelRepository, SCALE_IDS.EXTRAVERSION);
        }

        // Create Bien-être scale if it doesn't exist
        const bienEtreScale = await scaleRepository.findOne({ where: { id: SCALE_IDS.BIEN_ETRE } });
        if (!bienEtreScale) {
            await scaleRepository.save({
                id: SCALE_IDS.BIEN_ETRE,
                name: 'bien_etre',
                description: 'Échelle de Bien-être (Anxiété inversée)',
                minValue: 0,
                maxValue: 13,
                isDefault: true,
                isActive: true
            });
            await addBienEtreLevels(scaleLevelRepository, SCALE_IDS.BIEN_ETRE);
        }

        console.log('Default scales created or updated successfully');
    } catch (error) {
        console.error('Error creating default scales:', error);
        throw error;
    }
}

async function seedDefaultFormula(dataSource: DataSource) {
    try {
        const formulaRepository = dataSource.getRepository(StabilityFormulaEntity);
        const scaleWeightRepository = dataSource.getRepository(ScaleWeightEntity);

        // Check if formula already exists
        const existingFormula = await formulaRepository.findOne({ where: { id: FORMULA_ID } });
        if (existingFormula) {
            console.log('Default formula already exists, skipping creation');
            return;
        }

        // Create default formula
        await formulaRepository.save({
            id: FORMULA_ID,
            description: 'Formule par défaut, toutes les échelles ayant le même poids sauf irritabilité qui est inversée',
            formula: `${SCALE_IDS.HUMEUR}:1,${SCALE_IDS.IRRITABILITE}:1:true,${SCALE_IDS.CONFIANCE}:1,${SCALE_IDS.EXTRAVERSION}:1,${SCALE_IDS.BIEN_ETRE}:1`,
            isDefault: true,
            isActive: true
        });

        // Add scale weights
        await scaleWeightRepository.save([
            {
                stabilityFormulaId: FORMULA_ID,
                scaleId: SCALE_IDS.HUMEUR,
                weight: 1.0,
                isInverted: false
            },
            {
                stabilityFormulaId: FORMULA_ID,
                scaleId: SCALE_IDS.IRRITABILITE,
                weight: 1.0,
                isInverted: true
            },
            {
                stabilityFormulaId: FORMULA_ID,
                scaleId: SCALE_IDS.CONFIANCE,
                weight: 1.0,
                isInverted: false
            },
            {
                stabilityFormulaId: FORMULA_ID,
                scaleId: SCALE_IDS.EXTRAVERSION,
                weight: 1.0,
                isInverted: false
            },
            {
                stabilityFormulaId: FORMULA_ID,
                scaleId: SCALE_IDS.BIEN_ETRE,
                weight: 1.0,
                isInverted: false
            }
        ]);

        console.log('Default stability formula created successfully');
    } catch (error) {
        console.error('Error creating default formula:', error);
        throw error;
    }
}

async function createDemoUser(dataSource: DataSource) {
    try {
        const userRepository = dataSource.getRepository(UserEntity);

        // Check if demo user already exists
        const existingUser = await userRepository.findOne({ where: { id: DEMO_USER_ID } });
        if (existingUser) {
            console.log('Demo user already exists, skipping creation');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('demopassword', salt);

        // Create demo user
        await userRepository.save({
            id: DEMO_USER_ID,
            email: 'demo@example.com',
            username: 'demouser',
            passwordHash
        });

        console.log('Demo user created successfully');
    } catch (error) {
        console.error('Error creating demo user:', error);
        throw error;
    }
}

async function createExampleMoodEntries(dataSource: DataSource) {
    try {
        const moodEntryRepository = dataSource.getRepository(MoodEntryEntity);
        const moodScaleValueRepository = dataSource.getRepository(MoodScaleValueEntity);

        // Check if mood entries already exist for demo user
        const existingEntries = await moodEntryRepository.find({ where: { userId: DEMO_USER_ID } });
        if (existingEntries.length > 0) {
            console.log(`${existingEntries.length} mood entries already exist for demo user, skipping creation`);
            return;
        }

        // Create a few example mood entries for the demo user
        const today = new Date();

        // Create entries for the last 7 days
        for (let i = 0; i < 7; i++) {
            const entryDate = new Date(today);
            entryDate.setDate(today.getDate() - i);

            // Random score between 60 and 90
            const stabilityScore = Math.floor(Math.random() * 30) + 60;

            const entryId = uuidv4();

            await moodEntryRepository.save({
                id: entryId,
                userId: DEMO_USER_ID,
                entryDate,
                comment: `Example mood entry for ${entryDate.toISOString().split('T')[0]}`,
                medication: i % 2 === 0 ? 'Example medication' : '',
                sleepHours: 6 + Math.floor(Math.random() * 3),
                stabilityScore
            });

            // Create scale values for this entry
            const scaleValues = [
                {
                    moodEntryId: entryId,
                    scaleId: SCALE_IDS.HUMEUR,
                    value: 7 + Math.floor(Math.random() * 3)
                },
                {
                    moodEntryId: entryId,
                    scaleId: SCALE_IDS.IRRITABILITE,
                    value: 3 + Math.floor(Math.random() * 3)
                },
                {
                    moodEntryId: entryId,
                    scaleId: SCALE_IDS.CONFIANCE,
                    value: 6 + Math.floor(Math.random() * 4)
                },
                {
                    moodEntryId: entryId,
                    scaleId: SCALE_IDS.EXTRAVERSION,
                    value: 5 + Math.floor(Math.random() * 4)
                },
                {
                    moodEntryId: entryId,
                    scaleId: SCALE_IDS.BIEN_ETRE,
                    value: 7 + Math.floor(Math.random() * 3)
                }
            ];

            await moodScaleValueRepository.save(scaleValues);
        }

        console.log('Example mood entries created successfully');
    } catch (error) {
        console.error('Error creating example mood entries:', error);
        throw error;
    }
}

async function addHumeurLevels(scaleLevelRepository: any, scaleId: string) {
    // Check if levels already exist
    const existingLevels = await scaleLevelRepository.find({ where: { scaleId } });
    if (existingLevels.length > 0) {
        console.log(`Levels for scale ${scaleId} already exist, skipping creation`);
        return;
    }

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
        await scaleLevelRepository.save({
            scaleId,
            level: level.level,
            description: level.description
        });
    }
}

async function addIrritabiliteLevels(scaleLevelRepository: any, scaleId: string) {
    // Check if levels already exist
    const existingLevels = await scaleLevelRepository.find({ where: { scaleId } });
    if (existingLevels.length > 0) {
        console.log(`Levels for scale ${scaleId} already exist, skipping creation`);
        return;
    }

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
        await scaleLevelRepository.save({
            scaleId,
            level: level.level,
            description: level.description
        });
    }
}

async function addConfianceLevels(scaleLevelRepository: any, scaleId: string) {
    // Check if levels already exist
    const existingLevels = await scaleLevelRepository.find({ where: { scaleId } });
    if (existingLevels.length > 0) {
        console.log(`Levels for scale ${scaleId} already exist, skipping creation`);
        return;
    }

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
        await scaleLevelRepository.save({
            scaleId,
            level: level.level,
            description: level.description
        });
    }
}

async function addExtraversionLevels(scaleLevelRepository: any, scaleId: string) {
    // Check if levels already exist
    const existingLevels = await scaleLevelRepository.find({ where: { scaleId } });
    if (existingLevels.length > 0) {
        console.log(`Levels for scale ${scaleId} already exist, skipping creation`);
        return;
    }

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
        await scaleLevelRepository.save({
            scaleId,
            level: level.level,
            description: level.description
        });
    }
}

async function addBienEtreLevels(scaleLevelRepository: any, scaleId: string) {
    // Check if levels already exist
    const existingLevels = await scaleLevelRepository.find({ where: { scaleId } });
    if (existingLevels.length > 0) {
        console.log(`Levels for scale ${scaleId} already exist, skipping creation`);
        return;
    }

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
        await scaleLevelRepository.save({
            scaleId,
            level: level.level,
            description: level.description
        });
    }
}

// Run the initialization
initializeDatabase()
    .then(() => {
        console.log('Database setup completed successfully. Exiting...');
        process.exit(0);
    })
    .catch(error => {
        console.error('Database setup failed:', error);
        process.exit(1);
    });