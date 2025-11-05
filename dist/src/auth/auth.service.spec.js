"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const supabase_js_1 = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(),
    })),
}));
jest.mock('bcrypt', () => ({
    hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
    compare: jest.fn((password, hashedPassword) => Promise.resolve(password === hashedPassword.replace('hashed_', ''))),
    hashSync: jest.fn((password) => `hashed_${password}`),
}));
const mockJwtService = {
    sign: jest.fn((payload) => `mock_access_token_${payload.sub}`),
};
const mockProcessEnv = {
    SUPABASE_URL: 'http://mock.supabase.url',
    SUPABASE_SERVICE_ROLE_KEY: 'mock-key',
};
const OLD_ENV = process.env;
beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, ...mockProcessEnv };
});
afterAll(() => {
    process.env = OLD_ENV;
});
const createSupabaseQueryMock = () => {
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn();
    const mockSelect = jest.fn().mockReturnThis();
    const mockInsert = jest.fn().mockReturnThis();
    const chainableMethods = {
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        insert: mockInsert,
    };
    return {
        ...chainableMethods,
        mockEq: mockEq,
        mockSingle: mockSingle,
        mockSelectMethod: mockSelect,
        mockInsertMethod: mockInsert,
    };
};
describe('AuthService', () => {
    let service;
    let supabaseMock;
    let jwtServiceMock;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        supabaseMock = supabase_js_1.createClient.mock.results[0].value;
        jwtServiceMock = module.get(jwt_1.JwtService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('signup', () => {
        const mockSignupDto = {
            nomorInduk: '1234567',
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        };
        it('should signup a new user', async () => {
            const mockUsersTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'users') {
                    mockUsersTable.mockInsertMethod.mockReturnThis();
                    mockUsersTable.mockSelectMethod.mockReturnThis();
                    mockUsersTable.mockSingle.mockResolvedValueOnce({
                        data: {
                            id: 'new_user_id',
                            nomorInduk: mockSignupDto.nomorInduk,
                            name: mockSignupDto.name,
                            email: mockSignupDto.email,
                            role: 'siswa',
                            password: 'hashed_password123',
                        },
                        error: null,
                    });
                    return mockUsersTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            bcrypt.hash.mockClear();
            bcrypt.hash.mockResolvedValue('hashed_password123');
            jwtServiceMock.sign.mockClear();
            jwtServiceMock.sign.mockReturnValue('mock_access_token_new_user_id');
            const result = await service.signup(mockSignupDto.nomorInduk, mockSignupDto.name, mockSignupDto.email, mockSignupDto.password);
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
            expect(result.user).toEqual({
                id: 'new_user_id',
                email: mockSignupDto.email,
                name: mockSignupDto.name,
                nomorInduk: mockSignupDto.nomorInduk,
                role: 'siswa',
            });
            expect(jwtServiceMock.sign).toHaveBeenCalledTimes(1);
            expect(jwtServiceMock.sign).toHaveBeenCalledWith({
                sub: 'new_user_id',
                email: mockSignupDto.email,
                role: 'siswa',
            });
            expect(supabaseMock.from).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
            expect(mockUsersTable.mockInsertMethod).toHaveBeenCalledTimes(1);
            expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
            expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(bcrypt.hash).toHaveBeenCalledTimes(1);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockSignupDto.password, 10);
        });
        it('should throw error if invalid nomorInduk', async () => {
            await expect(service.signup('123', 'Test', 'test@example.com', 'password123')).rejects.toThrow('Invalid Identification number');
            expect(supabaseMock.from).not.toHaveBeenCalled();
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });
        it('should throw error if insert fails', async () => {
            const mockUsersTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'users') {
                    mockUsersTable.mockInsertMethod.mockReturnThis();
                    mockUsersTable.mockSelectMethod.mockReturnThis();
                    mockUsersTable.mockSingle.mockResolvedValueOnce({
                        data: null,
                        error: { message: 'Insert failed from Supabase' },
                    });
                    return mockUsersTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            bcrypt.hash.mockResolvedValue('hashed_password123');
            await expect(service.signup(mockSignupDto.nomorInduk, mockSignupDto.name, mockSignupDto.email, mockSignupDto.password)).rejects.toThrow('Insert failed from Supabase');
            expect(supabaseMock.from).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
            expect(mockUsersTable.mockInsertMethod).toHaveBeenCalledTimes(1);
            expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
            expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(jwtServiceMock.sign).not.toHaveBeenCalled();
        });
    });
    describe('signin', () => {
        const mockSigninDto = {
            email: 'test@example.com',
            password: 'password123',
        };
        const mockUserInDb = {
            id: 'existing_user_id',
            email: mockSigninDto.email,
            password: 'hashed_password123',
            name: 'Existing User',
            nomorInduk: '9876543',
            role: 'siswa',
        };
        it('should signin a user with correct credentials', async () => {
            const mockUsersTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'users') {
                    mockUsersTable.mockSelectMethod.mockReturnThis();
                    mockUsersTable.mockEq.mockReturnThis();
                    mockUsersTable.mockSingle.mockResolvedValueOnce({
                        data: mockUserInDb,
                        error: null,
                    });
                    return mockUsersTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            bcrypt.compare.mockClear();
            bcrypt.compare.mockResolvedValue(true);
            jwtServiceMock.sign.mockClear();
            jwtServiceMock.sign.mockReturnValue('mock_access_token_existing_user_id');
            const result = await service.signin(mockSigninDto.email, mockSigninDto.password);
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
            expect(result.user).toEqual({
                id: mockUserInDb.id,
                email: mockUserInDb.email,
                name: mockUserInDb.name,
                nomorInduk: mockUserInDb.nomorInduk,
                role: mockUserInDb.role,
            });
            expect(jwtServiceMock.sign).toHaveBeenCalledTimes(1);
            expect(jwtServiceMock.sign).toHaveBeenCalledWith({
                sub: mockUserInDb.id,
                email: mockUserInDb.email,
                role: mockUserInDb.role,
            });
            expect(supabaseMock.from).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
            expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
            expect(mockUsersTable.mockEq).toHaveBeenCalledWith('email', mockSigninDto.email);
            expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(bcrypt.compare).toHaveBeenCalledTimes(1);
            expect(bcrypt.compare).toHaveBeenCalledWith(mockSigninDto.password, mockUserInDb.password);
        });
        it('should throw error if user not found', async () => {
            const mockUsersTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'users') {
                    mockUsersTable.mockSelectMethod.mockReturnThis();
                    mockUsersTable.mockEq.mockReturnThis();
                    mockUsersTable.mockSingle.mockResolvedValueOnce({
                        data: null,
                        error: { message: 'User not found' },
                    });
                    return mockUsersTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            await expect(service.signin(mockSigninDto.email, mockSigninDto.password)).rejects.toThrow('Invalid credentials');
            expect(supabaseMock.from).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
            expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
            expect(mockUsersTable.mockEq).toHaveBeenCalledWith('email', mockSigninDto.email);
            expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(jwtServiceMock.sign).not.toHaveBeenCalled();
        });
        it('should throw error if wrong password', async () => {
            const mockUsersTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'users') {
                    mockUsersTable.mockSelectMethod.mockReturnThis();
                    mockUsersTable.mockEq.mockReturnThis();
                    mockUsersTable.mockSingle.mockResolvedValueOnce({
                        data: mockUserInDb,
                        error: null,
                    });
                    return mockUsersTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            bcrypt.compare.mockClear();
            bcrypt.compare.mockResolvedValue(false);
            await expect(service.signin(mockSigninDto.email, 'wrong_password')).rejects.toThrow('Wrong password');
            expect(supabaseMock.from).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
            expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
            expect(mockUsersTable.mockEq).toHaveBeenCalledWith('email', mockSigninDto.email);
            expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(bcrypt.compare).toHaveBeenCalledTimes(1);
            expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', mockUserInDb.password);
            expect(jwtServiceMock.sign).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map