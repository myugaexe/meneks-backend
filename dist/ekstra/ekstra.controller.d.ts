import { CreateEkstraDto } from './dto/create-ekstra.dto';
import { EkstraService } from './ekstra.service';
export declare class EkstraController {
    private readonly ekstraService;
    constructor(ekstraService: EkstraService);
    create(dto: CreateEkstraDto): Promise<{
        message: string;
        ekstra: any;
        jadwal: any;
    }>;
    findAll(): Promise<any[]>;
}
