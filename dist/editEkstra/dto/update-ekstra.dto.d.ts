declare class ScheduleUpdateDto {
    day: string;
    startTime: string;
    endTime: string;
}
export declare class UpdateEkstraDto {
    name: string;
    description: string;
    maxMembers: number;
    registrationStart: string;
    registrationEnd: string;
    pembinaId?: number;
    schedules: ScheduleUpdateDto[];
}
export {};
