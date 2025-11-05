import { EditEkstraService } from './edit-ekstra.service';
import { UpdateEkstraDto } from './dto/update-ekstra.dto';
export declare class EditEkstraController {
    private readonly editEkstraService;
    constructor(editEkstraService: EditEkstraService);
    updateEkstra(id: number, dto: UpdateEkstraDto): Promise<{
        message: string;
    }>;
    getEkstra(id: number): Promise<{
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
}
