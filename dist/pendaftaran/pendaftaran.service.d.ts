import { ConfigService } from '@nestjs/config';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
export declare class PendaftaranService {
    private configService;
    private supabase;
    private readonly MAX_EKSTRA_REGISTRATIONS;
    constructor(configService: ConfigService);
    create(dto: CreatePendaftaranDto): Promise<any>;
}
