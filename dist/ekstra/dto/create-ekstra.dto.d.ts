declare class ScheduleDto {
    day: string;
    startTime: string;
    endTime: string;
}
export declare class CreateEkstraDto {
    name: string;
    description: string;
    maxMembers: number;
    registrationStart: string;
    registrationEnd: string;
    pembinaId: number;
    schedules: ScheduleDto[];
}
export {};
