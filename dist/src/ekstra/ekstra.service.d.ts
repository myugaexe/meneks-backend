import { CreateEkstraDto } from './dto/create-ekstra.dto';
export declare class EkstraService {
    findAll(): Promise<any[]>;
    create(dto: CreateEkstraDto): Promise<{
        message: string;
        ekstra: any;
        jadwal: any;
    }>;
}
