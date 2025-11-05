import { PresensiService } from './presensi.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';
export declare class PresensiController {
    private readonly presensiService;
    constructor(presensiService: PresensiService);
    create(dto: CreatePresensiDto): Promise<any>;
    findAll(): Promise<any[]>;
}
