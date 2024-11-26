export interface CreateBracketInput {
    participant1Id: number;
    participant2Id: number;
    level: string;
}

export interface UpdateBracketInput {
    bracketId: number;
    homeScore: number;
    awayScore: number;
    status: string;
}