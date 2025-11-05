import { UpdateEkstraDto } from './dto/update-ekstra.dto';
export declare class EditEkstraService {
    getOne(ekstraId: number): Promise<{
        id: any;
        name: any;
        description: any;
        maxMembers: any;
        registrationStart: any;
        registrationEnd: any;
        schedule: {
            id: any;
            day: any;
            startTime: any;
            endTime: any;
        };
    }>;
    update(ekstraId: number, dto: UpdateEkstraDto): Promise<{
        message: string;
    }>;
}
