// src/types.ts
export const TYPES = {
    // Repositories
    UserRepository: Symbol.for('UserRepository'),
    ScaleRepository: Symbol.for('ScaleRepository'),
    ScaleLevelRepository: Symbol.for('ScaleLevelRepository'),
    MoodEntryRepository: Symbol.for('MoodEntryRepository'),
    MoodScaleValueRepository: Symbol.for('MoodScaleValueRepository'),
    StabilityFormulaRepository: Symbol.for('StabilityFormulaRepository'),
    ScaleWeightRepository: Symbol.for('ScaleWeightRepository'),

    // TypeORM Repositories
    UserEntityRepository: Symbol.for('UserEntityRepository'),
    ScaleEntityRepository: Symbol.for('ScaleEntityRepository'),
    ScaleLevelEntityRepository: Symbol.for('ScaleLevelEntityRepository'),
    MoodEntryEntityRepository: Symbol.for('MoodEntryEntityRepository'),
    MoodScaleValueEntityRepository: Symbol.for('MoodScaleValueEntityRepository'),
    StabilityFormulaEntityRepository: Symbol.for('StabilityFormulaEntityRepository'),
    ScaleWeightEntityRepository: Symbol.for('ScaleWeightEntityRepository'),

    // Domain Services
    StabilityCalculatorService: Symbol.for('StabilityCalculatorService'),
    ScaleManagementService: Symbol.for('ScaleManagementService'),
    StabilityFormulaParserService: Symbol.for('StabilityFormulaParserService'),

    // Application Services
    UserService: Symbol.for('UserService'),
    ScaleService: Symbol.for('ScaleService'),
    MoodEntryService: Symbol.for('MoodEntryService'),
    StabilityFormulaService: Symbol.for('StabilityFormulaService'),
    AIAssessmentService: Symbol.for('AIAssessmentService'),

    // Infrastructure Services
    MistralAPIClient: Symbol.for('MistralAPIClient'),
    DatabaseConnection: Symbol.for('DatabaseConnection'),
    Logger: Symbol.for('Logger'),

    // Utilities
    ConfigService: Symbol.for('ConfigService'),
};
