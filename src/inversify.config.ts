import { Container } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';
import { TYPES } from './types';
import { getDataSource } from '@/infrastructure/database/data-source';

// TypeORM Entities
import { UserEntity } from '@/infrastructure/database/entities/user.entity';
import { ScaleEntity } from '@/infrastructure/database/entities/scale.entity';
import { ScaleLevelEntity } from '@/infrastructure/database/entities/scale-level.entity';
import { MoodEntryEntity } from '@/infrastructure/database/entities/mood-entry.entity';
import { MoodScaleValueEntity } from '@/infrastructure/database/entities/mood-scale-value.entity';
import { StabilityFormulaEntity } from '@/infrastructure/database/entities/stability-formula.entity';
import { ScaleWeightEntity } from '@/infrastructure/database/entities/scale-weight.entity';

// Domain Services
import { StabilityCalculatorService } from '@/domain/services/stability-calculator.service';
import { ScaleManagementService } from '@/domain/services/scale-management.service';
import { StabilityFormulaParserService } from '@/domain/services/stability-formula-parser.service';

// Repositories
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { ScaleRepository } from '@/infrastructure/repositories/scale.repository';
import { ScaleLevelRepository } from '@/infrastructure/repositories/scale-level.repository';
import { MoodEntryRepository } from '@/infrastructure/repositories/mood-entry.repository';
import { MoodScaleValueRepository } from '@/infrastructure/repositories/mood-scale-value.repository';
import { StabilityFormulaRepository } from '@/infrastructure/repositories/stability-formula.repository';
import { ScaleWeightRepository } from '@/infrastructure/repositories/scale-weight.repository';

// Application Services
import { UserService } from '@/application/services/user.service';
import { ScaleService } from '@/application/services/scale.service';
import { MoodEntryService } from '@/application/services/mood-entry.service';
import { StabilityFormulaService } from '@/application/services/stability-formula.service';
import { AIAssessmentService } from '@/application/services/ai-assessment.service';

// Infrastructure Services
import { MistralAPIClient } from '@/infrastructure/services/mistral-api.client';
import { LoggerService } from '@/infrastructure/services/logger.service';
import { ConfigService } from '@/infrastructure/services/config.service';
import {DataSource} from "typeorm";

// Configure container
const container = new Container();

// Config
container.bind<ConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();

// Database connection - synchronous after initialization
container.bind<DataSource>(TYPES.DatabaseConnection).toDynamicValue(() => {
    return getDataSource();
}).inSingletonScope();

// TypeORM Repositories - all synchronous now since DataSource is pre-initialized
container.bind(TYPES.UserEntityRepository).toDynamicValue(() => {
    const dataSource = container.get<DataSource>(TYPES.DatabaseConnection);
    return dataSource.getRepository(UserEntity);
}).inRequestScope();

container.bind(TYPES.ScaleEntityRepository).toDynamicValue(() => {
    const dataSource = container.get<DataSource>(TYPES.DatabaseConnection);
    return dataSource.getRepository(ScaleEntity);
}).inRequestScope();

container.bind(TYPES.ScaleLevelEntityRepository).toDynamicValue(() => {
    const dataSource = container.get<DataSource>(TYPES.DatabaseConnection);
    return dataSource.getRepository(ScaleLevelEntity);
}).inRequestScope();

container.bind(TYPES.MoodEntryEntityRepository).toDynamicValue(() => {
    const dataSource = container.get<DataSource>(TYPES.DatabaseConnection);
    return dataSource.getRepository(MoodEntryEntity);
}).inRequestScope();

container.bind(TYPES.MoodScaleValueEntityRepository).toDynamicValue(() => {
    const dataSource = container.get<DataSource>(TYPES.DatabaseConnection);
    return dataSource.getRepository(MoodScaleValueEntity);
}).inRequestScope();

container.bind(TYPES.StabilityFormulaEntityRepository).toDynamicValue(() => {
    const dataSource = container.get<DataSource>(TYPES.DatabaseConnection);
    return dataSource.getRepository(StabilityFormulaEntity);
}).inRequestScope();

container.bind(TYPES.ScaleWeightEntityRepository).toDynamicValue(() => {
    const dataSource = container.get<DataSource>(TYPES.DatabaseConnection);
    return dataSource.getRepository(ScaleWeightEntity);
}).inRequestScope();

// Domain Repositories
container.bind(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind(TYPES.ScaleRepository).to(ScaleRepository).inSingletonScope();
container.bind(TYPES.ScaleLevelRepository).to(ScaleLevelRepository).inSingletonScope();
container.bind(TYPES.MoodEntryRepository).to(MoodEntryRepository).inSingletonScope();
container.bind(TYPES.MoodScaleValueRepository).to(MoodScaleValueRepository).inSingletonScope();
container.bind(TYPES.StabilityFormulaRepository).to(StabilityFormulaRepository).inSingletonScope();
container.bind(TYPES.ScaleWeightRepository).to(ScaleWeightRepository).inSingletonScope();

// Domain Services
container.bind(TYPES.StabilityCalculatorService).to(StabilityCalculatorService).inSingletonScope();
container.bind(TYPES.ScaleManagementService).to(ScaleManagementService).inSingletonScope();
container.bind(TYPES.StabilityFormulaParserService).to(StabilityFormulaParserService).inSingletonScope();

// Application Services
container.bind(TYPES.UserService).to(UserService).inSingletonScope();
container.bind(TYPES.ScaleService).to(ScaleService).inSingletonScope();
container.bind(TYPES.MoodEntryService).to(MoodEntryService).inSingletonScope();
container.bind(TYPES.StabilityFormulaService).to(StabilityFormulaService).inSingletonScope();
container.bind(TYPES.AIAssessmentService).to(AIAssessmentService).inSingletonScope();

// Infrastructure Services
container.bind(TYPES.MistralAPIClient).to(MistralAPIClient).inSingletonScope();
container.bind(TYPES.Logger).to(LoggerService).inSingletonScope();

// Build provider module for controllers
container.load(buildProviderModule());

export { container };