import { PendaftaranService } from './pendaftaran.service';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
export declare class PendaftaranController {
    private readonly pendaftaranService;
    constructor(pendaftaranService: PendaftaranService);
    create(dto: CreatePendaftaranDto, req: any): Promise<any>;
}
