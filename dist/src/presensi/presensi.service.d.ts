import { CreatePresensiDto } from './dto/create-presensi.dto';
export declare class PresensiService {
    create(dto: CreatePresensiDto): Promise<any>;
    findAll(): Promise<any[]>;
}
